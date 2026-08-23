import { describe, expect, it } from 'vitest';

import {
  developmentCategoryFixtures,
  homeInternetBuyerSchema,
  homeInternetOfferSchema,
} from './index.js';

describe('category definitions', () => {
  it('provides the five explicit DEV category definitions without collapsing market types', () => {
    expect(developmentCategoryFixtures.map((category) => category.slug)).toEqual([
      'home_internet',
      'mobile_connection',
      'dental_hygiene',
      'fitness',
      'tire_service',
    ]);
  });

  it('rejects incomplete buyer and teaser-price supplier payloads', () => {
    expect(homeInternetBuyerSchema.safeParse({ minimumSpeedMbps: 100 }).success).toBe(false);
    expect(
      homeInternetOfferSchema.safeParse({
        monthlyMinor: 10_000,
        speedMbps: 100,
      }).success,
    ).toBe(false);
  });
});
