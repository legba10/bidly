import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const appDirectory = resolve(scriptDirectory, '..');
const sourceDirectory = resolve(appDirectory, 'brand-source');
const outputDirectory = resolve(appDirectory, 'public', 'brand');
const publicDirectory = resolve(appDirectory, 'public');
const routeAssetsDirectory = resolve(appDirectory, 'src', 'app');

const lolo2SourceDirectory = resolve(sourceDirectory, 'lolo2');
const markSource = resolve(lolo2SourceDirectory, 'bidly-mark-transparent-master.png');
const logoOnLightSource = resolve(lolo2SourceDirectory, 'bidly-logo-on-light-master.png');
const logoOnDarkSource = resolve(lolo2SourceDirectory, 'bidly-logo-on-dark-master.png');
const lockupOnLightSource = resolve(lolo2SourceDirectory, 'bidly-lockup-on-light-master.png');
const lockupOnDarkSource = resolve(lolo2SourceDirectory, 'bidly-lockup-on-dark-master.png');

function icoFromPngEntries(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  const directory = Buffer.alloc(entries.length * 16);
  let offset = header.length + directory.length;
  for (const [index, entry] of entries.entries()) {
    const start = index * 16;
    directory.writeUInt8(entry.size, start);
    directory.writeUInt8(entry.size, start + 1);
    directory.writeUInt8(0, start + 2);
    directory.writeUInt8(0, start + 3);
    directory.writeUInt16LE(1, start + 4);
    directory.writeUInt16LE(32, start + 6);
    directory.writeUInt32LE(entry.buffer.length, start + 8);
    directory.writeUInt32LE(offset, start + 12);
    offset += entry.buffer.length;
  }
  return Buffer.concat([header, directory, ...entries.map((entry) => entry.buffer)]);
}

async function transparentSquare(source, size, inset = 0.08) {
  const contentSize = Math.round(size * (1 - inset * 2));
  const content = await sharp(source)
    .resize({
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      fit: 'contain',
      height: contentSize,
      width: contentSize,
    })
    .png()
    .toBuffer();
  return sharp({
    create: { background: { alpha: 0, b: 0, g: 0, r: 0 }, channels: 4, height: size, width: size },
  })
    .composite([{ input: content, gravity: 'center' }])
    .png()
    .toBuffer();
}

async function solidSquare(source, size, inset, background) {
  const contentSize = Math.round(size * (1 - inset * 2));
  const content = await sharp(source)
    .resize({
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      fit: 'contain',
      height: contentSize,
      width: contentSize,
    })
    .png()
    .toBuffer();
  return sharp({ create: { background, channels: 4, height: size, width: size } })
    .composite([{ input: content, gravity: 'center' }])
    .png()
    .toBuffer();
}

async function main() {
  await mkdir(resolve(outputDirectory, 'motion'), { recursive: true });
  await mkdir(routeAssetsDirectory, { recursive: true });
  await Promise.all([
    copyFile(markSource, resolve(outputDirectory, 'bidly-mark.png')),
    copyFile(logoOnLightSource, resolve(outputDirectory, 'bidly-logo-on-light.png')),
    copyFile(logoOnDarkSource, resolve(outputDirectory, 'bidly-logo-on-dark.png')),
    copyFile(lockupOnLightSource, resolve(outputDirectory, 'bidly-lockup-on-light.png')),
    copyFile(lockupOnDarkSource, resolve(outputDirectory, 'bidly-lockup-on-dark.png')),
    sharp(markSource)
      .webp({ effort: 5, lossless: true })
      .toFile(resolve(outputDirectory, 'bidly-mark.webp')),
    sharp(logoOnLightSource)
      .webp({ effort: 5, lossless: true })
      .toFile(resolve(outputDirectory, 'bidly-logo-on-light.webp')),
    sharp(logoOnDarkSource)
      .webp({ effort: 5, lossless: true })
      .toFile(resolve(outputDirectory, 'bidly-logo-on-dark.webp')),
    sharp(lockupOnLightSource)
      .webp({ effort: 5, lossless: true })
      .toFile(resolve(outputDirectory, 'bidly-lockup-on-light.webp')),
    sharp(lockupOnDarkSource)
      .webp({ effort: 5, lossless: true })
      .toFile(resolve(outputDirectory, 'bidly-lockup-on-dark.webp')),
  ]);

  const iconBuffers = new Map();
  for (const size of [16, 32, 48, 180, 192, 512, 800]) {
    iconBuffers.set(size, await transparentSquare(markSource, size, size <= 48 ? 0.02 : 0.07));
  }
  for (const size of [16, 32, 48]) {
    const buffer = iconBuffers.get(size);
    await writeFile(resolve(outputDirectory, `favicon-${size}x${size}.png`), buffer);
    await writeFile(resolve(publicDirectory, `favicon-${size}x${size}.png`), buffer);
  }

  const favicon = icoFromPngEntries(
    [16, 32, 48].map((size) => ({ buffer: iconBuffers.get(size), size })),
  );
  await Promise.all([
    writeFile(resolve(outputDirectory, 'favicon.ico'), favicon),
    writeFile(resolve(publicDirectory, 'favicon.ico'), favicon),
    writeFile(resolve(routeAssetsDirectory, 'favicon.ico'), favicon),
    writeFile(resolve(outputDirectory, 'apple-touch-icon-180.png'), iconBuffers.get(180)),
    writeFile(resolve(publicDirectory, 'apple-touch-icon.png'), iconBuffers.get(180)),
    writeFile(resolve(routeAssetsDirectory, 'apple-icon.png'), iconBuffers.get(180)),
    writeFile(resolve(outputDirectory, 'pwa-icon-192.png'), iconBuffers.get(192)),
    writeFile(resolve(publicDirectory, 'pwa-192x192.png'), iconBuffers.get(192)),
    writeFile(resolve(outputDirectory, 'pwa-icon-512.png'), iconBuffers.get(512)),
    writeFile(resolve(publicDirectory, 'pwa-512x512.png'), iconBuffers.get(512)),
    writeFile(resolve(outputDirectory, 'social-mark-800.png'), iconBuffers.get(800)),
    writeFile(resolve(routeAssetsDirectory, 'icon.png'), iconBuffers.get(512)),
  ]);

  const maskable192 = await solidSquare(markSource, 192, 0.19, '#070812');
  const maskable512 = await solidSquare(markSource, 512, 0.19, '#070812');
  await Promise.all([
    writeFile(resolve(outputDirectory, 'pwa-maskable-192.png'), maskable192),
    writeFile(resolve(outputDirectory, 'pwa-maskable-512.png'), maskable512),
    writeFile(resolve(publicDirectory, 'pwa-maskable-192x192.png'), maskable192),
    writeFile(resolve(publicDirectory, 'pwa-maskable-512x512.png'), maskable512),
  ]);

  const ogLogo = await sharp(lockupOnDarkSource).resize({ width: 820 }).png().toBuffer();
  const ogBackground = Buffer.from(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="a" cx="72%" cy="22%" r="80%"><stop offset="0" stop-color="#151735"/><stop offset="1" stop-color="#000000"/></radialGradient></defs>
      <rect width="1200" height="630" fill="url(#a)"/>
      <path d="M0 520 C300 430 560 650 1200 430 L1200 630 L0 630Z" fill="#C6FF00" opacity="0.08"/>
    </svg>`);
  await sharp(ogBackground)
    .composite([{ input: ogLogo, left: 92, top: 180 }])
    .png()
    .toFile(resolve(outputDirectory, 'bidly-og-1200x630.png'));
  await copyFile(
    resolve(outputDirectory, 'bidly-og-1200x630.png'),
    resolve(publicDirectory, 'bidly-og.png'),
  );
  await writeFile(
    resolve(outputDirectory, 'motion', 'README.md'),
    '# Bidly hero assets\n\nThe homepage uses the approved static LOLO2 4K hero. Video, scroll scrubbing and fake 3D are intentionally absent. See `docs/design/BIDLY_HERO_MOTION.md` and `docs/design/LOLO2_ASSET_AUDIT.md`.\n',
  );
}

await main();
