import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const appDirectory = resolve(scriptDirectory, '..');
const workspaceDirectory = resolve(appDirectory, '..', '..');
const sourceDirectory = resolve(workspaceDirectory, 'packages', 'ui', 'brand');
const outputDirectory = resolve(appDirectory, 'public', 'brand');

const markSource = resolve(sourceDirectory, 'bidly-mark.svg');
const logoSource = resolve(sourceDirectory, 'bidly-logo.svg');
const ogSource = resolve(sourceDirectory, 'bidly-og.svg');

const pngSizes = [32, 64, 128, 256, 512, 1024];
const webpSizes = [256, 512, 1024];

function toDataUrl(source, type = 'image/svg+xml') {
  return `data:${type};base64,${Buffer.from(source).toString('base64')}`;
}

function fromDataUrl(dataUrl) {
  const separator = dataUrl.indexOf(',');
  if (separator === -1) throw new Error('Expected a base64 data URL');
  return Buffer.from(dataUrl.slice(separator + 1), 'base64');
}

function icoFromPngEntries(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const directory = Buffer.alloc(entries.length * 16);
  let offset = header.length + directory.length;
  for (const [index, entry] of entries.entries()) {
    const start = index * 16;
    directory.writeUInt8(entry.size === 256 ? 0 : entry.size, start);
    directory.writeUInt8(entry.size === 256 ? 0 : entry.size, start + 1);
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

async function renderPng(page, svg, size, outputPath, scale = 1) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`
    <style>
      html, body { width: 100%; height: 100%; margin: 0; background: transparent; }
      body { display: grid; place-items: center; }
      img { width: ${Math.round(size * scale)}px; height: ${Math.round(size * scale)}px; object-fit: contain; }
    </style>
    <img alt="" src="${toDataUrl(svg)}">
  `);
  await page.locator('img').screenshot({ omitBackground: true, path: outputPath });
  return readFile(outputPath);
}

async function renderWebp(page, svg, size) {
  const dataUrl = await page.evaluate(
    async ({ source, targetSize }) =>
      new Promise((resolveDataUrl, reject) => {
        const image = new Image();
        const blobUrl = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml' }));
        image.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const context = canvas.getContext('2d');
          if (!context) {
            URL.revokeObjectURL(blobUrl);
            reject(new Error('Canvas 2D context is unavailable'));
            return;
          }
          const scale = Math.min(targetSize / image.width, targetSize / image.height);
          const width = image.width * scale;
          const height = image.height * scale;
          context.drawImage(
            image,
            (targetSize - width) / 2,
            (targetSize - height) / 2,
            width,
            height,
          );
          URL.revokeObjectURL(blobUrl);
          resolveDataUrl(canvas.toDataURL('image/webp', 0.92));
        };
        image.onerror = () => {
          URL.revokeObjectURL(blobUrl);
          reject(new Error('Could not render the Bidly SVG as WebP'));
        };
        image.src = blobUrl;
      }),
    { source: svg, targetSize: size },
  );
  if (typeof dataUrl !== 'string') throw new Error('Canvas did not return a WebP data URL');
  return fromDataUrl(dataUrl);
}

async function main() {
  const mark = await readFile(markSource, 'utf8');
  await mkdir(resolve(outputDirectory, 'motion'), { recursive: true });
  await copyFile(markSource, resolve(outputDirectory, 'bidly-mark.svg'));
  await copyFile(logoSource, resolve(outputDirectory, 'bidly-logo.svg'));
  await copyFile(ogSource, resolve(outputDirectory, 'bidly-og.svg'));

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const pngBuffers = new Map();
    for (const size of [...new Set([16, ...pngSizes, 180, 192])]) {
      const filename = `bidly-mark-${size}.png`;
      pngBuffers.set(size, await renderPng(page, mark, size, resolve(outputDirectory, filename)));
    }
    for (const size of webpSizes) {
      await writeFile(
        resolve(outputDirectory, `bidly-mark-${size}.webp`),
        await renderWebp(page, mark, size),
      );
    }
    await renderPng(page, mark, 512, resolve(outputDirectory, 'bidly-mark-maskable-512.png'), 0.7);

    await copyFile(
      resolve(outputDirectory, 'bidly-mark-16.png'),
      resolve(appDirectory, 'public', 'favicon-16x16.png'),
    );
    await copyFile(
      resolve(outputDirectory, 'bidly-mark-32.png'),
      resolve(appDirectory, 'public', 'favicon-32x32.png'),
    );
    await copyFile(
      resolve(outputDirectory, 'bidly-mark-180.png'),
      resolve(appDirectory, 'public', 'apple-touch-icon.png'),
    );
    await copyFile(
      resolve(outputDirectory, 'bidly-mark-192.png'),
      resolve(appDirectory, 'public', 'pwa-192x192.png'),
    );
    await copyFile(
      resolve(outputDirectory, 'bidly-mark-512.png'),
      resolve(appDirectory, 'public', 'pwa-512x512.png'),
    );
    await copyFile(
      resolve(outputDirectory, 'bidly-mark-maskable-512.png'),
      resolve(appDirectory, 'public', 'pwa-maskable-512x512.png'),
    );

    const favicon = icoFromPngEntries(
      [16, 32].map((size) => {
        const buffer = pngBuffers.get(size);
        if (!buffer) throw new Error(`Missing generated ${size}px PNG`);
        return { size, buffer };
      }),
    );
    await writeFile(resolve(appDirectory, 'public', 'favicon.ico'), favicon);
    await mkdir(resolve(appDirectory, 'src', 'app'), { recursive: true });
    await writeFile(resolve(appDirectory, 'src', 'app', 'favicon.ico'), favicon);
    await copyFile(
      resolve(outputDirectory, 'bidly-mark-512.png'),
      resolve(appDirectory, 'src', 'app', 'icon.png'),
    );
    await copyFile(
      resolve(outputDirectory, 'bidly-mark-180.png'),
      resolve(appDirectory, 'src', 'app', 'apple-icon.png'),
    );
  } finally {
    await browser.close();
  }
}

await main();
