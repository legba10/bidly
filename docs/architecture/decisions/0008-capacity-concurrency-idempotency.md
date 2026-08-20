# ADR-0008: PostgreSQL locking for capacity and acceptance

- Status: accepted
- Date: 2026-08-20

## Decision

Use PostgreSQL as the sole capacity authority. Reserve the last unit inside one transaction using `SELECT ... FOR UPDATE` on a `capacity_unit`, a checked conditional counter update, unique actor/operation idempotency records, and unique active offer/booking constraints. Lock multiple units in sorted UUID order. Use bounded retry only for PostgreSQL serialization/deadlock codes and emit safe metrics on every failure.

Soft reservations have UTC expiry and are released in bounded `FOR UPDATE SKIP LOCKED` batches. Redis may cache availability hints but cannot authorize or finalize capacity.

## Alternatives

- Optimistic version-only updates remain useful defense in depth but create avoidable retry contention for the known last-slot case.
- Advisory locks are not the primary control because row ownership and inspection are clearer here.
- Redis locks/counters are rejected as the correctness boundary.

## Evidence

Real PostgreSQL integration tests must race independent transactions for one unit, retry the winning idempotency key, reject a changed payload, and prove TTL release cannot underflow counters.
