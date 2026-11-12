import type { Locator, Page } from '@playwright/test';

/** The "Log in" modal on the home page. */
export class SignInForm {
  readonly modal: Locator;
  readonly title: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(readonly page: Page) {
    this.modal = page.locator('app-signin-modal');
    this.title = this.modal.locator('.modal-title');
    this.emailInput = page.locator('#signinEmail');
    this.passwordInput = page.locator('#signinPassword');
    this.loginButton = this.modal.getByRole('button', { name: 'Login' });
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
