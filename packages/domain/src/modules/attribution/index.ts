import type { CommandMetadata, EntityId, UtcInstant } from '../../shared/index.js';

export type AttributionEventType =
  | 'OFFER_ACCEPTED'
  | 'BOOKING_CREATED'
  | 'ARRIVED'
  | 'SERVICE_COMPLETED'
  | 'BUYER_CONFIRMED'
  | 'SUPPLIER_CONFIRMED'
  | 'CPA_ELIGIBLE';
export type AttributionStatus = 'RECORDED' | 'CONFIRMED' | 'DISPUTED' | 'REVERSED';

export interface AttributionEvent {
  readonly id: EntityId<'AttributionEvent'>;
  readonly conversionId: EntityId<'Conversion'>;
  readonly type: AttributionEventType;
  readonly status: AttributionStatus;
  readonly evidenceReference?: string;
  readonly occurredAt: UtcInstant;
}

export interface Conversion {
  readonly id: EntityId<'Conversion'>;
  readonly offerId: EntityId<'Offer'>;
  readonly fulfillmentId: EntityId<'Fulfillment'>;
  readonly status: 'PENDING' | 'CONFIRMED' | 'DISPUTED' | 'REVERSED';
  readonly cpaEligibleAt?: UtcInstant;
}

export interface AttributionRepository {
  appendIdempotently(event: AttributionEvent, metadata: CommandMetadata): Promise<AttributionEvent>;
  findConversionByOffer(offerId: EntityId<'Offer'>): Promise<Conversion | undefined>;
}

export class AttributionService {
  cpaEligible(conversion: Conversion, fulfillmentStatus: string): boolean {
    return conversion.status === 'CONFIRMED' && fulfillmentStatus === 'CONFIRMED';
  }
}
