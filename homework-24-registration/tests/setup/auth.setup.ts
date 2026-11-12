import { test as setup, expect } from '@playwright/test';
import { STORAGE_STATE_PATH } from '../../config/constants';
import { testUser } from '../../config/env';
import { HomePage } from '../../pages/HomePage';
import { GaragePage } from '../../pages/GaragePage';

setup('log in as the test user and save storage state', async ({ page }) => {
  const { email, password } = testUser();
  const homePage = new HomePage(page);

  await homePage.open();
  const signInForm = await homePage.openSignInForm();
  await signInForm.login(email, password);

  const garagePage = new GaragePage(page);
  await expect(page).toHaveURL(GaragePage.URL);
  await expect(garagePage.heading).toBeVisible();
  await expect(garagePage.myProfileButton).toBeVisible();

  await page.context().storageState({ path: STORAGE_STATE_PATH });
});
