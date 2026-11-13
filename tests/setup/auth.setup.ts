import { test as setup, expect } from '@playwright/test';
import { STORAGE_STATE_PATH, testUser } from '../../utils/env';

setup('log in as the test user and save storage state', async ({ page }) => {
  const { email, password } = testUser();

  await page.goto('/');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.locator('#signinEmail').fill(email);
  await page.locator('#signinPassword').fill(password);
  await page.locator('app-signin-modal').getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/panel\/garage/);

  await page.context().storageState({ path: STORAGE_STATE_PATH });
});
