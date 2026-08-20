import { defineConfig, devices } from '@playwright/test';

const webOrigin = 'http://127.0.0.1:3000';
const apiOrigin = 'http://127.0.0.1:3001';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['line'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  use: {
    baseURL: webOrigin,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  expect: {
    timeout: 5_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: [
    {
      // Browser smoke checks production builds: Next development reloads can
      // replace the document while axe is evaluating it, particularly in WebKit.
      command: 'pnpm --filter @bidly/web start',
      reuseExistingServer: !process.env['CI'],
      stderr: 'pipe',
      stdout: 'pipe',
      timeout: 120_000,
      url: webOrigin,
    },
    {
      command: 'pnpm --filter @bidly/api start',
      reuseExistingServer: !process.env['CI'],
      stderr: 'pipe',
      stdout: 'pipe',
      timeout: 120_000,
      url: `${apiOrigin}/health/ready`,
    },
  ],
});
