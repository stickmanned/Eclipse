import { defineConfig } from '@playwright/test';

/**
 * Extension E2E.
 *
 * An MV3 extension needs a persistent context launched with
 * `--load-extension`, so there is no `use.browserName` here — each test file
 * builds its own context through `tests/e2e/fixtures.ts`.
 *
 * The demo server is started by Playwright itself so `npm run test:e2e` is a
 * single command with no setup.
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  webServer: {
    command: 'node demo/server.mjs',
    url: 'http://127.0.0.1:4321/',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
