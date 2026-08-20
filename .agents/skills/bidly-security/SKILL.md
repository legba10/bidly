---
name: bidly-security
description: Threat-model, implement, or review security-sensitive Bidly code, APIs, authorization, personal-data flows, multi-tenancy, auctions, capacity, integrations, or security automation.
---

# Bidly application security

Use [`docs/security/SECURITY_BASELINE.md`](../../../docs/security/SECURITY_BASELINE.md), [`THREAT_MODEL.md`](../../../docs/security/THREAT_MODEL.md), and [`DEPENDENCY_POLICY.md`](../../../docs/security/DEPENDENCY_POLICY.md). Target OWASP ASVS 5.0, OWASP Top 10:2025, WSTG 4.2, and WCAG-related security behavior where applicable.

## Mandatory review surface

Check authentication, server-side authorization, IDOR/BOLA, tenant and organization scope, sessions, CSRF, XSS, injection, SSRF, redirects, uploads, rate limits, brute force, mass assignment, unsafe deserialization, secrets, PII/log leakage, headers, CORS/CSP, webhooks, replay, audit logging, dependencies, and supply chain.

Supplier A must never read or mutate supplier B's data. Minimize staff and supplier PII access; document purpose, consent, retention, deletion/export, residency, and every processor. Do not send production PII to foreign analytics, logs, AI, monitoring, or error tracking by default.

Treat capacity booking as a hostile race: use database-enforced atomicity, idempotency, deterministic locks, and concurrency tests. Protect auctions from unauthorized bidding, replay/duplicate bids, accepted-offer mutation, price substitution, and post-auction condition changes. Version material offer terms after protected stages; never mutate them silently.

For security-sensitive changes, write abuse cases and regression tests, keep responses non-enumerating, redact logs, use least privilege, and fail closed. Do not mark a scanner finding ignored without an owner, expiry, rationale, and compensating control.
