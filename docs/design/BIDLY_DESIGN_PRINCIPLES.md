# Bidly design principles

**Target:** a mature, calm, high-trust consumer marketplace for the Russian market. This is a system foundation, not a visual specification for product screens.

## Experience principles

1. **Consumer-first clarity.** Explain the action and consequence without making users learn auction vocabulary.
2. **Trust through evidence.** Show complete price, material conditions, availability, provenance, and uncertainty. Do not manufacture urgency or guarantees.
3. **Calm confidence.** Strong hierarchy, restrained color, useful whitespace, functional borders/shadows, and no decorative noise.
4. **Choice over coercion.** Make comparable options understandable and preserve individual choice; never imply that cheapest is automatically best.
5. **Responsive by construction.** Content and controls work on narrow mobile screens, tablet, desktop, zoom, and long Russian text.
6. **Accessible by default.** WCAG 2.2 AA is the engineering target where applicable. Semantics, keyboard, focus, names, contrast, reduced motion, and non-color cues are component contracts.

## Visual anti-patterns

Do not ship generic AI SaaS/crypto/neon aesthetics, gradient overload, purple-everywhere, ubiquitous glassmorphism, admin-dashboard chrome for consumers, default shadcn themes, enormous rounded cards, or decoration that competes with price and conditions.

## Semantic tokens

Components consume semantic roles rather than palette names:

- color: `background-primary`, `background-secondary`, `surface`, `surface-raised`, `text-primary`, `text-secondary`, `text-muted`, `border`, `border-strong`, `brand`, `brand-hover`, `success`, `warning`, `danger`, `info`, `price-positive`, `auction-active`, `capacity-low`;
- typography: `display`, `h1`, `h2`, `h3`, `title`, `body`, `body-small`, `label`, `caption`, `numeric-large`;
- constrained spacing, radius, elevation, outline, and motion scales.

Raw palette tokens may exist as implementation inputs, but feature code cannot depend on names such as `purple-500`. A semantic change must update one role rather than hundreds of consumers.

## Numeric typography

Money, participant counts, capacity, and discount deltas need tabular numerals, stable baselines, non-breaking units, locale-aware separators, and enough room for unusual values:

- `549 ₽ / мес`
- `18 421 участник`
- `1 842 300 ₽`
- `−27%`

Money is formatted from exact minor units; formatting never becomes a calculation authority. Price or discount meaning cannot be carried by color alone.

## Composition layers

`packages/ui` owns:

- `tokens` — semantic values and themes;
- `primitives` — low-level accessible interaction/structure;
- `components` — reusable Bidly presentation components;
- `patterns` — compositions with no business rules;
- `icons` — a small consistent, accessible icon set.

Domain logic, database access, authorization, and feature-specific constants do not enter the UI package. New third-party primitives require the dependency review policy; source-distributed code is maintained as Bidly code after review.

## Component acceptance matrix

For every applicable component or pattern, review:

| Dimension      | Required evidence                                                 |
| -------------- | ----------------------------------------------------------------- |
| Content states | default, loading, empty, error, partial, success, disabled        |
| Viewports      | narrow mobile, tablet, desktop, 200% zoom/reflow                  |
| Content stress | long Russian strings, large money/counts, missing optional values |
| Input          | keyboard, pointer, touch target, visible focus                    |
| Semantics      | correct element, label/name, relationships, live-region restraint |
| Color/motion   | contrast, no color-only meaning, reduced motion                   |
| Automation     | Storybook story, behavior test, applicable axe check              |

## Motion

Motion is allowed only to communicate a state change, causal relationship, or orientation. Durations stay short and easing restrained. `prefers-reduced-motion: reduce` removes non-essential animation and smooth scrolling. Motion must never delay access to a result.

## Copy

User-facing copy comes from the locale dictionary. Prefer “Компании делают предложения” over “Bidding phase”, “Доступно 184 места” over internal field names, and “Лучшее предложение сейчас” over an unconditional “Победитель”. Follow the `bidly-ux-copy` skill.

## Foundation decision

Bidly owns its visual layer. Tailwind is a build-time utility engine, not the token source. shadcn may be reviewed as source code for complex interactions; Radix or Base UI may be selected per primitive when native HTML is insufficient. None is installed in the bootstrap because the current Button/Surface components do not justify the maintenance and supply-chain cost.

See [ADR-0005](../architecture/decisions/0005-ui-foundation.md).
