import { z } from 'zod';

import type {
  CommandMetadata,
  EntityId,
  OrganizationId,
  UtcInstant,
  UserId,
} from '../../shared/index.js';

export type BookingStatus =
  | 'PENDING'
  | 'SOFT_RESERVED'
  | 'CONFIRMED'
  | 'CANCELLED_BY_BUYER'
  | 'CANCELLED_BY_SUPPLIER'
  | 'NO_SHOW'
  | 'ARRIVED'
  | 'IN_SERVICE'
  | 'COMPLETED'
  | 'DISPUTED';
export type ConnectionStatus =
  | 'OFFER_ACCEPTED'
  | 'COVERAGE_CHECK_PENDING'
  | 'COVERAGE_AVAILABLE'
  | 'INSTALLATION_SELECTION'
  | 'INSTALLATION_CONFIRMED'
  | 'CONNECTED'
  | 'COVERAGE_UNAVAILABLE'
  | 'FALLBACK_OFFER';

export interface BookingSlot {
  readonly id: EntityId<'BookingSlot'>;
  readonly capacityUnitId: EntityId<'CapacityUnit'>;
  readonly branchId: EntityId<'SupplierBranch'>;
  readonly startsAt: UtcInstant;
  readonly endsAt: UtcInstant;
}

export interface Booking {
  readonly id: EntityId<'Booking'>;
  readonly offerId: EntityId<'Offer'>;
  readonly buyerId: UserId;
  readonly organizationId: OrganizationId;
  readonly slotId?: EntityId<'BookingSlot'>;
  readonly status: BookingStatus;
  readonly version: number;
}

export interface CoverageCheck {
  readonly id: EntityId<'CoverageCheck'>;
  readonly offerId: EntityId<'Offer'>;
  readonly addressId: EntityId<'Address'>;
  readonly status: 'PENDING' | 'AVAILABLE' | 'UNAVAILABLE' | 'INCONCLUSIVE';
  readonly source: 'MANUAL' | 'SUPPLIER_DATA' | 'ADAPTER';
}

export interface ConnectionRequest {
  readonly id: EntityId<'ConnectionRequest'>;
  readonly offerId: EntityId<'Offer'>;
  readonly coverageCheckId: EntityId<'CoverageCheck'>;
  readonly status: ConnectionStatus;
  readonly version: number;
}

export const createBookingSchema = z.object({
  offerId: z.uuid(),
  slotId: z.uuid(),
  expectedOfferVersion: z.number().int().nonnegative(),
  idempotencyKey: z.string().min(16).max(128),
});

export interface BookingRepository {
  createAtomically(
    offerId: EntityId<'Offer'>,
    slotId: EntityId<'BookingSlot'>,
    buyerId: UserId,
    expectedOfferVersion: number,
    metadata: CommandMetadata,
  ): Promise<Booking>;
  findOwned(id: EntityId<'Booking'>, buyerId: UserId): Promise<Booking | undefined>;
  transition(
    id: EntityId<'Booking'>,
    organizationId: OrganizationId,
    expectedVersion: number,
    target: BookingStatus,
    metadata: CommandMetadata,
  ): Promise<Booking>;
}

export class BookingService {
  constructor(private readonly repository: BookingRepository) {}

  create(
    offerId: EntityId<'Offer'>,
    slotId: EntityId<'BookingSlot'>,
    buyerId: UserId,
    expectedOfferVersion: number,
    metadata: CommandMetadata,
  ): Promise<Booking> {
    return this.repository.createAtomically(
      offerId,
      slotId,
      buyerId,
      expectedOfferVersion,
      metadata,
    );
  }
}
