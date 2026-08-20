import AxeBuilder from '@axe-core/playwright';
import { getBlockingAccessibilityViolations } from '@bidly/testing';
import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

async function openLanding(page: Page): Promise<void> {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('heading', { level: 1, name: 'Компании конкурируют за ваш выбор' }),
  ).toBeVisible();
}

test('explains the reverse-demand marketplace without inventing market data', async ({ page }) => {
  await openLanding(page);

  await expect(page.getByText('Вы сами выбираете подходящее предложение.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Открыть бизнес-раздел' })).toHaveAttribute(
    'href',
    '/business',
  );
});

test('has no serious or critical automated accessibility violations', async ({ page }) => {
  await openLanding(page);
  const results = await new AxeBuilder({ page }).analyze();

  expect(getBlockingAccessibilityViolations(results.violations)).toEqual([]);
});

test('keeps unavailable market data explicit instead of fabricating a market', async ({ page }) => {
  await page.goto('/market', { waitUntil: 'domcontentloaded' });

  await expect(
    page.getByRole('heading', { level: 1, name: 'Рынок появится после подключения данных' }),
  ).toBeVisible();
  await expect(page.getByText('Мы не показываем вымышленные торги или цены.')).toBeVisible();
});

test('serves browser security headers', async ({ request }) => {
  const response = await request.get('/');

  expect(response.ok()).toBe(true);
  expect(response.headers()['content-security-policy']).toContain("default-src 'self'");
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['x-frame-options']).toBe('DENY');
  expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
});

test('exposes minimal API health without caching', async ({ request }) => {
  const response = await request.get('http://127.0.0.1:3001/health/ready');

  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ status: 'ok' });
  expect(response.headers()['cache-control']).toBe('no-store');
});
