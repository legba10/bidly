# Parameterized infrastructure cost model

Do not use fabricated price totals. Before procurement, insert current provider quotes (including VAT/contract terms) into this model and run low/base/high demand scenarios. Currency is RUB unless a contract states otherwise.

## Variables

| Symbol     | Monthly input                                                            |
| ---------- | ------------------------------------------------------------------------ |
| `C_app`    | web/API/worker compute instances, disks, public IPs                      |
| `C_lb`     | load balancer and processed traffic                                      |
| `C_pg`     | managed PostgreSQL CPU/RAM/storage/HA/IO/backup/PITR                     |
| `C_redis`  | managed Redis-compatible topology/storage                                |
| `C_s3`     | object bytes, requests, version retention                                |
| `C_cdn`    | CDN requests and delivered traffic                                       |
| `C_net`    | public/inter-zone/egress traffic not included elsewhere                  |
| `C_obs`    | logs, metrics, traces, retention, alerts                                 |
| `C_sec`    | DDoS/WAF, secrets/KMS, scanning, certificates if billable                |
| `C_msg`    | SMS/email/push units and dedicated sender costs                          |
| `C_backup` | isolated backups and restore-exercise resources                          |
| `C_ops`    | on-call/engineering support and managed-service support plan             |
| `H`        | contingency/headroom factor, initially scenario-tested rather than fixed |

```text
Monthly infrastructure =
  (C_app + C_lb + C_pg + C_redis + C_s3 + C_cdn + C_net
   + C_obs + C_sec + C_msg + C_backup + C_ops) × H
```

## Scenario envelopes

| Scenario         | Topology assumption                                                                         | Dominant unknowns                                  | Quote/model action                                           |
| ---------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| DEV              | one low-cost app path; no production PII; disposable database or isolated managed minimum   | developer hours, managed minimums, logs            | set hard budget/TTL; no HA claim                             |
| EARLY PRODUCTION | LB, 2 app instances, HA managed PG, managed Redis, S3, backups, baseline DDoS/observability | HA premium, DB minimum, support                    | obtain three-provider comparable quote                       |
| 10K MAU          | same topology with measured headroom                                                        | SMS, DB connections, logs, image traffic           | model per active/user/action and peak concurrency            |
| 100K MAU         | independent web/API scale, replicas only if proven, worker/queue                            | traffic, telemetry, DB IO/storage, support         | load-test and use p50/p95/p99 inputs                         |
| 1M MAU           | multi-AZ autoscaling; evaluated orchestration/cells                                         | egress/CDN, high availability, staffing, retention | architecture and procurement review; no linear extrapolation |

## Unit drivers to collect

- peak and average request rate, concurrency, response bytes, cache hit ratio;
- MAU/DAU and actions per active user by market type;
- PostgreSQL writes/reads, connection concurrency, data/index growth, PITR volume;
- private/public object count, average size, download/upload frequency, versions;
- log/metric/trace bytes per request and retention by data class;
- SMS/email attempts per verified delivery and fraud/rate-limit overhead;
- restore exercise duration and temporary resources;
- inter-zone and public egress by component.

## Cost guardrails

- Tag resources by environment/service/owner and alert on budget variance.
- Keep logs/telemetry allowlisted and sampled; never cut audit evidence blindly to save cost.
- Revisit reserved/committed capacity only after a stable measured baseline.
- Include VAT, backups, traffic, HA, support, and migration/exit cost; a cheap list price is not Total Cost.
- Compare provider quotes using identical availability, retention, traffic, and support assumptions.
