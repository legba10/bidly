# Bidly bootstrap threat model

**Method:** asset/trust-boundary analysis with STRIDE-style categories and marketplace abuse cases.  
**Status:** baseline to update with every new data flow, actor, product mutation, provider, or trust boundary.

## Assets

- buyer identity/contact, consent, preferences, reliability and fulfillment evidence;
- supplier identity, organization membership, commercial terms, capacity and documents;
- immutable offer/acceptance versions, allocation inputs/results, audit trail;
- capacity inventory/reservations and auction lifecycle state;
- Bidly Pass/token/QR material and webhook/idempotency records;
- commission/CPA attribution and future billing records;
- credentials, signing/encryption keys, CI/release/IaC state;
- availability, marketplace fairness, ranking integrity, and user trust.

## Trust boundaries

```text
Untrusted browser / bots
        │ HTTPS + edge controls
        ▼
Public web/API boundary ───── future external provider webhooks
        │ validated command           │ signature/replay validation
        ▼                             ▼
Application authorization and domain boundary
        │ private, least-privilege identities
        ├── PostgreSQL source of truth
        ├── Redis-compatible ephemeral state
        ├── private S3-compatible objects
        └── redacted telemetry/audit sinks

Supplier organization A ──X── Supplier organization B
Staff/support boundary ────── purpose/role/audit constrained
CI/build boundary ─────────── no production data or long-lived runtime secrets
```

## Principal threats and mandatory mitigations

| Threat / abuse case                                      | Impact                                              | Required controls and evidence                                                                                               |
| -------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| BOLA/IDOR or organization-ID substitution                | Supplier/buyer data breach or unauthorized mutation | trusted actor/org context; scoped queries; deny default; cross-tenant matrix tests                                           |
| Staff or compromised admin overreach                     | mass PII/commercial exposure                        | least privilege, purpose-based access, re-auth, audit, periodic grant review, break-glass controls                           |
| Capacity race for last slot                              | overselling, financial/reputation loss              | DB constraint + transaction/conditional update/lock; idempotency; deterministic retries; concurrent test                     |
| Replay/duplicate bid, acceptance, booking, pass, webhook | repeated/altered side effect                        | unique IDs, actor/payload-bound idempotency, nonce/timestamp/signature, atomic outcome store                                 |
| Silent offer change or price substitution                | buyer charged different terms; dispute/fraud        | immutable/versioned terms; acceptance bound to version; Total Cost; audit and regression test                                |
| Unauthorized supplier bidding/manipulated allocation     | marketplace unfairness/data leakage                 | organization permission; lifecycle/state version; reproducible algorithm version/inputs; abuse monitoring                    |
| Fake fulfillment/CPA attribution                         | supplier/Bidly financial fraud                      | scoped expiring pass, replay resistance, dual/category evidence, dispute path, anomaly review                                |
| New supplier claims huge capacity                        | mass failed fulfillment                             | verified/history-based limits, monitoring, gradual trust; no self-report-only trust                                          |
| Account takeover/session theft                           | PII and high-impact marketplace actions             | secure session lifecycle, MFA/risk controls where justified, re-auth, rotation/revocation, alerting                          |
| Injection/XSS/CSRF/SSRF/open redirect                    | data theft, internal access, account actions        | runtime validation, parameterization, encoding, CSRF/origin, CSP, URL/redirect allowlists, egress controls                   |
| Malicious/oversized file                                 | malware, parser compromise, cost/DoS                | quarantine, content/size/archive limits, scan, generated key, private storage, signed access                                 |
| PII/token leakage in logs/analytics/foreign SDK          | legal/security exposure                             | allowlisted schemas, source/collector redaction tests, RU-hosted defaults, outbound inventory                                |
| Secret/dependency/build compromise                       | source/runtime takeover                             | protected branches, pinned actions, reviewed scripts, frozen lockfile, Gitleaks/OSV/Semgrep/CodeQL/Trivy, provenance roadmap |
| Resource exhaustion/bot demand manipulation              | outage, distorted demand/cost                       | layered rate/bot controls, verification, quotas, bounded queries/payloads, anomaly monitoring                                |
| Backup compromise or untested recovery                   | permanent data loss/extortion                       | isolated encrypted backups, separated rights, PITR, restore exercises, rotation/incident runbook                             |
| Provider outage/control-plane denial                     | service loss                                        | multi-AZ initial topology, tested backups, portable artifacts/data, provider exit plan; no premature multi-cloud claims      |

## Security assumptions to challenge

- The browser, supplier clients, callbacks, files, and all IDs are attacker-controlled.
- Redis, CDN, queues, and analytics can be stale or unavailable; they cannot weaken database invariants.
- A valid login is not authorization and a supplier employee is not automatically authorized for every organization resource.
- Encryption does not repair excessive collection, broad access, logging, or missing retention.
- Provider certification/marketing does not prove Bidly compliance.
- Automated scanners and axe find classes of defects, not complete security/accessibility correctness.

## Review triggers

Update this model before introducing authentication, PII fields, database schema, auction mutation, file upload, realtime channel, worker/queue, external provider/webhook, payment/billing behavior, mobile app, proprietary cloud service, or a new staff role. Record new flow, data class, attacker, abuse cases, controls, residual risk, tests, and incident/recovery effect.
