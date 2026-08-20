# System architecture baseline

Bidly starts as a typed modular monolith with separately deployable web and API processes. It preserves domain and provider boundaries without paying the operational cost of microservices or Kubernetes before traffic/team evidence requires them.

```text
Browser
  │ standard HTTPS
  ▼
Russian DDoS/WAF/CDN (as required) → Load balancer
                                       ├─ Web instance 1..N (Next.js/Node OCI)
                                       └─ API instance 1..N (Fastify/Node OCI)
                                              │ private network
                                              ├─ Managed PostgreSQL
                                              ├─ Redis-compatible service
                                              └─ S3-compatible object storage
```

Only the technical web page and liveness/readiness API exist today. PostgreSQL, Redis, object storage, queues, authentication, and product modules are architectural targets, not running integrations.

## Repository boundaries

| Path                  | Responsibility                                                       | Forbidden coupling                                  |
| --------------------- | -------------------------------------------------------------------- | --------------------------------------------------- |
| `apps/web`            | Server-first web delivery and composition                            | Database access, vendor SDKs, domain rules in React |
| `apps/api`            | HTTP boundary, runtime validation, authorization composition, health | UI imports, trusting client authorization           |
| `packages/domain`     | Domain types, invariants, provider ports                             | Framework, database, HTTP, or vendor dependencies   |
| `packages/database`   | Future PostgreSQL query/transaction adapters                         | Product UI or provider SDKs                         |
| `packages/validation` | Runtime boundary schemas and environment parsing                     | Hidden business defaults                            |
| `packages/config`     | Pure locale and shared technical configuration                       | Secrets or runtime mutation                         |
| `packages/ui`         | Bidly tokens, primitives, components, patterns, icons                | Domain workflows, data access, authorization        |
| `packages/testing`    | Shared synthetic test helpers                                        | Production code dependencies on test utilities      |

Dependencies point inward: apps compose packages; infrastructure implements domain/application ports. Domain code never imports adapters.

## API direction

- Standard HTTPS and versioned JSON REST are the default external boundary because they are portable, observable, cacheable where safe, and simpler to authorize than an unbounded query surface.
- Every untrusted request/response boundary receives runtime validation. TypeScript types alone are not validation.
- Mutations use server-side actor/organization authorization, explicit command schemas, idempotency for realistic retries, optimistic versioning where relevant, and audit context.
- Lists are paginated and bounded. No unbounded database query or avoidable N+1 is acceptable.
- Error responses expose a stable code and safe user message, not stack traces, SQL, tokens, or personal data.
- Realtime is deferred. When justified, it will publish versioned state derived from the database rather than becoming a second source of truth.

## Provider ports

`SmsProvider`, `EmailProvider`, `MapProvider`, `PaymentProvider`, `ObjectStorageProvider`, and `BillingProvider` live as vendor-neutral contracts in `packages/domain`. No implementation is selected during bootstrap. Payment and billing ports do not authorize a buyer-payment flow.

## Observability boundary

Future workloads emit structured logs, metrics, and traces using OpenTelemetry-compatible concepts. Logs use request/correlation identifiers and stable event names; they exclude credentials, raw tokens, personal data, full request bodies, and signed URLs. A Russian-hosted collector/backend is required for production data unless a documented processor and legal/security review approves otherwise.

## Key decisions

- [ADR-0001: pnpm monorepo and modular monolith](decisions/0001-monorepo-modular-monolith.md)
- [ADR-0002: Next.js web and Fastify API](decisions/0002-web-api-stack.md)
- [ADR-0003: PostgreSQL and Kysely direction](decisions/0003-postgresql-query-layer.md)
- [ADR-0004: RU-first portable infrastructure](decisions/0004-ru-first-portable-infrastructure.md)
- [ADR-0005: owned UI foundation](decisions/0005-ui-foundation.md)
- [ADR-0006: OpenTofu IaC baseline](decisions/0006-opentofu-iac.md)
