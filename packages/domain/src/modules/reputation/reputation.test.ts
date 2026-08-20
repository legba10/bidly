import { describe, expect, it } from 'vitest';

import { parseEntityId } from '../../shared/index.js';

import { SupplierScoreCalculator } from './index.js';

describe('SupplierScoreCalculator', () => {
  it('is deterministic and exposes penalties', () => {
    const result = new SupplierScoreCalculator().calculate({
      organizationId: parseEntityId<'SupplierOrganization'>('0198c000-0000-7000-8000-000000000050'),
      allocated: 10,
      accepted: 10,
      fulfilled: 8,
      cancelled: 1,
      complaints: 1,
      priceMismatch: 0,
      conditionMismatch: 0,
      noCapacity: 0,
      onTime: 7,
    });
    expect(result.penaltyBasisPoints).toBe(500);
    expect(result.finalBasisPoints).toBeGreaterThan(0);
    expect(result.finalBasisPoints).toBeLessThanOrEqual(10_000);
  });
});
