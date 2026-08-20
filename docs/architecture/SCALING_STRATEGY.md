# Scaling strategy

Scale only after measured saturation, reliability risk, or team/workload complexity justifies the next stage. User counts are planning ranges, not automatic triggers; workload shape and SLO evidence decide.

## Stage plan

| Area           | Stage 1: 1–10k users                                                                    | Stage 2: 10k–100k                                                                        | Stage 3: 100k–1m+                                                        | Stage 4: federal scale                                          |
| -------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Application    | LB → 2 stateless web/API instances; rolling deploy                                      | independent web/API scaling; multiple AZ; background worker only for proven durable jobs | autoscaling groups or evaluated orchestrator; workload isolation         | multi-region/zone cells only if SLO and team justify            |
| PostgreSQL     | managed HA PostgreSQL, private network, PITR                                            | vertical scale + read replica for proven read load; connection pooler                    | partition/archive only from query evidence; replicas and failover drills | evaluated sharding/cells; no premature distributed database     |
| Redis          | managed single primary + HA option for cache/rate coordination; no final capacity truth | replication/failover; separated workloads if contention                                  | clustered topology only after key/throughput analysis                    | cell-local caches/coordination with explicit consistency        |
| Queues         | transactional outbox table and simple worker when first async need appears              | managed/self-hosted portable broker selected by ADR                                      | partitioned consumers, DLQ, backpressure and replay tooling              | cell/region routing and disaster strategy                       |
| Object storage | private S3 buckets, lifecycle/versioning by class                                       | CDN for approved public assets; upload scanning pipeline                                 | partitioned prefixes/accounts if limits require                          | replication/restore strategy based on RPO and legal constraints |
| CDN/edge       | DDoS/LB; CDN only public immutable assets                                               | tuned cache rules and WAF from observed threats                                          | origin shielding/capacity plan                                           | multi-provider only if outage economics justify                 |
| Observability  | structured redacted logs, golden signals, uptime checks                                 | OpenTelemetry collector, traces sampling, SLO dashboards                                 | scalable storage, tail/risk sampling, capacity forecasts                 | cell-level SLO/error budgets and federated incident view        |
| Backups        | daily automated + PITR, S3 versioning where appropriate, quarterly restore exercise     | tighter restore cadence and replica failover drill                                       | cross-zone/account isolation, more frequent restore exercises            | tested regional/cell recovery and documented degraded modes     |

## Expected bottlenecks and move triggers

### Stage 1 → 2

- sustained resource saturation after query/code optimization;
- database connections or slow queries threaten the SLO;
- deploys or one-AZ failures cannot meet the accepted availability target;
- asynchronous work measurably harms request latency;
- restore/failover exercise misses approved RTO/RPO.

### Stage 2 → 3

- independent workloads need different scaling or isolation;
- queue lag, write volume, table/index size, or storage throughput crosses tested safe headroom;
- manual capacity planning becomes a recurring availability risk;
- team ownership and deployment frequency justify orchestration cost;
- security boundaries require stronger workload isolation.

### Stage 3 → 4

- a regional/cell failure exceeds business tolerance;
- provider/zone limits or concentrated blast radius cannot meet the approved SLO;
- measured federal traffic requires data locality/cell routing;
- the organization can operate multi-cell recovery, consistency, and incident response.

## Kubernetes decision gate

Kubernetes is not a bootstrap or first-production requirement. Consider it only when workload count, deployment orchestration, autoscaling, isolation, traffic, and platform-team capacity produce a measured benefit greater than cluster, networking, security, upgrade, and on-call complexity. A new ADR must compare VM/autoscaling-group and managed-container alternatives and include an exit/skills plan.

## Performance rules at every stage

- server-first rendering where appropriate; no unnecessary client components or giant bundles;
- optimized images and predictable, data-class-aware caching;
- bounded pagination and queries; query plans/indexes reviewed for hot paths;
- no avoidable N+1; no unbounded fan-out or queue retry;
- capacity and money correctness are never weakened for throughput;
- load tests use synthetic data and production-like topology before changing stage.
