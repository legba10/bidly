# Data residency and processor boundary

**Status:** architectural baseline, not legal advice  
**Primary market:** Russian Federation  
**Last reviewed:** 2026-08-20

Bidly must be deployable so primary personal-data collection, recording, systematization, accumulation, storage, clarification, and extraction occur on infrastructure physically located in Russia. The current text of Federal Law 152-FZ, including Article 18(5), must be interpreted by qualified Russian counsel for the actual company, data categories, processors, and flows; provider marketing claims do not establish compliance. Official text: [Russian legal information portal](https://ips.pravo.gov.ru/api/ips/legislation/document?baseid=None&hash=98490812b3409e2a8d78a11ca9010f434ea3d9250a11dbbdb78690cd5551bdd6).

## Default production flow

```text
User in browser
      │ HTTPS, minimized request data
      ▼
Russian edge: DNS → DDoS/WAF/CDN/LB
      │ private/provider network where available
      ▼
Application workloads in Russia
      ├── Managed PostgreSQL in Russia (primary record)
      ├── Redis-compatible service in Russia (ephemeral/minimized)
      ├── S3-compatible private storage in Russia
      └── Russian-hosted logs/metrics/traces with redaction
```

Edge services must not cache authenticated or personal responses unless an explicit data classification and cache policy permits it. Redis is not a casual PII mirror. Private objects are private by default and use short-lived, purpose-scoped signed access.

## Data classes and default placement

| Class              | Examples                                                | Default                                     | Required controls                                                 |
| ------------------ | ------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| Public             | approved brand/static assets                            | CDN/object storage in Russia                | integrity, cache/version control                                  |
| Internal           | configuration metadata, non-PII operations              | Russian infrastructure                      | least privilege, audit, backup where critical                     |
| Confidential       | commercial terms, supplier operational data             | Russian app/DB/storage                      | organization isolation, encryption, audit                         |
| Personal data      | identity/contact, consent, booking/fulfillment evidence | Russian primary DB/private storage          | minimization, purpose, retention, access/export/deletion workflow |
| Restricted secrets | credentials, signing keys, pass tokens                  | Russian secrets manager/HSM-capable service | never in source/logs, rotation, least privilege                   |

Detailed categories, legal bases, retention durations, and cross-border rules are deliberately not invented here. They require a data inventory and counsel-approved record of processing before product data is collected.

## Potential external processors

No external production processor is selected or active in this bootstrap.

| Capability               | Default boundary                       | Data that must not leave by default                     | Gate before selection                                                |
| ------------------------ | -------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------- |
| Cloud/edge               | Russian provider                       | all production personal data                            | contract, locations/subprocessors, security, SLA, exit test          |
| Email/SMS/push           | Russian-business-compatible adapter    | unrelated profile/auction data                          | minimization, DPA/contract, delivery/log retention, webhook security |
| Maps/geocoding           | adapter, preferably Russian-hosted     | identity/contact and precise location unless necessary  | purpose review, coordinate/address minimization, retention           |
| Analytics/error tracking | self/Russian-hosted preferred          | identifiers, contact data, offer/pass tokens, free text | event schema review, redaction test, processor approval              |
| AI services              | disabled for production PII by default | any personal/confidential marketplace data              | explicit use case, legal/security review, opt-in/data controls       |
| Payments                 | no integration in initial model        | buyer service-payment data                              | explicit product/legal/PCI architecture and Russian provider ADR     |
| Support tools            | no production feed by default          | full accounts, documents, credentials                   | role model, field minimization, audit/export/deletion                |

## Engineering controls required before product launch

1. Maintain a field-level inventory: purpose, legal basis, owner, region, processor, retention, deletion/export behavior.
2. Record versioned consent/action evidence without duplicating more PII than necessary.
3. Enforce tenant/organization scope and privileged staff access server-side; periodically review grants.
4. Redact structured logs and telemetry at source and collector; test known PII/token fields.
5. Separate public objects from private documents; block public ACLs/policies by default.
6. Encrypt transport and provider-managed storage; govern application-level encryption for especially sensitive fields by threat model.
7. Document backup locations, retention, deletion propagation, and restore access.
8. Map every outbound hostname/data field before enabling a third-party SDK or browser beacon.
9. Run export/deletion/retention and breach-response exercises before claiming the controls operate.

## Exit and migration

Portable PostgreSQL, Redis protocol, S3 API, OCI images, standard HTTPS/DNS, and OpenTelemetry reduce provider lock-in. Quarterly at later maturity, export representative encrypted backups/configuration, restore in an isolated environment, and verify that application/provider ports do not depend on undocumented proprietary behavior.
