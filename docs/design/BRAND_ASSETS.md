# Bidly brand assets

All raster assets are generated from the SVG master with `pnpm --filter @bidly/web brand:assets`. The script uses the already installed Playwright rendering stack; it does not introduce a new image-processing dependency. PNG and WebP files have transparent backgrounds.

## Source masters

| File                                            | Purpose                                   |
| ----------------------------------------------- | ----------------------------------------- |
| `packages/ui/brand/bidly-mark.svg`              | Primary vector ribbon mark                |
| `packages/ui/brand/bidly-logo.svg`              | Static mark + wordmark composition        |
| `packages/ui/brand/bidly-og.svg`                | Brand-safe 1200×630 Open Graph foundation |
| `packages/ui/src/brand/brand-mark.tsx`          | Reusable React mark                       |
| `packages/ui/src/brand/brand-wordmark.tsx`      | Reusable React wordmark                   |
| `packages/ui/src/brand/brand-logo.tsx`          | Accessible composite React logo           |
| `packages/ui/src/brand/animated-brand-hero.tsx` | Future MP4/WebM/poster boundary           |

## Public outputs

| File family                                                      | Sizes                                     | Purpose                                                      |
| ---------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------ |
| `apps/web/public/brand/bidly-mark.svg`                           | vector                                    | Public mark                                                  |
| `apps/web/public/brand/bidly-logo.svg`                           | vector                                    | Public logo composition                                      |
| `bidly-mark-*.png`                                               | 16, 32, 64, 128, 180, 192, 256, 512, 1024 | Transparent mark assets; requested product sizes are 32–1024 |
| `bidly-mark-*.webp`                                              | 256, 512, 1024                            | Transparent efficient mark assets                            |
| `bidly-mark-maskable-512.png`                                    | 512                                       | Padded PWA maskable icon                                     |
| `bidly-og.svg`                                                   | 1200×630                                  | Open Graph foundation                                        |
| `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`          | 16, 32                                    | Browser favicon set                                          |
| `apple-touch-icon.png`                                           | 180                                       | Apple touch icon                                             |
| `pwa-192x192.png`, `pwa-512x512.png`, `pwa-maskable-512x512.png` | 192, 512                                  | Web manifest assets                                          |
| `apps/web/src/app/favicon.ico`, `icon.png`, `apple-icon.png`     | generated copies                          | Next.js App Router metadata conventions                      |

The source master and output assets are intentionally separate: component rendering remains vector-first, while browser/platform integrations receive deterministic generated files.
