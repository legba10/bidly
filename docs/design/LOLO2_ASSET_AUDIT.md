# Bidly LOLO2 asset audit

**Дата:** 2026-08-24

**Источник:** `C:/Users/surgut/Desktop/lolo2`

**Статус:** implemented

## Одобренные мастера

| Оригинал                                          |    Размер | Alpha | Controlled master                   | Контекст                           |
| ------------------------------------------------- | --------: | :---: | ----------------------------------- | ---------------------------------- |
| `bidly_mark_clean_1024_transparent.png`           | 1024×1024 |  да   | `bidly-mark-transparent-master.png` | компактный знак, favicon/app icons |
| `02_bidly_logo_light_bg_transparent.png`          |  1935×610 |  да   | `bidly-logo-on-light-master.png`    | светлая поверхность                |
| `03_bidly_logo_dark_bg_transparent.png`           |  1935×610 |  да   | `bidly-logo-on-dark-master.png`     | header, footer, dark shells/auth   |
| `04_bidly_lockup_slogan_light_bg_transparent.png` |  2875×865 |  да   | `bidly-lockup-on-light-master.png`  | расширенный светлый lockup         |
| `05_bidly_lockup_slogan_dark_bg_transparent.png`  |  2875×865 |  да   | `bidly-lockup-on-dark-master.png`   | расширенный тёмный lockup          |
| `BIDLY_Hero_Right_4K.png`                         | 3840×2160 |  нет  | `bidly-hero-static-4k-master.png`   | статичный hero                     |

Все controlled masters лежат в `apps/web/brand-source/lolo2/` и совпадают с оригиналами по SHA-256. Opaque logo, автотрейс SVG, прежние ribbon/cube assets, MP4 и старые posters не используются и удалены из активного набора.

## Критические правила

- логотип рендерится напрямую из transparent PNG;
- контейнер logo всегда transparent, без border, shadow, filter или blend mode;
- mark не перерисовывается CSS/SVG;
- hero статичен; video и fake 3D запрещены;
- пользовательский LOLO2 каталог остаётся read-only.
