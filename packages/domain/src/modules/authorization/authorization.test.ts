import { describe, expect, it } from 'vitest';

import { parseEntityId, type ActorContext } from '../../shared/index.js';

import { DefaultAuthorizationService } from './index.js';

const organizationA = parseEntityId<'SupplierOrganization'>('0198c000-0000-7000-8000-000000000040');
const organizationB = parseEntityId<'SupplierOrganization'>('0198c000-0000-7000-8000-000000000041');
const actor: ActorContext = {
  userId: parseEntityId<'User'>('0198c000-0000-7000-8000-000000000042'),
  sessionId: parseEntityId<'UserSession'>('0198c000-0000-7000-8000-000000000043'),
  requestId: 'request-authorization-test',
  roles: new Set(['SUPPLIER_MEMBER']),
  supplierRoles: new Set(['BID_MANAGER']),
  activeOrganizationId: organizationA,
};

describe('DefaultAuthorizationService', () => {
  const authorization = new DefaultAuthorizationService();

  it('allows an unlocked bid in the active organization', () => {
    expect(
      authorization.can(actor, 'bid:update', {
        type: 'Bid',
        organizationId: organizationA,
        locked: false,
      }).allowed,
    ).toBe(true);
  });

  it('denies Supplier A access to Supplier B', () => {
    expect(
      authorization.can(actor, 'bid:update', { type: 'Bid', organizationId: organizationB })
        .reasonCode,
    ).toBe('ORGANIZATION_SCOPE_MISMATCH');
  });

  it('denies mutation of a locked bid', () => {
    expect(
      authorization.can(actor, 'bid:update', {
        type: 'Bid',
        organizationId: organizationA,
        locked: true,
      }).reasonCode,
    ).toBe('RESOURCE_LOCKED');
  });

  it('does not let support perform admin overrides', () => {
    const support = { ...actor, roles: new Set(['BIDLY_SUPPORT'] as const) };
    expect(authorization.can(support, 'admin:override', { type: 'Auction' }).allowed).toBe(false);
  });
});
