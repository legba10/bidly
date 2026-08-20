# Test strategy

The test pyramid is risk-based: domain invariants and exact calculations receive fast unit coverage; database/authorization/concurrency receive real integration coverage when those layers exist; critical journeys receive three-browser E2E coverage. Bootstrap tests intentionally exercise only technical surfaces.

## Current foundation

| Layer             | Tool                            | Current scope                                                                                                                         | Merge expectation                  |
| ----------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Unit              | Vitest                          | state machines, money, bid/category validation, allocation, authorization, offers, fulfillment, attribution, reliability, config      | Blocking                           |
| Component         | Vitest + Testing Library        | UI behavior and semantics                                                                                                             | Blocking                           |
| Accessibility     | axe-core + Storybook addon      | jsdom checks semantic rules; real-browser suites also check contrast; serious/critical violations fail; manual checks remain required | Blocking for automated violations  |
| Story interaction | Storybook + Vitest browser mode | stories rendered in real Chromium                                                                                                     | Blocking                           |
| E2E smoke         | Playwright                      | technical web/API availability, accessibility, and security headers against built production web/API processes                        | Chromium, Firefox, WebKit blocking |
| API integration   | Vitest + Fastify inject         | health/security headers, auth failures, safe errors, request IDs, validation, idempotent command boundary                             | Blocking                           |
| PostgreSQL        | Vitest + PostgreSQL 18.4        | empty migration, last-slot race, replay-safe reservation, TTL release, audit/outbox                                                   | Blocking in CI                     |

## Future product minimums

- Domain: calculations, state transitions, eligibility, allocation, exact fees, Total Cost, and capacity.
- Database: transaction rollback, conditional updates/locks, constraints, idempotency, outbox, and migrations.
- Security: actor and organization matrices, BOLA/IDOR, mass assignment, session/CSRF, webhook replay, PII redaction.
- Concurrency: many contenders for the last unit prove at most one consumption and deterministic retry behavior.
- E2E: only approved buyer/supplier journeys, including failure and recovery. Do not create fake flows to inflate coverage.

## Test quality rules

- Prefer observable outcomes over implementation details and snapshots.
- No arbitrary sleeps; wait for an explicit state or clock under test control.
- A flaky test is a defect. Quarantine requires an owner, issue, evidence, and expiry; CI retries cannot conceal a persistent failure.
- Browser smoke starts the built production processes rather than development servers. Development hot reload may replace a document while a browser accessibility scan is evaluating it and is not a reliable release-runtime test surface.
- Each corrected P0/P1 or security defect gets a regression test.
- External providers are behind contracts and use deterministic fakes in unit tests or controlled sandboxes in integration tests. Never call production.
- Test fixtures contain synthetic data only and must not resemble real secrets or personal data.

## Property-based testing decision

Allocation, capacity, and money are good future property-test targets, but no additional generator dependency is added at this stage. Their state spaces are currently small and deterministic example/concurrency tests exercise the approved rules more clearly. Re-evaluate a mature generator library when allocation policies gain more dimensions or randomized concurrency/model-based tests can expose states that the current matrix cannot. Until then, dependency cost and opaque generated failures outweigh the marginal coverage.

## Manual accessibility coverage

Automation cannot prove complete WCAG conformance. Before releasing affected UI, verify keyboard-only order and operation, visible focus, screen-reader names/announcements, 200% zoom/reflow, contrast, reduced motion, error recovery, and that price/status/availability are not color-only.
