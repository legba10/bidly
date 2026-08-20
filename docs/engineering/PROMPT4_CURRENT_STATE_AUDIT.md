# Prompt №4 — current state audit

**Date:** 2026-08-21

**Scope:** repository, domain/schema/API/test boundaries, current local implementation, and the eleven supplied visual references.
**Method:** source and contract review before changing code; visual review of the supplied “before” images and the running landing page at `http://127.0.0.1:3000/`.

This is an evidence record, not a claim that the currently modelled marketplace is already operational. Domain documents remain the source of truth when a visual reference conflicts with them.

## WHAT EXISTS

- A strict TypeScript pnpm modular monolith: Next.js web, Fastify API, `@bidly/domain`, PostgreSQL/Kysely adapters, validation contracts, and the Bidly-owned UI package.
- A PostgreSQL 18 migration covering identity/session records, consent, organizations, catalogue, demand pools, auctions, immutable bid/offer versions, constrained capacity, bookings, fulfillment, Bidly Pass, disputes, attribution, CPA, audit, outbox, and notifications.
- Domain types and tests for auction transitions, Total Cost/bid validation, allocation, offer acceptance, capacity, fulfillment, attribution, authorization, and reputation. The schema distinguishes TYPE A–D rather than collapsing their contracts.
- A real atomic PostgreSQL offer-acceptance path: ownership/version/expiry checks, idempotency, row locking, capacity reservation, history, audit and outbox in one transaction. PostgreSQL concurrency coverage exists but needs a local/CI PostgreSQL 18 runtime to execute.
- The published API boundary currently exposes only health, actor identity, categories, and offer acceptance. Most product commands have Zod contracts but are intentionally not published without complete repositories and authorization composition.
- A bright public landing, split login direction, shared token system, existing `Button`, `Surface`, `MoneyValue`, `StatusIndicator`, `DemandPulse`, `MarketProgress`, and outline icon language. The business frame already uses a dark rail and light work area.
- The public landing uses only the three DEV catalogue definitions (`home_internet`, `dental_hygiene`, `fitness`) for category discovery. It does not claim that an actual pool, price, supplier, participant count, deadline, saving, or availability exists.

## WHAT WORKS

- Public landing navigation, category links, footer, responsive layout, keyboard-visible focus, reduced-motion baseline, and the explanatory collective-demand graphic work as a coherent informational experience.
- The supplied before images correctly identify the current visual strengths: calm light canvas, strong Cyrillic hierarchy, restrained cobalt action, useful whitespace, clear buyer/business separation, and a credible dark business-surface direction.
- `/`, `/login`, `/market`, old buyer routes, `/business`, and `/admin` resolve without broken routes. The running home page is semantically structured and its consumer-facing copy no longer exposes raw `capacity`, `allocation`, `verified demand`, or `fulfillment` terminology.
- Health endpoints, request IDs, safe Fastify errors, response `no-store`, security headers, validation, and the offer-acceptance API boundary work under test.
- The existing documented gates previously passed for Prompt №3: formatting, lint, typecheck, unit/component/accessibility, Storybook, build, three-browser smoke, and local security scans. The PostgreSQL suite is correctly skipped rather than misreported when `TEST_DATABASE_URL` is absent.

## WHAT IS PLACEHOLDER

- `/market`, market-category, buyer, business, and admin routes render `IntegrationUnavailable`. The default eyebrow still says “Функция готовится”; that conflicts with Prompt №4’s production-facing wording rule even though the state itself is honest.
- Login is editorial only: no phone normalization, OTP challenge, session cookie, anti-abuse control, SMS provider adapter, account creation, recovery, or server-side protected-route check is configured.
- The API has no published read models for public pools, category pages, buyer dashboards, auctions, offers, bookings, notifications, organization dashboards, capacity/calendar, finance, or admin. `GET /api/v1/categories` is also unconfigured in the running server.
- The database has tables and ports for booking, fulfillment, notifications, outbox, user sessions and administration, but has no complete command/read repositories, worker, scheduler, identity adapter, or application composition for them.
- DEV seed inserts only geography, categories, generic test users and organizations. It deliberately contains no demand pools, auctions, suppliers’ commercial terms, availability, booking slots, offers, customer records, money results, or customer PII that could honestly drive the requested operational screens.
- The current mark is a temporary two-bar glyph, not the supplied ribbon `B`; there is no vector master, generated raster pipeline, favicon/Apple/OG asset family, motion slot, or component split into `BrandMark`, `BrandWordmark`, and `BrandLogo`.

## WHAT IS VISUALLY WEAK

- The refreshed ribbon reference introduces the decisive missing asset: a deep-blue/electric-blue/cyan/violet folded `B`, with a carefully proportioned `BIDLY` wordmark. The current generic purple glyph makes the product feel unfinished and does not carry the “many buyers → one demand” concept.
- The home page’s upper composition is correctly calm, but the supplied current-page captures show its hero illustration as a static generic card. It needs a recognizable brand-centred demand-to-offer composition, without synthetic prices or counters.
- The journey section is text-heavy and too sparse at desktop width. It needs the seven human stages, a purposeful horizontal desktop composition, and an intentional stacked mobile composition.
- The current market and business screens are dominated by large empty-state cards. The references establish a better direction: consumer marketplace cards and an operational dark-rail workspace, but neither may be populated with decorative numbers, offers, capacity or customers.
- The header omits “О Bidly”, has no responsive navigation treatment, and its footer is too minimal for the documented product/legal architecture. Auxiliary text and some labels are near the minimum readable size at desktop.
- The reference dashboards are useful for hierarchy, density, buyer-action priority and supplier work patterns, but their avatars, metrics, timers, prices, ratings, calendars, QR/Pass values and social-login buttons are visual reference only. They are not evidence that those facts exist in this environment.

## WHAT IS FUNCTIONALLY MISSING

- Reviewed phone-OTP identity/session architecture, server-side protected-route enforcement, CSRF/origin rules, rate limiting, OTP provider abstraction and safe development adapter. Production must never reveal or accept a fabricated OTP.
- Organization-scoped read/command APIs with runtime validation, trusted active organization context, BOLA/IDOR matrix tests, bounded pagination, and minimal PII release controls.
- Published public category/pool queries; authenticated demand creation/verification; auction/bid/allocation reads; buyer-specific offers; booking/connection and coverage fallback commands; notifications; supplier bid/capacity/fulfillment operations; admin audit/override workflows.
- Worker composition for transactional outbox delivery, auction/reservation/offer expiry, booking reminders and notifications. No future job should bypass state/version/actor/audit rules.
- Production data/read model policy for visible metrics. Values in public and operational UI must be API/domain facts. DEV-only synthetic fixtures must be unmistakably development-only and must never leak to production.
- Product-specific legal content and provider configuration: terms/privacy/rules, consent policy versions, Russian SMS provider credentials, address/coverage adapter, and any production infrastructure credentials.

## WHAT CONFLICTS WITH DOMAIN

- No current route falsely implements market semantics, which is preferable to a fake client-side marketplace. However, a generic unavailable component labelled “Функция готовится” is no longer acceptable as the primary production-facing state under Prompt №4.
- The old business rail displays raw English `Capacity`; supplier UI may show a real quota, but the navigation must use Russian and only real scope data.
- The attached dashboard visual references imply populated marketplaces. Rendering their numbers now would breach the rules for real counters, exact money, capacity, tenant isolation and consent. The existing frontend must not become a separate state machine.
- A fully interactive buyer/supplier/admin surface cannot honestly be claimed from the current API/database composition. Completing it requires server-side implementations, read contracts, authorization tests, and database integration—not static React state.
- The documents mark authentication, booking, fulfillment, attribution, billing, notification delivery, scheduling, retention and admin mutation repositories as deferred. They must not be enabled by copying UI controls or assuming arbitrary business constants.

## WHAT MUST BE COMPLETED

1. Create a vector-first ribbon brand system and generated asset pipeline; replace the old mark consistently, add the future hero-video boundary, PWA/OG/icon foundations, and document usage.
2. Refine the public site around the real collective-demand explanation: seven-step journey, trust disclosures, full footer, responsive navigation, informative category discovery and honest non-giant empty states. Keep live numerical claims absent until a published data source exists.
3. Replace the default placeholder wording and structure with purposeful pending-data/secure-access states that preserve navigation and explain the next safe action. Do not turn them into fictional dashboards.
4. Implement only those backend flows that can be completed end-to-end inside the current modular architecture: start with identity/session and demand/catalog read foundations only after a threat-modelled design and tests; then add reads/commands module by module with authorization, idempotency and concurrency evidence. Do not expose reserved contracts merely because a UI needs them.
5. Build buyer, supplier and admin shells only on server-authorized, data-backed contracts. Where an operational endpoint is still absent, preserve an honest limited state rather than a fake metric, customer, offer, booking, CPA or audit event.
6. Add route/component/E2E/accessibility coverage for every implemented contract and visual state; execute the PostgreSQL integration suite where PostgreSQL 18 is available.
7. Update design, visual-audit, asset, architecture/security and final implementation documents with exact evidence and remaining credential/provider blockers.

## Visual plan derived from the supplied references

- Preserve the current light, calm, marketplace-first composition; apply the new ribbon only as a controlled brand signature, not as a crypto-like visual language.
- Use the ribbon mark as the static hero focal point alongside real HTML/SVG demand nodes and condition cards. It explains aggregation without inventing commercial results.
- Increase useful content density through journey, category and trust information rather than wider decorative cards or hard-coded analytics.
- Keep buyer surfaces light and task-first; keep business operational and darker only in the rail. The references guide hierarchy, never data truth.
- Test the revised layouts at 320, 360, 390, 430, 768, 1024, 1280, 1366, 1440 and 1920 pixels, with mobile-specific navigation and motion reduction.
