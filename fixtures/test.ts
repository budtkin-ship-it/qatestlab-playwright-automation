import { test as base } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { LoginPage } from '../pages/login.page';
import { UsersPage } from '../pages/users.page';
import { getCredentials, type Credentials } from '../test-data/credentials';

interface TestFixtures {
  loginPage: LoginPage;
  credentials: Credentials;
  usersPage: UsersPage;
  userAccount: Credentials;
}

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  credentials: async ({}, use) => {
    await use(getCredentials());
  },
  usersPage: async ({ page }, use) => {
    await use(new UsersPage(page));
  },
  userAccount: [async ({ usersPage }, use) => {
    const user = {
      username: `qa_${randomUUID().replaceAll('-', '')}`,
      password: `Qa!${randomUUID()}`,
    };
    try {
      await use(user);
    } finally {
      await usersPage.deleteUserIfExists(user.username);
    }
  }, { timeout: 30_000 }],
});

export { expect } from '@playwright/test';
