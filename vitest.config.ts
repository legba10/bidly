import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const directory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['apps/api/src/**/*.ts', 'packages/*/src/**/*.{ts,tsx}'],
      exclude: ['**/*.stories.tsx', '**/*.test.{ts,tsx}', '**/*.a11y.test.tsx', '**/src/index.ts'],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: [
            'apps/api/src/**/*.test.ts',
            'packages/config/src/**/*.test.ts',
            'packages/domain/src/**/*.test.ts',
            'packages/validation/src/**/*.test.ts',
          ],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          environment: 'node',
          include: ['packages/database/src/**/*.integration.test.ts'],
          testTimeout: 30_000,
          hookTimeout: 30_000,
        },
      },
      {
        extends: true,
        test: {
          name: 'component',
          environment: 'jsdom',
          include: ['packages/ui/src/**/*.test.tsx'],
          exclude: ['packages/ui/src/**/*.a11y.test.tsx'],
          setupFiles: ['./test/setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'accessibility',
          environment: 'jsdom',
          include: ['packages/ui/src/**/*.a11y.test.tsx'],
          setupFiles: ['./test/setup.ts'],
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(directory, 'packages/ui/.storybook'),
            storybookScript: 'pnpm storybook --no-open',
          }),
        ],
        test: {
          name: 'storybook',
          // Storybook's Vite config roots itself at packages/ui. Align Vitest
          // discovery and Storybook's story transform to that same directory.
          dir: path.join(directory, 'packages/ui'),
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
