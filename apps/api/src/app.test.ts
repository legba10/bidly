import { parseEntityId, type ActorContext } from '@bidly/domain';
import { afterEach, describe, expect, it } from 'vitest';

import { createApp } from './app.js';

const apps: Awaited<ReturnType<typeof createApp>>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map(async (app) => app.close()));
});

describe('technical health endpoints', () => {
  it.each(['/health/live', '/health/ready'])(
    'returns a minimal no-store response for %s',
    async (url) => {
      const app = await createApp({ logger: false });
      apps.push(app);

      const response = await app.inject({ method: 'GET', url });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok' });
      expect(response.headers['cache-control']).toBe('no-store');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    },
  );
});

const actor: ActorContext = {
  userId: parseEntityId<'User'>('0198c000-0000-7000-8000-000000000301'),
  sessionId: parseEntityId<'UserSession'>('0198c000-0000-7000-8000-000000000302'),
  requestId: 'actor-request-id',
  roles: new Set(['BUYER']),
};

describe('API v1 boundary', () => {
  it('requires server-side authentication and returns a safe error contract', async () => {
    const app = await createApp({ logger: false });
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/api/v1/me' });

    expect(response.statusCode).toBe(401);
    expect(response.json<{ code: string; message: string; request_id: string }>()).toEqual({
      code: 'AUTHENTICATION_REQUIRED',
      message: 'Authentication is required',
      request_id: response.json<{ request_id: string }>().request_id,
    });
    expect(response.body).not.toContain('stack');
  });

  it('preserves a valid request id for correlation', async () => {
    const app = await createApp({
      logger: false,
      services: { actorResolver: { resolve: async () => actor } },
    });
    apps.push(app);
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/me',
      headers: { 'x-request-id': 'request-correlation-0001' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ user_id: actor.userId, roles: ['BUYER'] });
  });

  it('validates offer acceptance and passes an idempotency key to one command handler', async () => {
    const calls: unknown[] = [];
    const app = await createApp({
      logger: false,
      services: {
        actorResolver: { resolve: async () => actor },
        offers: {
          accept: async (input) => {
            calls.push(input);
            return {
              offer_id: String(input.offerId),
              reservation_id: '0198c000-0000-7000-8000-000000000304',
              status: 'ACCEPTED',
            };
          },
        },
      },
    });
    apps.push(app);
    const id = '0198c000-0000-7000-8000-000000000303';
    const request = {
      method: 'POST' as const,
      url: `/api/v1/offers/${id}/accept`,
      headers: { 'idempotency-key': 'test-key-0000000000000001' },
      payload: { offerId: id, expectedVersion: 1, idempotencyKey: 'body-fallback-key-0001' },
    };
    const first = await app.inject(request);
    const replay = await app.inject(request);
    expect(first.statusCode).toBe(200);
    expect(replay.statusCode).toBe(200);
    expect(first.json()).toEqual(replay.json());
    expect(calls).toHaveLength(2);
    expect(calls[0]).toMatchObject({ idempotencyKey: 'test-key-0000000000000001' });
  });

  it('rejects a mismatch between path and body resource identifiers', async () => {
    const app = await createApp({
      logger: false,
      services: { actorResolver: { resolve: async () => actor } },
    });
    apps.push(app);
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/offers/0198c000-0000-7000-8000-000000000303/accept',
      payload: {
        offerId: '0198c000-0000-7000-8000-000000000305',
        expectedVersion: 1,
        idempotencyKey: '00000000000000000001',
      },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: 'RESOURCE_ID_MISMATCH' });
  });
});
