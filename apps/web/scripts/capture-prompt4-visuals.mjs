import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { chromium } from 'playwright';

const baseUrl = process.env['BIDLY_CAPTURE_BASE_URL'] ?? 'http://127.0.0.1:3000';
const outputDirectory = resolve(
  import.meta.dirname,
  '../../../docs/engineering/prompt4-screenshots',
);

const captures = [
  { name: 'home-desktop', path: '/', viewport: { width: 1440, height: 960 } },
  { name: 'home-mobile', path: '/', viewport: { width: 390, height: 844 } },
  { name: 'market-desktop', path: '/market', viewport: { width: 1440, height: 960 } },
  { name: 'market-mobile', path: '/market', viewport: { width: 390, height: 844 } },
  { name: 'login-desktop', path: '/login', viewport: { width: 1440, height: 960 } },
  { name: 'business-desktop', path: '/business', viewport: { width: 1440, height: 960 } },
];

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  for (const capture of captures) {
    const page = await browser.newPage({ viewport: capture.viewport });
    await page.goto(new URL(capture.path, baseUrl).toString(), { waitUntil: 'domcontentloaded' });
    await page.screenshot({
      fullPage: true,
      path: resolve(outputDirectory, `${capture.name}.png`),
    });
    await page.close();
  }
} finally {
  await browser.close();
}
