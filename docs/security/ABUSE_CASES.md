# Marketplace abuse cases

| Actor/surface | Abuse                                | Primary controls                                                          | Required evidence                     |
| ------------- | ------------------------------------ | ------------------------------------------------------------------------- | ------------------------------------- |
| Buyer         | fake demand/mass signup              | verification abstraction, quotas, bounded rate policy, anomaly events     | verification and rate tests           |
| Buyer         | no-show/repeated cancellation        | separate internal reliability events, fair retention/appeal review        | outcome audit; no public person score |
| Buyer         | offer/slot hoarding                  | short soft-reservation TTL, per-actor limits, idempotency, atomic release | TTL and concurrency tests             |
| Buyer         | replay acceptance/booking            | actor+operation+payload-bound idempotency                                 | replay tests                          |
| Supplier      | cross-tenant bid access              | trusted organization scope, ownership predicates, deny default            | Supplier A/B matrix tests             |
| Supplier      | fake/unbounded capacity              | verified manual ceiling, performance history, atomic unit constraints     | limit tests and audit                 |
| Supplier      | teaser price/hidden fees             | category-required Total Cost, fee validation, immutable offer snapshot    | calculation/validation tests          |
| Supplier      | post-auction term change/withdrawal  | versioning, lock state, controlled withdrawal reason/penalty flag         | locked-bid regression                 |
| Supplier      | fake completion/self-generated buyer | scoped hashed Bidly Pass, dual evidence, replay protection, disputes      | attribution tests                     |
| Supplier      | allocation manipulation              | policy version, stored components/inputs, eligibility checks              | deterministic fixtures                |
| Staff         | silent override/privilege abuse      | least privilege, reasoned commands, previous/new safe values, audit       | admin-audit tests                     |
| Platform      | PII over-disclosure/logging          | separate contact tables, post-acceptance purpose gate, allowlisted logs   | PII response/log tests                |

Rate limits are an application port until an approved deployment mechanism exists. They never replace authorization, idempotency, verification, or database constraints.
