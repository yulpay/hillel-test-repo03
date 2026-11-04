# Homework 24 — QAuto registration form tests

Playwright + TypeScript tests for the QAuto Sign up modal.

```bash
npm install
npx playwright install chromium   # first time only
cp .env.example .env              # then fill in BASE_URL, HTTP_USERNAME, HTTP_PASSWORD
npm test
```

`baseURL` and the Basic Auth credentials are read from `.env` (git-ignored) by `config/env.ts`.
If a variable is missing, the run stops with `Missing env variable: <NAME>`.

| Script | Command |
|---|---|
| `npm test` | `npx playwright test` |
| `npm run test:headed` | `npx playwright test --headed` |
| `npm run test:ui` | `npx playwright test --ui` |
| `npm run test:chromium` | `npx playwright test --project=chromium` |
| `npm run test:debug` | `npx playwright test --debug` |
| `npm run report` | `npx playwright show-report` |
## Structure (Page Object Model, Homework 25)
| Path | Contents |
|---|---|
| `pages/BasePage.ts` | Holds `page`, `open(path = '/')` |
| `pages/HomePage.ts` | Sign up button, `openSignUpForm()` returns a `RegistrationForm` |
| `pages/RegistrationForm.ts` | Sign up modal: field locators, `fill*()`, `fillForm(user)`, `errorFor(field)`, `clickRegister()` |
| `pages/GaragePage.ts` | `/panel/garage` heading and the logged-in-only "My profile" button |
| `test-data/users.ts` | `validUser(overrides)` with an `aqa-` email |
| `test-data/registration.ts` | Error texts, boundary and negative cases |
| `fixtures/pages.ts` | `test.extend` with `homePage`, `registrationForm` (modal already open), `garagePage` |
| `tests/registration.spec.ts` | Scenarios and assertions only, no selectors |

Users created by the tests have emails like `aqa-<timestamp>-<random>@test.com`.

## Known bugs (marked with `test.fail()`)
| Requirement | Actual behavior |
|---|---|
| Empty Name → `Name is required` | Shows `Name required` |
| Empty Last name → `Last name is required` | Shows `Last name required` |
| Name / Last name values are trimmed (`"  Jo  "` is valid) | Shows `Name is invalid` / `Last name is invalid` |

Also: every `<label>` in the form has `for="signupEmail"`, so `getByLabel` can't be used. The tests locate fields by `id`.
