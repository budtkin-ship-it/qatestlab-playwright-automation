# OrangeHRM E2E automation

A small Playwright Test + TypeScript project for the QATestLab hiring assignment.
Sections 2.1 (Login), 2.2 (User Management), 2.3 (My Info Attachments), and
2.4 (Dashboard Data Validation) are implemented against the
[OrangeHRM demo](https://opensource-demo.orangehrmlive.com/).

- Valid credentials open the Dashboard (tagged `@smoke`).
- Invalid credentials show `Invalid credentials`; direct Dashboard access
  redirects back to Login.
- The Users scenario creates a unique ESS account, verifies its details, changes
  its status to Disabled, and deletes it. Employee selection uses a live
  autocomplete suggestion, without creating or editing an employee.
- The Attachments scenario uploads a UUID-named text file with a description,
  verifies the downloaded filename and bytes, then deletes the attachment and
  checks its absence after reloading the same employee profile.
- The Dashboard scenario validates the Sub Unit and Location employee-distribution
  pie charts, their visible category labels, and the absence of labels belonging
  to the other chart dimension.

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

**Attachments test:**

```sh
npm test -- tests/attachments.spec.ts
```

**Dashboard test:**

```sh
npm test -- tests/dashboard.spec.ts
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

**Debug Attachments:**

```sh
npm run test:debug -- tests/attachments.spec.ts
```

**Debug Dashboard:**

```sh
npm run test:debug -- tests/dashboard.spec.ts
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

The Attachments fixture creates a small UTF-8 file in the ignored test output
directory, with a UUID filename, description, and run-specific contents. Upload
uses `setInputFiles`; download uses Playwright's download event and compares the
original filename and complete file contents. A separate 30-second teardown
budget allows cleanup after failures. Cleanup targets only the submitted UUID
filename on the captured My Info profile; it leaves pre-existing attachments
alone. Demo outages, session loss, or concurrent profile changes can still
prevent cleanup, which is reported as a teardown failure.

Dashboard validation is read-only and uses the real chart legends. It expects
`Engineering` and `Unassigned` in the Sub Unit chart, and `Texas R&D` and
`Unassigned` in the Location chart. Negative assertions reject `Texas R&D` in
the Sub Unit legend and `Engineering` in the Location legend. These categories
were observed on the live demo; renaming organizational units/locations or
reassigning all employees can legitimately change the expected labels. Employee
counts and slice percentages are not fixed or asserted. The charts have unlabeled
canvases, so the test scopes them by their visible widget titles and validates
the DOM legends; it does not verify pixel rendering or backend aggregation.

## Project structure

```text
tests/
  login.spec.ts          # Positive and negative Login tests
  users.spec.ts          # Create, verify, update, and delete a test-owned user
  attachments.spec.ts    # Upload, verify download, and delete a test-owned file
  dashboard.spec.ts      # Employee-distribution chart labels and negative checks
pages/
  login.page.ts          # Login locators and user actions
  users.page.ts          # Users form, table, and scoped account actions
  attachments.page.ts    # My Info attachment upload, download, and deletion
  dashboard.page.ts      # Scoped chart canvases and visible legend labels
fixtures/
  test.ts                # Page objects, credentials, test data, and cleanup
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
module boundaries. Only assignment sections 2.1 through 2.4 are implemented. Remaining
assignment sections, a CI workflow, and extra framework layers are not included.
