# Bidly brand asset inventory

**Дата инвентаризации:** 2026-08-24

**Метод:** рекурсивный обход предоставленных каталогов, SHA-256 для дублей, метаданные Sharp для растровых файлов.

## Выбранные мастера

- **Знак:** `apps/web/brand-source/lolo2/bidly-mark-transparent-master.png` — byte-identical копия `C:/Users/surgut/Desktop/lolo2/bidly_mark_clean_1024_transparent.png`, 1024×1024, PNG с alpha.
- **Логотипы:** `bidly-logo-on-light-master.png` и `bidly-logo-on-dark-master.png` — byte-identical прозрачные LOLO2 PNG, 1935×610.
- **Lockup:** `bidly-lockup-on-light-master.png` и `bidly-lockup-on-dark-master.png` — byte-identical прозрачные LOLO2 PNG, 2875×865.
- **Hero:** `bidly-hero-static-4k-master.png` — byte-identical копия `C:/Users/surgut/Desktop/lolo2/BIDLY_Hero_Right_4K.png`, 3840×2160.

Текущие мастера выбраны из фактически проинспектированной папки LOLO2. Производные создают `brand:assets` и `hero:assets`; видео, scroll-scrub, автотрейс и CSS-реконструкция бренда отсутствуют.

## Полный список

| Путь                                                            | Формат |   Размеры | Alpha | Aspect |      Байт | Назначение                              | Дубликат SHA-256                                              |
| --------------------------------------------------------------- | ------ | --------: | :---: | -----: | --------: | --------------------------------------- | ------------------------------------------------------------- |
| `apps/web/brand-source/lolo2/bidly-hero-static-4k-master.png`   | PNG    | 3840×2160 |  нет  |  1.778 | 4 229 553 | статичный hero / responsive derivative  | apps/web/public/media/bidly-hero-static-4k.png                |
| `apps/web/brand-source/lolo2/bidly-lockup-on-dark-master.png`   | PNG    |  2875×865 |  да   |  3.324 |   175 157 | горизонтальный логотип со слоганом      | apps/web/public/brand/bidly-lockup-on-dark.png                |
| `apps/web/brand-source/lolo2/bidly-lockup-on-light-master.png`  | PNG    |  2875×865 |  да   |  3.324 |   177 034 | горизонтальный логотип со слоганом      | apps/web/public/brand/bidly-lockup-on-light.png               |
| `apps/web/brand-source/lolo2/bidly-logo-on-dark-master.png`     | PNG    |  1935×610 |  да   |  3.172 |   151 734 | горизонтальный логотип                  | apps/web/public/brand/bidly-logo-on-dark.png                  |
| `apps/web/brand-source/lolo2/bidly-logo-on-light-master.png`    | PNG    |  1935×610 |  да   |  3.172 |   152 632 | горизонтальный логотип                  | apps/web/public/brand/bidly-logo-on-light.png                 |
| `apps/web/brand-source/lolo2/bidly-mark-transparent-master.png` | PNG    | 1024×1024 |  да   |  1.000 |   208 404 | знак / растровый источник               | apps/web/public/brand/bidly-mark.png                          |
| `apps/web/public/brand/apple-touch-icon-180.png`                | PNG    |   180×180 |  да   |  1.000 |    18 866 | Apple touch icon                        | —                                                             |
| `apps/web/public/brand/bidly-lockup-on-dark.png`                | PNG    |  2875×865 |  да   |  3.324 |   175 157 | горизонтальный логотип со слоганом      | apps/web/brand-source/lolo2/bidly-lockup-on-dark-master.png   |
| `apps/web/public/brand/bidly-lockup-on-dark.webp`               | WEBP   |  2875×865 |  да   |  3.324 |   108 122 | горизонтальный логотип со слоганом      | —                                                             |
| `apps/web/public/brand/bidly-lockup-on-light.png`               | PNG    |  2875×865 |  да   |  3.324 |   177 034 | горизонтальный логотип со слоганом      | apps/web/brand-source/lolo2/bidly-lockup-on-light-master.png  |
| `apps/web/public/brand/bidly-lockup-on-light.webp`              | WEBP   |  2875×865 |  да   |  3.324 |   108 850 | горизонтальный логотип со слоганом      | —                                                             |
| `apps/web/public/brand/bidly-logo-on-dark.png`                  | PNG    |  1935×610 |  да   |  3.172 |   151 734 | горизонтальный логотип                  | apps/web/brand-source/lolo2/bidly-logo-on-dark-master.png     |
| `apps/web/public/brand/bidly-logo-on-dark.webp`                 | WEBP   |  1935×610 |  да   |  3.172 |    95 762 | горизонтальный логотип                  | —                                                             |
| `apps/web/public/brand/bidly-logo-on-light.png`                 | PNG    |  1935×610 |  да   |  3.172 |   152 632 | горизонтальный логотип                  | apps/web/brand-source/lolo2/bidly-logo-on-light-master.png    |
| `apps/web/public/brand/bidly-logo-on-light.webp`                | WEBP   |  1935×610 |  да   |  3.172 |    95 902 | горизонтальный логотип                  | —                                                             |
| `apps/web/public/brand/bidly-mark.png`                          | PNG    | 1024×1024 |  да   |  1.000 |   208 404 | знак / растровый источник               | apps/web/brand-source/lolo2/bidly-mark-transparent-master.png |
| `apps/web/public/brand/bidly-mark.webp`                         | WEBP   | 1024×1024 |  да   |  1.000 |   137 776 | знак / растровый источник               | —                                                             |
| `apps/web/public/brand/bidly-og-1200x630.png`                   | PNG    |  1200×630 |  да   |  1.905 |   101 836 | социальная карточка                     | —                                                             |
| `apps/web/public/brand/favicon-16x16.png`                       | PNG    |     16×16 |  да   |  1.000 |       657 | favicon                                 | —                                                             |
| `apps/web/public/brand/favicon-32x32.png`                       | PNG    |     32×32 |  да   |  1.000 |     1 722 | favicon                                 | —                                                             |
| `apps/web/public/brand/favicon-48x48.png`                       | PNG    |     48×48 |  да   |  1.000 |     3 041 | favicon                                 | —                                                             |
| `apps/web/public/brand/favicon.ico`                             | ICO    |         — |   —   |      — |     5 474 | favicon                                 | —                                                             |
| `apps/web/public/brand/motion/README.md`                        | MD     |         — |   —   |      — |       215 | документированный статичный hero policy | —                                                             |
| `apps/web/public/brand/pwa-icon-192.png`                        | PNG    |   192×192 |  да   |  1.000 |    20 831 | PWA / Android icon                      | —                                                             |
| `apps/web/public/brand/pwa-icon-512.png`                        | PNG    |   512×512 |  да   |  1.000 |    95 929 | PWA / Android icon                      | —                                                             |
| `apps/web/public/brand/pwa-maskable-192.png`                    | PNG    |   192×192 |  да   |  1.000 |    12 855 | PWA maskable icon                       | —                                                             |
| `apps/web/public/brand/pwa-maskable-512.png`                    | PNG    |   512×512 |  да   |  1.000 |    61 790 | PWA maskable icon                       | —                                                             |
| `apps/web/public/brand/social-mark-800.png`                     | PNG    |   800×800 |  да   |  1.000 |   184 385 | социальная карточка                     | —                                                             |
| `apps/web/public/media/bidly-hero-static-1024.webp`             | WEBP   |  1024×576 |  нет  |  1.778 |    73 104 | статичный hero / responsive derivative  | —                                                             |
| `apps/web/public/media/bidly-hero-static-1536.webp`             | WEBP   |  1536×864 |  нет  |  1.778 |   135 824 | статичный hero / responsive derivative  | —                                                             |
| `apps/web/public/media/bidly-hero-static-2560.webp`             | WEBP   | 2560×1440 |  нет  |  1.778 |   271 234 | статичный hero / responsive derivative  | —                                                             |
| `apps/web/public/media/bidly-hero-static-4k.png`                | PNG    | 3840×2160 |  нет  |  1.778 | 4 229 553 | статичный hero / responsive derivative  | apps/web/brand-source/lolo2/bidly-hero-static-4k-master.png   |
