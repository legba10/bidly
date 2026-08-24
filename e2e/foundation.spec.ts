import AxeBuilder from '@axe-core/playwright';
import { getBlockingAccessibilityViolations } from '@bidly/testing';
import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

async function openLanding(page: Page): Promise<void> {
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.getByRole('heading', { level: 1, name: /Ваш спрос/ })).toBeVisible();
}

function isWebKitRscPrefetchNoise(message: string): boolean {
  return message.includes('_rsc=') && message.includes('due to access control checks');
}

test('keeps the production public path truthful and functional', async ({ page }) => {
  await openLanding(page);

  await expect(page.getByText('DEV ONLY', { exact: false })).toHaveCount(0);
  await expect(page.getByText('18 421', { exact: false })).toHaveCount(0);
  await expect(page.getByText('549 ₽', { exact: false })).toHaveCount(0);
  const hero = page.locator('.bidly-home-hero');
  await expect(hero.getByRole('link', { name: 'Создать запрос' })).toHaveAttribute(
    'href',
    '/market',
  );
  await expect(page.getByRole('link', { name: 'Как это работает' }).last()).toHaveAttribute(
    'href',
    '/how-it-works',
  );

  await hero.getByRole('link', { name: 'Создать запрос' }).click();
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Спрос уже есть. Выберите, где усилить его своим запросом',
    }),
  ).toBeVisible();
});

test('uses one static responsive hero without video or scroll scrubbing', async ({ page }) => {
  await openLanding(page);

  const visual = page.locator('.bidly-hero-visual');
  const image = visual.locator('img');
  await expect(visual).toBeVisible();
  await expect(page.locator('video')).toHaveCount(0);
  await expect(page.locator('[data-hero-scroll-region]')).toHaveCount(0);
  await expect(image).toHaveAttribute('src', '/media/bidly-hero-road-4k.webp');
  await expect
    .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  await expect(page.locator('.bidly-home-hero')).toHaveCSS('position', 'relative');
});

test('uses transparent approved logo assets in primary contexts', async ({ page }) => {
  const routes = ['/', '/market', '/about', '/login', '/app', '/business'];

  for (const route of routes) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    const logo = page.locator('.bidly-brand-logo:visible').first();
    const image = logo.locator('img');
    await expect(logo).toBeVisible();
    await expect(image).toHaveAttribute(
      'src',
      /\/brand\/bidly-(?:logo-on-dark|logo-on-light|mark|lockup-on-dark|lockup-on-light)\.png/,
    );
    const presentation = await logo.evaluate((element) => {
      const style = getComputedStyle(element);
      const imageElement = element.querySelector('img');
      if (!(imageElement instanceof HTMLImageElement)) throw new Error('Brand image is missing');
      const imageStyle = getComputedStyle(imageElement);
      return {
        background: style.backgroundImage,
        backgroundColor: style.backgroundColor,
        border: style.borderStyle,
        boxShadow: style.boxShadow,
        filter: imageStyle.filter,
        mixBlendMode: imageStyle.mixBlendMode,
      };
    });
    expect(presentation).toEqual({
      background: 'none',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      border: 'none',
      boxShadow: 'none',
      filter: 'none',
      mixBlendMode: 'normal',
    });
  }
});

test('keeps the public header intentional before and after scroll', async ({ page }) => {
  await openLanding(page);
  const header = page.locator('.bidly-public-header');
  const logo = header.locator('.bidly-brand-logo:visible img');
  const logoSource = await logo.getAttribute('src');
  await expect(header).toHaveAttribute('data-scrolled', 'false');

  await page.evaluate(() => {
    window.scrollTo(0, Math.max(180, window.innerHeight));
  });
  await expect(header).toHaveAttribute('data-scrolled', 'true');
  await expect(logo).toHaveAttribute('src', logoSource ?? '');
  const background = await header.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(background).not.toBe('rgb(128, 128, 128)');
});

test('persists the chosen theme and uses the matching visible logo', async ({ page }) => {
  await openLanding(page);
  const toggle = page.getByRole('button', { name: 'Переключить светлую и тёмную тему' });
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.bidly-public-header .bidly-brand-logo:visible img')).toHaveAttribute(
    'src',
    '/brand/bidly-logo-on-dark.png',
  );
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('does not add a custom cursor or decorative pointer transform', async ({ page }) => {
  await openLanding(page);
  await expect(page.locator('[style*="cursor:"][style*="fixed"]')).toHaveCount(0);
});

test('has no serious or critical automated accessibility violations', async ({ page }) => {
  test.setTimeout(120_000);
  await openLanding(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(getBlockingAccessibilityViolations(results.violations)).toEqual([]);
});

test('keeps production market, login, buyer and business data boundaries explicit', async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  await page.goto('/market', { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByText('Живые данные появятся только из проверенного API').first(),
  ).toBeVisible();
  await expect(page.getByText('549 ₽', { exact: false })).toHaveCount(0);

  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Подключаем защищённый вход' })).toBeVisible();
  await expect(page.getByText('DEV', { exact: false })).toHaveCount(0);
  await expect(page.getByText('549 ₽', { exact: false })).toHaveCount(0);

  await page.goto('/app', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Личный кабинет ждёт защищённый вход')).toBeVisible();

  await page.goto('/business', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Бизнес-раздел ждёт организационный контур')).toBeVisible();

  expect(
    (await request.post('/api/dev-auth/request', { data: { phone: '+7 999 000-00-00' } })).status(),
  ).toBe(404);
  expect((await request.post('/api/dev-auth/logout')).status()).toBe(404);
});

test('keeps all required responsive layouts within the viewport', async ({ page }) => {
  test.setTimeout(180_000);
  const viewports = [
    { width: 1920, height: 1080 },
    { width: 1440, height: 900 },
    { width: 1366, height: 768 },
    { width: 1280, height: 800 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
    { width: 430, height: 932 },
    { width: 390, height: 844 },
    { width: 375, height: 812 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await openLanding(page);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true);
    await expect(page.locator('.bidly-hero-visual')).toBeVisible();
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await openLanding(page);
  await page.locator('.bidly-public-header__menu > summary').click();
  const navigation = page.getByRole('navigation', { name: 'Мобильная навигация' });
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'Рынок' })).toHaveAttribute('href', '/market');
});

test('loads every main route without runtime errors or horizontal overflow', async ({ page }) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !isWebKitRscPrefetchNoise(message.text()))
      errors.push(message.text());
  });
  page.on('pageerror', (error) => {
    if (!isWebKitRscPrefetchNoise(error.message)) errors.push(error.message);
  });

  const routes = [
    '/',
    '/how-it-works',
    '/market',
    '/market/home_internet',
    '/business-info',
    '/about',
    '/support',
    '/legal/terms',
    '/legal/privacy',
    '/legal/rules',
    '/login',
    '/app',
    '/business',
    '/account',
    '/admin',
    '/my/auctions',
    '/my/savings',
    '/auctions/example',
    '/auctions/example/offers',
    '/offers/example',
    '/bookings/example',
  ];

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.status(), route).toBeLessThan(500);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      route,
    ).toBe(true);
  }
  expect(errors).toEqual([]);
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
