# Quality gates

CI is authoritative. Local hooks are early feedback and cannot waive a gate. Branch protection should require all applicable jobs after the GitHub remote exists.

## P0 — never merge

- frozen install, build, typecheck, lint, required unit/integration/component/E2E test, or migration validation fails;
- leaked or suspected real secret (rotate it even if removed from the diff);
- exploitable critical/high dependency, SAST, IaC, or image finding without an approved unexpired exception;
- broken server-side authorization, tenant isolation, exact money, offer immutability, state transition, idempotency, or atomic capacity invariant;
- product change collapses market types, assumes unlimited capacity, auto-selects lowest price, hides Total Cost, or releases PII without the required user action/consent;
- unsafe production data residency/processor dependency or plaintext secret/IaC state enters the repository;
- required recovery/migration evidence is missing for a destructive data change.

## P1 — fix before release (normally before merge)

- serious accessibility regression, keyboard/focus/name failure, color-only meaning, or affected UI not reviewed at WCAG 2.2 AA target;
- important Chromium/Firefox/WebKit journey regression;
- major performance/bundle/query regression or new unbounded/N+1 behavior;
- inconsistent design-system implementation, hardcoded user copy/business constants, or missing responsive/error/partial states;
- security/PII/audit/observability documentation or regression coverage is materially incomplete;
- a flaky test, scanner outage, or paid-plan limitation is being hidden rather than tracked with owner and expiry.

## Required pull-request checks

| Gate                       | Command / CI evidence                                                 |
| -------------------------- | --------------------------------------------------------------------- |
| Reproducibility            | `pnpm install --frozen-lockfile` and reviewed dependency scripts      |
| Formatting                 | `pnpm format:check`                                                   |
| Static correctness         | `pnpm lint`, `pnpm typecheck`                                         |
| Unit/integration/component | `pnpm test`                                                           |
| Story/accessibility        | `pnpm test:storybook`, `pnpm test:a11y`, `pnpm build:storybook`       |
| Build                      | `pnpm build`; OCI targets build in CI                                 |
| Browser smoke              | `pnpm test:e2e` in Chromium, Firefox, WebKit                          |
| Secrets                    | Gitleaks files + full available Git history                           |
| Dependencies               | OSV-Scanner against source/lockfile                                   |
| SAST                       | Semgrep local baseline and CodeQL where GitHub supports it            |
| IaC/images                 | Trivy filesystem/IaC and both built OCI images                        |
| Review                     | domain/security/design/testing skills as applicable; docs/ADR updated |

## Finding exceptions

Only a named owner may propose an exception. It must document severity, reachable evidence, affected version/scope, compensating control, issue, expiry, and reviewer. P0 domain/authorization/secret/data-loss invariants are not waived for schedule. A scanner suppression is the narrowest rule/path/fingerprint possible and is deleted at expiry.

## Branch protection target

Require pull request, at least one qualified review (more for CODEOWNERS/security when configured), resolved conversations, up-to-date required checks, no force-push/delete on protected branches, and no automatic Dependabot merge. Exact settings must be applied and verified after a GitHub repository/plan is available; workflow files alone do not enforce protection.
