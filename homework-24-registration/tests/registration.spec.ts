import { test, expect } from '../fixtures/pages';
import { GaragePage } from '../pages/GaragePage';
import type { RegistrationField, RegistrationForm } from '../pages/RegistrationForm';
import { EMAIL_PREFIX, validUser } from '../test-data/users';
import {
  BOUNDARY_CASES,
  BOUNDARY_PASSWORDS,
  EMPTY_NAME_CASES,
  NEGATIVE_CASES,
  RED_BORDER,
} from '../test-data/registration';

async function expectFieldError(form: RegistrationForm, field: RegistrationField, message: string) {
  await expect(form.errorFor(field)).toHaveText(message);
  await expect(form.input(field)).toHaveCSS('border-color', RED_BORDER);
  await expect(form.registerButton).toBeDisabled();
}

test.describe('Registration form', () => {
  test.describe('Positive', () => {
    test('registers a new user with valid data', async ({ registrationForm, garagePage }) => {
      const user = validUser();
      expect(user.email.startsWith(EMAIL_PREFIX)).toBe(true);

      await registrationForm.fillForm(user);
      await expect(registrationForm.errors).toHaveCount(0);
      await expect(registrationForm.registerButton).toBeEnabled();

      await registrationForm.clickRegister();

      await expect(garagePage.page).toHaveURL(GaragePage.URL);
      await expect(registrationForm.modal).toBeHidden();
      await expect(garagePage.heading).toBeVisible();
      await expect(garagePage.myProfileButton).toBeVisible();
    });

    for (const c of BOUNDARY_CASES) {
      test(`accepts boundary value: ${c.title}`, async ({ registrationForm }) => {
        await registrationForm.fillForm(validUser({ [c.field]: c.value }));

        await expect(registrationForm.errorFor(c.field)).toHaveCount(0);
        await expect(registrationForm.input(c.field)).not.toHaveCSS('border-color', RED_BORDER);
        await expect(registrationForm.registerButton).toBeEnabled();
      });
    }

    for (const password of BOUNDARY_PASSWORDS) {
      test(`accepts boundary password of ${password.length} chars`, async ({ registrationForm }) => {
        await registrationForm.fillForm(validUser({ password, repeatPassword: password }));

        await expect(registrationForm.errorFor('password')).toHaveCount(0);
        await expect(registrationForm.registerButton).toBeEnabled();
      });
    }

    for (const field of ['name', 'lastName'] as const) {
      test(`trims spaces around a valid ${field}`, async ({ registrationForm }) => {
        // Known bug: requirements say the value is trimmed, but the app shows
        // "Name is invalid" / "Last name is invalid" for "  Jo  "
        test.fail(true, 'App does not trim leading/trailing spaces');

        await registrationForm.fillForm(validUser({ [field]: '  Jo  ' }));

        await expect(registrationForm.errorFor(field)).toHaveCount(0);
        await expect(registrationForm.registerButton).toBeEnabled();
      });
    }
  });

  test.describe('Negative', () => {
    for (const c of NEGATIVE_CASES) {
      test(c.title, async ({ registrationForm }) => {
        // All other fields are valid, so the disabled button is caused by this field only.
        // For password cases keep repeatPassword empty, otherwise it adds its own mismatch error.
        const user =
          c.field === 'password'
            ? validUser({ password: c.value, repeatPassword: '' })
            : validUser({ [c.field]: c.value });
        await registrationForm.fillForm(user);

        await expectFieldError(registrationForm, c.field, c.error);
      });
    }

    for (const c of EMPTY_NAME_CASES) {
      test(`${c.field}: empty shows "${c.specError}"`, async ({ registrationForm }) => {
        // Known bug: the app shows "${c.actualError}" instead of the required text
        test.fail(true, `App shows "${c.actualError}" instead of "${c.specError}"`);

        await registrationForm.fillForm(validUser({ [c.field]: '' }));

        await expectFieldError(registrationForm, c.field, c.specError);
      });

      test(`${c.field}: empty — red border and disabled Register`, async ({ registrationForm }) => {
        await registrationForm.fillForm(validUser({ [c.field]: '' }));

        await expectFieldError(registrationForm, c.field, c.actualError);
      });
    }
  });
});
