# Bidly domain source of truth

**Status:** bootstrap baseline  
**Owner:** product + domain engineering  
**Last reviewed:** 2026-08-20

This document records the Bidly marketplace vocabulary and non-negotiable invariants. It is deliberately implementation-independent. A change to these rules requires an explicit product decision, review of security/accounting effects, updated tests, and an ADR when the trade-off is architectural.

## Product model

Bidly is a reverse marketplace: buyers express demand and eligible suppliers make bounded offers. Bidly helps form and verify demand, compare complete offers, allocate constrained supply, preserve user choice, and attribute actual fulfillment.

The system is not a lowest-price winner-takes-all auction. It must support different market mechanics, multiple suppliers, finite capacity, individual buyer preferences, and direct buyer–supplier service relationships.

## Non-negotiable invariants

1. The lowest nominal price never creates an automatic winner.
2. A buyer retains an individual choice among offers for which they are eligible and which still have capacity.
3. Physically constrained markets may and normally will allocate to multiple suppliers.
4. Supplier capacity is finite, scoped, auditable, and enforced atomically. Overselling is a correctness and security failure.
5. Total Cost and material conditions outrank teaser price. Hidden surcharges and post-acceptance price substitution are forbidden.
6. Market types A–D are distinct contracts. Their verification, allocation, capacity, and fulfillment rules cannot be collapsed into one generic flow.
7. Registered demand and verified demand are different facts and must be shown separately to authorized suppliers.
8. Material offer terms become immutable or versioned at protected lifecycle stages; history is never silently rewritten.
9. In the initial commercial model, the buyer pays and contracts directly with the supplier for the underlying service. Bidly does not receive that buyer payment.
10. Bidly monetization is supplier-paid CPA/commission only for an attributable customer who was actually received/served under the defined confirmation policy.
11. Personal data is disclosed to a supplier only after the buyer's corresponding informed action/consent and only for the stated purpose.

## Core concepts

### DemandPool

A `DemandPool` groups compatible demand for a defined market, geography/coverage, time window, and material conditions. Aggregation must not erase buyer-level eligibility, preferences, consent, or reliability state.

Open questions such as pool compatibility rules, split/merge policy, minimum demand, and expiry durations remain product decisions. They must not be invented as constants in code or UI.

### Intent and verified demand

Intent is progressive evidence, not a binary counter:

| Level             | Meaning                                                   | Supplier-facing interpretation                              |
| ----------------- | --------------------------------------------------------- | ----------------------------------------------------------- |
| `INTERESTED`      | The user expressed initial interest.                      | Registered demand; weak commitment signal.                  |
| `READY`           | The user states readiness under described constraints.    | Stronger registered demand; still not necessarily verified. |
| `COMMITTED`       | The user completed the product-defined commitment action. | Strong intent; fulfillment is not yet proven.               |
| `VERIFIED_DEMAND` | Required verification evidence passed.                    | Shown separately from total registered demand.              |

Verification method, freshness, re-verification, and evidence retention are category-specific future decisions. “Committed” never means money was paid to Bidly unless a later, explicit model changes that contract.

## Market types

| Type   | Name          | Essential distinction                                                                     | Capacity expectation                                                                 |
| ------ | ------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| TYPE A | `SWITCH`      | Buyer switches/connects an ongoing provider/service under a supplier offer.               | May be operationally bounded; never assume unlimited.                                |
| TYPE B | `CAPACITY`    | A physically/time constrained service such as branches, dates, hours, or slots.           | Explicit slots and per-slot/per-day limits; multi-winner is normal.                  |
| TYPE C | `BULK`        | Aggregated volume improves terms for a compatible group.                                  | Quantity/fulfillment bounds remain explicit.                                         |
| TYPE D | `LEAD_MARKET` | Qualified demand is connected to eligible suppliers under defined lead/fulfillment rules. | Lead acceptance and service capacity are bounded; a lead alone is not fulfilled CPA. |

Each category must define its own eligibility, verification, allocation, acceptance, booking/connection, fulfillment evidence, cancellation, dispute, and attribution policy before implementation.

## Bid contract

A supplier bid contains at least:

- exact price representation and currency;
- Total Cost inputs and period/billing basis;
- finite capacity and the scope to which it applies;
- fulfillment period;
- geography or coverage;
- material conditions and eligibility constraints;
- supplier organization and authorized actor;
- version, creation time, protected-stage time, and audit evidence.

TYPE B and other capacity markets additionally require applicable branches, days, hours, slots, per-slot capacity, per-day capacity, timezone, and rules for moving/releasing reservations.

Subsequent bid versions may correct or improve terms only according to the lifecycle policy. An accepted offer must continue to reference the exact immutable version the buyer accepted.

## Auction lifecycle

Canonical forward path:

```text
DRAFT
  → COLLECTING_DEMAND
  → DEMAND_VERIFICATION
  → SUPPLIER_BIDDING
  → BID_VALIDATION
  → ALLOCATION
  → USER_ACCEPTANCE
  → BOOKING_OR_CONNECTION
  → SERVICE_DELIVERY
  → CONFIRMED
  → SETTLEMENT
  → CLOSED
```

Additional explicit states/outcomes:

- `CANCELLED` — terminated by an authorized policy with actor, reason, and consequences;
- `DISPUTED` — fulfillment, price, conditions, or attribution is contested;
- `EXPIRED` — a deadline passed without the required transition;
- `PARTIALLY_FILLED` — only part of compatible verified demand was allocated/fulfilled.

### Transition rules

- Transitions are allowlisted, authorized server-side, idempotent where retried, timestamped, and audited.
- A transition validates the current state and version in the same transaction as its effects.
- Background jobs cannot skip validation or impersonate an actor without a service identity and audit context.
- Terminal-state reopening, dispute resolution, settlement adjustment, and cancellation consequences are future policies; no agent may guess them.
- Side effects use a transactional outbox or equivalent durable handoff when introduced; database commit and message publication cannot be treated as one unguarded action.

## Allocation and buyer choice

Allocation determines a set of eligible, capacity-backed options. It may consider:

- Total Cost and price basis;
- quality evidence and supplier score;
- location/coverage and fulfillment availability;
- buyer-stated preferences and eligibility;
- supplier capacity at the required granularity;
- category-specific constraints.

Weights, ranking formula, tie-breaking, and supplier visibility are not defined in this bootstrap. They require explainability, manipulation analysis, product approval, versioning, and regression fixtures before code exists.

An allocation result is not an automatic acceptance. The user chooses among allowed options unless a future explicit category contract states otherwise. A user cannot accept a materially changed offer version without seeing and accepting the change.

## Capacity and concurrency

Capacity is a hard, database-enforced business constraint.

- Reservations/consumption use a transaction with a conditional update or row-level/advisory locking appropriate to the final model.
- The invariant is checked at the narrowest scope: offer, branch, day, slot, or other category-defined bucket.
- Unique constraints, non-negative checks, version columns, and idempotency keys provide defense in depth.
- Lock ordering is deterministic. Deadlocks/serialization failures use bounded retries and observable failure, never an unbounded loop.
- Reservation expiry/release is an explicit, idempotent transition. Clocks use an agreed UTC instant and category timezone.
- Concurrency tests must prove that two requests cannot consume the last unit twice and that a retry cannot double-consume it.

Redis may coordinate or cache but is not the final source of truth for financial, acceptance, or capacity invariants unless a future ADR proves equivalent durability and consistency.

## Trust and reliability

Supplier trust evidence includes, at minimum:

- fulfillment rate;
- complaint rate and substantiated outcomes;
- advertised-versus-actual price mismatch;
- supplier cancellations;
- historical requested, accepted, and fulfilled capacity.

New suppliers must not receive high trust or unbounded capacity merely from self-declaration. Score definitions, cold-start policy, fraud handling, appeal, and display are future governed decisions.

Buyer reliability records distinct counts/events for joined, accepted, completed, cancelled, and no-show behavior. It must not become an opaque discriminatory score. Inputs, legitimate purpose, retention, user recourse, and category effects require review.

## Fulfillment attribution

The planned primitive is a versioned Bidly Pass/token/QR plus supplier/user confirmation appropriate to the category. Requirements before implementation include:

- high-entropy, scoped, expiring, single-purpose token;
- no PII embedded in a QR or URL;
- replay protection and idempotent redemption;
- binding to the accepted offer version and authorized supplier organization;
- state, time, and location checks only where justified;
- auditable confirmation and dispute path;
- no full token values in logs or analytics.

A generated pass, click, lead delivery, or booking request alone is not proof that the service was fulfilled.

## Money and settlement

- Store money as integer minor units plus ISO currency, or an equivalently exact database decimal with a reviewed boundary type. Never use binary floating point for calculation.
- Preserve gross/net components, taxes/fees when defined, billing period, quantity, and immutable calculation/version inputs.
- Display Total Cost before the buyer's material action.
- Initial flow: `Buyer → Supplier` for the service; after attributable fulfillment, `Supplier → Bidly` for CPA/commission.
- `SETTLEMENT` describes supplier/Bidly commercial attribution, not buyer payment processing.
- `PaymentProvider` and `BillingProvider` are ports only. No fictitious charge/refund behavior is authorized by this document.

## Actor and data boundaries

Expected actors are buyer, supplier member, supplier administrator, Bidly support/operations roles, service identity, and auditor. Exact roles remain to be designed, but all authorization must be server-side, deny by default, and scope supplier access to its organization.

PII release must record subject, purpose, data categories, supplier organization, triggering user action/consent, policy version, time, and revocation/retention handling where applicable. Aggregate demand shown before consent must prevent re-identification.

## Decision checklist for future domain work

- Which market type and category contract applies?
- Which state/version is authoritative and which transitions are legal?
- What can race, retry, expire, cancel, or partially succeed?
- Which database constraint preserves the invariant?
- What exact price and conditions did the user see and accept?
- What capacity scope is consumed and how is it released?
- Which actor/organization is authorized?
- Which PII and consent purpose are involved?
- What audit event and fulfillment evidence remain?
- Which unit, integration, concurrency, authorization, and regression tests prove the result?
