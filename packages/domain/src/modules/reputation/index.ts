import type { EntityId, OrganizationId, UserId } from '../../shared/index.js';

export interface BuyerReliabilityProfile {
  readonly buyerId: UserId;
  readonly joinedAuctions: number;
  readonly acceptedOffers: number;
  readonly completedServices: number;
  readonly cancelled: number;
  readonly noShow: number;
}

export interface SupplierPerformanceProfile {
  readonly organizationId: OrganizationId;
  readonly allocated: number;
  readonly accepted: number;
  readonly fulfilled: number;
  readonly cancelled: number;
  readonly complaints: number;
  readonly priceMismatch: number;
  readonly conditionMismatch: number;
  readonly noCapacity: number;
  readonly onTime: number;
  readonly scoreBasisPoints: number;
  readonly formulaVersionId: EntityId<'SupplierScoreFormulaVersion'>;
}

export interface SupplierScoreExplanation {
  readonly fulfillmentBasisPoints: number;
  readonly onTimeBasisPoints: number;
  readonly penaltyBasisPoints: number;
  readonly finalBasisPoints: number;
}

export class SupplierScoreCalculator {
  calculate(
    profile: Omit<SupplierPerformanceProfile, 'scoreBasisPoints' | 'formulaVersionId'>,
  ): SupplierScoreExplanation {
    const accepted = Math.max(profile.accepted, 1);
    const fulfillment = Math.floor((profile.fulfilled * 10_000) / accepted);
    const onTime = Math.floor((profile.onTime * 10_000) / Math.max(profile.fulfilled, 1));
    const penalties = Math.min(
      10_000,
      (profile.cancelled +
        profile.complaints +
        profile.priceMismatch +
        profile.conditionMismatch +
        profile.noCapacity) *
        250,
    );
    const finalBasisPoints = Math.max(
      0,
      Math.floor((fulfillment * 7 + onTime * 3) / 10) - penalties,
    );
    return {
      fulfillmentBasisPoints: fulfillment,
      onTimeBasisPoints: onTime,
      penaltyBasisPoints: penalties,
      finalBasisPoints,
    };
  }
}

export interface ReputationRepository {
  buyerProfile(buyerId: UserId): Promise<BuyerReliabilityProfile>;
  supplierProfile(organizationId: OrganizationId): Promise<SupplierPerformanceProfile>;
  appendOutcome(eventId: EntityId<'AttributionEvent'>): Promise<void>;
}
