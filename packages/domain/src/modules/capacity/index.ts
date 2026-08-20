import { z } from 'zod';

import type {
  CommandMetadata,
  EntityId,
  OrganizationId,
  UtcInstant,
  UserId,
} from '../../shared/index.js';

import { DomainError } from '../../shared/index.js';

export type CapacityUnitKind =
  'TOTAL' | 'BRANCH_DAY' | 'BRANCH_TIME_RANGE' | 'APPOINTMENT_SLOT' | 'CONNECTION' | 'INVENTORY';
export type CapacityReservationStatus =
  'SOFT_RESERVED' | 'RESERVED' | 'CONSUMED' | 'RELEASED' | 'EXPIRED';

export interface CapacityPool {
  readonly id: EntityId<'CapacityPool'>;
  readonly bidVersionId: EntityId<'BidVersion'>;
  readonly organizationId: OrganizationId;
  readonly branchId?: EntityId<'SupplierBranch'>;
  readonly totalQuantity: bigint;
}

export interface CapacityUnit {
  readonly id: EntityId<'CapacityUnit'>;
  readonly poolId: EntityId<'CapacityPool'>;
  readonly kind: CapacityUnitKind;
  readonly startsAt?: UtcInstant;
  readonly endsAt?: UtcInstant;
  readonly totalQuantity: bigint;
  readonly reservedQuantity: bigint;
  readonly consumedQuantity: bigint;
  readonly version: number;
}

export interface CapacityReservation {
  readonly id: EntityId<'CapacityReservation'>;
  readonly unitId: EntityId<'CapacityUnit'>;
  readonly offerId: EntityId<'Offer'>;
  readonly buyerId: UserId;
  readonly quantity: bigint;
  readonly status: CapacityReservationStatus;
  readonly expiresAt?: UtcInstant;
  readonly createdAt: UtcInstant;
}

export interface CapacityAllocation {
  readonly id: EntityId<'CapacityAllocation'>;
  readonly unitId: EntityId<'CapacityUnit'>;
  readonly allocationCandidateId: EntityId<'AllocationCandidate'>;
  readonly quantity: bigint;
}

export interface CapacityRelease {
  readonly id: EntityId<'CapacityRelease'>;
  readonly reservationId: EntityId<'CapacityReservation'>;
  readonly quantity: bigint;
  readonly reason:
    'BUYER_CANCELLED' | 'SUPPLIER_CANCELLED' | 'TTL_EXPIRED' | 'SUPERSEDED' | 'ADMIN_OVERRIDE';
  readonly releasedAt: UtcInstant;
}

export interface SupplierCapacityLimit {
  readonly organizationId: OrganizationId;
  readonly categoryId: EntityId<'Category'>;
  readonly maxQuantity: bigint;
  readonly source: 'INITIAL_MANUAL' | 'PERFORMANCE_POLICY' | 'ADMIN_OVERRIDE';
  readonly version: number;
}

export interface SupplierCapacityHistory {
  readonly organizationId: OrganizationId;
  readonly offered: bigint;
  readonly allocated: bigint;
  readonly fulfilled: bigint;
  readonly cancelled: bigint;
}

export const reserveCapacitySchema = z.object({
  unitId: z.uuid(),
  offerId: z.uuid(),
  quantity: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  ttlSeconds: z.number().int().min(30).max(3600),
});

export interface ReserveCapacityCommand {
  readonly unitId: EntityId<'CapacityUnit'>;
  readonly offerId: EntityId<'Offer'>;
  readonly buyerId: UserId;
  readonly quantity: bigint;
  readonly expiresAt: UtcInstant;
  readonly metadata: CommandMetadata;
}

export interface CapacityRepository {
  reserveAtomically(command: ReserveCapacityCommand): Promise<CapacityReservation>;
  confirmReservation(
    id: EntityId<'CapacityReservation'>,
    metadata: CommandMetadata,
  ): Promise<CapacityReservation>;
  consumeReservation(
    id: EntityId<'CapacityReservation'>,
    metadata: CommandMetadata,
  ): Promise<CapacityReservation>;
  releaseExpired(now: UtcInstant, batchSize: number, metadata: CommandMetadata): Promise<number>;
  findUnit(id: EntityId<'CapacityUnit'>): Promise<CapacityUnit | undefined>;
}

export class CapacityService {
  constructor(private readonly repository: CapacityRepository) {}

  async reserve(command: ReserveCapacityCommand): Promise<CapacityReservation> {
    if (command.quantity <= 0n)
      throw new DomainError('VALIDATION_FAILED', 'Reservation quantity must be positive');
    return this.repository.reserveAtomically(command);
  }

  available(unit: CapacityUnit): bigint {
    const available = unit.totalQuantity - unit.reservedQuantity - unit.consumedQuantity;
    if (available < 0n)
      throw new DomainError('CAPACITY_UNAVAILABLE', 'Capacity invariant is violated');
    return available;
  }
}
