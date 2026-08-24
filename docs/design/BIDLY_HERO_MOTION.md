# Bidly static hero policy

## Решение

Главная использует один статичный 4K‑кадр из LOLO2. Видео, scroll‑controlled playback, fake 3D, autoplay, pinning, parallax и custom cursor в hero отсутствуют. Название файла сохранено для совместимости со ссылками из прежних инженерных отчётов; текущая политика намеренно статична.

## Production assets

- мастер: `apps/web/brand-source/lolo2/bidly-hero-road-4k-master.webp`, 3840×2160;
- точная публичная копия: `apps/web/public/media/bidly-hero-road-4k.webp`;
- responsive WebP: 2560, 1536 и 1024 px, quality 94;
- генератор: `apps/web/scripts/generate-hero-assets.mjs`.

## Композиция

Графика остаётся справа, а настоящий HTML‑контент — слева. `picture` выбирает размер по viewport, контейнер не имеет рамки или карточки, а мягкий левый градиент поддерживает читаемость. На tablet/mobile применяется отдельное позиционирование и вертикальная композиция; изображение не сжимается поверх текста.

## Доступность и производительность

Изображение декоративное (`alt=""`, `aria-hidden` на visual wrapper), поэтому смысл и действия полностью представлены HTML. Геометрия зарезервирована исходными `width`/`height`; первый visual загружается с высоким приоритетом. `prefers-reduced-motion` остаётся глобальным контрактом для лёгких UI‑переходов, но hero от motion не зависит.
