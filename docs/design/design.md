# Bidly design direction

**Status:** implemented product demo and production-safe public foundation
**Source of truth:** product/domain documents, API contracts and `BIDLY_DESIGN_PRINCIPLES.md`. The five supplied mock-ups are the visual reference, not a source of business rules.

## Brand idea

Bidly is a marketplace of confirmed collective demand. A buyer should immediately understand: people state a need together; companies compete with complete terms; the buyer chooses an eligible offer and Bidly accompanies the connection or booking. The interface must not resemble a discount catalogue, a financial-trading terminal, or a generic SaaS dashboard.

The supplied gradient `B` is the product signature. Approved transparent raster masters represent many buyer signals becoming one stronger demand; the auto-traced SVG found at the repository root is not an approved source. The static 4K homepage scene extends the same idea and remains decorative explanation, not evidence of a market result. See `BIDLY_BRAND_GUIDELINES.md` and `BIDLY_HERO_MOTION.md`.

## Visual character

- The homepage is a premium dark surface with lime action, static violet/blue imagery and restrained depth; buyer product surfaces use the same dark system with calmer density.
- Business surfaces are denser and operational, with a deep navy navigation rail and elevated dark content surfaces. Density changes; tokens and hierarchy do not.
- Rounded cards, thin cool borders and restrained elevation create structure. Gradient is an editorial accent, never a data encoding or a substitute for contrast.
- Illustration is abstract and product-specific: demand nodes, offers, capacity, progress and the owner-supplied static 4K hero. No stock-photo dependency or screenshot-as-background technique.
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
- The homepage hero is static at every breakpoint. Reduced-motion users receive the same complete composition; only short UI transitions are reduced.

## Current integration boundary

The published API currently exposes authentication identity, categories and offer acceptance only; it has no public query endpoints for the complete auction, offer, booking, capacity, buyer or supplier dashboards. Production renders safe unavailable states instead of synthetic commercial data.

Local development has an isolated deterministic read model for visual and interaction review. It contains five category scenarios and complete Total Cost examples, is gated by environment and is not evidence that a live market exists. The public UI does not expose development/mock/debug labels. The local phone flow stores only a phone hash and short-lived HttpOnly session; it is not production authentication.
