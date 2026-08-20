---
name: bidly-product-design
description: Design or review Bidly consumer UI, design-system components, layouts, interaction states, and responsive behavior. Excludes backend-only and infrastructure-only tasks.
---

# Bidly product design

Read [`docs/design/BIDLY_DESIGN_PRINCIPLES.md`](../../../docs/design/BIDLY_DESIGN_PRINCIPLES.md) before UI work. Build a mature federal consumer marketplace: consumer-first, trustworthy, calm, simple, typographically strong, spacious, and clear about financial values and market state.

Avoid generic AI SaaS, crypto/fintech dashboards, neon, gradient overload, purple-everywhere, decorative glass, admin-looking consumer screens, giant rounded cards, and default shadcn visual styling. shadcn/Radix/Base UI may contribute audited interaction behavior, never Bidly's visual identity.

Users should not need to understand reverse-auction mechanics. Prefer human Russian such as “Компании делают предложения”, “Доступно 184 места”, and “Лучшее предложение сейчас”; do not expose internal state names or claim an unconditional “winner”.

Use semantic tokens and existing primitives before adding local colors, radii, spacing, shadows, or typography. Motion must explain state or causality, and must respect reduced motion. Never communicate price, availability, or status by color alone.

For every UI change, inspect desktop, tablet, and mobile plus loading, empty, error, partial-data, success, disabled, keyboard/focus, reduced-motion, long Russian copy, large money/count values, and unusual but valid data. Add or update stories and accessibility tests for applicable states.
