# Bidly hero media audit

**Дата:** 2026-08-24

**Источник:** `C:/Users/surgut/Desktop/lolo2` (read-only)

## Выбранный файл

| Оригинал                  | Контролируемый мастер                                         | Метаданные     |      Байт | SHA-256                                                            |
| ------------------------- | ------------------------------------------------------------- | -------------- | --------: | ------------------------------------------------------------------ |
| `BIDLY_Hero_Right_4K.png` | `apps/web/brand-source/lolo2/bidly-hero-static-4k-master.png` | PNG, 3840×2160 | 4 229 553 | `458756c15d8dd4859c67434e553475e88fccf53317cf6b9dfa09f39a719dde10` |

Мастер является byte-identical копией. Внешняя папка не изменена.

## Runtime strategy

`BidlyHeroVisual` рендерит статичный `<picture>` с 1024/1536/2560 WebP и точным 4K PNG fallback. Графическая композиция закреплена справа, HTML‑текст расположен слева. В runtime нет `<video>`, MP4, scroll region, frame sequence, seek logic или motion dependency.

Старые poster/video derivatives и компоненты удалены. E2E проверяет отсутствие video/scroll-scrub, готовность изображения и отсутствие horizontal overflow на девяти требуемых размерах.
