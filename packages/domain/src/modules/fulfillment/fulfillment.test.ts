import { describe, expect, it } from 'vitest';

import { deriveConfirmationStatus } from './index.js';

describe('fulfillment double confirmation', () => {
  it('confirms matching evidence', () => {
    expect(deriveConfirmationStatus(true, true)).toBe('CONFIRMED');
  });

  it('creates a dispute when confirmations conflict', () => {
    expect(deriveConfirmationStatus(true, false)).toBe('DISPUTED');
    expect(deriveConfirmationStatus(false, true)).toBe('DISPUTED');
  });
});
