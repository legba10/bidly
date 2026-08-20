# Bidly hero motion slot

This directory deliberately contains no generated video. When the approved visual asset is available, place these files here without changing the hero component API:

- `bidly-hero.webm` — preferred modern-browser format;
- `bidly-hero.mp4` — fallback;
- `bidly-hero-poster.webp` — first paint / fallback poster.

`AnimatedBrandHero` keeps using the static SVG ribbon mark until an approved poster and at least one video source are present. Future loading must use the poster first, defer video until the component is in view or the browser is idle, avoid automatic heavy video on data-saving/mobile contexts, and respect `prefers-reduced-motion`.
