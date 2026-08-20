# Database package boundary

This package is intentionally dependency-free. Bidly has selected managed PostgreSQL and a Kysely/`pg` direction, but installing a query layer, inventing tables, or creating fake migrations before the first approved domain model would create architectural drift.

The first schema task must read `docs/product/BIDLY_DOMAIN.md` and ADR-0003, then define tenant keys, exact money, timezone-aware instants, immutable offer versions, state/version checks, idempotency, capacity constraints/locking, audit/outbox behavior, migration rollback/roll-forward, and real PostgreSQL integration/concurrency tests.
