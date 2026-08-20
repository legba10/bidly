# Bidly visual reference map

The supplied reference images were analyzed on 2026-08-20. They govern visual direction only; the domain model and contracts override any conflicting visual suggestion.

| Reference         | Visual decisions adopted                                                                                             | Domain corrections and improvements                                                                                                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Landing        | Bright editorial hero, cobalt wordmark/action, soft cards around a collective-demand motif, generous section rhythm. | Counters, discounts, prices and running auction timers are not copied without live evidence. The hero explains the mechanism instead of advertising an unsupported saving.                          |
| 2. “How it works” | Buyer-to-supplier flow, clear numerical step rhythm, paired buyer/business story.                                    | The real canonical lifecycle has more states; public copy explains the human journey and does not mislabel a bid as a guaranteed result.                                                            |
| 3. Buyer home     | Light consumer workspace, calm cards, action-first hierarchy and a concise notification rail.                        | It will use real buyer offers/bookings only. The desktop sidebar is not forced onto mobile, where task navigation must be adapted.                                                                  |
| 4. Login          | Editorial split layout, trust statements and a focused sign-in panel.                                                | No non-working SMS, social login or partner buttons. Until the authorised authentication flow exists, the route communicates the dependency without impersonating sign-in.                          |
| 5. Business home  | Dark compact rail, dense operational content, restrained capacity/funnel/calendar modules.                           | Supplier demand is aggregate and organisation-scoped. Customer PII, artificial conversion figures and mutable history are prohibited. Capacity is displayed only from authoritative capacity units. |

## Cross-reference rules

- Reuse one outlined SVG icon language owned by `@bidly/ui`; do not mix icon libraries, emoji or decorative glyphs.
- Use the indigo scale and cool-neutral borders from design tokens, not reference-image pixels or Tailwind hex literals.
- Prefer clean CSS/SVG product diagrams to photographic placeholders.
- Treat cards as information grouping, not as every layout element; avoid a “card inside card” dashboard.
- At 390px preserve one clear primary action, readable Total Cost labels and intentional stacking rather than scaling the desktop canvas down.
