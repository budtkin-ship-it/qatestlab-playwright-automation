import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { getCredentials, type Credentials } from '../test-data/credentials';

interface TestFixtures {
  loginPage: LoginPage;
  credentials: Credentials;
}

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  credentials: async ({}, use) => {
    await use(getCredentials());
  },
});

export { expect } from '@playwright/test';
