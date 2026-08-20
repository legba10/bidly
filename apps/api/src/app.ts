import { randomUUID } from 'node:crypto';

import { DomainError } from '@bidly/domain';
import { requestIdSchema } from '@bidly/validation';
import helmet from '@fastify/helmet';
import Fastify, { type FastifyInstance } from 'fastify';
import { ZodError } from 'zod';

import { registerApiV1, type ApiV1Services } from './api-v1.js';

export interface CreateAppOptions {
  readonly logLevel?: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';
  readonly logger?: boolean;
  readonly services?: ApiV1Services;
}

const healthResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['status'],
  properties: {
    status: { type: 'string', const: 'ok' },
  },
} as const;

export async function createApp({
  logLevel = 'info',
  logger = true,
  services = {},
}: CreateAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    genReqId(request) {
      const supplied = request.headers['x-request-id'];
      return typeof supplied === 'string' && requestIdSchema.safeParse(supplied).success
        ? supplied
        : randomUUID();
    },
    logger: logger
      ? {
          level: logLevel,
          redact: {
            censor: '[REDACTED]',
            paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers.set-cookie'],
          },
        }
      : false,
  });

  await app.register(
    helmet,
    process.env['NODE_ENV'] === 'production' ? { global: true } : { global: true, hsts: false },
  );

  app.addHook('onSend', async (_request, reply, payload) => {
    void reply.header('Cache-Control', 'no-store');
    return payload;
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        code: 'INVALID_REQUEST',
        message: 'Request validation failed',
        details: Object.fromEntries(
          error.issues
            .slice(0, 10)
            .map((issue, index) => [
              `issue_${String(index + 1)}`,
              issue.path.join('.') || 'request',
            ]),
        ),
        request_id: request.id,
      });
    }
    if (error instanceof DomainError) {
      const status =
        error.code === 'AUTHORIZATION_DENIED'
          ? 403
          : error.code === 'CAPACITY_UNAVAILABLE' ||
              error.code === 'IDEMPOTENCY_CONFLICT' ||
              error.code === 'INVALID_STATE_TRANSITION' ||
              error.code === 'OFFER_EXPIRED'
            ? 409
            : 400;
      return reply.code(status).send({
        code: error.code,
        message: error.message,
        details: error.details,
        request_id: request.id,
      });
    }
    request.log.error(
      {
        event: 'request.failed',
        errorName: error instanceof Error ? error.name : 'UnknownError',
        requestId: request.id,
      },
      'Unhandled request failure',
    );
    return reply.code(500).send({
      code: 'INTERNAL_ERROR',
      message: 'Request could not be completed',
      request_id: request.id,
    });
  });

  app.get(
    '/health/live',
    {
      schema: { response: { 200: healthResponseSchema } },
    },
    async () => ({ status: 'ok' as const }),
  );

  app.get(
    '/health/ready',
    {
      schema: { response: { 200: healthResponseSchema } },
    },
    async () => ({ status: 'ok' as const }),
  );

  await registerApiV1(app, services);

  return app;
}
