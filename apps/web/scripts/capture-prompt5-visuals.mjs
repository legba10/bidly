import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { chromium } from 'playwright';

const baseUrl = process.env['BIDLY_CAPTURE_BASE_URL'] ?? 'http://127.0.0.1:3000';
const outputDirectory = resolve(
  import.meta.dirname,
  '../../../docs/engineering/premium-qa-screenshots',
);

const targetViewports = [
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

const captures = [
  { name: 'home-desktop', path: '/', viewport: { width: 1440, height: 900 } },
  { name: 'home-tablet', path: '/', viewport: { width: 768, height: 1024 } },
  { name: 'home-mobile', path: '/', viewport: { width: 390, height: 844 } },
  { name: 'how-it-works-desktop', path: '/how-it-works', viewport: { width: 1440, height: 900 } },
  { name: 'market-desktop', path: '/market', viewport: { width: 1440, height: 900 } },
  { name: 'market-mobile', path: '/market', viewport: { width: 390, height: 844 } },
  { name: 'business-info-desktop', path: '/business-info', viewport: { width: 1440, height: 900 } },
  { name: 'about-desktop', path: '/about', viewport: { width: 1440, height: 900 } },
  { name: 'support-desktop', path: '/support', viewport: { width: 1440, height: 900 } },
  { name: 'login-desktop', path: '/login', viewport: { width: 1440, height: 900 } },
  { name: 'login-mobile', path: '/login', viewport: { width: 390, height: 844 } },
  {
    name: 'buyer-dashboard-desktop',
    path: '/app',
    requiresBuyer: true,
    viewport: { width: 1440, height: 900 },
  },
  {
    name: 'buyer-dashboard-mobile',
    path: '/app',
    requiresBuyer: true,
    viewport: { width: 390, height: 844 },
  },
  { name: 'business-dashboard-desktop', path: '/business', viewport: { width: 1440, height: 900 } },
  { name: 'business-dashboard-mobile', path: '/business', viewport: { width: 390, height: 844 } },
];

const additionalRouteAudits = [
  { name: 'account-unavailable', path: '/account' },
  { name: 'admin-unavailable', path: '/admin' },
  { name: 'legal-terms', path: '/legal/terms' },
  { name: 'legal-privacy', path: '/legal/privacy' },
  { name: 'legal-rules', path: '/legal/rules' },
  { name: 'market-home-internet', path: '/market/home_internet' },
  { name: 'market-mobile-connection', path: '/market/mobile_connection' },
  { name: 'market-fitness', path: '/market/fitness' },
  { name: 'market-dental-hygiene', path: '/market/dental_hygiene' },
  { name: 'market-tire-service', path: '/market/tire_service' },
  { name: 'buyer-auctions', path: '/my/auctions', requiresBuyer: true },
  { name: 'buyer-savings', path: '/my/savings', requiresBuyer: true },
  { name: 'buyer-auction-detail', path: '/auctions/home_internet', requiresBuyer: true },
  {
    name: 'buyer-auction-offers',
    path: '/auctions/home_internet/offers',
    requiresBuyer: true,
  },
  { name: 'buyer-offer-detail', path: '/offers/svyaz-plus', requiresBuyer: true },
  { name: 'buyer-booking', path: '/bookings/hygiene-25-08', requiresBuyer: true },
  ...[
    'demand',
    'auctions',
    'offers',
    'bookings',
    'capacity',
    'clients',
    'analytics',
    'finance',
    'reviews',
    'team',
    'documents',
    'settings',
  ].map((section) => ({ name: `business-${section}`, path: `/business/${section}` })),
];

let loginSequence = 0;

async function loginBuyer(context) {
  loginSequence += 1;
  const phone = `+7900${String(Date.now() + loginSequence).slice(-7)}`;
  const challengeResponse = await context.request.post(`${baseUrl}/api/dev-auth/request`, {
    data: { phone },
  });
  if (!challengeResponse.ok()) throw new Error('DEV challenge request failed');
  const challenge = await challengeResponse.json();
  const verifyResponse = await context.request.post(`${baseUrl}/api/dev-auth/verify`, {
    data: { code: challenge.devCode, requestId: challenge.requestId },
  });
  if (!verifyResponse.ok()) throw new Error('DEV challenge verification failed');
}

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  const viewportResults = [];
  for (const viewport of targetViewports) {
    const page = await browser.newPage({ viewport });
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    const result = await page.evaluate(() => {
      const heroImage = document.querySelector('.bidly-hero-visual img');
      return {
        headingVisible: Boolean(document.querySelector('h1')),
        heroReady: heroImage instanceof HTMLImageElement && heroImage.complete,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        scrollScrubRegionCount: document.querySelectorAll('[data-hero-scroll-region]').length,
        videoCount: document.querySelectorAll('video').length,
      };
    });
    viewportResults.push({ ...viewport, ...result, consoleErrors });
    await page.close();
  }
  await writeFile(
    resolve(outputDirectory, 'viewport-qa.json'),
    `${JSON.stringify(viewportResults, null, 2)}\n`,
  );

  const routeResults = [];
  const routes = [
    ...captures,
    ...additionalRouteAudits.map((route) => ({
      ...route,
      viewport: { width: 1440, height: 900 },
    })),
  ];
  for (const route of routes) {
    const context = await browser.newContext({ viewport: route.viewport });
    if (route.requiresBuyer) await loginBuyer(context);
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    const response = await page.goto(new URL(route.path, baseUrl).toString(), {
      waitUntil: 'networkidle',
    });
    const metrics = await page.evaluate(() => {
      const selectorFor = (element) => {
        if (element.id) return `#${element.id}`;
        const classes = [...element.classList].slice(0, 3).join('.');
        return `${element.tagName.toLowerCase()}${classes ? `.${classes}` : ''}`;
      };
      const unexpectedLightSurfaces = [...document.querySelectorAll('body *')]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          if (rect.width * rect.height < 400 || rect.bottom < 0 || rect.top > window.innerHeight)
            return false;
          const match = getComputedStyle(element).backgroundColor.match(
            /rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)(?:[, /]+([\d.]+))?\)/,
          );
          if (!match) return false;
          const [, red = '0', green = '0', blue = '0', alpha = '1'] = match;
          return (
            Number(alpha) >= 0.75 &&
            Number(red) >= 230 &&
            Number(green) >= 230 &&
            Number(blue) >= 230
          );
        })
        .slice(0, 20)
        .map(selectorFor);
      const brandImages = [...document.querySelectorAll('img')]
        .filter((image) => image.currentSrc.includes('/brand/'))
        .map((image) => {
          const style = getComputedStyle(image);
          const parentStyle = image.parentElement ? getComputedStyle(image.parentElement) : null;
          return {
            border: style.border,
            boxShadow: style.boxShadow,
            filter: style.filter,
            mixBlendMode: style.mixBlendMode,
            parentBackground: parentStyle?.backgroundColor ?? null,
            src: new URL(image.currentSrc).pathname,
          };
        });
      return {
        brandImages,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        imageFailures: [...document.images]
          .filter((image) => image.complete && image.naturalWidth === 0)
          .map((image) => image.currentSrc || image.src),
        unexpectedLightSurfaces,
      };
    });
    if (captures.includes(route))
      await page.screenshot({ path: resolve(outputDirectory, `${route.name}.png`) });
    routeResults.push({
      consoleErrors,
      name: route.name,
      pageErrors,
      path: route.path,
      status: response?.status() ?? null,
      ...metrics,
    });
    await context.close();
  }
  await writeFile(
    resolve(outputDirectory, 'route-qa.json'),
    `${JSON.stringify(routeResults, null, 2)}\n`,
  );

  const performancePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await performancePage.addInitScript(() => {
    window.__bidlyHeroMetrics = { cls: 0, lcp: 0 };
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const latest = entries.at(-1);
      if (latest) window.__bidlyHeroMetrics.lcp = latest.startTime;
    }).observe({ buffered: true, type: 'largest-contentful-paint' });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__bidlyHeroMetrics.cls += entry.value;
      }
    }).observe({ buffered: true, type: 'layout-shift' });
  });
  await performancePage.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await performancePage.waitForTimeout(1_200);
  const performance = await performancePage.evaluate(() => {
    const resources = performance.getEntriesByType('resource');
    const heroResources = resources
      .filter((entry) => entry.name.includes('/media/bidly-hero-static'))
      .map((entry) => ({
        encodedBodySize: entry.encodedBodySize,
        name: new URL(entry.name).pathname,
        transferSize: entry.transferSize,
      }));
    return {
      ...window.__bidlyHeroMetrics,
      context: 'local Next.js development server; directional observation, not a lab benchmark',
      heroResources,
      totalEncodedBodySize: resources.reduce((sum, entry) => sum + entry.encodedBodySize, 0),
      totalTransferSize: resources.reduce((sum, entry) => sum + entry.transferSize, 0),
    };
  });
  await writeFile(
    resolve(outputDirectory, 'hero-performance.json'),
    `${JSON.stringify(performance, null, 2)}\n`,
  );
  await performancePage.close();
} finally {
  await browser.close();
}
