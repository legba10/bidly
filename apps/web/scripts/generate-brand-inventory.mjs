import { createHash } from 'node:crypto';
import { access, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const workspaceDirectory = resolve(scriptDirectory, '..', '..', '..');
const inventoryPath = resolve(workspaceDirectory, 'docs', 'design', 'BRAND_ASSET_INVENTORY.md');
const candidates = [
  resolve(workspaceDirectory, 'apps', 'web', 'brand-source', 'lolo2'),
  resolve(workspaceDirectory, 'apps', 'web', 'public', 'brand'),
  resolve(workspaceDirectory, 'apps', 'web', 'public', 'media'),
];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function walk(path) {
  const details = await stat(path);
  if (details.isFile()) return [path];
  const entries = await readdir(path, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => walk(resolve(path, entry.name))))).flat();
}

function usageFor(path) {
  const value = path.toLowerCase();
  if (value.includes('hero')) return 'статичный hero / responsive derivative';
  if (value.includes('lockup')) return 'горизонтальный логотип со слоганом';
  if (value.includes('bidly-logo')) return 'горизонтальный логотип';
  if (value.includes('favicon')) return 'favicon';
  if (value.includes('apple')) return 'Apple touch icon';
  if (value.includes('maskable')) return 'PWA maskable icon';
  if (value.includes('pwa') || value.includes('android')) return 'PWA / Android icon';
  if (value.includes('social') || value.includes('opengraph') || value.includes('og-'))
    return 'социальная карточка';
  if (value.includes('microsoft') || value.includes('mstile')) return 'Microsoft tile';
  if (value.includes('motion')) return 'документированный статичный hero policy';
  if (['.png', '.webp', '.svg'].includes(extname(value))) return 'знак / растровый источник';
  return 'метаданные набора';
}

async function describe(path) {
  const buffer = await readFile(path);
  const extension = extname(path).slice(1).toUpperCase() || 'FILE';
  let dimensions = '—';
  let alpha = '—';
  let aspect = '—';
  try {
    const metadata = await sharp(buffer, { animated: false }).metadata();
    if (metadata.width && metadata.height) {
      dimensions = `${metadata.width}×${metadata.height}`;
      aspect = (metadata.width / metadata.height).toFixed(3);
    }
    alpha = metadata.hasAlpha ? 'да' : 'нет';
  } catch {
    if (extension === 'SVG') {
      const source = buffer.toString('utf8');
      const width = source.match(/<svg[^>]*width=["']([^"']+)/i)?.[1];
      const height = source.match(/<svg[^>]*height=["']([^"']+)/i)?.[1];
      if (width && height) dimensions = `${width}×${height}`;
      alpha = 'вектор';
    }
  }
  return {
    alpha,
    aspect,
    bytes: buffer.length,
    dimensions,
    extension,
    hash: createHash('sha256').update(buffer).digest('hex'),
    path: relative(workspaceDirectory, path).replaceAll('\\', '/'),
    usage: usageFor(path),
  };
}

const roots = [];
for (const candidate of candidates) if (await exists(candidate)) roots.push(candidate);
const paths = (await Promise.all(roots.map(walk)))
  .flat()
  .sort((left, right) => left.localeCompare(right, 'ru'));
const assets = await Promise.all(paths.map(describe));
const hashes = new Map();
for (const asset of assets) hashes.set(asset.hash, [...(hashes.get(asset.hash) ?? []), asset.path]);

const rows = assets.map((asset) => {
  const duplicates = hashes.get(asset.hash) ?? [];
  const duplicate =
    duplicates.length > 1 ? duplicates.filter((path) => path !== asset.path).join('<br>') : '—';
  return `| \`${asset.path}\` | ${asset.extension} | ${asset.dimensions} | ${asset.alpha} | ${asset.aspect} | ${asset.bytes.toLocaleString('ru-RU')} | ${asset.usage} | ${duplicate} |`;
});

const document = `# Bidly brand asset inventory

**Дата инвентаризации:** 2026-08-24

**Метод:** рекурсивный обход предоставленных каталогов, SHA-256 для дублей, метаданные Sharp для растровых файлов.

## Выбранные мастера

- **Знак:** \`apps/web/brand-source/lolo2/bidly-mark-transparent-master.png\` — byte-identical копия \`C:/Users/surgut/Desktop/lolo2/bidly_mark_clean_1024_transparent.png\`, 1024×1024, PNG с alpha.
- **Логотипы:** \`bidly-logo-on-light-master.png\` и \`bidly-logo-on-dark-master.png\` — byte-identical прозрачные LOLO2 PNG, 1935×610.
- **Lockup:** \`bidly-lockup-on-light-master.png\` и \`bidly-lockup-on-dark-master.png\` — byte-identical прозрачные LOLO2 PNG, 2875×865.
- **Hero:** \`bidly-hero-static-4k-master.png\` — byte-identical копия \`C:/Users/surgut/Desktop/lolo2/BIDLY_Hero_Right_4K.png\`, 3840×2160.

Текущие мастера выбраны из фактически проинспектированной папки LOLO2. Производные создают \`brand:assets\` и \`hero:assets\`; видео, scroll-scrub, автотрейс и CSS-реконструкция бренда отсутствуют.

## Полный список

| Путь | Формат | Размеры | Alpha | Aspect | Байт | Назначение | Дубликат SHA-256 |
| --- | --- | ---: | :---: | ---: | ---: | --- | --- |
${rows.join('\n')}
`;

await writeFile(inventoryPath, document);
