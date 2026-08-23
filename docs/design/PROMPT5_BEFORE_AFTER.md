# Prompt №5 visual before / after (historical)

This report records the earlier Prompt №5 implementation. The LOLO2 rebuild supersedes its homepage, logo and hero-media decisions; see `LOLO2_BEFORE_AFTER.md`, `HERO_MEDIA_AUDIT.md` and `BIDLY_HERO_MOTION.md` for the current production state.

## Before

- The homepage was a sparse light canvas with a small abstract mark card and no visual marketplace activity.
- The repository-rendered logo was a reconstructed/vector placeholder rather than the owner-supplied gradient artwork.
- `/market` and `/business` were largely unavailable cards; buyer pages did not form a navigable product journey.
- Login was editorial only and could not enter a protected local demo.
- About and Support lacked the content depth of the supplied references.
- The hero had no approved static LOLO2 visual integration.

## After

- `/` now uses the supplied static 4K LOLO2 scene, five steps and no visible environment labels; video and scroll-controlled playback were removed by explicit product direction.
- The owner-supplied gradient mark and horizontal composition drive shared `BrandLogo`/`BrandMark`, favicon, PWA, Apple and OG derivatives. Automatic vector tracing is rejected.
- `/market` supports query, city, stage and synonym filtering in a labelled deterministic DEV mode, with production-safe category-only rendering.
- `/how-it-works`, `/about` and `/support` are complete responsive information pages with truthful marketplace semantics.
- `/login` has a development-only phone challenge/session adapter; `/app`, auction, offer, booking, savings and buyer-list routes create a coherent local journey. Production remains unavailable without a real identity/read model.
- `/business` and its section routes provide a dense responsive local workspace for demand, offers, capacity, bookings, clients, analytics, finance, reviews, team, documents and settings. Production keeps the organization boundary closed.
- Shared `DemandCard`, `AuctionCard`, `OfferCard`, `BusinessMetric`, `ConversionFunnel` and `CapacityChart` components include Storybook coverage.
- Eight required hero viewport sizes have no horizontal overflow, the start poster is ready at first paint and local measurement reports CLS 0.

## Product truth retained

- Multi-winner markets remain multi-winner and the buyer chooses among eligible offers.
- Lowest price does not automatically win.
- Total Cost and material conditions stay together.
- Capacity remains finite and must be rechecked atomically before booking/connection.
- Personal data is released only after the corresponding informed user action/consent.
- The buyer pays the supplier for the underlying service; Bidly CPA follows attributable confirmed fulfillment.
- Synthetic commercial data remains isolated from production public/login flows; environment labels are no longer exposed in the product UI.

## Visual evidence

Current screenshots and machine-readable viewport/performance observations are stored under `docs/engineering/premium-qa-screenshots/`. Static hero source and derivative decisions are documented in `HERO_MEDIA_AUDIT.md`; the no-video policy is documented in `BIDLY_HERO_MOTION.md`.
