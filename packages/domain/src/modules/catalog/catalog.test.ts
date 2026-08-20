import { describe, expect, it } from 'vitest';

import {
  developmentCategoryFixtures,
  homeInternetBuyerSchema,
  homeInternetOfferSchema,
} from './index.js';

describe('category definitions', () => {
  it('provides the three DEV category definitions without a category switch', () => {
    expect(developmentCategoryFixtures.map((category) => category.slug)).toEqual([
      'home_internet',
      'dental_hygiene',
      'fitness',
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
