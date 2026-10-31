# OrangeHRM E2E automation

A small Playwright Test + TypeScript project for the QATestLab hiring assignment.
Section 2.1 covers successful login and rejection of invalid credentials against the
[OrangeHRM demo](https://opensource-demo.orangehrmlive.com/).

- Valid credentials open the Dashboard (tagged `@smoke`).
- Invalid credentials show `Invalid credentials`; direct Dashboard access
  redirects back to Login.

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

## Configuration

The local `.env` file is ignored by Git. After cloning the project, copy
`.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

On macOS/Linux, use `cp .env.example .env`.

Set `ORANGEHRM_USERNAME` and `ORANGEHRM_PASSWORD` to valid credentials for the
target environment. `BASE_URL` defaults to the public demo. Credentials have no
fallback values. Missing credentials fail the valid-login test with an actionable
message; they do not silently skip it. Listing tests and type checking do not
require credentials. Shell/CI environment variables take precedence over `.env`.

Keep credentials and authentication state out of source control. Only the blank
`.env.example` should be committed. Generated reports/screenshots are ignored;
review them before sharing because they may contain account information. Traces
and videos are disabled by default; opt-in traces can contain login credentials.

## Execution

| Command | Purpose |
| --- | --- |
| `npm test` | Run all tests headlessly in Chromium |
| `npm run test:smoke` | Run tests tagged `@smoke` |
| `npm run test:headed` | Run with a visible browser |
| `npm run test:debug` | Run with Playwright Inspector |
| `npm run test:ui` | Open Playwright UI mode |
| `npm run test:list` | List discovered tests without running them |
| `npm run typecheck` | Check all project TypeScript in strict mode |
| `npm run report` | Open the latest HTML report |

Pass additional Playwright arguments after `--`, for example:

```sh
npm test -- tests/login.spec.ts
npm run test:smoke -- --trace on
```

The configuration uses one worker to limit contention on the shared demo,
a 60-second test timeout, 10-second assertion/action timeouts, and a 30-second
navigation timeout. Local runs have no retries; `CI` enables two retries and
rejects focused tests. Each test receives an isolated browser context.
HTML reports are written to `playwright-report/`, and failure screenshots to
`test-results/`. The public demo may be reset or changed by other users.

## Project structure

```text
tests/
  login.spec.ts          # Positive and negative Login tests
pages/
  login.page.ts          # Login locators and user actions
fixtures/
  test.ts                # Typed page object and credentials fixtures
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
module boundaries. Only assignment section 2.1 (Login) is implemented. Remaining
assignment sections, a CI workflow, and extra framework layers are not included.
