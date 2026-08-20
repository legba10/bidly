import { describe, expect, it } from 'vitest';

import { LocalFeatureFlags } from './feature-flags.js';

describe('LocalFeatureFlags', () => {
  it('is deny-by-default and enables only named local flags', () => {
    const flags = LocalFeatureFlags.parse('category.fitness,auction.multi_winner');
    expect(flags.enabled('category.fitness')).toBe(true);
    expect(flags.enabled('category.home_internet')).toBe(false);
  });

  it('fails closed for an unknown flag', () => {
    expect(() => LocalFeatureFlags.parse('category.uncontrolled')).toThrow(
      'Unknown Bidly feature flags',
    );
  });
});
