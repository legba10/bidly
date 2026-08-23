# Bidly brand assets

Оригиналы в `C:/Users/surgut/Desktop/lolo2` остаются неизменными. В контролируемом source‑каталоге хранятся только шесть выбранных мастеров: mark, две версии logo, две версии lockup и один статичный 4K hero.

```text
pnpm --filter @bidly/web brand:assets
pnpm --filter @bidly/web hero:assets
pnpm --filter @bidly/web brand:inventory
```

## Component mapping

| Контекст                                   | Компонент/variant                        | Asset                        |
| ------------------------------------------ | ---------------------------------------- | ---------------------------- |
| public header/footer, login, dark sidebars | `BrandLogo variant="on-dark"`            | `bidly-logo-on-dark.png`     |
| светлая поверхность при необходимости      | `BrandLogo variant="on-light"`           | `bidly-logo-on-light.png`    |
| компактная навигация/icon                  | `BrandLogo variant="mark"` / `BrandMark` | `bidly-mark.png`             |
| About brand statement                      | `BrandLogo variant="lockup-on-dark"`     | `bidly-lockup-on-dark.png`   |
| metadata                                   | generated favicon/Apple/PWA/OG           | clean mark + approved lockup |

PNG‑логотипы используются напрямую. WebP‑версии генерируются lossless как запасные производные, но shared logo component не подменяет прозрачный мастер и не применяет CSS recolor, background, border, shadow, filter или blend mode.
