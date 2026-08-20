# Bidly design system

**Status:** foundation in `@bidly/ui`; production extension must add Storybook coverage with each reusable component.

## Tokens

Tokens in `packages/ui/src/tokens` are the only source for colour, spacing, radius, elevation, focus, type and motion. Key families:

- canvas/surface/text/border for structure;
- indigo brand and semantic ready/attention/danger colours for meaning;
- density, layout and z-index tokens for layout policy;
- display/body/numeric tokens, with tabular figures for money, time and capacity;
- fast/standard motion that switches off for `prefers-reduced-motion`.

`price-positive` means a verified favourable comparison and is never the sole indicator. `auction-active` is informational, not a winning state. The current brand inputs are deep navy, electric blue, blue, cyan and controlled violet; feature code still consumes semantic tokens rather than raw colours.

## Component layers

1. Primitives: button, surface, input/field, badge, focus/skip behaviour.
2. Brand and icons: vector-first Bidly ribbon mark, wordmark and composition plus one internal outline icon set. Generated platform assets come from the SVG master; see `BIDLY_BRAND_GUIDELINES.md` and `BRAND_ASSETS.md`.
3. Domain display: Total Cost, status, condition/capacity, date and progress components.
4. Patterns: buyer offer comparison, market progress, demand pulse, capacity calendar, business metric and audit timeline.
5. Screens: compose patterns; they do not calculate money, capacity, authorization or auction state.

## Responsive policy

| Range       | Policy                                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
| 320–599px   | Single column, body text at least 16px, primary action in thumb-reachable flow, no horizontal data tables. |
| 600–1023px  | Two-column content only where reading order remains clear; navigation may collapse.                        |
| 1024–1439px | Desktop content grid; buyer auxiliary rail is optional.                                                    |
| 1440px+     | Max content width and deliberate whitespace; never stretch operational tables to unreadable line lengths.  |

## Accessibility baseline

Target is WCAG 2.2 AA. Components use semantic HTML first, preserve keyboard operation, maintain visible focus, use text labels for colour/status meaning and respect reduced motion. Automated axe tests are a guardrail, not a substitute for keyboard and visual contrast review.
