---
name: bidly-domain
description: Preserve Bidly marketplace semantics when designing or changing demand pools, auction states, bids, allocation, capacity, fulfillment, trust, or monetization. Do not use for infrastructure-only work.
---

# Bidly domain integrity

Before domain work, read [`docs/product/BIDLY_DOMAIN.md`](../../../docs/product/BIDLY_DOMAIN.md). Treat it as the source of truth; propose an ADR/domain-doc update when a requirement conflicts with it rather than silently changing semantics.

## Invariants

- `DemandPool` aggregates demand while retaining user-level choices and consent. Intent progresses through `INTERESTED`, `READY`, and `COMMITTED`; verified demand is distinct from registered demand and suppliers must see both separately.
- Preserve market types: TYPE A `SWITCH`, TYPE B `CAPACITY`, TYPE C `BULK`, TYPE D `LEAD_MARKET`. Never infer one type's allocation or fulfillment semantics for another.
- A bid records price, finite capacity, fulfillment period, coverage/geography, and conditions. Capacity markets additionally model branches, days, hours, slots, and per-slot/per-day limits.
- Lifecycle: `DRAFT → COLLECTING_DEMAND → DEMAND_VERIFICATION → SUPPLIER_BIDDING → BID_VALIDATION → ALLOCATION → USER_ACCEPTANCE → BOOKING_OR_CONNECTION → SERVICE_DELIVERY → CONFIRMED → SETTLEMENT → CLOSED`. `CANCELLED`, `DISPUTED`, `EXPIRED`, and `PARTIALLY_FILLED` are explicit outcomes, not aliases.
- Physically constrained services can and usually will have multiple winning suppliers. Allocation considers total price, quality, supplier score, location, user preferences, availability, and atomic capacity; lowest price alone never decides.
- Never oversell. Use transactional conditional writes or locks, deterministic lock ordering, bounded retries, and idempotency where a request can repeat.
- Supplier trust includes fulfillment, complaints, price mismatch, cancellations, and capacity history. Do not grant a new supplier unbounded capacity based only on self-reporting.
- Buyer reliability distinguishes joined, accepted, completed, and no-show outcomes.
- Fulfillment attribution uses a versioned Bidly Pass/token/QR flow plus execution confirmation; do not treat a click or lead as proven fulfillment.
- Initial monetization is supplier-paid CPA/commission for an actually received/served customer. Bidly does not collect the buyer's payment for the supplier's core service.

For every change, identify affected state transitions, capacity and concurrency behavior, actor permissions, money representation, audit events, and regression tests.
