import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { RegistrationForm } from './RegistrationForm';
import { SignInForm } from './SignInForm';

export class HomePage extends BasePage {
  readonly signUpButton: Locator;
  readonly signInButton: Locator;

  constructor(page: Page) {
    super(page);
    this.signUpButton = page.getByRole('button', { name: 'Sign up' });
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
  }

  async openSignUpForm(): Promise<RegistrationForm> {
    await this.signUpButton.click();
    const form = new RegistrationForm(this.page);
    await form.title.waitFor();
    return form;
  }

  async openSignInForm(): Promise<SignInForm> {
    await this.signInButton.click();
    const form = new SignInForm(this.page);
    await form.title.waitFor();
    return form;
  }
}
