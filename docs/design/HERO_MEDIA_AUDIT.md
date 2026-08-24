# Bidly hero media audit

**Дата:** 2026-08-24

**Источник:** `C:/Users/surgut/Desktop/lolo2` (read-only)

## Выбранный файл

| Оригинал                       | Контролируемый мастер                                        | Метаданные      |    Байт | SHA-256                                                            |
| ------------------------------ | ------------------------------------------------------------ | --------------- | ------: | ------------------------------------------------------------------ |
| `bidly_hero_4K_3840x2160.webp` | `apps/web/brand-source/lolo2/bidly-hero-road-4k-master.webp` | WebP, 3840×2160 | 346 978 | `723ed5bd0c32edafbb0046083c275ce0d7ce252d97136d97348c3fda137b6435` |

Мастер является byte-identical копией. Внешняя папка не изменена.

## Runtime strategy

`BidlyHeroVisual` рендерит статичный `<picture>` с 1024/1536/2560 WebP и точной 4K WebP-копией. Графическая композиция закреплена справа, HTML‑текст расположен слева. В runtime нет `<video>`, MP4, scroll region, frame sequence, seek logic или motion dependency.

Старые poster/video derivatives и компоненты удалены. E2E проверяет отсутствие video/scroll-scrub, готовность изображения и отсутствие horizontal overflow на девяти требуемых размерах.
