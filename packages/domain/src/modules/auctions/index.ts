import { z } from 'zod';

import type { EntityId, UtcInstant } from '../../shared/index.js';

import { DomainError } from '../../shared/index.js';

export type AuctionStatus =
  | 'DRAFT'
  | 'COLLECTING_DEMAND'
  | 'DEMAND_VERIFICATION'
  | 'SUPPLIER_BIDDING'
  | 'BID_VALIDATION'
  | 'ALLOCATION'
  | 'USER_ACCEPTANCE'
  | 'BOOKING_OR_CONNECTION'
  | 'SERVICE_DELIVERY'
  | 'CONFIRMED'
  | 'SETTLEMENT'
  | 'CLOSED'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'EXPIRED'
  | 'PARTIALLY_FILLED';

export type AuctionMode = 'SINGLE_WINNER' | 'MULTI_WINNER';

export interface Auction {
  readonly id: EntityId<'Auction'>;
  readonly demandPoolVersionId: EntityId<'DemandPoolVersion'>;
  readonly categoryVersionId: EntityId<'CategoryVersion'>;
  readonly rulesVersionId: EntityId<'AuctionRulesVersion'>;
  readonly allocationPolicyVersionId: EntityId<'AllocationPolicyVersion'>;
  readonly mode: AuctionMode;
  readonly status: AuctionStatus;
  readonly version: number;
}

export interface AuctionWindow {
  readonly demandCollectionStart: UtcInstant;
  readonly demandCollectionEnd: UtcInstant;
  readonly verificationDeadline: UtcInstant;
  readonly biddingStart: UtcInstant;
  readonly biddingEnd: UtcInstant;
  readonly allocationDeadline: UtcInstant;
  readonly acceptanceDeadline: UtcInstant;
  readonly fulfillmentStart: UtcInstant;
  readonly fulfillmentEnd: UtcInstant;
  readonly finalCloseAt: UtcInstant;
}

export interface AuctionRules {
  readonly versionId: EntityId<'AuctionRulesVersion'>;
  readonly allowBidRevisionBeforeValidation: boolean;
  readonly requiredVerifiedDemand: number;
}

export interface AuctionSupplierEligibility {
  readonly auctionId: EntityId<'Auction'>;
  readonly organizationId: EntityId<'SupplierOrganization'>;
  readonly eligible: boolean;
  readonly reasonCode?: string;
}

export const auctionTransitionSchema = z.object({
  auctionId: z.uuid(),
  targetStatus: z.enum([
    'DRAFT',
    'COLLECTING_DEMAND',
    'DEMAND_VERIFICATION',
    'SUPPLIER_BIDDING',
    'BID_VALIDATION',
    'ALLOCATION',
    'USER_ACCEPTANCE',
    'BOOKING_OR_CONNECTION',
    'SERVICE_DELIVERY',
    'CONFIRMED',
    'SETTLEMENT',
    'CLOSED',
    'CANCELLED',
    'DISPUTED',
    'EXPIRED',
    'PARTIALLY_FILLED',
  ]),
  expectedVersion: z.number().int().nonnegative(),
  reason: z.string().trim().min(3).max(1000).optional(),
});

const forwardTransitions: Readonly<Record<AuctionStatus, ReadonlySet<AuctionStatus>>> = {
  DRAFT: new Set(['COLLECTING_DEMAND', 'CANCELLED']),
  COLLECTING_DEMAND: new Set(['DEMAND_VERIFICATION', 'CANCELLED', 'EXPIRED']),
  DEMAND_VERIFICATION: new Set(['SUPPLIER_BIDDING', 'CANCELLED', 'EXPIRED']),
  SUPPLIER_BIDDING: new Set(['BID_VALIDATION', 'CANCELLED', 'EXPIRED']),
  BID_VALIDATION: new Set(['ALLOCATION', 'CANCELLED', 'PARTIALLY_FILLED']),
  ALLOCATION: new Set(['USER_ACCEPTANCE', 'PARTIALLY_FILLED', 'CANCELLED']),
  USER_ACCEPTANCE: new Set(['BOOKING_OR_CONNECTION', 'PARTIALLY_FILLED', 'EXPIRED', 'CANCELLED']),
  BOOKING_OR_CONNECTION: new Set(['SERVICE_DELIVERY', 'PARTIALLY_FILLED', 'DISPUTED', 'CANCELLED']),
  SERVICE_DELIVERY: new Set(['CONFIRMED', 'PARTIALLY_FILLED', 'DISPUTED']),
  CONFIRMED: new Set(['SETTLEMENT', 'DISPUTED']),
  SETTLEMENT: new Set(['CLOSED', 'DISPUTED']),
  PARTIALLY_FILLED: new Set([
    'BOOKING_OR_CONNECTION',
    'SERVICE_DELIVERY',
    'CONFIRMED',
    'SETTLEMENT',
    'CLOSED',
    'DISPUTED',
  ]),
  DISPUTED: new Set(['SETTLEMENT', 'CLOSED']),
  CANCELLED: new Set(),
  EXPIRED: new Set(),
  CLOSED: new Set(),
};

export class AuctionStateMachine {
  canTransition(current: AuctionStatus, target: AuctionStatus): boolean {
    return forwardTransitions[current].has(target);
  }

  transition(auction: Auction, target: AuctionStatus): Auction {
    if (!this.canTransition(auction.status, target)) {
      throw new DomainError('INVALID_STATE_TRANSITION', 'Auction transition is not allowed', {
        current: auction.status,
        target,
      });
    }
    return { ...auction, status: target, version: auction.version + 1 };
  }
}

export interface AuctionRepository {
  findForUpdate(id: EntityId<'Auction'>): Promise<Auction | undefined>;
  saveTransition(auction: Auction, previousStatus: AuctionStatus, reason?: string): Promise<void>;
}
