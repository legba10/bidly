import { describe, expect, it } from 'vitest';

import { parseEntityId, toUtcInstant } from '../../shared/index.js';

import { AttributionService, type Conversion } from './index.js';

const conversion: Conversion = {
  id: parseEntityId<'Conversion'>('0198c000-0000-7000-8000-000000000201'),
  offerId: parseEntityId<'Offer'>('0198c000-0000-7000-8000-000000000202'),
  fulfillmentId: parseEntityId<'Fulfillment'>('0198c000-0000-7000-8000-000000000203'),
  status: 'CONFIRMED',
  cpaEligibleAt: toUtcInstant('2026-09-02T10:00:00.000Z'),
};

describe('AttributionService', () => {
  it('allows CPA only after a confirmed conversion and confirmed fulfillment', () => {
    const service = new AttributionService();
    expect(service.cpaEligible(conversion, 'CONFIRMED')).toBe(true);
    expect(service.cpaEligible({ ...conversion, status: 'PENDING' }, 'CONFIRMED')).toBe(false);
    expect(service.cpaEligible(conversion, 'SUPPLIER_CONFIRMED')).toBe(false);
  });
});
