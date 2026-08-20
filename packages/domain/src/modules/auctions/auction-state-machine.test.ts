import { describe, expect, it } from 'vitest';

import { parseEntityId } from '../../shared/index.js';

import { AuctionStateMachine, type Auction } from './index.js';

const auction: Auction = {
  id: parseEntityId<'Auction'>('0198c000-0000-7000-8000-000000000001'),
  demandPoolVersionId: parseEntityId<'DemandPoolVersion'>('0198c000-0000-7000-8000-000000000002'),
  categoryVersionId: parseEntityId<'CategoryVersion'>('0198c000-0000-7000-8000-000000000003'),
  rulesVersionId: parseEntityId<'AuctionRulesVersion'>('0198c000-0000-7000-8000-000000000004'),
  allocationPolicyVersionId: parseEntityId<'AllocationPolicyVersion'>(
    '0198c000-0000-7000-8000-000000000005',
  ),
  mode: 'MULTI_WINNER',
  status: 'DRAFT',
  version: 1,
};

describe('AuctionStateMachine', () => {
  const machine = new AuctionStateMachine();

  it('allows the canonical forward transition and increments the version', () => {
    expect(machine.transition(auction, 'COLLECTING_DEMAND')).toMatchObject({
      status: 'COLLECTING_DEMAND',
      version: 2,
    });
  });

  it('rejects skipping validation and allocation', () => {
    expect(() => machine.transition(auction, 'USER_ACCEPTANCE')).toThrow(/not allowed/u);
  });

  it('keeps closed auctions terminal', () => {
    expect(machine.canTransition('CLOSED', 'DRAFT')).toBe(false);
  });
});
