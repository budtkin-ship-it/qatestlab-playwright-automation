import { defineConfig, devices } from '@playwright/test';
import './utils/env';

// Hermetic browser installs keep binaries inside node_modules/playwright-core.
process.env.PLAYWRIGHT_BROWSERS_PATH = '0';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  outputDir: 'test-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: process.env.BASE_URL?.trim() || 'https://opensource-demo.orangehrmlive.com/',
    headless: !!process.env.CI,
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    // Login traces can contain credentials. Enable locally only when needed.
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
    locale: 'en-US',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
