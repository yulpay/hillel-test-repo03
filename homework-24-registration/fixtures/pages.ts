import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { RegistrationForm } from '../pages/RegistrationForm';
import { GaragePage } from '../pages/GaragePage';

type Pages = {
  homePage: HomePage;
  /** Home page is open and the Sign up modal is shown */
  registrationForm: RegistrationForm;
  garagePage: GaragePage;
};

export const test = base.extend<Pages>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  registrationForm: async ({ homePage }, use) => {
    await homePage.open();
    const form = await homePage.openSignUpForm();
    await expect(form.title).toHaveText('Registration');
    await use(form);
  },
  garagePage: async ({ page }, use) => {
    await use(new GaragePage(page));
  },
});

export { expect };
