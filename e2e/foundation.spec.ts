import AxeBuilder from '@axe-core/playwright';
import { getBlockingAccessibilityViolations } from '@bidly/testing';
import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

async function openTechnicalFoundation(page: Page): Promise<void> {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('heading', { level: 1, name: 'Техническая проверка дизайн-системы' }),
  ).toBeVisible();
}

test('renders only the technical foundation surface', async ({ page }) => {
  await openTechnicalFoundation(page);

  await expect(
    page.getByText('Здесь нет торгов, кабинетов и другой продуктовой логики.'),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Продуктовые действия пока недоступны' }),
  ).toBeDisabled();
});

test('has no serious or critical automated accessibility violations', async ({ page }) => {
  await openTechnicalFoundation(page);
  const results = await new AxeBuilder({ page }).analyze();

  expect(getBlockingAccessibilityViolations(results.violations)).toEqual([]);
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
