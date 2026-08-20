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

test('explains the reverse-demand marketplace and provides a functioning public path', async ({
  page,
}) => {
  await openLanding(page);

  await expect(page.getByText('Вы сами выбираете подходящее предложение.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Узнать о работе с Bidly' })).toHaveAttribute(
    'href',
    '/business-info',
  );

  const secondStep = page.getByRole('button', { name: 'Bidly объединяет совместимый спрос' });
  await secondStep.click();
  await expect(secondStep).toHaveAttribute('aria-current', 'step');
  await expect(
    page.getByText('Похожие запросы объединяются без потери ваших индивидуальных ограничений.'),
  ).toBeVisible();
});

test('has no serious or critical automated accessibility violations', async ({ page }) => {
  await openLanding(page);
  const results = await new AxeBuilder({ page }).analyze();

  expect(getBlockingAccessibilityViolations(results.violations)).toEqual([]);
});

test('keeps live market data explicit while exposing the approved category catalog', async ({
  page,
}) => {
  await page.goto('/market', { waitUntil: 'domcontentloaded' });

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Выберите направление, с которого начнётся ваш запрос',
    }),
  ).toBeVisible();
  await expect(page.getByText('Направлений найдено: 3')).toBeVisible();
  await expect(
    page.getByText('Рынок появится после подключения проверенных данных').first(),
  ).toBeVisible();
  await expect(page.getByText('549 ₽')).toHaveCount(0);
});

test('opens the usable mobile navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openLanding(page);

  await page.locator('.bidly-public-header__menu > summary').click();
  const navigation = page.getByRole('navigation', { name: 'Мобильная навигация' });
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'Рынок' })).toHaveAttribute('href', '/market');
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
