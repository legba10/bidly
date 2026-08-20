import { createHash } from 'node:crypto';

import { parseEntityId } from '@bidly/domain';
import { apiV1Contracts, idempotencyHeaderSchema } from '@bidly/validation';

import type { ActorContext } from '@bidly/domain';
import type { FastifyInstance, FastifyRequest } from 'fastify';

export interface ActorResolver {
  resolve(request: FastifyRequest): Promise<ActorContext | undefined>;
}

export interface RateLimitDecision {
  readonly allowed: boolean;
  readonly retryAfterSeconds?: number;
}

export interface RateLimiter {
  check(subject: string, action: string): Promise<RateLimitDecision>;
}

export interface CategoryQueryService {
  list(input: { readonly limit: number; readonly cursor?: string }): Promise<{
    readonly items: readonly {
      readonly id: string;
      readonly version_id: string;
      readonly slug: string;
      readonly market_type: 'SWITCH' | 'CAPACITY' | 'BULK' | 'LEAD';
    }[];
    readonly next_cursor?: string;
  }>;
}

export interface OfferCommandHandler {
  accept(input: {
    readonly actor: ActorContext;
    readonly offerId: ReturnType<typeof parseEntityId<'Offer'>>;
    readonly expectedVersion: number;
    readonly idempotencyKey: string;
    readonly payloadHash: string;
  }): Promise<{
    readonly offer_id: string;
    readonly reservation_id: string;
    readonly status: 'ACCEPTED';
  }>;
}

export interface ApiV1Services {
  readonly actorResolver?: ActorResolver;
  readonly rateLimiter?: RateLimiter;
  readonly categories?: CategoryQueryService;
  readonly offers?: OfferCommandHandler;
}

async function actorFor(
  request: FastifyRequest,
  services: ApiV1Services,
): Promise<ActorContext | undefined> {
  const actor = await services.actorResolver?.resolve(request);
  if (!actor) {
    request.log.warn(
      { event: 'authorization.denied', action: request.routeOptions.url, requestId: request.id },
      'Authorization denied',
    );
  }
  return actor;
}

export async function registerApiV1(app: FastifyInstance, services: ApiV1Services): Promise<void> {
  app.get('/api/v1/me', async (request, reply) => {
    const actor = await actorFor(request, services);
    if (!actor)
      return reply.code(401).send({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication is required',
        request_id: request.id,
      });
    return { user_id: actor.userId, roles: [...actor.roles].sort() };
  });

  app.get('/api/v1/categories', async (request, reply) => {
    const query = apiV1Contracts.categories.query.parse(request.query);
    if (!services.categories)
      return reply.code(503).send({
        code: 'SERVICE_NOT_CONFIGURED',
        message: 'Category query service is not configured',
        request_id: request.id,
      });
    return services.categories.list({
      limit: query.limit,
      ...(query.cursor === undefined ? {} : { cursor: query.cursor }),
    });
  });

  app.post('/api/v1/offers/:id/accept', async (request, reply) => {
    const actor = await actorFor(request, services);
    if (!actor)
      return reply.code(401).send({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication is required',
        request_id: request.id,
      });
    const decision = await services.rateLimiter?.check(actor.userId, 'offer.accept');
    if (decision && !decision.allowed) {
      if (decision.retryAfterSeconds) void reply.header('Retry-After', decision.retryAfterSeconds);
      return reply.code(429).send({
        code: 'RATE_LIMITED',
        message: 'Request rate is temporarily limited',
        request_id: request.id,
      });
    }
    const params = apiV1Contracts.acceptOffer.params.parse({
      id: (request.params as { id?: unknown }).id,
    });
    const body = apiV1Contracts.acceptOffer.body.parse(request.body);
    if (body.offerId !== params.id)
      return reply.code(400).send({
        code: 'RESOURCE_ID_MISMATCH',
        message: 'Path and body resource identifiers differ',
        request_id: request.id,
      });
    const header = Array.isArray(request.headers['idempotency-key'])
      ? request.headers['idempotency-key'][0]
      : request.headers['idempotency-key'];
    const idempotencyKey = idempotencyHeaderSchema.parse(header ?? body.idempotencyKey);
    if (!services.offers)
      return reply.code(503).send({
        code: 'SERVICE_NOT_CONFIGURED',
        message: 'Offer command service is not configured',
        request_id: request.id,
      });
    const payloadHash = createHash('sha256')
      .update(JSON.stringify({ offerId: params.id, expectedVersion: body.expectedVersion }))
      .digest('hex');
    const result = await services.offers.accept({
      actor,
      offerId: parseEntityId<'Offer'>(params.id),
      expectedVersion: body.expectedVersion,
      idempotencyKey,
      payloadHash,
    });
    return reply.code(200).send(result);
  });
}
