# ADR-0004: RU-first portable production infrastructure

- Status: accepted; provider selection deferred
- Date: 2026-08-20

## Context

Bidly must be purchasable, payable, administered, and scaled by a Russian business, with a path to keep primary personal-data systems physically in Russia. Critical production operation cannot depend on Vercel, Supabase, Neon, Firebase, Netlify, Railway, Render, Cloudflare Workers, foreign managed databases/storage/authentication, or another unstable foreign SaaS dependency.

## Decision

Shortlist Yandex Cloud, Selectel, and Cloud.ru. Build around OCI containers, managed PostgreSQL, Redis-compatible protocol, S3-compatible storage, standard HTTPS/DNS, and OpenTelemetry. Initial production topology is DDoS/WAF as required → LB → two stateless app instances → managed PostgreSQL/Redis/S3, without mandatory Kubernetes.

No provider is selected by this ADR. Procurement requires the matrix, proof of concept, legal/processor review, quote, SLA/backup test, and migration rehearsal. Proprietary services require a new ADR containing why, alternatives, data involved, and exit strategy.

## Alternatives

- Foreign platform SaaS: may be used only for optional development with no production PII or runtime dependency; rejected for critical production.
- Immediate Kubernetes: rejected until workload/team/traffic/isolation evidence exceeds operational cost.
- Self-managed PostgreSQL: rejected for initial production unless managed offerings fail a documented requirement.

## Exit strategy

Maintain provider ports and export formats; keep IaC modules provider-separated; restore PostgreSQL and objects into an alternative isolated environment; rebuild OCI artifacts; lower/test DNS cutover; document proprietary replacements and egress limits.

See [provider comparison](../RUSSIAN_PROVIDER_COMPARISON.md) and [data residency](../DATA_RESIDENCY.md).
