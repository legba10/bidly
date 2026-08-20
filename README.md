# Bidly engineering foundation

This repository contains the production-oriented modular-monolith foundation for Bidly, a Russian reverse marketplace. It implements typed bounded domain modules, PostgreSQL 18 migrations, capacity concurrency/idempotency, allocation rules, API contracts, authorization policy, audit/outbox foundations, and automated tests. It intentionally contains no production marketplace UI or real provider integrations.

## Local start

Requirements are pinned in [docs/engineering/ENVIRONMENT.md](docs/engineering/ENVIRONMENT.md).

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

- technical web page: `http://127.0.0.1:3000`
- API liveness: `http://127.0.0.1:3001/health/live`
- Storybook: `pnpm storybook`

## Backend/domain commands

```powershell
# Generate the published OpenAPI 3.1 contract from Zod schemas
pnpm api:generate

# PostgreSQL 18 only
$env:DATABASE_URL='postgresql://...'
pnpm db:migrate

# Synthetic DEV ONLY fixtures; both guards are required
$env:NODE_ENV='development'
$env:BIDLY_ALLOW_DEV_SEED='1'
pnpm db:seed:dev

# Real database concurrency suite
$env:TEST_DATABASE_URL='postgresql://.../bidly_test'
pnpm test:integration
```

Start with [domain architecture](docs/architecture/DOMAIN_ARCHITECTURE.md), [data model](docs/architecture/DATA_MODEL.md), [invariants](docs/product/BIDLY_INVARIANTS.md), and the [implementation report](docs/engineering/DOMAIN_IMPLEMENTATION_REPORT.md). PostgreSQL is authoritative for capacity and allocation; no cache may approve a reservation.

Before a merge, run `pnpm validate`, `pnpm test:integration` with PostgreSQL 18, and the security commands described in [QUALITY_GATES.md](docs/engineering/QUALITY_GATES.md). Project-wide agent rules live in [AGENTS.md](AGENTS.md); detailed business, security, design, testing, and review guidance is provided through local skills under `.agents/skills`.
