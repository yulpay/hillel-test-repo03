import { defineConfig, devices } from '@playwright/test';
import { config } from './config/env';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Max time for a whole test */
  timeout: 30_000,
  /* Max time for a single web-first assertion */
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    /* Values come from .env, see config/env.ts */
    baseURL: config.baseURL,
    /* The site is behind HTTP Basic Auth */
    httpCredentials: config.httpCredentials,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  /* One browser only: the positive test creates a real user on every run */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
