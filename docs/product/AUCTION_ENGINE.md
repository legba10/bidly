# Auction engine

## Flow

`DemandPool` collects compatible buyer demand while keeping each buyer's constraints and consent. Verification produces separate registered/verified/committed metrics. An auction references immutable versions of the pool, category definition, rules, and allocation policy.

The canonical path is:

```text
DRAFT → COLLECTING_DEMAND → DEMAND_VERIFICATION → SUPPLIER_BIDDING
→ BID_VALIDATION → ALLOCATION → USER_ACCEPTANCE
→ BOOKING_OR_CONNECTION → SERVICE_DELIVERY → CONFIRMED
→ SETTLEMENT → CLOSED
```

`CANCELLED`, `DISPUTED`, `EXPIRED`, and `PARTIALLY_FILLED` are explicit outcomes. `AuctionStateMachine` owns the allowlist; HTTP clients cannot write status fields. Every transition checks the current version, actor policy, required window, and preconditions in one transaction and appends status history, audit, and outbox records.

## Bidding and validation

A bid is an organization-owned identity plus immutable versions. Each version contains exact price/Total Cost inputs, finite capacity, fulfillment interval, geography/coverage, conditions, inclusions, exclusions, and category attributes. After `BID_VALIDATION`, protected terms are locked. An allowed correction creates `BidRevision` and a new version; it never rewrites the accepted version.

Deterministic validation checks required category fields, exact price consistency, positive/capped capacity, feasible dates, coverage, mandatory/duplicate fees, supplier verification, and supplier capacity limits. It produces structured issues; no AI validation is involved.

## Allocation and user choice

The engine first filters buyer/supplier eligibility, coverage, dates, and capacity. It then calculates versioned components such as Total Cost, quality evidence, distance, availability, supplier reliability, and conditions. The stored candidate explanation contains normalized component scores and the policy version. Price is one factor, not an automatic winner.

For multi-winner auctions, capacity may be distributed across eligible suppliers. For single-winner auctions, buyer-specific coverage/capacity can still require a fallback chain. Allocation results create immutable offer snapshots. The buyer explicitly selects an available offer; the engine does not assign a supplier automatically.

## After acceptance

TYPE A uses connection and coverage states and can advance to the next fallback candidate when coverage fails. TYPE B converts a soft capacity reservation into a confirmed booking. Fulfillment requires category-appropriate evidence. Conflicting buyer/supplier confirmation creates a dispute. Only a valid conversion can create a CPA event; buyer payment remains outside Bidly.
