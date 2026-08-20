# ADR-0003: PostgreSQL with explicit transactional query layer

- Status: accepted direction; dependency intentionally deferred
- Date: 2026-08-20

## Context

Capacity, accepted offer versions, auditability, idempotency, and settlement attribution require relational constraints and understandable transaction/locking semantics. No product schema exists yet, so installing an ORM or migration tool now would be speculative.

## Decision

Use managed PostgreSQL in Russia as the future source of truth. Prefer Kysely plus the official `pg` driver and an explicit migration mechanism once the first approved schema is designed. Kysely provides typed SQL without hiding PostgreSQL transactions/locks and permits reviewed SQL for `SELECT … FOR UPDATE`, conditional updates, CTEs, constraints, and query plans.

For capacity, use database constraints plus a transaction with conditional update or appropriate row lock, deterministic lock order, bounded retry on serialization/deadlock, and an idempotency key. Redis cannot be the sole correctness boundary.

## Alternatives

- **Prisma:** productive schema/client tooling, but generated-client/runtime and abstraction around advanced locking are not justified for the expected transaction-heavy core.
- **Drizzle:** capable and lightweight; not selected because Kysely's query-builder/SQL-first boundary is a better initial fit. Re-evaluate with a real schema.
- **Raw `pg`:** maximum control but higher repeated mapping/type maintenance.
- **PostgreSQL in Kubernetes:** rejected absent an exceptional operational requirement; managed HA/PITR is preferred.

## Consequences

- The database package remains dependency-free during bootstrap; this avoids a fake schema and unused install scripts.
- Schema design must include tenant keys, exact money, timezones, immutable versions, checks, unique/idempotency constraints, and audit/outbox strategy.
- Provider-specific PostgreSQL extensions require a separate ADR and exit plan.

References: [Kysely documentation](https://kysely.dev/docs/intro), [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html), [Drizzle transactions](https://orm.drizzle.team/docs/transactions).
