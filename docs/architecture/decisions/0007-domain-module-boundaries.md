# ADR-0007: Bidly domain module boundaries

- Status: accepted
- Date: 2026-08-20

## Decision

Implement the Prompt №2 model as bounded modules inside `packages/domain/src/modules`; each exports types, runtime schemas, services, and repository/provider ports through its own `index.ts`. PostgreSQL adapters live in `packages/database` and Fastify/application composition in `apps/api`.

Modules exchange typed IDs, commands, results, read ports, and domain events. They do not import another module's private files or query its tables. Shared code is limited to Money, Clock, IDs, actor/request context, pagination, errors, and idempotency/audit metadata.

## Consequences

One process/transaction can preserve capacity, offer, audit, outbox, and ledger invariants without distributed coordination. Boundaries remain extractable if later SLO/ownership evidence justifies services. Architecture tests and review enforce imports until a heavier boundary tool is warranted.
