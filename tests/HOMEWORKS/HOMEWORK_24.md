# Homework: Locators, Actions and Asserts in Playwright

## Goal
Write automated UI tests with **Playwright + TypeScript** for the **new-user Registration form** on a web app.
Required: **1 positive scenario** and **at least 5 negative scenarios** (more is better — cover the requirements thoroughly).

## Application under test
- URL: `https://qauto.forstudy.space/`
- The site is protected by **HTTP Basic Auth**: username `guest`, password `welcome2qauto`.
  Configure this in `playwright.config.ts` via `use.httpCredentials` (do NOT put credentials in the URL).
- The Registration form is a modal dialog. Open it by clicking the **"Sign up"** button on the home page.
- Before writing locators, open the page and inspect the real DOM. Prefer stable locators
  (`id`, `getByRole`, `getByLabel`, `getByText`) over long CSS/XPath chains.
  Hint (verify before relying on it): inputs likely have ids `#signupName`, `#signupLastName`,
  `#signupEmail`, `#signupPassword`, `#signupRepeatPassword`.

## Mandatory rule for created users
Every user the tests create must have an email that **starts with a fixed prefix**, so auto-test users
can be distinguished from others. Use prefix `aqa-` plus a unique part so reruns don't collide,
e.g. `aqa-${Date.now()}@test.com`.

## Form requirements

| Element | Mandatory | Errors | Rules |
|---|---|---|---|
| Text "Registration" | – | – | Modal title |
| Field "Name" | yes | Empty → `Name is required`<br>Wrong data → `Name is invalid`<br>Wrong length → `Name has to be from 2 to 20 characters long`<br>Border color red | English letters only, length 2–20. Leading/trailing spaces are ignored (value is trimmed). |
| Field "Last name" | yes | Empty → `Last name is required`<br>Wrong data → `Last name is invalid`<br>Wrong length → `Last name has to be from 2 to 20 characters long`<br>Border color red | English letters only, length 2–20. Value is trimmed. |
| Field "Email" | yes | Wrong data → `Email is incorrect`<br>Empty → `Email required`<br>Border color red | Standard email validation. |
| Field "Password" | yes | Wrong data → `Password has to be from 8 to 15 characters long and contain at least one integer, one capital, and one small letter`<br>Empty → `Password required`<br>Border color red | Length 8–15, at least 1 digit, 1 uppercase, 1 lowercase letter. |
| Field "Re-enter password" | yes | Mismatch → `Passwords do not match`<br>Empty → `Re-enter password required`<br>Border color red | Must equal Password. |
| Button "Register" | – | – | Disabled while any data is invalid. On click with valid data, a new user is created. |

Notes on app behavior:
- Validation errors typically appear after the field **loses focus** (blur) — e.g. fill, then press Tab or `locator.blur()`.
- "Border color red" → assert with `toHaveCSS('border-color', 'rgb(220, 53, 69)')` (check the real value in DevTools first).

## Tests to write

### Positive (1)
1. Fill all fields with valid data (email with `aqa-` prefix) → Register button is enabled → click it →
   assert the user is registered (e.g. URL changes to `/panel/garage` and/or the user is logged in).

### Negative (minimum 5; suggested set)
For each: assert the exact error text, the red border on the field, and that **Register is disabled**.
- Name: empty; invalid (digits/non-English, e.g. `Ivan1`, `Іван`); too short (1 char); too long (21 chars).
- Last name: same four cases as Name.
- Name/Last name: value with spaces around a valid name (e.g. `"  Jo  "`) is accepted (trim) — optional boundary check.
- Email: empty; invalid format (e.g. `aqa-test`, `aqa@`, `aqa@test`).
- Password: empty; 7 chars; 16 chars; no digit; no uppercase; no lowercase.
- Re-enter password: empty; doesn't match Password.
- Boundaries: lengths 2 and 20 (Name/Last name) and 8 and 15 (Password) are accepted.

Use data-driven loops (`for (const c of cases) test(...)`) where it reduces duplication.

## Technical requirements
- Stack: Playwright Test (`@playwright/test`) with TypeScript.
- Project structure:
  ```
  playwright.config.ts   # baseURL + httpCredentials
  tests/registration.spec.ts
  package.json
  ```
- Use `baseURL` and `page.goto('/')`.
- Use `test.beforeEach` to open the site and the Sign up modal.
- Use web-first assertions (`await expect(locator).toHaveText / toBeVisible / toBeDisabled / toHaveCSS`). No hard waits (`waitForTimeout`).
- Group with `test.describe('Registration form', ...)`, with nested describes for Positive / Negative.
- Run the tests (`npx playwright test`) and make sure they pass. If a test fails because the app differs
  from the requirements, verify the actual behavior and either fix the test or mark it clearly
  (e.g. `test.fail()` with a comment explaining the discrepancy).

## Deliverable
A working Playwright TypeScript project where `npx playwright test` runs 1 positive + ≥5 negative registration tests, all green (or documented known-bug failures).