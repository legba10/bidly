import { describe, expect, it } from 'vitest';

import {
  formatDateTime,
  formatInteger,
  formatMoneyMinor,
  formatPercentageBasisPoints,
} from './locale.js';

describe('Russian locale formatting', () => {
  it('formats large integer values without precision loss', () => {
    expect(formatInteger(1_842_300n).replaceAll('\u00A0', ' ')).toBe('1 842 300');
  });

  it('formats exact minor units without floating-point arithmetic', () => {
    expect(formatMoneyMinor(54_900n)).toBe('549\u00A0₽');
    expect(formatMoneyMinor(184_230_005n).replaceAll('\u00A0', ' ')).toBe('1 842 300,05 ₽');
  });

  it('uses a true minus sign for percentage deltas', () => {
    expect(formatPercentageBasisPoints(-2_700n)).toBe('−27%');
  });

  it('requires an explicit timezone for deterministic output', () => {
    expect(formatDateTime('2026-08-20T10:00:00Z', 'Europe/Moscow')).toContain('13:00');
  });

  it('rejects unsafe JavaScript numbers', () => {
    expect(() => formatInteger(Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
  });
});
