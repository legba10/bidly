# Bidly brand guidelines

## Core mark

The Bidly mark is a vector-first folded ribbon `B`. It communicates individual buyer signals becoming stronger collective demand, rather than crypto, AI, fintech, or a generic letterform. The master is [`packages/ui/brand/bidly-mark.svg`](../../packages/ui/brand/bidly-mark.svg); interface code uses `BrandMark`, `BrandWordmark`, and `BrandLogo` from `@bidly/ui`.

## Composition and usage

- `BrandMark` is decorative by default. `BrandLogo` is the named composite used when Bidly must be announced to assistive technology.
- Place the mark to the left of the `BIDLY` wordmark; use the mark alone only where space is genuinely constrained (favicon, app icon, compact navigation).
- Keep clear space of at least one third of the mark’s visible height on every side.
- The full logo must be at least 80 CSS pixels wide; the mark must be at least 20 CSS pixels high. Use the supplied small raster mark at 16 pixels, not a squeezed full wordmark.
- On light surfaces the wordmark uses deep ink. On dark surfaces use `BrandLogo tone="light"`; the coloured ribbon remains unchanged.

## Colour

The controlled brand palette is: deep navy `#0B0F18`, electric blue `#0A1BFF`, blue `#206BFF`, cyan `#00D4FF`, and restrained violet `#7B61FF`. Product code consumes semantic UI tokens rather than these raw values. Violet and cyan are internal ribbon depth accents, not status colours or a page-wide gradient.

## Forbidden use

- Do not crop the supplied reference image, use a JPEG logo, flatten the mark onto a background, recolour it arbitrarily, stretch it, add strokes, or replace it with a generic `B`.
- Do not use the mark as a busy background, repeat it as texture, turn it into a spinner, or make it a permanent glow/pulse.
- Do not imply a crypto, Web3, exchange, AI assistant, or lowest-price-only product.

## Motion architecture

`AnimatedBrandHero` accepts optional WebM, MP4 and poster sources. Without approved media it renders the static master mark. It observes viewport visibility and opts out for `prefers-reduced-motion` and Save-Data users. The future asset contract is documented in [`apps/web/public/brand/motion/README.md`](../../apps/web/public/brand/motion/README.md).

Navigation-logo interaction is limited to a 180ms one-pixel elevation and very slight colour-depth response. It is disabled with reduced motion.
