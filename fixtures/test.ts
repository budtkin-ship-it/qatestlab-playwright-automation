import { test as base } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { AttachmentsPage } from '../pages/attachments.page';
import { DashboardPage } from '../pages/dashboard.page';
import { LoginPage } from '../pages/login.page';
import { UsersPage } from '../pages/users/users.page';
import { UserFormPage } from '../pages/users/user-form.page';
import { VacanciesPage } from '../pages/vacancies.page';
import { getCredentials, type Credentials } from '../test-data/credentials';

interface TestFixtures {
  loginPage: LoginPage;
  credentials: Credentials;
  dashboardPage: DashboardPage;
  vacanciesPage: VacanciesPage;
  usersPage: UsersPage;
  userFormPage: UserFormPage;
  userAccount: Credentials;
  attachmentsPage: AttachmentsPage;
  attachmentFile: {
    name: string;
    path: string;
    contents: Buffer;
    description: string;
  };
}

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  credentials: async ({}, use) => {
    await use(getCredentials());
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  vacanciesPage: async ({ page }, use) => {
    await use(new VacanciesPage(page));
  },

  usersPage: async ({ page }, use) => {
    await use(new UsersPage(page));
  },

  userFormPage: async ({ page }, use) => {
    await use(new UserFormPage(page));
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

  attachmentsPage: async ({ page }, use) => {
    await use(new AttachmentsPage(page));
  },

  attachmentFile: [async ({ attachmentsPage }, use, testInfo) => {
    const id = randomUUID();
    const name = `qa-attachment-${id}.txt`;
    const file = {
      name,
      path: testInfo.outputPath(name),
      contents: Buffer.from(`QATestLab attachment round-trip test\nRun: ${id}\n`, 'utf8'),
      description: `QATestLab attachment ${id}`,
    };
    await writeFile(file.path, file.contents);
    try {
      await use(file);
    } finally {
      await attachmentsPage.deleteAttachmentIfExists(file.name);
    }
  }, { timeout: 30_000 }],
});

export { expect } from '@playwright/test';
