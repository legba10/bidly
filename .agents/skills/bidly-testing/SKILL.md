---
name: bidly-testing
description: Plan, implement, or review Bidly unit, integration, component, accessibility, E2E, concurrency, and regression tests. Excludes tasks that only edit prose with no behavioral impact.
---

# Bidly testing

Choose the lowest reliable level while preserving critical cross-boundary tests.

- Unit: domain calculations, exact money, capacity, allocation, state transitions, fees, and eligibility.
- Integration: real database transactions, authorization, organization isolation, auction lifecycle, idempotency, and concurrent capacity booking.
- Component: behavior, semantics, keyboard/focus, variants, Russian long text, unusual numeric values, and responsive constraints.
- Accessibility: axe plus manual-test expectations for keyboard, names, focus, contrast, reduced motion, and non-color cues. Serious/critical automated violations block merge.
- E2E: critical buyer and supplier journeys in Chromium, Firefox, and WebKit. Keep the bootstrap suite technical; never invent product behavior to make a test pass.
- Regression: every corrected P0/P1 or security defect gets a test that fails before the fix and passes after it.

Avoid snapshot-only confidence, shared mutable fixtures, arbitrary sleeps, and tests coupled to implementation details. Make time, randomness, external providers, and concurrency controllable. Preserve evidence for flaky failures; do not hide them with unconditional retries or skips.
