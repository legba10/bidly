# Bidly domain invariants

**Status:** normative  
**Reviewed:** 2026-08-20

These rules are enforced in domain services, PostgreSQL constraints/transactions, and regression tests. A change needs product, security, data, migration, and ADR review.

## Market and allocation

1. A demand pool groups compatible demand by category version, geography/coverage, material requirements, and purchase window; category alone is insufficient.
2. Registered, verified, and committed demand are separate facts and metrics.
3. Allocation is deterministic, policy-versioned, explainable, and capacity-bounded. Lowest headline price alone never selects a winner.
4. `allocated_capacity <= offered_capacity` at every pool/unit/slot scope.
5. Ineligible buyers and suppliers never enter the candidate set. Coverage is checked where the category requires it.
6. Multi-winner categories may allocate several suppliers. Even a single-winner auction may produce buyer-specific fallback candidates.
7. Allocation creates eligible options; it never substitutes for explicit buyer acceptance.

## Offers, capacity, and fulfillment

1. An offer snapshots the exact bid version, supplier, Total Cost inputs/result, conditions, geography, capacity scope, eligible dates, category definition, policy version, and expiry.
2. A supplier cannot mutate an existing offer snapshot. Changed terms require a new bid/offer version.
3. A buyer cannot accept an expired, unavailable, superseded, ineligible, or capacity-unbacked offer.
4. `reserved_quantity + consumed_quantity <= capacity_quantity`; release and expiry are explicit idempotent transitions.
5. A repeated accept/reserve/book/confirm command with the same actor, operation, payload hash, and idempotency key returns the original outcome and never repeats side effects.
6. A supplier cannot fulfill a buyer who lacks an accepted allocation-backed offer for that organization.
7. A completed conversion references an accepted offer and valid fulfillment evidence.
8. CPA cannot accrue before the category confirmation policy has enough non-conflicting fulfillment evidence.

## Tenancy, money, and evidence

1. Supplier access is scoped by trusted `user_id + organization_id` membership; a client-supplied organization identifier is never sufficient.
2. Buyer PII is absent from auction/bid/allocation rows and is disclosed to a supplier only after the relevant acceptance/consent flow.
3. Money is integer minor units plus ISO 4217 currency. Binary floating point is forbidden.
4. Canonical instants are UTC `timestamptz`; category/branch time zones are stored separately for scheduling.
5. Auction, bid, offer, booking, fulfillment, and dispute state changes are allowlisted, version-checked, timestamped, and append-audited.
6. Admin overrides include actor, reason, previous/new safe values, request ID, and timestamp.
7. Ledger, audit, status history, immutable versions, and attribution evidence are append-only; normal delete endpoints cannot erase them.

## Critical transaction boundaries

- **Accept offer:** lock offer and capacity unit → validate state/expiry/actor → reserve capacity → write acceptance/status → audit + outbox → commit.
- **Create booking:** lock accepted offer and slot → reserve/convert capacity → insert one booking → audit + outbox → commit.
- **Confirm fulfillment:** lock fulfillment → append confirmation → derive confirmed/disputed state → append attribution/CPA eligibility when allowed → audit + outbox → commit.
- **Auction transition:** lock auction → validate state/version/deadline/permission → append status history → audit + outbox → commit.
