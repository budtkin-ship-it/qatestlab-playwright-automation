# OrangeHRM E2E automation

A small Playwright Test + TypeScript project for the QATestLab hiring assignment.
Sections 2.1 (Login) and 2.2 (User Management) are implemented against the
[OrangeHRM demo](https://opensource-demo.orangehrmlive.com/).

- Valid credentials open the Dashboard (tagged `@smoke`).
- Invalid credentials show `Invalid credentials`; direct Dashboard access
  redirects back to Login.
- The Users scenario creates a unique ESS account, verifies its details, changes
  its status to Disabled, and deletes it. Employee selection uses a live
  autocomplete suggestion, without creating or editing an employee.

## Installation

Use Node.js 22 or 24 LTS and npm. Install the locked dependencies:

```sh
npm ci
```

Install Chromium inside the workspace (the test configuration uses the same
hermetic browser location). On PowerShell:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = '0'
npx playwright install chromium
```

On macOS/Linux:

```sh
PLAYWRIGHT_BROWSERS_PATH=0 npx playwright install chromium
```

Linux hosts may also need Playwright system dependencies; see the
[official installation guide](https://playwright.dev/docs/intro).
Reinstall Chromium after upgrading Playwright or reinstalling `node_modules`.
The browser-path variable above is needed only for installation; test runs set
the same workspace-local path automatically in `playwright.config.ts`.

## Configuration

The local `.env` file is ignored by Git. After cloning the project, copy
`.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

On macOS/Linux, use `cp .env.example .env`.

For a local demonstration, enter the public demo credentials displayed on the
OrangeHRM login page into `.env`. This workspace's ignored `.env` is already
configured for that demo; `.env.example` intentionally contains no credentials.

Set `ORANGEHRM_USERNAME` and `ORANGEHRM_PASSWORD` to valid credentials for the
target environment. User Management requires an account with Admin access.
`BASE_URL` defaults to the public demo. Credentials have no
fallback values. Missing credentials fail the valid-login test with an actionable
message; they do not silently skip it. Listing tests and type checking do not
require credentials. Shell/CI environment variables take precedence over `.env`.

Keep credentials and authentication state out of source control. Only the blank
`.env.example` should be committed. Generated reports/screenshots are ignored;
review them before sharing because they may contain account information. Traces
and videos are disabled by default; opt-in traces can contain login credentials.

## Running Tests

Local runs use visible Chromium windows by default, including direct
`npx playwright test` commands and new scenarios. In a fresh VS Code terminal,
leave `CI` unset and use the commands below without extra flags or temporary
environment variables. The local `.env` loads automatically.
The single config uses `headless: !!process.env.CI`; `CI=true` enables headless
execution for CI. The same config serves local and CI runs.

**All tests:**

```sh
npm test
```

**Login tests:**

```sh
npm test -- tests/login.spec.ts
```

**User Management tests:**

```sh
npm test -- tests/users.spec.ts
```

**Debug all tests with Playwright Inspector:**

```sh
npm run test:debug
```

**Debug Login tests:**

```sh
npm run test:debug -- tests/login.spec.ts
```

**Debug User Management tests:**

```sh
npm run test:debug -- tests/users.spec.ts
```

Use Inspector's Resume and Step over controls to continue execution.

**Open the HTML report:**

```sh
npm run report
```

Other useful commands: `npm run test:smoke`, `npm run test:ui`,
`npm run test:list`, and `npm run typecheck`.

The configuration uses one worker to limit contention on the shared demo,
a 60-second test timeout, 10-second assertion/action timeouts, and a 30-second
navigation timeout. Local runs have no retries; `CI` enables two retries and
rejects focused tests. Each test receives an isolated browser context.
HTML reports are written to `playwright-report/`, and failure screenshots to
`test-results/`. The public demo may be reset or changed by other users.
The Users scenario generates a new UUID username and password on every run.
Its teardown fixture searches for that exact username and deletes it if needed,
including after a test failure, with a separate 30-second cleanup budget. It
never edits or deletes existing accounts or employees. Cleanup can still fail
if the demo is unavailable or the Admin session is lost; teardown errors remain
visible in the test results. The scenario needs an autocomplete result with a
first/last name when searching `a`, since the list omits employee middle names.

## Project structure

```text
tests/
  login.spec.ts          # Positive and negative Login tests
  users.spec.ts          # Create, verify, update, and delete a test-owned user
pages/
  login.page.ts          # Login locators and user actions
  users.page.ts          # Users form, table, and scoped account actions
fixtures/
  test.ts                # Page objects, credentials, test account, and cleanup
test-data/
  credentials.ts         # Credential type and environment-backed data
utils/
  env.ts                 # Local environment loading and required-value checks
playwright.config.ts    # Browser, URL, timeouts, retries, reporting
tsconfig.json           # Strict TypeScript configuration
.env.example            # Safe configuration template
```

Add scenarios under `tests/`, keep page-specific locators/actions in `pages/`,
and use fixtures only for reusable setup. Prefer accessible roles/placeholders
and Playwright web-first assertions; avoid fixed sleeps and brittle selectors.
Use two-space indentation, single quotes, semicolons, and explicit types at
module boundaries. Only assignment sections 2.1 and 2.2 are implemented. Remaining
assignment sections, a CI workflow, and extra framework layers are not included.
