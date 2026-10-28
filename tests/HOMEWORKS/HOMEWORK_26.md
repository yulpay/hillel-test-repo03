# Homework: Playwright CLI and ENV variables

## Context
This task builds on the existing Playwright + TypeScript project from the previous homework
(registration form tests for `https://qauto.forstudy.space/`). Do NOT start a new project. Refactor the existing one.

Right now `baseURL` and `httpCredentials` (username `guest`, password `welcome2qauto`) are
hard-coded in `playwright.config.ts`. That's not good practice: URLs and credentials should live outside the code.

## Task (original requirements)
1. Move `baseURL` and `httpCredentials` into a `.env` file.
2. Use environment variables in `playwright.config.ts`, **or** create your own config module that
   stores these values, and use the values from that config.

## Implementation steps
1. Install dotenv: `npm install -D dotenv`.
2. Create `.env` in the project root:
   ```
   BASE_URL=https://qauto.forstudy.space/
   HTTP_USERNAME=guest
   HTTP_PASSWORD=welcome2qauto
   ```
3. Create `.env.example` with the same keys but **no real values**, so other people know what to set.
4. Add `.env` to `.gitignore` (create `.gitignore` if it doesn't exist; also ignore `node_modules/`,
   `test-results/`, `playwright-report/`). `.env.example` IS committed.
5. Create a config module `config/env.ts` that:
   - loads `.env` with `dotenv` (`import 'dotenv/config'` or `dotenv.config()`),
   - reads `process.env.BASE_URL`, `HTTP_USERNAME`, `HTTP_PASSWORD`,
   - **throws a clear error** if any of them is missing (e.g. `Missing env variable: BASE_URL`),
   - exports a typed object, e.g.:
     ```ts
     export const config = {
       baseURL: string,
       httpCredentials: { username: string, password: string },
     };
     ```
6. Update `playwright.config.ts` to use `config.baseURL` and `config.httpCredentials`.
   No URLs or passwords may remain hard-coded anywhere in the code.
7. If any test file uses the full URL or credentials directly, switch it to relative paths
   (`page.goto('/')`) or values from `config`.

## Playwright CLI (part of the topic)
Add npm scripts to `package.json` so tests run through the Playwright CLI:
```json
"scripts": {
  "test": "npx playwright test",
  "test:headed": "npx playwright test --headed",
  "test:ui": "npx playwright test --ui",
  "test:chromium": "npx playwright test --project=chromium",
  "test:debug": "npx playwright test --debug",
  "report": "npx playwright show-report"
}
```

## Verification
- `npm test` passes with the same results as before the refactor.
- Temporarily rename `.env` → tests fail fast with the clear "Missing env variable" error. Then restore it.
- `grep -r "welcome2qauto\|qauto.forstudy.space" --exclude-dir=node_modules --exclude=.env .`
  finds nothing in the code (only in `.env`).
- `git status` (if it's a git repo) does not show `.env` as a file to commit.

## Deliverable
The refactored project with: `.env` (git-ignored), `.env.example`, `config/env.ts`,
an updated `playwright.config.ts`, npm CLI scripts in `package.json`, and all tests passing.
Finish with a short summary of what changed and how to run the tests.