import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { RegistrationForm } from './RegistrationForm';

export class HomePage extends BasePage {
  readonly signUpButton: Locator;

  constructor(page: Page) {
    super(page);
    this.signUpButton = page.getByRole('button', { name: 'Sign up' });
  }

  async openSignUpForm(): Promise<RegistrationForm> {
    await this.signUpButton.click();
    const form = new RegistrationForm(this.page);
    await form.title.waitFor();
    return form;
  }
}
