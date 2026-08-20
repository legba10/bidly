import { describe, expect, it } from 'vitest';

import { money, parseEntityId, toUtcInstant } from '../../shared/index.js';

import { BidValidationService, TotalCostCalculator, type BidVersion } from './index.js';

const validVersion: BidVersion = {
  id: parseEntityId<'BidVersion'>('0198c000-0000-7000-8000-000000000010'),
  bidId: parseEntityId<'Bid'>('0198c000-0000-7000-8000-000000000011'),
  version: 1,
  headlinePrice: money(54_900n, 'RUB'),
  headlineCadence: 'MONTHLY',
  pricingComplete: true,
  capacityQuantity: 10n,
  fulfillmentStart: toUtcInstant('2026-09-01T00:00:00.000Z'),
  fulfillmentEnd: toUtcInstant('2026-10-01T00:00:00.000Z'),
  geographyIds: [parseEntityId<'CoverageArea'>('0198c000-0000-7000-8000-000000000012')],
  conditions: [],
  inclusions: [],
  exclusions: [],
  fees: [
    { code: 'installation', amount: money(10_000n, 'RUB'), cadence: 'ONE_TIME', mandatory: true },
  ],
  categoryAttributes: { speedMbps: 500 },
};

describe('TotalCostCalculator', () => {
  it('uses exact minor units over the comparison period', () => {
    const result = new TotalCostCalculator().calculate(
      validVersion.headlinePrice,
      validVersion.headlineCadence,
      validVersion.fees,
      12,
    );
    expect(result.totalCost).toEqual(money(668_800n, 'RUB'));
    expect(result.effectiveMonthlyPrice).toEqual(money(55_733n, 'RUB'));
  });
});

describe('BidValidationService', () => {
  const service = new BidValidationService();

  it('rejects zero capacity, impossible dates, and missing total cost inputs', () => {
    const invalid: BidVersion = {
      ...validVersion,
      capacityQuantity: 0n,
      fulfillmentStart: validVersion.fulfillmentEnd,
      pricingComplete: false,
      fees: [],
    };
    const result = service.validate(invalid, {
      requiredAttributeKeys: new Set(['speedMbps']),
      supplierVerified: true,
      supplierCapacityLimit: 100n,
    });
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        'CAPACITY_MUST_BE_POSITIVE',
        'INVALID_FULFILLMENT_RANGE',
        'TOTAL_COST_INPUTS_MISSING',
      ]),
    );
  });

  it('rejects a supplier capacity claim above its limit', () => {
    const result = service.validate(validVersion, {
      requiredAttributeKeys: new Set(['speedMbps']),
      supplierVerified: true,
      supplierCapacityLimit: 5n,
    });
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'CAPACITY_LIMIT_EXCEEDED' }),
    );
  });
});
