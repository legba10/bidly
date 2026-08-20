import type { EntityId } from '../../shared/index.js';

export interface AllocationWeights {
  readonly price: number;
  readonly quality: number;
  readonly distance: number;
  readonly availability: number;
  readonly supplierReliability: number;
  readonly conditions: number;
}

export interface AllocationPolicy {
  readonly id: EntityId<'AllocationPolicy'>;
  readonly categoryVersionId: EntityId<'CategoryVersion'>;
  readonly currentVersionId: EntityId<'AllocationPolicyVersion'>;
}

export interface AllocationPolicyVersion {
  readonly id: EntityId<'AllocationPolicyVersion'>;
  readonly version: number;
  readonly weights: AllocationWeights;
  readonly minimumScore: number;
}

export interface AllocationInput {
  readonly buyerDemandId: EntityId<'BuyerDemand'>;
  readonly bidVersionId: EntityId<'BidVersion'>;
  readonly capacityUnitId: EntityId<'CapacityUnit'>;
  readonly buyerEligible: boolean;
  readonly supplierEligible: boolean;
  readonly coverageEligible: boolean;
  readonly capacityAvailable: bigint;
  readonly scores: Readonly<Record<keyof AllocationWeights, number>>;
}

export interface AllocationCandidate {
  readonly buyerDemandId: EntityId<'BuyerDemand'>;
  readonly bidVersionId: EntityId<'BidVersion'>;
  readonly capacityUnitId: EntityId<'CapacityUnit'>;
  readonly score: number;
  readonly rank: number;
  readonly explanation: Readonly<
    Record<keyof AllocationWeights, { readonly score: number; readonly weight: number }>
  >;
}

const scoreKeys = [
  'price',
  'quality',
  'distance',
  'availability',
  'supplierReliability',
  'conditions',
] as const;

export class AllocationEngine {
  allocate(
    inputs: readonly AllocationInput[],
    policy: AllocationPolicyVersion,
    multiWinner: boolean,
  ): readonly AllocationCandidate[] {
    const weightTotal = scoreKeys.reduce((sum, key) => sum + policy.weights[key], 0);
    if (weightTotal <= 0) return [];
    const candidates = inputs
      .filter(
        (input) =>
          input.buyerEligible &&
          input.supplierEligible &&
          input.coverageEligible &&
          input.capacityAvailable > 0n,
      )
      .map((input) => {
        const weighted = scoreKeys.reduce(
          (sum, key) => sum + input.scores[key] * policy.weights[key],
          0,
        );
        const score = Math.floor(weighted / weightTotal);
        return {
          buyerDemandId: input.buyerDemandId,
          bidVersionId: input.bidVersionId,
          capacityUnitId: input.capacityUnitId,
          score,
          explanation: Object.fromEntries(
            scoreKeys.map((key) => [
              key,
              { score: input.scores[key], weight: policy.weights[key] },
            ]),
          ) as AllocationCandidate['explanation'],
        };
      })
      .filter((candidate) => candidate.score >= policy.minimumScore)
      .sort(
        (left, right) =>
          right.score - left.score || left.bidVersionId.localeCompare(right.bidVersionId),
      );
    const byBuyer = new Map<string, AllocationCandidate[]>();
    for (const candidate of candidates) {
      const group = byBuyer.get(candidate.buyerDemandId) ?? [];
      group.push(candidate as AllocationCandidate);
      byBuyer.set(candidate.buyerDemandId, group);
    }
    return [...byBuyer.values()].flatMap((buyerCandidates) => {
      const ranked = buyerCandidates.map((candidate, index) => ({
        ...candidate,
        rank: index + 1,
      }));
      return multiWinner ? ranked : ranked.slice(0, 1);
    });
  }
}

export interface AllocationRepository {
  saveRun(
    auctionId: EntityId<'Auction'>,
    policyVersionId: EntityId<'AllocationPolicyVersion'>,
    candidates: readonly AllocationCandidate[],
  ): Promise<EntityId<'AllocationRun'>>;
  listForBuyer(
    auctionId: EntityId<'Auction'>,
    buyerDemandId: EntityId<'BuyerDemand'>,
  ): Promise<readonly AllocationCandidate[]>;
}
