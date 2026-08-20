# Bidly design direction

**Status:** implemented foundation
**Source of truth:** product/domain documents, API contracts and `BIDLY_DESIGN_PRINCIPLES.md`. The five supplied mock-ups are the visual reference, not a source of business rules.

## Brand idea

Bidly is a marketplace of confirmed collective demand. A buyer should immediately understand: people state a need together; companies compete with complete terms; the buyer chooses an eligible offer and Bidly accompanies the connection or booking. The interface must not resemble a discount catalogue, a financial-trading terminal, or a generic SaaS dashboard.

Prompt №4 adds the owned ribbon `B` as the product signature. Its vector master represents many buyer signals becoming one stronger demand; it is not a decorative background or a claim about a market result. See `BIDLY_BRAND_GUIDELINES.md`.

## Visual character

- Buyer surfaces are calm, bright and spacious: cool off-white canvas, white cards, deep ink text and an electric-indigo action colour.
- Business surfaces are denser and operational, with a dark navy navigation rail and the same light content canvas. Density changes; tokens and hierarchy do not.
- Rounded cards, thin cool borders and restrained elevation create structure. Gradient is an editorial accent, never a data encoding or a substitute for contrast.
- Illustration is abstract and product-specific: demand nodes, offers, capacity and progress. No stock-photo dependency or screenshot-as-background technique.
- The type system prioritizes legible Russian Cyrillic and tabular numbers. The current system stack is intentionally self-hosted/no-network; adding a downloadable font requires licensing, CSP and dependency review.

## Product truth in UI

- A price is only shown with the defined Total Cost basis and material conditions.
- No countdown, capacity count, saving, bid rank, winner, provider, rating, user total or availability is invented for visual effect.
- `SUPPLIER_BIDDING` is rendered as “Компании делают предложения”; it never implies that the buyer already has a winner.
- Capacity is a real constraint. Buyer copy says that an offer must still be available; supplier screens use the narrowest real capacity scope when an API provides it.
- Personal data is neither shown in aggregate demand nor promised to a supplier before the buyer’s relevant informed action/consent.

## Interaction and accessibility

- One primary action per decision surface; secondary and quiet actions are visually subordinate.
- All focusable controls have a visible focus treatment, controls retain native semantics, and icon-only controls require an accessible name.
- Information never relies on colour alone. Status uses wording and shape; tables/cards have readable labels.
- Desktop, tablet and one-handed mobile are distinct compositions. Buyer navigation becomes a bottom action area when product navigation exists; business remains task-oriented.

## Current integration boundary

The published API currently exposes authentication identity, categories and offer acceptance only; the running API does not yet configure category queries or an auth session, and it has no public query endpoints for auctions, offers, bookings, capacity, supplier dashboards or admin data. Screens that need those reads stay explicitly unavailable instead of inventing a frontend state universe. See the implementation report for the exact dependency list.

The public market now uses the approved DEV catalogue definitions as discovery content, without manufacturing pools, participant counts, terms, prices, availability or stages. It is not evidence that the live market API is available.
