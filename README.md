# OrangeHRM E2E Automation

## Overview

Playwright Test + TypeScript E2E automation for the QATestLab hiring assignment,
using Page Object Model, typed fixtures, and strict TypeScript.
Application: [OrangeHRM public demo](https://opensource-demo.orangehrmlive.com/).

## Test Coverage

| Section | Coverage |
| --- | --- |
| 2.1 Login | Valid login, invalid credentials, and protected Dashboard access. |
| 2.2 User Management | Create a UUID-named System User, verify details, change status, and delete. |
| 2.3 My Info Attachments | Upload a unique text file with a description, verify downloaded filename/bytes, and delete. |
| 2.4 Dashboard | Validate Sub Unit and Location charts, expected legend labels, and cross-category negative checks. |
| 2.5 Recruitment | Search Vacancies by Job Title, Vacancy, and Status; verify matching fields and opposite-status empty results. |

## Installation

Use Node.js 22 or 24 LTS with npm. From the project root:

```sh
npm ci
```

Install Chromium in the workspace-local location used by the test configuration.

**PowerShell:**

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = '0'
npx playwright install chromium
```

**macOS/Linux:**

```sh
PLAYWRIGHT_BROWSERS_PATH=0 npx playwright install chromium
```

The browser-path variable is required for installation only; test configuration
sets it automatically. Reinstall Chromium after reinstalling dependencies or
upgrading Playwright. Linux may also need
[Playwright system dependencies](https://playwright.dev/docs/intro).

## Configuration & Running

Create the ignored local `.env` from the credential-free template.

**PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS/Linux:**

```sh
cp .env.example .env
```

Set `ORANGEHRM_USERNAME` and `ORANGEHRM_PASSWORD` to valid demo credentials
displayed on the login page. Use an Admin account for the complete suite.
`BASE_URL` defaults to the public demo. The file loads automatically; existing
shell/CI variables take precedence. Never commit `.env` or authentication data.

Local runs open visible Chromium windows, including direct `npx playwright test`
commands. Leave `CI` unset locally; `CI=true` enables headless mode and two
retries. Local runs have no retries. No CI workflow is included.

```sh
# Run the complete suite
npm test

# Run one spec; replace the path for another feature
npm test -- tests/vacancies.spec.ts

# Debug with Playwright Inspector: all tests or one spec
npm run test:debug
npm run test:debug -- tests/vacancies.spec.ts

# Check TypeScript
npm run typecheck

# Open the latest HTML report
npm run report
```

Use Inspector's Resume and Step over controls to continue debugging.
Other scripts: `test:smoke`, `test:headed`, `test:ui`, and `test:list`.
HTML reports are in `playwright-report/`; failure screenshots and generated
test files are in `test-results/`. Both directories are ignored by Git.
Review artifacts before sharing: they can contain account information.

## Project Structure

```text
tests/                   # Login, Users, Attachments, Dashboard, Vacancies specs
pages/                   # UI locators and actions
fixtures/test.ts         # Page fixtures, test data, and cleanup
test-data/credentials.ts # Environment-backed credentials
utils/env.ts             # .env loading and required-value checks
playwright.config.ts     # Browser, timeouts, retries, and reporters
tsconfig.json            # Strict TypeScript settings
package-lock.json        # Locked dependency versions
.env.example             # Blank credential template
```

## Assumptions & Limitations

- The public demo is shared and may be reset or changed by other users.
  Tests use isolated browser contexts and one worker to limit contention.
- System User names and attachment filenames use UUIDs. User creation selects
  an existing two-part employee suggestion for `a`; it does not create employees.
- Cleanup targets only the test-generated username or submitted attachment
  filename. Fixtures attempt cleanup after failures with a separate 30-second
  budget. Outages, session loss, or concurrent profile changes can prevent it;
  teardown failures remain visible. Attachments cleanup reopens My Info.
- Dashboard checks use canvas visibility and DOM legends, not pixel rendering
  or backend totals. Sub Unit expects Engineering/Unassigned; Location expects
  Texas R&D/Unassigned. Cross-category labels must be absent. Organization
  changes can invalidate these expectations; employee counts are not fixed.
- Vacancy tests read the first live record and require a selectable job title,
  an unambiguous vacancy name, and Active/Closed status. Concurrent edits can
  invalidate the captured values. Searches are read-only and need no cleanup.
