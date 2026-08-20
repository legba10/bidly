# Security baseline

**Target references:** [OWASP ASVS 5.0.0](https://owasp.org/www-project-application-security-verification-standard/), [OWASP Top 10:2025](https://owasp.org/Top10/2025/), [OWASP WSTG 4.2](https://owasp.org/www-project-web-security-testing-guide/), [WCAG 2.2](https://www.w3.org/TR/WCAG22/).  
**Status:** engineering requirements; only controls listed as current are implemented in the bootstrap.

Bidly is expected to become a high-value, multi-tenant consumer marketplace processing Russian personal data, supplier commercial data, constrained capacity, immutable offer terms, and fulfillment/commission attribution. Security is a correctness property and a release gate.

## Current bootstrap controls

- exact dependency versions and one pnpm lockfile;
- dependency lifecycle scripts denied until allowlisted after inspection;
- strict TypeScript, runtime environment validation, lint rules for unsafe async/type patterns;
- web/API security headers with documented interim CSP limitations;
- API log redaction and no request-body logging;
- Gitleaks, OSV-Scanner, Semgrep, CodeQL, Dependabot, and Trivy CI configuration;
- Storybook/axe and Playwright security-header smoke tests;
- `.env.example` contains non-secret local defaults only;
- provider/payment/storage contracts have no vendor implementations;
- no authentication, product mutation, database, upload, webhook, payment, or PII collection surface exists.

## Required before each surface exists

### Authentication and sessions

- Use a reviewed Russian-production-compatible identity architecture; no mandatory foreign authentication provider.
- Hash passwords with a current memory-hard policy if passwords are used; protect reset/enrollment/recovery equally.
- Rotate session identifiers on authentication/privilege change, use `Secure`, `HttpOnly`, appropriate `SameSite`, bounded lifetime, server-side revocation, and device/risk controls proportional to threat.
- Apply generic responses and layered throttling to login, registration, recovery, OTP, and verification. Do not create account-enumeration or brute-force oracles.
- Require stronger re-authentication for organization administration, payout/billing changes, sensitive export, and other defined high-impact actions.

### Authorization and multi-tenancy

- Deny by default on the server. Client state, hidden controls, URL ownership, and supplied organization IDs are not authorization.
- Derive actor, organization membership, role, and resource scope from trusted server context; query by both tenant and resource identifiers.
- Supplier A can never read, infer, update, export, or receive events for supplier B.
- Test an actor/resource/action matrix including BOLA/IDOR, bulk endpoints, exports, search, files, websockets, background jobs, and indirect IDs.
- Privileged support access is time/role/purpose bounded and audited; impersonation requires explicit visible controls and traceability.

### Input, output, and browser security

- Validate type, shape, length, range, enum, and cross-field invariants at every untrusted boundary; allowlist mass-assignable fields.
- Parameterize SQL. Avoid command execution; if unavoidable, use fixed executable/argument APIs without shell interpolation.
- Contextually encode output. Avoid raw HTML; sanitize with a reviewed policy only when an approved rich-text requirement exists.
- Protect state-changing browser requests from CSRF using same-site design plus token/origin controls appropriate to the auth model.
- Keep CORS disabled until a separate origin is approved; then allowlist exact origins/methods/headers and never reflect arbitrary origins with credentials.
- Keep CSP restrictive, report/test changes, and move from the bootstrap inline-style/script allowance to nonces/hashes before sensitive product UI.
- Validate redirect destinations and outbound URLs; SSRF-capable fetchers require scheme/host allowlists, DNS/IP checks, private-range blocking, size/time limits, and redirect revalidation.

### APIs, replay, and concurrency

- Version public contracts and cap payloads, pagination, query cost, timeouts, and concurrency.
- Use idempotency keys for realistic retried mutations; bind key to actor, endpoint, validated payload hash, outcome, and expiry.
- Verify webhook signature, timestamp/skew, provider/key version, unique event ID, expected content type, and replay store before side effects.
- Capacity, acceptance, and protected offer changes validate state/version and write effects in one database transaction with constraints/locks and concurrency tests.
- Rate limits are actor/IP/device/resource aware as appropriate and fail safely. They are not a substitute for authorization.

### Auctions and offers

- Only authorized supplier-organization actors may bid; prevent cross-organization visibility and mutation.
- Store exact, versioned bid terms. Protect protected-stage terms from silent edits and bind acceptance/fulfillment to the accepted version.
- Detect duplicate/replayed bids and price/condition substitution. Audit actor, organization, before/after version, request/idempotency context, and time.
- Allocation/ranking versions and inputs are reproducible and manipulation-reviewed. Lowest price does not auto-win.

### Files and object storage

- Private buckets and block-public-access policy by default; public assets use a separate intentional path.
- Authorize metadata and object access server-side. Signed URLs are short-lived, method/object/content constrained, and never logged.
- Validate type from content, extension, size, count, archive depth, and filename; store under generated keys outside executable paths.
- Scan/quarantine uploads before use, strip active content/metadata when required, and protect parsers from decompression/resource bombs.

### Personal data and secrets

- Follow [DATA_RESIDENCY.md](../architecture/DATA_RESIDENCY.md): minimize fields and processors, record purpose/consent, define retention/export/deletion, and keep primary systems in Russia.
- Secrets enter through an approved secrets manager or local ignored environment. Never place them in source, images, logs, telemetry, browser bundles, IaC state, tickets, or test fixtures.
- Rotate credentials and signing keys; scope identities per workload/environment; prefer short-lived credentials when supported.
- Encrypt in transit and provider-managed storage. Application-level encryption/key separation follows data classification and threat model, not blanket claims.

### Logging, audit, and observability

- Structured logs use allowlisted fields, event names, correlation IDs, severity, and safe error codes.
- Never log credentials, cookies, authorization headers, reset/OTP/pass tokens, full signed URLs, raw request bodies, documents, or unnecessary PII.
- Security/domain audit events are append-oriented, access-controlled, time-synchronized, retention-defined, and protected against silent mutation.
- Alerts cover auth abuse, authorization failures, replay, capacity invariant failures, protected offer changes, secret findings, dependency findings, and recovery failures without exposing payloads.

### Dependencies and supply chain

Follow [DEPENDENCY_POLICY.md](DEPENDENCY_POLICY.md). Pin CI actions by full commit SHA, review package lifecycle scripts, use lockfile-frozen installs, scan dependencies/secrets/SAST/IaC/images, and never auto-merge an update without the full relevant gates.

## Exceptions

A security exception must include finding/control, affected scope, evidence, business reason, compensating controls, owner, severity, expiry, tracking issue, and approval. Expired exceptions fail the gate. “False positive” requires reproducible evidence and the narrowest suppression.
