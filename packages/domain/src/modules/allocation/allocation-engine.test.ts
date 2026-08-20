import { describe, expect, it } from 'vitest';

import { parseEntityId } from '../../shared/index.js';

import { AllocationEngine, type AllocationInput, type AllocationPolicyVersion } from './index.js';

const policy: AllocationPolicyVersion = {
  id: parseEntityId<'AllocationPolicyVersion'>('0198c000-0000-7000-8000-000000000020'),
  version: 1,
  weights: {
    price: 30,
    quality: 20,
    distance: 10,
    availability: 15,
    supplierReliability: 20,
    conditions: 5,
  },
  minimumScore: 4_000,
};

function input(suffix: string, overrides: Partial<AllocationInput> = {}): AllocationInput {
  return {
    buyerDemandId: parseEntityId<'BuyerDemand'>('0198c000-0000-7000-8000-000000000021'),
    bidVersionId: parseEntityId<'BidVersion'>(`0198c000-0000-7000-8000-0000000000${suffix}`),
    capacityUnitId: parseEntityId<'CapacityUnit'>(`0198c000-0000-7000-8000-0000000001${suffix}`),
    buyerEligible: true,
    supplierEligible: true,
    coverageEligible: true,
    capacityAvailable: 1n,
    scores: {
      price: 8_000,
      quality: 7_000,
      distance: 7_000,
      availability: 8_000,
      supplierReliability: 7_000,
      conditions: 8_000,
    },
    ...overrides,
  };
}

describe('AllocationEngine', () => {
  const engine = new AllocationEngine();

  it('excludes ineligible, uncovered, and capacity-empty candidates', () => {
    const result = engine.allocate(
      [
        input('30'),
        input('31', { buyerEligible: false }),
        input('32', { coverageEligible: false }),
        input('33', { capacityAvailable: 0n }),
      ],
      policy,
      true,
    );
    expect(result).toHaveLength(1);
  });

  it('keeps multiple winners and explainable components', () => {
    const result = engine.allocate([input('30'), input('31')], policy, true);
    expect(result).toHaveLength(2);
    expect(result[0]?.explanation.supplierReliability.weight).toBe(20);
  });

  it('does not equate the cheapest score with the best overall score', () => {
    const cheapButUnreliable = input('30', {
      scores: {
        price: 10_000,
        quality: 1_000,
        distance: 5_000,
        availability: 2_000,
        supplierReliability: 0,
        conditions: 2_000,
      },
    });
    const balanced = input('31');
    const [winner] = engine.allocate([cheapButUnreliable, balanced], policy, false);
    expect(winner?.bidVersionId).toBe(balanced.bidVersionId);
  });

  it('selects one winner per buyer in single-winner mode', () => {
    const secondBuyer = parseEntityId<'BuyerDemand'>('0198c000-0000-7000-8000-000000000022');
    const result = engine.allocate(
      [input('30'), input('31'), input('32', { buyerDemandId: secondBuyer })],
      policy,
      false,
    );
    expect(result).toHaveLength(2);
    expect(new Set(result.map((candidate) => candidate.buyerDemandId)).size).toBe(2);
  });
});
