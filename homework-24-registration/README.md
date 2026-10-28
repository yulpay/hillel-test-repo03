# Homework 24 — QAuto registration form tests

Playwright + TypeScript tests for the Sign up modal on https://qauto.forstudy.space/.

```bash
npm install
npx playwright install chromium   # first time only
npx playwright test
```

Basic Auth credentials and `baseURL` are set in `playwright.config.ts`.
Users created by the tests have emails like `aqa-<timestamp>-<random>@test.com`.

## Known bugs (marked with `test.fail()`)
| Requirement | Actual behavior |
|---|---|
| Empty Name → `Name is required` | Shows `Name required` |
| Empty Last name → `Last name is required` | Shows `Last name required` |
| Name / Last name values are trimmed (`"  Jo  "` is valid) | Shows `Name is invalid` / `Last name is invalid` |

Also: every `<label>` in the form has `for="signupEmail"`, so `getByLabel` can't be used. The tests locate fields by `id`.
