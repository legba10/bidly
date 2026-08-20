import { describe, expect, it, vi } from 'vitest';

import { parseEntityId, type ActorContext, type PlatformRole } from '../../shared/index.js';

import { AdminService, type AdminRepository } from './index.js';

function actor(role: PlatformRole): ActorContext {
  return {
    userId: parseEntityId<'User'>('0198c000-0000-7000-8000-000000000401'),
    sessionId: parseEntityId<'UserSession'>('0198c000-0000-7000-8000-000000000402'),
    requestId: 'admin-test-request',
    roles: new Set([role]),
  };
}

const command = {
  resourceType: 'Auction',
  resourceId: '0198c000-0000-7000-8000-000000000403',
  reason: 'Исправление подтверждённой операционной ошибки',
  expectedVersion: 3,
  newValue: { status: 'CANCELLED' },
};

describe('AdminService', () => {
  const repository: AdminRepository = {
    applyOverride: vi.fn(async () => ({
      previousValue: { status: 'SUPPLIER_BIDDING' },
      auditEventId: parseEntityId<'AuditEvent'>('0198c000-0000-7000-8000-000000000404'),
    })),
  };

  it('does not grant override powers to support', async () => {
    await expect(
      new AdminService(repository).override(actor('BIDLY_SUPPORT'), command),
    ).rejects.toMatchObject({
      code: 'AUTHORIZATION_DENIED',
    });
  });

  it('requires an atomic repository result containing an audit event', async () => {
    const result = await new AdminService(repository).override(actor('BIDLY_ADMIN'), command);
    expect(result.auditEventId).toBe('0198c000-0000-7000-8000-000000000404');
  });
});
