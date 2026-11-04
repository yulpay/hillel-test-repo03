import type { Locator, Page } from '@playwright/test';
import type { User } from '../test-data/users';

export type RegistrationField = keyof User;

/** The "Sign up" modal on the home page. */
export class RegistrationForm {
  readonly modal: Locator;
  readonly title: Locator;
  readonly nameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly repeatPasswordInput: Locator;
  readonly registerButton: Locator;
  /** All validation messages currently shown in the form */
  readonly errors: Locator;

  constructor(readonly page: Page) {
    this.modal = page.locator('app-signup-modal');
    this.title = this.modal.locator('.modal-title');
    // Labels in the app all point to `for="signupEmail"`, so getByLabel is unreliable — use ids.
    // Page-scoped on purpose: errorFor() uses them in `has:`, which is resolved relative to .form-group
    this.nameInput = page.locator('#signupName');
    this.lastNameInput = page.locator('#signupLastName');
    this.emailInput = page.locator('#signupEmail');
    this.passwordInput = page.locator('#signupPassword');
    this.repeatPasswordInput = page.locator('#signupRepeatPassword');
    this.registerButton = this.modal.getByRole('button', { name: 'Register' });
    this.errors = this.modal.locator('.invalid-feedback');
  }

  input(field: RegistrationField): Locator {
    const inputs: Record<RegistrationField, Locator> = {
      name: this.nameInput,
      lastName: this.lastNameInput,
      email: this.emailInput,
      password: this.passwordInput,
      repeatPassword: this.repeatPasswordInput,
    };
    return inputs[field];
  }

  errorFor(field: RegistrationField): Locator {
    return this.modal.locator('.form-group', { has: this.input(field) }).locator('.invalid-feedback');
  }

  async fillName(value: string): Promise<void> {
    await this.nameInput.fill(value);
  }

  async fillLastName(value: string): Promise<void> {
    await this.lastNameInput.fill(value);
  }

  async fillEmail(value: string): Promise<void> {
    await this.emailInput.fill(value);
  }

  async fillPassword(value: string): Promise<void> {
    await this.passwordInput.fill(value);
  }

  async fillRepeatPassword(value: string): Promise<void> {
    await this.repeatPasswordInput.fill(value);
  }

  /** Validation errors appear only after the field loses focus. */
  async triggerValidation(field: RegistrationField): Promise<void> {
    await this.input(field).blur();
  }

  async fillField(field: RegistrationField, value: string): Promise<void> {
    await this.input(field).fill(value);
    await this.triggerValidation(field);
  }

  /** Fills every field in order and blurs it, so all validation messages are shown. */
  async fillForm(user: User): Promise<void> {
    for (const [field, value] of Object.entries(user) as [RegistrationField, string][]) {
      await this.fillField(field, value);
    }
  }

  async clickRegister(): Promise<void> {
    await this.registerButton.click();
  }
}
