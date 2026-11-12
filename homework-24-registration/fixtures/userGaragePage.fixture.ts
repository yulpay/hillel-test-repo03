import { test as base, expect } from '@playwright/test';
import { STORAGE_STATE_PATH } from '../config/constants';
import { GaragePage } from '../pages/GaragePage';

type UserFixtures = {
  /** Garage page opened by the logged-in test user (session from tests/setup/auth.setup.ts) */
  userGaragePage: GaragePage;
};

export const test = base.extend<UserFixtures>({
  // `browser.newContext()` does not pick up `use` options from the config, so pass them explicitly
  userGaragePage: async ({ browser, baseURL, httpCredentials }, use) => {
    const context = await browser.newContext({
      storageState: STORAGE_STATE_PATH,
      baseURL,
      httpCredentials,
    });
    const page = await context.newPage();
    const garagePage = new GaragePage(page);
    await garagePage.open();

    await use(garagePage);

    await context.close();
  },
});

export { expect };
