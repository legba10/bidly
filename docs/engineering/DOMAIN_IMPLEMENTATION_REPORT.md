# Domain implementation report

**Stage:** Prompt №2 backend/domain foundation  
**Date:** 2026-08-20

## Implemented modules

The modular monolith contains `identity`, `organizations`, `buyers`, `suppliers`, `catalog`, `geography`, `demand`, `auctions`, `bids`, `capacity`, `allocation`, `offers`, `booking`, `fulfillment`, `attribution`, `reputation`, `billing`, `notifications`, `audit`, `authorization`, and `admin`. Domain code depends on shared value types and ports, not Fastify, PostgreSQL, Next.js, or vendor SDKs.

External SMS, email, maps, object storage, payment, and billing are ports only. No provider SDK, Kafka, Redis, microservice split, or production consumer UI was introduced.

## Database schema

Migration `0001_bidly_core.sql` targets PostgreSQL 18 and creates UUIDv7-keyed relational tables, strong foreign keys, checks, scoped uniqueness, status histories, idempotency, audit, outbox, notifications, and retention policy. JSON is limited to schema-validated category/configuration fields and safe event metadata; critical relationships are columns and foreign keys.

Kysely is used for explicit queries and transactions. The migration runner records SHA-256 checksums and takes a PostgreSQL advisory transaction lock. Development seed is doubly gated and contains only marked synthetic Surgut fixtures.

## Domain invariants

The enforced/tested rules include exact minor-unit money, binding immutable bid/offer versions, offer expiry, organization/ownership/state authorization, explainable allocation, no capacity oversell, replay-safe reservation, fulfillment double confirmation/dispute, and no CPA eligibility without confirmed fulfillment. The complete list is in [BIDLY_INVARIANTS](../product/BIDLY_INVARIANTS.md).

## Auction lifecycle

The explicit state machine covers demand collection, verification, supplier bidding, bid validation, allocation, user acceptance, booking/connection, delivery, confirmation, settlement, terminal states, partial fill, and dispute. Rules, category definition, and allocation policy are version references on each auction. See [AUCTION_ENGINE](../product/AUCTION_ENGINE.md).

## Capacity model

Capacity is modeled as supplier limit → bid capacity pool → concrete units → allocations/reservations/releases. `PostgresCapacityRepository` serializes the unit row, performs a conditional counter update, inserts reservation/audit/outbox/idempotency results in one transaction, and releases expired soft reservations in bounded `SKIP LOCKED` batches. PostgreSQL remains authoritative; no stale cache participates in allocation. See [CAPACITY_ENGINE](../product/CAPACITY_ENGINE.md).

## Allocation model

Eligibility, coverage, and available capacity are hard filters. Versioned weighted scores rank price, quality, distance, availability, supplier reliability, and terms with stored explanations and deterministic tie-breaking. Single-winner mode selects one candidate per buyer; multi-winner preserves ranked alternatives. Price is intentionally not the only factor.

## RBAC

Authorization combines platform role, supplier membership/role, active organization, ownership, and resource state. Supplier A cannot operate on supplier B; locked bids cannot be edited; support does not inherit moderator/admin mutation powers. Admin overrides require admin role, reason, optimistic version, and audit-capable repository. See [RBAC](../security/RBAC.md).

## Security controls

PII is separated from marketplace tables; error and log contracts are non-sensitive; request IDs correlate logs/audit; Fastify redacts auth/cookie headers; Helmet and no-store defaults are enabled. Abuse cases cover buyers, suppliers, and privileged insiders. Rate limiting is a transport port so deployment policy can be selected without making Redis authoritative. Supply-chain dependencies remain exact-pinned and CI security gates from Prompt №1 remain in place.

## API

Zod command schemas generate OpenAPI 3.1 from one source. `/api/v1` currently exposes health-independent actor/category reads and the offer-accept boundary with auth, request ID, resource-ID consistency, payload hashing, idempotency key, rate-limiter port, and safe error mapping. Other typed contracts are reserved but not falsely exposed before transaction repositories exist. See [API contract](../api/API_CONTRACT.md).

## Tests

Unit tests cover auction transitions, bid validation/total cost, eligibility and multi-winner allocation, supplier isolation and locked state, offer ownership/expiry/snapshot immutability, category validation, fulfillment confirmation/dispute, CPA eligibility, reliability scoring, and audited admin override contracts. API injection tests cover auth failure, safe errors, correlation IDs, validation, and the idempotency boundary.

The PostgreSQL integration suite migrates an empty database, races two requests for the last capacity unit, verifies one winner, rejects payload-changing key reuse, verifies bounded TTL release/audit/outbox, accepts an allocation-backed offer atomically, and proves the active-slot booking uniqueness constraint. CI is configured to run it against PostgreSQL `18.4-alpine`. The local workstation used for this report has no Docker, PostgreSQL, Podman, or WSL distribution, so these three database-backed tests were discovered but skipped locally and cannot honestly be reported as executed.

## Final validation evidence

| Gate                                     | Result on this workstation                                                                |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| Typecheck / ESLint / Prettier            | passed                                                                                    |
| Unit + component + accessibility         | 16 files, 44 tests passed                                                                 |
| Storybook real Chromium                  | 5 files, 21 tests passed                                                                  |
| Chromium + Firefox + WebKit E2E          | 12 tests passed                                                                           |
| API production smoke                     | liveness `200`; unauthenticated `/api/v1/me` safe `401` with request ID                   |
| Package/application/Storybook builds     | passed                                                                                    |
| Gitleaks / OSV-Scanner / Semgrep / Trivy | passed after removing the vulnerable `@storybook/nextjs-vite → image-size` dev-only chain |
| PostgreSQL 18 integration                | 1 file / 3 tests discovered and skipped locally; blocking CI job configured               |

`pnpm install --ignore-scripts` completed under the lockfile supply-chain policy. Lifecycle scripts for newly added runtime dependencies remained disabled; the reviewed bootstrap allowlist was not broadened.

## ADRs

- 0007 — domain module boundaries;
- 0008 — capacity concurrency and idempotency;
- 0009 — lightweight transactional outbox;
- 0010 — PostgreSQL 18 UUIDv7 identifiers.

## Known limitations and risks

- Offer acceptance and capacity reservation have production PostgreSQL transactions. Booking, fulfillment, attribution, billing, auction, and admin mutations remain specified as ports/schema until their complete transaction repositories and authorization policies are wired.
- Authentication has secure-session-ready data/ports but no email/phone/SMS provider or credential flow; enabling it needs a dedicated threat-modelled decision.
- Rate limiting is an interface, not a distributed implementation. Deployments must provide a durable/shared limiter before public writes are enabled.
- Outbox persistence exists, but leasing/retry/notification workers are not implemented.
- Retention policy schema exists, but deletion/anonymization scheduling and legal policy values are not implemented.
- PostgreSQL migration syntax and concurrency still require the first successful remote CI run; they are not locally verified until a PostgreSQL 18 runtime is available.
- No measured production query plans, load profile, federal partitioning threshold, or backup restore exercise exists yet.
- Storybook 10.5.10 required a narrow, lockfile-pinned pnpm patch for Windows path separators and percent-decoded Cyrillic file URLs. The patch is isolated under `patches/` and covered by the Storybook browser gate; it should be removed once upstream contains an equivalent fix.

## What is intentionally NOT implemented yet

No Prompt №3 work was started: there is no landing page, consumer marketplace UI, supplier dashboard, production copy flow, animation, or visual branding. There are also no payments, settlement execution, invoice issuing, real notifications, real customer data, moderation console, arbitration product, fraud ML, AI allocation, Kafka, Kubernetes, Redis cache, feature-flag SaaS, or provider integrations. Typed ports/data models are not represented as completed operational products.
