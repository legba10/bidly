import { z } from 'zod';

import type {
  CommandMetadata,
  EntityId,
  OrganizationId,
  UtcInstant,
  UserId,
} from '../../shared/index.js';

export type FulfillmentStatus =
  | 'PENDING'
  | 'ARRIVED'
  | 'IN_SERVICE'
  | 'SUPPLIER_CONFIRMED'
  | 'BUYER_CONFIRMED'
  | 'CONFIRMED'
  | 'DISPUTED'
  | 'CANCELLED';
export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED' | 'CLOSED';

export interface BidlyPass {
  readonly id: EntityId<'BidlyPass'>;
  readonly offerId: EntityId<'Offer'>;
  readonly organizationId: OrganizationId;
  readonly tokenHash: string;
  readonly tokenVersion: number;
  readonly expiresAt: UtcInstant;
  readonly redeemedAt?: UtcInstant;
}

export interface Fulfillment {
  readonly id: EntityId<'Fulfillment'>;
  readonly offerId: EntityId<'Offer'>;
  readonly bookingId?: EntityId<'Booking'>;
  readonly buyerId: UserId;
  readonly organizationId: OrganizationId;
  readonly status: FulfillmentStatus;
  readonly supplierConfirmedAt?: UtcInstant;
  readonly buyerConfirmedAt?: UtcInstant;
  readonly version: number;
}

export interface Dispute {
  readonly id: EntityId<'Dispute'>;
  readonly fulfillmentId: EntityId<'Fulfillment'>;
  readonly status: DisputeStatus;
  readonly reason:
    'SERVICE_NOT_DELIVERED' | 'PRICE_MISMATCH' | 'CONDITION_MISMATCH' | 'NO_SHOW' | 'OTHER';
  readonly openedBy: UserId;
  readonly createdAt: UtcInstant;
}

export interface DisputeEvidenceReference {
  readonly disputeId: EntityId<'Dispute'>;
  readonly objectKey: string;
  readonly kind: string;
}

export const confirmFulfillmentSchema = z.object({
  fulfillmentId: z.uuid(),
  expectedVersion: z.number().int().nonnegative(),
  confirmation: z.enum(['DELIVERED', 'NOT_DELIVERED']),
  idempotencyKey: z.string().min(16).max(128),
});

export interface BidlyPassTokenGenerator {
  generate(): Promise<{ readonly plaintext: string; readonly hash: string }>;
}

export interface FulfillmentRepository {
  confirmByBuyer(
    id: EntityId<'Fulfillment'>,
    buyerId: UserId,
    delivered: boolean,
    expectedVersion: number,
    metadata: CommandMetadata,
  ): Promise<Fulfillment>;
  confirmBySupplier(
    id: EntityId<'Fulfillment'>,
    organizationId: OrganizationId,
    delivered: boolean,
    expectedVersion: number,
    metadata: CommandMetadata,
  ): Promise<Fulfillment>;
  redeemPass(
    tokenHash: string,
    organizationId: OrganizationId,
    metadata: CommandMetadata,
  ): Promise<Fulfillment>;
}

export function deriveConfirmationStatus(
  supplierConfirmed: boolean | undefined,
  buyerConfirmed: boolean | undefined,
): FulfillmentStatus {
  if (supplierConfirmed === true && buyerConfirmed === true) return 'CONFIRMED';
  if (
    (supplierConfirmed === true && buyerConfirmed === false) ||
    (supplierConfirmed === false && buyerConfirmed === true)
  )
    return 'DISPUTED';
  if (supplierConfirmed === true) return 'SUPPLIER_CONFIRMED';
  if (buyerConfirmed === true) return 'BUYER_CONFIRMED';
  return 'PENDING';
}
