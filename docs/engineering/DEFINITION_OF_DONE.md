# Definition of Done

A future Codex or human task is done only when all applicable statements are true:

- the explicit requirement and acceptance behavior are implemented without unrelated product invention;
- Bidly domain invariants, market type, state machine, user choice, finite capacity, Total Cost, and initial money/contract model remain intact;
- domain logic is outside React, UI has no database access, and vendor SDKs remain behind approved ports;
- server-side authorization/organization scope, runtime validation, exact money, timezone, idempotency, race safety, audit, PII, and log redaction were considered and tested where affected;
- unit/integration/concurrency/component/regression tests were added or updated at the appropriate level;
- `format:check`, lint, typecheck, applicable tests/E2E/accessibility/security scans, Storybook/build, and OCI/IaC checks are green;
- affected desktop/tablet/mobile, loading/empty/error/partial/success/disabled, long Russian text, unusual values, keyboard/focus, reduced motion, and non-color cues were reviewed;
- user copy is natural Russian in locale resources, with no invented guarantee, dark pattern, hidden fee, or hardcoded production value;
- documentation, ADRs, environment examples, migration/recovery/runbooks, and third-party ledger are current where affected;
- no real secret, PII fixture, debug `console` logging, silent catch, commented-out garbage, dead dependency, temporary bypass, or unowned TODO substitutes for the result;
- `git status` contains only intended files and no build, report, tool, state, credential, or temporary artifacts;
- limitations are stated with evidence, owner/next action when known, and no red gate is described as success.
