# Bidly media assets

## Provenance

Production‑ассеты предоставлены владельцем в `C:/Users/surgut/Desktop/lolo2`, проинспектированы по размерам/alpha и скопированы byte‑for‑byte в `apps/web/brand-source/lolo2`. Внешний каталог не изменяется и не попадает в staging.

## Runtime sources

| Группа               | Controlled master                   | Runtime                                                       |
| -------------------- | ----------------------------------- | ------------------------------------------------------------- |
| mark                 | `bidly-mark-transparent-master.png` | `public/brand/bidly-mark.png` + favicon/Apple/PWA derivatives |
| logo on dark         | `bidly-logo-on-dark-master.png`     | `public/brand/bidly-logo-on-dark.png`                         |
| logo on light        | `bidly-logo-on-light-master.png`    | `public/brand/bidly-logo-on-light.png`                        |
| lockup on dark/light | `bidly-lockup-on-*-master.png`      | `public/brand/bidly-lockup-on-*.png`                          |
| static hero          | `bidly-hero-road-4k-master.webp`    | `public/media/bidly-hero-road-{4k,2560,1536,1024}.webp`       |

`brand:assets` создаёт icons и OG из clean mark/lockup; `hero:assets` создаёт только статичные responsive hero files. Runtime не ссылается на старые SVG, opaque logo, video или posters.
