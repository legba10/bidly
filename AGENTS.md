# Bidly repository rules

These rules apply to every task. Read the relevant project skill in `.agents/skills` and the source-of-truth document it links before changing domain, design, copy, security, tests, or review policy.

## Product integrity

- Do not invent or change Bidly business logic without an explicit requirement. Never simplify the market state machine or collapse TYPE A, B, C, and D semantics.
- Multi-winner markets stay multi-winner; the lowest price is not an automatic winner. Allocation preserves each user's individual choice among eligible offers.
- Supplier capacity is always finite and a hard constraint. Capacity changes must be atomic and overselling-safe.
- Show and validate Total Cost. Hidden surcharges and teaser-price substitution are forbidden.
- In the initial model, buyer money for the underlying service goes directly to the supplier. The buyer contracts with the supplier; Bidly receives supplier CPA/commission only after attributable fulfillment.
- Release personal data to a supplier only after the user's corresponding informed action or consent.

## Engineering and security

- Use strict TypeScript. `any` requires a narrow, documented exception. Do not disable lint or security rules as a shortcut; do not use silent catches.
- Never hardcode secrets or business constants in UI. Keep domain logic out of React, and keep UI away from databases.
- Enforce authorization server-side and scope every supplier action to its owning organization.
- Represent money without floating-point arithmetic; store dates unambiguously and timezone-aware.
- Make realistic retryable public mutations idempotent. Test every security-sensitive change.
- Do not log credentials, tokens, personal data, or full request bodies. Validate untrusted input at runtime.

## Completion

- Run every applicable format, lint, typecheck, unit, integration, component, accessibility, E2E, security, and build gate.
- Never claim completion with a failing required gate. Document an unavailable gate and the concrete reason instead of bypassing it.
- Do not add product screens or product behavior unless the task explicitly requests them.
