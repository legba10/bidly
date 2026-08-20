# ADR-0010: UUIDv7 non-sequential public identifiers

- Status: accepted
- Date: 2026-08-20

## Decision

Use PostgreSQL 18 `uuidv7()` defaults for persisted aggregate/event identifiers. APIs expose these opaque UUIDs and never sequential database IDs. References remain real foreign keys; UUIDs are not authorization.

UUIDv7 provides time-local index insertion and standard UUID interoperability without a custom extension or an additional runtime ID package. Time ordering is operationally useful but not treated as a trusted business timestamp. Domain tests may use injected deterministic UUIDs; production creation remains database-owned where atomic insert/return is natural.

## Consequences

PostgreSQL 18.4 is the tested baseline. Provider support for PostgreSQL 18 is a deployment gate. If an earlier managed major is selected, application-generated RFC UUIDv7 requires a new reviewed implementation/ADR update; silently switching to sequences is forbidden.
