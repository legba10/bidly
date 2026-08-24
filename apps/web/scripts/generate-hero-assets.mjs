import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const appDirectory = resolve(scriptDirectory, '..');
const sourceDirectory = resolve(appDirectory, 'brand-source', 'lolo2');
const outputDirectory = resolve(appDirectory, 'public', 'media');

const heroSource = resolve(sourceDirectory, 'bidly-hero-road-4k-master.webp');

async function renderPoster(source, name, width) {
  await sharp(source)
    .rotate()
    .resize({ fit: 'inside', width, withoutEnlargement: true })
    .webp({ effort: 5, quality: 94, smartSubsample: true })
    .toFile(resolve(outputDirectory, name));
}

async function main() {
  await mkdir(outputDirectory, { recursive: true });

  await Promise.all([
    copyFile(heroSource, resolve(outputDirectory, 'bidly-hero-road-4k.webp')),
    renderPoster(heroSource, 'bidly-hero-road-2560.webp', 2560),
    renderPoster(heroSource, 'bidly-hero-road-1536.webp', 1536),
    renderPoster(heroSource, 'bidly-hero-road-1024.webp', 1024),
  ]);
}

await main();
