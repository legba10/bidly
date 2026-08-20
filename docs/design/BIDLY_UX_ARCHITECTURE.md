# Bidly UX architecture

## Navigation model

| Area          | Intended routes                                                                                                                                                                                           | Primary task                                                                                       | Current data state                                                                            |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Public buyer  | `/`, `/market`, `/market/[category]`, `/auctions/[id]`, `/auctions/[id]/offers`, `/offers/[id]`, `/bookings/[id]`                                                                                         | Learn, find a category, join a compatible demand pool, compare an eligible offer, accept and book. | Landing is informational; market/auction/offer/booking reads await published query contracts. |
| Buyer account | `/my/auctions`, `/my/savings`, `/account`                                                                                                                                                                 | Track own decisions, savings and consent/profile.                                                  | Await authenticated read contracts.                                                           |
| Business      | `/business`, `/business/demand`, `/business/auctions`, `/business/offers`, `/business/bookings`, `/business/capacity`, `/business/analytics`, `/business/finance`, `/business/team`, `/business/settings` | See authorised aggregate demand, make a versioned bid, operate capacity and fulfilment.            | Await organisation-scoped query/command endpoints.                                            |
| Admin         | `/admin`                                                                                                                                                                                                  | Moderation, verification, disputes and append-audited overrides.                                   | Await least-privilege operations APIs.                                                        |

## Buyer journey

1. Read a category’s conditions and tell Bidly a need.
2. Join a compatible demand pool; explain what is registered versus verified.
3. Watch the auction lifecycle in plain language without inferring a winner.
4. Compare eligible, capacity-backed offers by Total Cost and material conditions.
5. Explicitly choose one valid offer; only then begin the relevant consent/address/booking step.
6. Track connection or booking and confirm fulfilment through the category policy.

## Business journey

1. See authorised aggregate demand, not buyer identities.
2. Draft/review a versioned offer including complete price, conditions, coverage and finite capacity.
3. Know when terms lock and what capacity scope becomes binding.
4. Operate accepted bookings/connections using an organisation-scoped calendar/list.
5. View fulfilment evidence and CPA only after attributable completion.

## UI states

Every data screen needs: loading, empty, populated, partially available, expired/closed, error and unavailable-contract states. An unavailable-contract state names the user-facing limitation, retains safe navigation and exposes no speculative controls.
