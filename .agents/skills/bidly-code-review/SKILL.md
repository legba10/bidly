---
name: bidly-code-review
description: Perform evidence-based review of Bidly code or pull requests for correctness, domain integrity, security, data races, UX, accessibility, performance, tests, and maintainability.
---

# Bidly code review

Read the domain/security/design/testing skill relevant to the changed paths. Inspect the actual diff and callers; do not return “looks good” without validation.

Prioritize findings by user/business impact:

1. correctness, authorization, tenant isolation, secrets/PII, monetary integrity, state-machine violations, race conditions, capacity overselling, and irreversible data loss;
2. broken UX, accessibility, idempotency, observability, performance bounds, or missing regression coverage;
3. maintainability issues with a concrete failure mode.

For each finding, cite the smallest useful file/line range, describe the scenario and consequence, and propose the governing invariant rather than a speculative rewrite. Verify tests exercise outcomes, not just code paths. Check bounded queries, N+1 behavior, client-bundle growth, runtime validation, error handling, auditability, documentation, and migration/rollback safety.

If no actionable findings remain, state what was inspected and which commands or evidence support that conclusion, plus any residual risk or untested area.
