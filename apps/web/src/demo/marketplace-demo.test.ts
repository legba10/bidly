import { describe, expect, it } from 'vitest';

import { demoCategories, findDemoCategories } from './marketplace-demo';

describe('DEV marketplace demo', () => {
  it('contains five deterministic categories with finite availability', () => {
    expect(demoCategories).toHaveLength(5);
    expect(demoCategories.every((category) => category.availability.length > 0)).toBe(true);
  });

  it('supports Russian synonyms and simple morphology without changing domain semantics', () => {
    expect(findDemoCategories('спортзал').map((category) => category.slug)).toEqual(['fitness']);
    expect(findDemoCategories('колёса').map((category) => category.slug)).toEqual(['tire_service']);
    expect(findDemoCategories('клиники').map((category) => category.slug)).toEqual([
      'dental_hygiene',
    ]);
  });
});
