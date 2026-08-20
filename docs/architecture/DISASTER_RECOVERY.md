# Disaster recovery baseline

A backup is not considered operational until a restore test proves it. This document defines future controls and proposed objectives; it does not claim deployed backups exist.

## Proposed service tiers

Business owners must approve final RPO/RTO after impact analysis.

| Tier        | Data/workload                                             | Initial proposed RPO                    | Initial proposed RTO | Notes                                       |
| ----------- | --------------------------------------------------------- | --------------------------------------- | -------------------- | ------------------------------------------- |
| Critical    | PostgreSQL orders/acceptance/capacity/consent/audit state | ≤ 15 minutes with PITR                  | ≤ 4 hours            | tighten as marketplace impact grows         |
| Important   | private objects and fulfillment documents                 | ≤ 24 hours or provider versioning event | ≤ 8 hours            | class-specific versioning/retention         |
| Rebuildable | containers, static assets, IaC/config from source         | repository release point                | ≤ 4 hours            | artifacts must be reproducible              |
| Ephemeral   | cache/session material where recoverable                  | no guarantee                            | recreate ≤ 1 hour    | session consequences require product review |

## PostgreSQL

- Managed HA topology in separate provider availability zones where offered.
- Automated encrypted backups plus continuous/PITR capability and documented retention.
- Backup storage isolated from workload credentials; deletion and restore permissions separated.
- Quarterly at Stage 1, then risk-adjusted, restore to an isolated network, run integrity/domain checks, record actual RPO/RTO, and securely destroy the exercise copy.
- Replica failover is availability, not backup. Logical corruption or hostile deletion can replicate.
- Schema migrations include forward/backward compatibility, backup/restore implications, and rollback or roll-forward procedure.

## Object storage and configuration

- Private buckets by default; enable versioning only where recovery value exceeds retention/privacy cost.
- Lifecycle policies retain/recover critical versions while enforcing approved deletion and legal retention.
- IaC source, lockfiles, CI policy, runbooks, DNS definitions, and secrets metadata are backed up; secret values remain in a secrets manager and follow separate recovery/rotation controls.
- Never rely on a CDN copy as the origin backup.

## Failure scenarios to exercise

1. accidental row/table deletion and point-in-time recovery;
2. failed migration with mixed application versions;
3. primary database/zone outage and managed failover;
4. corrupted/private object recovery;
5. lost application instance or registry artifact rebuild;
6. compromised credential rotation and session/token invalidation;
7. provider control-plane outage and manual break-glass access;
8. full provider exit rehearsal at a later risk tier.

## Runbook evidence

Every exercise records owner, time, source backup identifier, isolated target, checks performed, actual RPO/RTO, missing data, access logs, cleanup, findings, and dated remediation. Break-glass credentials are tested without exposing values to logs or tickets.

Provider references reviewed: [Yandex Managed PostgreSQL backups/PITR](https://yandex.cloud/ru/docs/managed-postgresql/concepts/backup), [Selectel managed database backups](https://docs.selectel.ru/managed-databases/), and [Cloud.ru PostgreSQL backups](https://cloud.ru/docs/paas-postgresql/ug/topics/guides__backups).
