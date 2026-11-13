import { defineConfig, devices } from '@playwright/test';
/* Loads .env (dotenv) and exposes the URL, Basic Auth and test-user settings */
import { BASE_URL, HTTP_CREDENTIALS, STORAGE_STATE_PATH } from './utils/env';

/* Browser projects log in once via the `setup` project and reuse its session */
const loggedIn = { storageState: STORAGE_STATE_PATH };
const browserProject = { dependencies: ['setup'], testIgnore: ['**/api/**', '**/*.setup.ts'] };

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Folder for traces, screenshots and videos of failed tests */
  outputDir: 'test-results',
  /* Max time for a whole test */
  timeout: 30_000,
  /* Max time for a single web-first assertion like `expect(locator).toBeVisible()` */
  expect: { timeout: 5_000 },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Use half of the available CPU cores on CI */
  workers: process.env.CI ? '50%' : undefined,
  /* Stop early on CI when the build is clearly broken */
  maxFailures: process.env.CI ? 10 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [
        ['github'],
        ['html', { open: 'never' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
      ]
    : [['list'], ['html', { open: 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. Override with BASE_URL in .env */
    baseURL: BASE_URL,

    /* The site is behind HTTP Basic Auth (HTTP_USERNAME / HTTP_PASSWORD in .env) */
    httpCredentials: HTTP_CREDENTIALS,

    /* Keep debugging artifacts only for failed tests. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    /* Max time for a single action (click, fill, ...) and for navigation */
    actionTimeout: 10_000,
    navigationTimeout: 15_000,

    /* Attribute used by `page.getByTestId()` */
    testIdAttribute: 'data-testid',

    /* Consistent formatting of dates and numbers across machines */
    locale: 'en-US',
    timezoneId: 'UTC',
  },

  /* Configure projects for major browsers */
  projects: [
    /* Logs in once and saves the session for the browser projects below */
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    /* API tests (tests/api) use APIRequestContext only, so they run once, without a browser */
    {
      name: 'api',
      testDir: './tests/api',
    },

    {
      name: 'chromium',
      ...browserProject,
      use: { ...devices['Desktop Chrome'], ...loggedIn },
    },

    {
      name: 'firefox',
      ...browserProject,
      use: { ...devices['Desktop Firefox'], ...loggedIn },
    },

    {
      name: 'webkit',
      ...browserProject,
      use: { ...devices['Desktop Safari'], ...loggedIn },
    },

    /* Test against mobile viewports. */
    {
      name: 'mobile-chrome',
      ...browserProject,
      use: { ...devices['Pixel 7'], ...loggedIn },
    },
    {
      name: 'mobile-safari',
      ...browserProject,
      use: { ...devices['iPhone 15'], ...loggedIn },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests (only needed when testing a local app) */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
