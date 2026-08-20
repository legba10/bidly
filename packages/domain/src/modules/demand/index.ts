import { z } from 'zod';

import type { EntityId, IdGenerator, UtcInstant, UserId } from '../../shared/index.js';

export type BuyerIntentLevel = 'INTEREST' | 'READY' | 'COMMITTED';
export type BuyerDemandStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'MATCHED'
  | 'VERIFICATION_REQUIRED'
  | 'VERIFIED'
  | 'ALLOCATED'
  | 'OFFER_AVAILABLE'
  | 'ACCEPTED'
  | 'FULFILLING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';
export type DemandPoolStatus =
  'DRAFT' | 'OPEN' | 'VERIFYING' | 'LOCKED' | 'ALLOCATING' | 'CLOSED' | 'CANCELLED';

export interface DemandPool {
  readonly id: EntityId<'DemandPool'>;
  readonly categoryVersionId: EntityId<'CategoryVersion'>;
  readonly status: DemandPoolStatus;
  readonly currentVersion: number;
}

export interface DemandPoolVersion {
  readonly id: EntityId<'DemandPoolVersion'>;
  readonly demandPoolId: EntityId<'DemandPool'>;
  readonly version: number;
  readonly criteria: Readonly<Record<string, unknown>>;
  readonly purchaseWindowStart: UtcInstant;
  readonly purchaseWindowEnd: UtcInstant;
}

export interface DemandPoolMetrics {
  readonly registered: number;
  readonly verified: number;
  readonly committed: number;
}

export interface BuyerDemand {
  readonly id: EntityId<'BuyerDemand'>;
  readonly buyerId: UserId;
  readonly demandPoolId?: EntityId<'DemandPool'>;
  readonly categoryVersionId: EntityId<'CategoryVersion'>;
  readonly cityId: EntityId<'City'>;
  readonly intentLevel: BuyerIntentLevel;
  readonly status: BuyerDemandStatus;
  readonly attributes: Readonly<Record<string, unknown>>;
  readonly purchaseWindowEnd: UtcInstant;
  readonly version: number;
}

export interface BuyerDemandPreference {
  readonly demandId: EntityId<'BuyerDemand'>;
  readonly key: string;
  readonly value: unknown;
}

export interface BuyerDemandVerification {
  readonly id: EntityId<'BuyerDemandVerification'>;
  readonly demandId: EntityId<'BuyerDemand'>;
  readonly method: 'EXPLICIT_CONFIRMATION' | 'EMAIL' | 'PHONE' | 'ADDRESS' | 'CATEGORY_CHECK';
  readonly status: 'PENDING' | 'VERIFIED' | 'FAILED' | 'EXPIRED';
  readonly verifiedAt?: UtcInstant;
}

export const buyerDemandCommandSchema = z.object({
  categoryVersionId: z.uuid(),
  cityId: z.uuid(),
  intentLevel: z.enum(['INTEREST', 'READY', 'COMMITTED']),
  attributes: z.record(z.string(), z.unknown()),
  purchaseWindowEnd: z.iso.datetime({ offset: true }),
});

export interface DemandRepository {
  findDemand(id: EntityId<'BuyerDemand'>, buyerId: UserId): Promise<BuyerDemand | undefined>;
  saveDemand(demand: BuyerDemand, expectedVersion: number): Promise<void>;
  metrics(poolId: EntityId<'DemandPool'>): Promise<DemandPoolMetrics>;
}

export interface DemandVerificationService {
  verifyExplicitConfirmation(
    demand: BuyerDemand,
    confirmedAt: UtcInstant,
  ): Promise<BuyerDemandVerification>;
}

export class SafeDemandVerificationService implements DemandVerificationService {
  constructor(private readonly idGenerator: IdGenerator) {}

  async verifyExplicitConfirmation(
    demand: BuyerDemand,
    confirmedAt: UtcInstant,
  ): Promise<BuyerDemandVerification> {
    return {
      id: this.idGenerator.next<'BuyerDemandVerification'>(),
      demandId: demand.id,
      method: 'EXPLICIT_CONFIRMATION',
      status: 'VERIFIED',
      verifiedAt: confirmedAt,
    };
  }
}
