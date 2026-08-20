# ADR-0001: pnpm monorepo and modular monolith

- Status: accepted
- Date: 2026-08-20

## Context

Bidly needs shared TypeScript contracts, UI, validation, and testing while product boundaries are still forming. Independent microservices or a heavy task orchestrator would add deployment, telemetry, versioning, and supply-chain cost without measured need.

## Decision

Use a pnpm workspace with `apps/web`, `apps/api`, and focused `packages/*`. Start with a modular monolith and two deployable Node processes. Use package scripts and pnpm's topological execution; do not add Turborepo/Nx until build graph size and CI measurements justify it.

Modules communicate through explicit imports/ports, not cross-module database access. A future service extraction requires ownership, data, SLO, consistency, deployment, observability, and failure-mode evidence.

## Consequences

- One lockfile and exact versions reduce drift and simplify scanning.
- Shared source can evolve atomically.
- Boundaries depend on review/lint/architecture tests until stronger enforcement is needed.
- CI may become slower at scale; add caching/orchestration only from measurements.
