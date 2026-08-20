# Capacity engine

PostgreSQL is authoritative. Redis/cache data may reduce reads but cannot approve a reservation, allocation, booking, or consumption.

## Unit model

- `CapacityPool` scopes capacity to a bid version and optionally organization/branch/geography.
- `CapacityUnit` is the narrowest atomic bucket: total units, branch/day, branch/time range, appointment slot, connection capacity, or inventory unit.
- `CapacityReservation` records a buyer/offer/idempotency-bound hold with quantity, state, and optional TTL.
- `CapacityAllocation` records auction allocation; `CapacityRelease` preserves release reason/history.
- `SupplierCapacityLimit` caps accepted capacity using verification/history/manual override. Self-declared capacity never bypasses it.

States: `AVAILABLE`, `SOFT_RESERVED`, `RESERVED`, `CONSUMED`, `RELEASED`, `EXPIRED`. A soft reservation has a UTC expiry. Release/expiry is an idempotent command, not deletion.

## No-overselling transaction

1. Begin transaction and set bounded lock timeout.
2. Resolve an existing idempotency outcome for the same actor/operation/key; reject key reuse with another payload hash.
3. Lock the target `capacity_unit` with `SELECT ... FOR UPDATE`.
4. Re-check active/non-expired reservations and calculate available quantity.
5. If insufficient, return a stable `CAPACITY_UNAVAILABLE` outcome without creating a reservation.
6. Insert one reservation protected by unique idempotency/offer constraints and update reserved counters/version.
7. Append audit and outbox events, then commit.

Database checks keep all quantities non-negative and `reserved + consumed <= total`. Lock acquisition order is capacity pool → sorted capacity units → offer/booking. Deadlock/serialization retries are bounded and observable.

The regression test sends two independent transactions for the last unit and asserts exactly one succeeds. It runs against real PostgreSQL in CI; an in-memory mock cannot certify locking behavior.

## TTL and failures

Expiry workers claim bounded batches with `FOR UPDATE SKIP LOCKED`, change stale `SOFT_RESERVED` rows to `EXPIRED`, decrement counters, and append release/audit/outbox events in one transaction. Retrying the worker is safe. Network failure after commit is recovered through the stored idempotency outcome.
