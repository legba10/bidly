# Bidly component inventory

| Component                                   | Layer           | Status      | Guardrail                                                                                          |
| ------------------------------------------- | --------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `BrandMark` / `BrandWordmark` / `BrandLogo` | Brand           | implemented | Vector ribbon master; the composite is labelled and no reference screenshot becomes an asset.      |
| `AnimatedBrandHero`                         | Brand boundary  | implemented | Static mark today; viewport-gated WebM/MP4/poster slot with reduced-motion and Save-Data fallback. |
| `BidlyIcon`                                 | Brand           | foundation  | Internal outline SVG set; decorative by default, named through surrounding control.                |
| `Button`, `Surface`                         | Primitive       | existing    | Native controls, clear hierarchy and visible focus.                                                |
| `MoneyValue`, `StatusIndicator`             | Domain display  | existing    | Exact integer-money formatter and text-plus-shape status.                                          |
| `MarketProgress`                            | Domain pattern  | planned     | Labels only real lifecycle projection; does not invent time remaining.                             |
| `DemandPulse`                               | Domain pattern  | planned     | Explains aggregation without unverified counts.                                                    |
| `BidlyMarketJourney`                        | Product pattern | implemented | Seven-stage human explanation only; no hidden auction-state or data logic.                         |
| `OfferConfidence`                           | Domain pattern  | planned     | Displays complete price/conditions/availability only from an offer snapshot.                       |
| `CapacityState`                             | Domain pattern  | planned     | Shows authoritative capacity scope, never a decorative quota.                                      |
| `IntegrationUnavailable`                    | State pattern   | foundation  | Blocks missing API implementation clearly and safely.                                              |
| Buyer / business shell                      | Layout          | planned     | Consumer light hierarchy vs. operational dense hierarchy.                                          |

All planned components require typed props, a Russian Storybook story for normal and adverse states, and an accessibility check before reuse in a screen.
