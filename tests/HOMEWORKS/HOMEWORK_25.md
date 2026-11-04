# Homework: POM in Playwright

## Context
This task builds on the existing Playwright + TypeScript project from the previous homeworks
(registration form tests for `https://qauto.forstudy.space/`, with `baseURL` and `httpCredentials`
loaded from `.env` via `config/env.ts`). Do NOT start a new project. Refactor the existing one.

## Task (original requirement)
Rewrite the existing user registration tests (created in the previous homework) using **Page Objects**.

## What this means
Tests must no longer contain raw locators (`page.locator(...)`, `#signupName`, etc.) or low-level UI steps.
All locators and page interactions move into Page Object classes. Test files only describe the scenario
and make assertions. Test coverage stays the same: 1 positive + all existing negative scenarios.

## Implementation steps
1. Create a `pages/` folder (or `src/pages/`) with Page Object classes:
   - `BasePage.ts` (optional): holds `page: Page`, and common methods like `open(path = '/')`.
   - `HomePage.ts`: the landing page. Has the "Sign up" button locator and a method
     `openSignUpForm(): Promise<RegistrationForm>` (or similar) that clicks it and returns the form object.
   - `RegistrationForm.ts` (component/modal object): contains
     - locators as `readonly` properties, created in the constructor: title, name, last name, email,
       password, re-enter password inputs, Register button, and a way to get a field's error message;
     - action methods such as `fillName(value)`, `fillLastName(value)`, `fillEmail(value)`,
       `fillPassword(value)`, `fillRepeatPassword(value)`, `blurField(...)`/`triggerValidation(...)`,
       `fillForm(user)` (fills all fields from one object), `clickRegister()`;
     - a getter/method for the error text of a given field (e.g. `errorFor(field)`).
   - `GaragePage.ts`: the page opened after successful registration (`/panel/garage`), with a locator
     or method that confirms the user is logged in.
2. Keep assertions in the tests (`expect(...)` stays in `*.spec.ts`), not in page objects.
   Page objects expose locators/methods; tests assert on them. Exception: small `waitFor`-style helpers are fine.
3. Move test data out of tests where it helps:
   - a `utils/` or `test-data/` helper that generates a valid user with an email starting with the
     `aqa-` prefix and a unique part, e.g. `aqa-${Date.now()}@test.com` (this prefix rule still applies);
   - the negative-case data (invalid names, emails, passwords) and expected error texts as constants/arrays.
4. (Recommended) Use Playwright **fixtures** (`test.extend`) to provide ready page objects to tests,
   e.g. a `registrationForm` fixture that opens the home page and the Sign up modal.
   Put it in `fixtures/` and import `test`/`expect` from there in the spec.
5. Rewrite `tests/registration.spec.ts` using the page objects. Keep `test.describe` grouping
   (Positive / Negative) and data-driven loops for similar negative cases.
6. Keep everything from the previous homeworks working: `.env` config, npm scripts, no hard-coded URLs or credentials.

## Example of the target style
```ts
test('shows error for empty Name', async ({ registrationForm }) => {
  await registrationForm.fillName('');
  await registrationForm.nameInput.blur();
  await expect(registrationForm.errorFor('name')).toHaveText('Name is required');
  await expect(registrationForm.nameInput).toHaveCSS('border-color', 'rgb(220, 53, 69)');
  await expect(registrationForm.registerButton).toBeDisabled();
});
```

## Code rules
- TypeScript, strict types (`Page`, `Locator` from `@playwright/test`), no `any`.
- No `waitForTimeout` / hard waits.
- No raw selectors in `*.spec.ts` files.
- Clear names. One class per file.

## Verification
- `npm test` passes, with at least the same number of tests as before.
- `grep -rn "locator(\|#signup" tests/` finds nothing (selectors only live in `pages/`).
- Each test still checks the same things as before (error text, red border, disabled Register button,
  successful registration).

## Deliverable
The refactored project with `pages/` (Page Objects), test data helpers, optional fixtures, and
a rewritten registration spec, all passing. Finish with a short summary of the new structure.