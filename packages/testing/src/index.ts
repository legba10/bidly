import type { Result } from 'axe-core';

const BLOCKING_IMPACTS = new Set(['serious', 'critical']);

export function getBlockingAccessibilityViolations(
  violations: readonly Result[],
): readonly Result[] {
  return violations.filter(
    (violation) => typeof violation.impact === 'string' && BLOCKING_IMPACTS.has(violation.impact),
  );
}
