import { describe, expect, it, vi } from 'vitest';

import {
  money,
  parseEntityId,
  toUtcInstant,
  type ActorContext,
  type CommandMetadata,
} from '../../shared/index.js';

import {
  createOfferVersion,
  OfferService,
  type Offer,
  type OfferAcceptanceRepository,
  type OfferSnapshot,
} from './index.js';

const buyerId = parseEntityId<'User'>('0198c000-0000-7000-8000-000000000101');
const offerId = parseEntityId<'Offer'>('0198c000-0000-7000-8000-000000000102');
const offer: Offer = {
  id: offerId,
  buyerDemandId: parseEntityId<'BuyerDemand'>('0198c000-0000-7000-8000-000000000103'),
  buyerId,
  allocationCandidateId: parseEntityId<'AllocationCandidate'>(
    '0198c000-0000-7000-8000-000000000104',
  ),
  currentVersionId: parseEntityId<'OfferVersion'>('0198c000-0000-7000-8000-000000000105'),
  status: 'AVAILABLE',
  expiresAt: toUtcInstant('2026-09-01T12:00:00.000Z'),
  version: 1,
};
const actor: ActorContext = {
  userId: buyerId,
  sessionId: parseEntityId<'UserSession'>('0198c000-0000-7000-8000-000000000106'),
  requestId: 'request-offer-test',
  roles: new Set(['BUYER']),
};
const metadata: CommandMetadata = {
  actor,
  idempotencyKey: 'offer-test-key-0001',
  payloadHash: 'hash',
  requestedAt: toUtcInstant('2026-09-01T10:00:00.000Z'),
};

function repositoryFor(
  found: Offer | undefined,
  onAccept: () => void = () => undefined,
): OfferAcceptanceRepository {
  return {
    findOwned: vi.fn(async () => found),
    acceptAtomically: vi.fn(async () => {
      onAccept();
      return {
        offer: { ...offer, status: 'ACCEPTED' as const },
        reservationId: parseEntityId<'CapacityReservation'>('0198c000-0000-7000-8000-000000000107'),
      };
    }),
    activateNextFallback: vi.fn(async () => undefined),
  };
}

describe('OfferService', () => {
  it('rejects an expired offer before making a reservation', async () => {
    let acceptanceCalls = 0;
    const repository = repositoryFor(offer, () => {
      acceptanceCalls += 1;
    });
    const service = new OfferService(repository, {
      now: () => toUtcInstant('2026-09-01T12:00:00.000Z'),
    });
    await expect(service.accept(offerId, buyerId, 1, metadata)).rejects.toMatchObject({
      code: 'OFFER_EXPIRED',
    });
    expect(acceptanceCalls).toBe(0);
  });

  it('does not reveal whether another buyer owns an offer', async () => {
    const service = new OfferService(repositoryFor(undefined), {
      now: () => toUtcInstant('2026-09-01T10:00:00.000Z'),
    });
    await expect(service.accept(offerId, buyerId, 1, metadata)).rejects.toMatchObject({
      code: 'AUTHORIZATION_DENIED',
    });
  });
});

describe('offer snapshots', () => {
  it('clones and deeply freezes the commercial terms', () => {
    const snapshot: OfferSnapshot = {
      supplierOrganizationId: parseEntityId<'SupplierOrganization'>(
        '0198c000-0000-7000-8000-000000000108',
      ),
      supplierDisplayName: 'DEV TEST SUPPLIER',
      bidVersionId: parseEntityId<'BidVersion'>('0198c000-0000-7000-8000-000000000109'),
      categoryVersionId: parseEntityId<'CategoryVersion'>('0198c000-0000-7000-8000-000000000110'),
      allocationPolicyVersionId: parseEntityId<'AllocationPolicyVersion'>(
        '0198c000-0000-7000-8000-000000000111',
      ),
      headlinePrice: money(10_000n, 'RUB'),
      totalCost: money(10_000n, 'RUB'),
      comparisonMonths: 1,
      conditions: ['без скрытых условий'],
      inclusions: [],
      exclusions: [],
      capacityUnitId: parseEntityId<'CapacityUnit'>('0198c000-0000-7000-8000-000000000112'),
      eligibleDates: [toUtcInstant('2026-09-02T10:00:00.000Z')],
      categoryDetails: { nested: { immutable: true } },
    };
    const version = createOfferVersion({
      id: parseEntityId<'OfferVersion'>('0198c000-0000-7000-8000-000000000113'),
      offerId,
      version: 1,
      snapshot,
      createdAt: toUtcInstant('2026-09-01T10:00:00.000Z'),
    });
    expect(Object.isFrozen(version)).toBe(true);
    expect(Object.isFrozen(version.snapshot.categoryDetails['nested'])).toBe(true);
    expect(version.snapshot).not.toBe(snapshot);
  });
});
