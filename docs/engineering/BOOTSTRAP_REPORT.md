# Bootstrap report

**Status:** completed technical foundation, with explicitly recorded local limitations  
**Evidence date:** 2026-08-20

This report distinguishes implemented controls from planned architecture. It does not claim that a service is deployed, a provider is contracted, or a database-backed test has run where the required local runtime was unavailable.

## Environment

| Item                                | Observed                                                  | Result                                                                                            |
| ----------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Operating system                    | Windows 10 Home 10.0.19045 x64                            | supported local development workstation                                                           |
| Node.js                             | `v24.15.0`; project pin is `24.19.0`                      | compatible with the declared `>=24.15.0 <25` engine; update remains a reviewed workstation action |
| pnpm                                | `11.19.0`                                                 | exact project package-manager version                                                             |
| Git                                 | `2.53.0.windows.3`                                        | available                                                                                         |
| Python                              | `3.12.10`                                                 | used only by the isolated Semgrep toolchain                                                       |
| Docker / PostgreSQL 18 runtime      | not installed locally                                     | OCI and real PostgreSQL validation require CI or an explicitly installed local runtime            |
| GitHub CLI                          | not installed                                             | remote/PR operations are intentionally out of scope                                               |
| Codex desktop / repository guidance | `AGENTS.md`, local skills, available plugins/MCP reviewed | root and nested instructions are in use; no unreviewed skill collection was installed             |

`pnpm install --frozen-lockfile` completed successfully on this workstation. The project uses the official Codex instruction and skill mechanisms documented in [ENVIRONMENT.md](ENVIRONMENT.md).

## Installed

- pnpm TypeScript monorepo with separate web, API, domain, database, validation, configuration, UI, and testing packages;
- React/Next.js web foundation, Fastify API foundation, Zod validation, Kysely with `pg`, and PostgreSQL 18 migration support;
- strict TypeScript, ESLint, Prettier, import/type rules, frozen lockfile, reviewed dependency-build allowlist, and local Git hooks;
- Bidly-owned semantic tokens, accessible primitives, Storybook, axe checks, Vitest browser/component tests, and Playwright smoke tests;
- Gitleaks, OSV-Scanner, Semgrep, Trivy, CodeQL configuration, Dependabot, Docker build targets, and pinned CI actions;
- RU-first portable infrastructure documentation, provider matrix, data-residency model, scaling path, recovery baseline, cost model, and OpenTofu skeleton.

The selection rationale, source, license, risk, and rejected alternatives are recorded in [THIRD_PARTY_REVIEW.md](THIRD_PARTY_REVIEW.md).

## Rejected or deferred

- Product screens, payment collection, provider SDKs, production resources, accounts, secrets, and production personal data: not authorized for bootstrap.
- Kubernetes, Kafka, Elasticsearch, microservices, event-sourcing framework, managed foreign production dependencies, and a foreign authentication provider: not justified before measured operational need.
- Default shadcn theme and unreviewed component/skill collections: rejected to retain Bidly visual ownership and supply-chain control.
- Prisma/Drizzle, Radix/Base UI packages, and property-test generators: credible options deferred until a concrete requirement outweighs their maintenance cost.
- Blind upgrades: `pnpm outdated` showed newer major releases for TypeScript/ESLint and a newer Node LTS patch; none was changed without compatibility and release-note review.

## Codex skills

Local, non-executable skills are available under `.agents/skills`:

- `bidly-domain` — marketplace state, allocation, capacity, fulfillment, and monetization invariants;
- `bidly-product-design` and `bidly-ux-copy` — consumer-marketplace design system and Russian product copy;
- `bidly-security` — OWASP-oriented security, tenancy, PII, replay, and capacity-race review;
- `bidly-testing` — test-layer selection and non-flaky regression evidence;
- `bidly-code-review` — evidence-based review criteria.

They reference the source-of-truth product, design, security, and testing documents rather than duplicating long policy in `AGENTS.md`.

## Design system

`packages/ui` implements semantic color, typography, geometry, motion, and focus tokens; accessible primitives; numeric formatting; icons; a technical-only pattern; and Storybook stories. The web page is intentionally a technical demonstration, not a marketplace screen or fictitious buyer/supplier flow. UI direction and acceptance criteria are in [BIDLY_DESIGN_PRINCIPLES.md](../design/BIDLY_DESIGN_PRINCIPLES.md).

## Testing

- Unit, component, and accessibility suite: **16 files / 44 tests passed**.
- Storybook browser suite: **5 files / 21 tests passed**.
- Playwright production-runtime smoke: **12 tests passed** across Chromium, Firefox, and WebKit, including axe and response-header checks.
- A WebKit accessibility failure was found during this verification when smoke tests used the Next development server: hot reload could replace the document during axe evaluation. The suite now starts built production web/API processes; the full rerun passed without test retries.
- PostgreSQL integration/concurrency suite: **2 tests skipped locally**, because `TEST_DATABASE_URL` and a PostgreSQL 18 runtime are absent. The CI job starts `postgres:18.4-alpine` and executes this suite. It is not represented as locally passed.

## Security

The local security command completed successfully:

- Gitleaks: no secrets found;
- OSV-Scanner: no dependency findings;
- Semgrep: 0 blocking findings across the configured baseline;
- Trivy filesystem/IaC: 0 high or critical vulnerability, misconfiguration, or secret findings.

Secrets remain absent from `.env.example`; private environment files, tooling state, build output, reports, and IaC state are ignored by Git. The baseline, threat model, data-residency constraints, RBAC, abuse cases, and dependency policy are documented under [`docs/security`](../security/).

## CI

GitHub Actions defines:

- `quality`: frozen install, formatting, lint, typecheck, unit/component/accessibility tests, Storybook tests/build, and application build;
- `e2e`: built production web/API smoke on Chromium, Firefox, and WebKit;
- `postgres-integration`: PostgreSQL 18 migration, concurrency, idempotency, audit, outbox, and booking-uniqueness tests;
- `containers`: OCI build plus Trivy scan for web and API images;
- `security`: history/files secrets scan, OSV, Semgrep, and Trivy;
- `CodeQL`: JavaScript/TypeScript `security-extended` analysis;
- Dependabot: weekly npm and GitHub Actions update proposals with no automatic merge.

Workflow files establish the checks, but branch protection has not been applied because no remote repository or GitHub plan was placed in scope.

## Architectural decisions

- [ADR-0001 — pnpm monorepo and modular monolith](../architecture/decisions/0001-monorepo-modular-monolith.md)
- [ADR-0002 — Next.js web and Fastify API](../architecture/decisions/0002-web-api-stack.md)
- [ADR-0003 — PostgreSQL and explicit transactional query layer](../architecture/decisions/0003-postgresql-query-layer.md)
- [ADR-0004 — RU-first portable infrastructure](../architecture/decisions/0004-ru-first-portable-infrastructure.md)
- [ADR-0005 — Bidly-owned UI foundation](../architecture/decisions/0005-ui-foundation.md)
- [ADR-0006 — OpenTofu IaC skeleton](../architecture/decisions/0006-opentofu-iac.md)
- [ADR-0007 to ADR-0010 — domain boundaries, capacity/idempotency, outbox, and UUIDv7](../architecture/decisions/)

## Remaining risks

1. Real PostgreSQL 18 concurrency, migration, and image validation cannot be proven locally until an approved Docker or PostgreSQL runtime is available. CI is configured for these gates but has not been executed from this unconnected local repository.
2. Docker, GitHub CLI, provider contracts, remote state, production secrets, DNS, and branch-protection configuration remain intentionally absent.
3. The local Node patch is older than `.node-version`; it is engine-compatible, but the pinned patch should be installed through the official Node distribution before a developer relies on exact workstation parity.
4. The Storybook static build emits a development-artifact chunk-size warning. It does not affect the web production bundle or current functional gates; revisit code splitting if Storybook grows materially.
5. Provider availability, SLA, pricing, processor terms, and 152-FZ suitability require current procurement, legal review, and a restore/portability proof before production selection. No document claims compliance based only on a provider statement.

## Next recommended step

Run the PostgreSQL 18 integration suite and OCI image build/scan in the configured CI environment, then review its evidence before enabling any database-backed HTTP mutation or provisioning production infrastructure.
