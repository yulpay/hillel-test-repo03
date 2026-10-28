import { test, expect, type Locator, type Page } from '@playwright/test';

const RED_BORDER = 'rgb(220, 53, 69)';
const PASSWORD_ERROR =
  'Password has to be from 8 to 15 characters long and contain at least one integer, one capital, and one small letter';

/** Every user created by auto-tests must have an email starting with this prefix. */
const EMAIL_PREFIX = 'aqa-';
const uniqueEmail = () =>
  `${EMAIL_PREFIX}${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.com`;

type FieldKey = 'name' | 'lastName' | 'email' | 'password' | 'repeatPassword';

const VALID = {
  name: 'John',
  lastName: 'Smith',
  password: 'Qwerty12',
};

class SignupForm {
  readonly modal: Locator;
  readonly title: Locator;
  readonly fields: Record<FieldKey, Locator>;
  readonly registerButton: Locator;

  constructor(private readonly page: Page) {
    this.modal = page.locator('app-signup-modal');
    this.title = this.modal.locator('.modal-title');
    // Labels in the app all point to `for="signupEmail"`, so getByLabel is unreliable — use ids
    this.fields = {
      name: page.locator('#signupName'),
      lastName: page.locator('#signupLastName'),
      email: page.locator('#signupEmail'),
      password: page.locator('#signupPassword'),
      repeatPassword: page.locator('#signupRepeatPassword'),
    };
    this.registerButton = this.modal.getByRole('button', { name: 'Register' });
  }

  async open() {
    await this.page.goto('/');
    await this.page.getByRole('button', { name: 'Sign up' }).click();
    await expect(this.title).toHaveText('Registration');
  }

  /** Validation errors appear after the field loses focus. */
  async fillAndBlur(field: FieldKey, value: string) {
    await this.fields[field].fill(value);
    await this.fields[field].blur();
  }

  async fillAll(data: Record<FieldKey, string>) {
    for (const [field, value] of Object.entries(data) as [FieldKey, string][]) {
      await this.fillAndBlur(field, value);
    }
  }

  errorFor(field: FieldKey): Locator {
    return this.modal
      .locator('.form-group', { has: this.fields[field] })
      .locator('.invalid-feedback');
  }

  async expectFieldError(field: FieldKey, message: string) {
    await expect(this.errorFor(field)).toHaveText(message);
    await expect(this.fields[field]).toHaveCSS('border-color', RED_BORDER);
    await expect(this.registerButton).toBeDisabled();
  }
}

const validData = (): Record<FieldKey, string> => ({
  name: VALID.name,
  lastName: VALID.lastName,
  email: uniqueEmail(),
  password: VALID.password,
  repeatPassword: VALID.password,
});

test.describe('Registration form', () => {
  let form: SignupForm;

  test.beforeEach(async ({ page }) => {
    form = new SignupForm(page);
    await form.open();
  });

  test.describe('Positive', () => {
    test('registers a new user with valid data', async ({ page }) => {
      const data = validData();
      expect(data.email.startsWith(EMAIL_PREFIX)).toBe(true);

      await form.fillAll(data);
      await expect(form.modal.locator('.invalid-feedback')).toHaveCount(0);
      await expect(form.registerButton).toBeEnabled();

      await form.registerButton.click();

      await expect(page).toHaveURL(/\/panel\/garage$/);
      await expect(form.modal).toBeHidden();
      await expect(page.getByRole('heading', { name: 'Garage', level: 1 })).toBeVisible();
      await expect(page.getByRole('button', { name: 'My profile' })).toBeVisible();
    });

    const boundaries: { title: string; field: FieldKey; value: string }[] = [
      { title: 'Name with 2 chars', field: 'name', value: 'Jo' },
      { title: 'Name with 20 chars', field: 'name', value: 'A'.repeat(20) },
      { title: 'Last name with 2 chars', field: 'lastName', value: 'Li' },
      { title: 'Last name with 20 chars', field: 'lastName', value: 'B'.repeat(20) },
    ];

    for (const c of boundaries) {
      test(`accepts boundary value: ${c.title}`, async () => {
        await form.fillAll({ ...validData(), [c.field]: c.value });

        await expect(form.errorFor(c.field)).toHaveCount(0);
        await expect(form.fields[c.field]).not.toHaveCSS('border-color', RED_BORDER);
        await expect(form.registerButton).toBeEnabled();
      });
    }

    for (const password of ['Qwerty12', 'Qwerty123456789']) {
      test(`accepts boundary password of ${password.length} chars`, async () => {
        await form.fillAll({ ...validData(), password, repeatPassword: password });

        await expect(form.errorFor('password')).toHaveCount(0);
        await expect(form.registerButton).toBeEnabled();
      });
    }

    for (const field of ['name', 'lastName'] as const) {
      test(`trims spaces around a valid ${field}`, async () => {
        // Known bug: requirements say the value is trimmed, but the app shows
        // "Name is invalid" / "Last name is invalid" for "  Jo  "
        test.fail(true, 'App does not trim leading/trailing spaces');

        await form.fillAll({ ...validData(), [field]: '  Jo  ' });

        await expect(form.errorFor(field)).toHaveCount(0);
        await expect(form.registerButton).toBeEnabled();
      });
    }
  });

  test.describe('Negative', () => {
    const cases: { title: string; field: FieldKey; value: string; error: string }[] = [
      { title: 'Name: invalid (digits)', field: 'name', value: 'Ivan1', error: 'Name is invalid' },
      { title: 'Name: invalid (non-English)', field: 'name', value: 'Іван', error: 'Name is invalid' },
      { title: 'Name: too short', field: 'name', value: 'J', error: 'Name has to be from 2 to 20 characters long' },
      { title: 'Name: too long', field: 'name', value: 'A'.repeat(21), error: 'Name has to be from 2 to 20 characters long' },

      { title: 'Last name: invalid (digits)', field: 'lastName', value: 'Smith1', error: 'Last name is invalid' },
      { title: 'Last name: invalid (non-English)', field: 'lastName', value: 'Петров', error: 'Last name is invalid' },
      { title: 'Last name: too short', field: 'lastName', value: 'S', error: 'Last name has to be from 2 to 20 characters long' },
      { title: 'Last name: too long', field: 'lastName', value: 'B'.repeat(21), error: 'Last name has to be from 2 to 20 characters long' },

      { title: 'Email: empty', field: 'email', value: '', error: 'Email required' },
      { title: 'Email: no @', field: 'email', value: 'aqa-test', error: 'Email is incorrect' },
      { title: 'Email: no domain', field: 'email', value: 'aqa@', error: 'Email is incorrect' },
      { title: 'Email: no TLD', field: 'email', value: 'aqa@test', error: 'Email is incorrect' },

      { title: 'Password: empty', field: 'password', value: '', error: 'Password required' },
      { title: 'Password: 7 chars', field: 'password', value: 'Qwerty1', error: PASSWORD_ERROR },
      { title: 'Password: 16 chars', field: 'password', value: 'Qwerty1234567890', error: PASSWORD_ERROR },
      { title: 'Password: no digit', field: 'password', value: 'Qwertyui', error: PASSWORD_ERROR },
      { title: 'Password: no uppercase', field: 'password', value: 'qwerty12', error: PASSWORD_ERROR },
      { title: 'Password: no lowercase', field: 'password', value: 'QWERTY12', error: PASSWORD_ERROR },

      { title: 'Re-enter password: empty', field: 'repeatPassword', value: '', error: 'Re-enter password required' },
      { title: 'Re-enter password: mismatch', field: 'repeatPassword', value: 'Qwerty13', error: 'Passwords do not match' },
    ];

    for (const c of cases) {
      test(c.title, async () => {
        // All other fields are valid, so the disabled button is caused by this field only
        const data = validData();
        if (c.field === 'password') {
          // Keep repeatPassword empty, otherwise it adds its own mismatch error
          await form.fillAll({ ...data, password: c.value, repeatPassword: '' });
        } else {
          await form.fillAll({ ...data, [c.field]: c.value });
        }

        await form.expectFieldError(c.field, c.error);
      });
    }

    const emptyNameCases: { field: FieldKey; specError: string; actualError: string }[] = [
      { field: 'name', specError: 'Name is required', actualError: 'Name required' },
      { field: 'lastName', specError: 'Last name is required', actualError: 'Last name required' },
    ];

    for (const c of emptyNameCases) {
      test(`${c.field}: empty shows "${c.specError}"`, async () => {
        // Known bug: the app shows "${c.actualError}" instead of the required text
        test.fail(true, `App shows "${c.actualError}" instead of "${c.specError}"`);

        await form.fillAll({ ...validData(), [c.field]: '' });

        await form.expectFieldError(c.field, c.specError);
      });

      test(`${c.field}: empty — red border and disabled Register`, async () => {
        await form.fillAll({ ...validData(), [c.field]: '' });

        await form.expectFieldError(c.field, c.actualError);
      });
    }
  });
});
