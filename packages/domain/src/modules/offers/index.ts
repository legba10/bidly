import { z } from 'zod';

import type {
  Clock,
  CommandMetadata,
  EntityId,
  Money,
  OrganizationId,
  UtcInstant,
  UserId,
} from '../../shared/index.js';

import { DomainError } from '../../shared/index.js';

export type OfferStatus =
  | 'AVAILABLE'
  | 'VIEWED'
  | 'SOFT_RESERVED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'SUPERSEDED'
  | 'UNAVAILABLE'
  | 'FULFILLING'
  | 'COMPLETED';

export interface OfferSnapshot {
  readonly supplierOrganizationId: OrganizationId;
  readonly supplierDisplayName: string;
  readonly bidVersionId: EntityId<'BidVersion'>;
  readonly categoryVersionId: EntityId<'CategoryVersion'>;
  readonly allocationPolicyVersionId: EntityId<'AllocationPolicyVersion'>;
  readonly headlinePrice: Money;
  readonly totalCost: Money;
  readonly comparisonMonths: number;
  readonly conditions: readonly string[];
  readonly inclusions: readonly string[];
  readonly exclusions: readonly string[];
  readonly capacityUnitId: EntityId<'CapacityUnit'>;
  readonly branchId?: EntityId<'SupplierBranch'>;
  readonly eligibleDates: readonly UtcInstant[];
  readonly categoryDetails: Readonly<Record<string, unknown>>;
}

export interface Offer {
  readonly id: EntityId<'Offer'>;
  readonly buyerDemandId: EntityId<'BuyerDemand'>;
  readonly buyerId: UserId;
  readonly allocationCandidateId: EntityId<'AllocationCandidate'>;
  readonly currentVersionId: EntityId<'OfferVersion'>;
  readonly status: OfferStatus;
  readonly expiresAt: UtcInstant;
  readonly version: number;
}

export interface OfferVersion {
  readonly id: EntityId<'OfferVersion'>;
  readonly offerId: EntityId<'Offer'>;
  readonly version: number;
  readonly snapshot: OfferSnapshot;
  readonly createdAt: UtcInstant;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

/** Creates the immutable commercial snapshot shown to a buyer. */
export function createOfferVersion(
  input: Omit<OfferVersion, 'snapshot'> & { readonly snapshot: OfferSnapshot },
): OfferVersion {
  const snapshot = structuredClone(input.snapshot);
  return deepFreeze({ ...input, snapshot });
}

export interface OfferFallbackChain {
  readonly buyerDemandId: EntityId<'BuyerDemand'>;
  readonly orderedOfferIds: readonly EntityId<'Offer'>[];
  readonly activeIndex: number;
}

export const acceptOfferSchema = z.object({
  offerId: z.uuid(),
  expectedVersion: z.number().int().nonnegative(),
  idempotencyKey: z.string().min(16).max(128),
});

export interface OfferAcceptanceRepository {
  acceptAtomically(
    offerId: EntityId<'Offer'>,
    buyerId: UserId,
    expectedVersion: number,
    metadata: CommandMetadata,
  ): Promise<{ readonly offer: Offer; readonly reservationId: EntityId<'CapacityReservation'> }>;
  findOwned(offerId: EntityId<'Offer'>, buyerId: UserId): Promise<Offer | undefined>;
  activateNextFallback(
    buyerDemandId: EntityId<'BuyerDemand'>,
    unavailableOfferId: EntityId<'Offer'>,
  ): Promise<Offer | undefined>;
}

export class OfferService {
  constructor(
    private readonly repository: OfferAcceptanceRepository,
    private readonly clock: Clock,
  ) {}

  async accept(
    offerId: EntityId<'Offer'>,
    buyerId: UserId,
    expectedVersion: number,
    metadata: CommandMetadata,
  ): Promise<{ readonly offer: Offer; readonly reservationId: EntityId<'CapacityReservation'> }> {
    const offer = await this.repository.findOwned(offerId, buyerId);
    if (!offer) throw new DomainError('AUTHORIZATION_DENIED', 'Offer is not available');
    if (offer.status !== 'AVAILABLE' && offer.status !== 'VIEWED')
      throw new DomainError(
        'INVALID_STATE_TRANSITION',
        'Offer cannot be accepted from its current state',
      );
    if (Date.parse(offer.expiresAt) <= Date.parse(this.clock.now()))
      throw new DomainError('OFFER_EXPIRED', 'Offer has expired');
    return this.repository.acceptAtomically(offerId, buyerId, expectedVersion, metadata);
  }
}
