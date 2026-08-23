# UX implementation report (pre-LOLO2 baseline)

This report is retained as implementation history. The homepage and brand-media sections were superseded on 2026-08-23 by the LOLO2 rebuild. Current evidence is recorded in `docs/design/LOLO2_BEFORE_AFTER.md`, `docs/design/HERO_MEDIA_AUDIT.md` and `docs/engineering/LOLO2_FINAL_REPORT.md`.

**Status:** implementation foundation complete; data-driven marketplace work blocked by unpublished read/auth contracts.

## Design system

The visual system turns the supplied references into reusable semantic tokens: deep navy/black canvases, lime action, electric blue/violet accents, off-white typography, subtle borders and restrained elevation across public, buyer and business surfaces. `@bidly/ui` owns tokens, a text-plus-shape status primitive, an internal outlined icon set, approved raster logo/mark, demand pulse, market progress and a safe unavailable-integration pattern. No external icon, chart or font dependency was added.

## Buyer UX

- `/` is a responsive public landing explaining the collective-demand model in plain Russian. It uses the actual DEV catalogue categories and intentionally has no fabricated prices, counts, countdowns, suppliers, savings or availability.
- `/market`, `/market/[category]`, `/auctions/[id]`, `/auctions/[id]/offers`, `/offers/[id]`, `/bookings/[id]`, `/my/auctions`, `/my/savings` and `/account` exist and visibly explain why their real UI cannot be rendered yet.
- `/login` follows the supplied split editorial direction without pretending that SMS, social or partner authentication works.

## Supplier UX

`/business` and every `/business/*` section have a distinct dark, capacity-oriented business frame but no invented demand, customer, capacity, conversion or CPA values. A real dashboard is deliberately deferred until organisation-scoped query endpoints exist.

## Admin UX

`/admin` is a server-authorisation dependency state. It does not imitate an override, moderator session, verification queue, audit log or access to sensitive data.

## Reusable components

The inventory and component contracts are maintained in `docs/design/COMPONENT_INVENTORY.md`. Each new foundation component has a Storybook story; the Storybook browser suite covers 26 scenarios.

## Accessibility

The implementation targets WCAG 2.2 AA: semantic landmarks and headings, skip link, visible focus, named brand mark, native links, text-plus-colour state, no automatic motion and corrected secondary-text contrast. Automated checks passed in unit accessibility and Storybook. Browser axe checks passed in Chromium, Firefox and WebKit.

## Responsive and visual review

Landing was manually checked at 1440px desktop and 390px mobile through the local browser. The desktop retains a generous editorial two-column composition; mobile intentionally stacks the call-to-action, demand explanation and abstract product graphic rather than compressing the desktop layout. Login and unavailable views share the same token system and collapse their split/rail layout below the mobile breakpoint.

## Visual regression / browser smoke

Playwright now launches a separate production server on port 3002 so its WebKit axe run cannot race the developer server on port 3000. The complete smoke suite passed: 15 checks across Chromium, Firefox and WebKit, including security headers and the explicit unavailable-market state.

## API integration and blocked backend dependencies

The current running API exposes `/api/v1/me`, `/api/v1/categories` and offer acceptance only. It has no authenticated web session or configured category query service, and it does not publish read/list APIs for auctions, offers, bookings, capacity, buyer account data, organisation-scoped business data, audit or administration. Reserved command schemas are not a substitute for those APIs.

The UI therefore never creates a separate frontend market state. When a query contract is published, bind it through validated generated contracts, maintain server-side authorization and create any visual QA data only through `packages/database` DEV seed.

## Validation evidence

- `pnpm format:check` — passed
- `pnpm lint` — passed
- `pnpm typecheck` — passed
- `pnpm test` — 44 passed
- `pnpm test:storybook` — 26 passed
- `pnpm build:storybook` — passed
- `pnpm build` — passed
- `pnpm test:e2e` — 15 passed
- `pnpm security:all` — passed (Gitleaks, OSV, Semgrep and Trivy)
- `pnpm test:integration` — 3 tests skipped locally because no `TEST_DATABASE_URL`/PostgreSQL service is available; they are not waived and run in the CI PostgreSQL job.

## Known UX risks and remaining screens

The presentation is intentionally not a fake product demo. Buyer home, live auction, offer comparison/detail, booking flow, supplier demand/bid/capacity/analytics/finance and admin moderation become real only after their scoped APIs, read models, identity and organisation context exist. Real authentication, provider integration, maps, payment, SMS, supplier verification and deployment remain outside this prompt.
