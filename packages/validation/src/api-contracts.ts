import { Auctions, Bids, Booking, Demand, Fulfillment, Offers } from '@bidly/domain';
import { z } from 'zod';

export const requestIdSchema = z
  .string()
  .min(8)
  .max(128)
  .regex(/^[A-Za-z0-9._:-]+$/u);
export const idempotencyHeaderSchema = z
  .string()
  .min(16)
  .max(128)
  .regex(/^[A-Za-z0-9._:-]+$/u);

export const apiErrorSchema = z.object({
  code: z.string().min(1).max(80),
  message: z.string().min(1).max(500),
  details: z.record(z.string(), z.string()).optional(),
  request_id: requestIdSchema,
});

const uuidPathSchema = z.object({ id: z.uuid() });

export const apiV1Contracts = {
  me: {
    method: 'GET',
    path: '/api/v1/me',
    response: z.object({ user_id: z.uuid(), roles: z.array(z.string()) }),
  },
  categories: {
    method: 'GET',
    path: '/api/v1/categories',
    query: z.object({
      limit: z.coerce.number().int().min(1).max(100).default(25),
      cursor: z.string().max(512).optional(),
    }),
    response: z.object({
      items: z.array(
        z.object({
          id: z.uuid(),
          version_id: z.uuid(),
          slug: z.string(),
          market_type: z.enum(['SWITCH', 'CAPACITY', 'BULK', 'LEAD']),
        }),
      ),
      next_cursor: z.string().optional(),
    }),
  },
  createDemand: {
    method: 'POST',
    path: '/api/v1/demand',
    body: Demand.buyerDemandCommandSchema,
    response: z.object({ demand_id: z.uuid(), status: z.string() }),
  },
  transitionAuction: {
    method: 'POST',
    path: '/api/v1/auctions/{id}/transitions',
    params: uuidPathSchema,
    body: Auctions.auctionTransitionSchema,
    response: z.object({ auction_id: z.uuid(), status: z.string(), version: z.number().int() }),
  },
  submitBid: {
    method: 'POST',
    path: '/api/v1/supplier/bids',
    body: Bids.bidSubmissionSchema,
    response: z.object({ bid_id: z.uuid(), version_id: z.uuid(), status: z.string() }),
  },
  acceptOffer: {
    method: 'POST',
    path: '/api/v1/offers/{id}/accept',
    params: uuidPathSchema,
    body: Offers.acceptOfferSchema,
    response: z.object({
      offer_id: z.uuid(),
      reservation_id: z.uuid(),
      status: z.literal('ACCEPTED'),
    }),
  },
  createBooking: {
    method: 'POST',
    path: '/api/v1/bookings',
    body: Booking.createBookingSchema,
    response: z.object({ booking_id: z.uuid(), status: z.string() }),
  },
  confirmFulfillment: {
    method: 'POST',
    path: '/api/v1/supplier/fulfillment/{id}/confirm',
    params: uuidPathSchema,
    body: Fulfillment.confirmFulfillmentSchema,
    response: z.object({ fulfillment_id: z.uuid(), status: z.string(), version: z.number().int() }),
  },
  adminOverride: {
    method: 'POST',
    path: '/api/v1/admin/overrides',
    body: z.object({
      resource_type: z.string(),
      resource_id: z.uuid(),
      reason: z.string().min(10),
      expected_version: z.number().int().nonnegative(),
    }),
    response: z.object({
      resource_id: z.uuid(),
      version: z.number().int(),
      audit_event_id: z.uuid(),
    }),
  },
} as const;

function schema(value: z.ZodType | undefined): Readonly<Record<string, unknown>> | undefined {
  return value ? z.toJSONSchema(value) : undefined;
}

export function buildOpenApiV1Document(): Readonly<Record<string, unknown>> {
  const paths: Record<string, unknown> = {};
  const publishedOperations = new Set(['me', 'categories', 'acceptOffer']);
  const idempotentOperations = new Set([
    'createDemand',
    'acceptOffer',
    'createBooking',
    'confirmFulfillment',
    'adminOverride',
  ]);
  for (const [name, contract] of Object.entries(apiV1Contracts)) {
    if (!publishedOperations.has(name)) continue;
    const operation: Record<string, unknown> = {
      operationId: `${contract.method.toLowerCase()}_${contract.path.replaceAll(/[^a-z0-9]+/giu, '_')}`,
      responses: {
        '200': {
          description: 'Successful response',
          content: { 'application/json': { schema: schema(contract.response) } },
        },
        '400': {
          description: 'Invalid request',
          content: { 'application/json': { schema: schema(apiErrorSchema) } },
        },
        '401': {
          description: 'Authentication required',
          content: { 'application/json': { schema: schema(apiErrorSchema) } },
        },
        '403': {
          description: 'Not authorized',
          content: { 'application/json': { schema: schema(apiErrorSchema) } },
        },
        '409': {
          description: 'State or idempotency conflict',
          content: { 'application/json': { schema: schema(apiErrorSchema) } },
        },
        '429': {
          description: 'Rate limited',
          content: { 'application/json': { schema: schema(apiErrorSchema) } },
        },
      },
    };
    if ('body' in contract)
      operation['requestBody'] = {
        required: true,
        content: { 'application/json': { schema: schema(contract.body) } },
      };
    const parameters: Record<string, unknown>[] = [];
    if ('params' in contract) {
      const parameterSchema = schema(contract.params);
      const properties = (parameterSchema?.['properties'] ?? {}) as Record<string, unknown>;
      for (const [parameterName, value] of Object.entries(properties)) {
        parameters.push({ name: parameterName, in: 'path', required: true, schema: value });
      }
    }
    if ('query' in contract) {
      const querySchema = schema(contract.query);
      const properties = (querySchema?.['properties'] ?? {}) as Record<string, unknown>;
      const required = new Set((querySchema?.['required'] ?? []) as string[]);
      for (const [parameterName, value] of Object.entries(properties)) {
        parameters.push({
          name: parameterName,
          in: 'query',
          required: required.has(parameterName),
          schema: value,
        });
      }
    }
    if (idempotentOperations.has(name)) {
      parameters.push({
        name: 'Idempotency-Key',
        in: 'header',
        required: true,
        schema: schema(idempotencyHeaderSchema),
      });
    }
    if (parameters.length > 0) operation['parameters'] = parameters;
    paths[contract.path] = {
      ...(paths[contract.path] as object | undefined),
      [contract.method.toLowerCase()]: operation,
    };
  }
  return {
    openapi: '3.1.0',
    info: {
      title: 'Bidly API',
      version: '1.0.0',
      description: 'Generated from Bidly Zod command schemas. No manually duplicated contract.',
    },
    servers: [{ url: '/' }],
    paths,
  };
}
