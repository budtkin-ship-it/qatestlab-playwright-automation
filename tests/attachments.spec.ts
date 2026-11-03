import { readFile } from 'node:fs/promises';
import { test, expect } from '../fixtures/test';

// I already use the 'attachmentFile' fixture to create a unique file and clean it up after the test.
// I use beforeEach for the common steps: login, navigation, and file upload.
// All three tests need these steps, so keeping them in one hook avoids
// repeating the same code in every test.
test.beforeEach(async ({ loginPage, credentials, attachmentsPage, attachmentFile }) => {
  await loginPage.goto();
  await loginPage.login(credentials);
  await loginPage.waitForDashboard();
  await attachmentsPage.open();
  await attachmentsPage.upload(attachmentFile.path, attachmentFile.description);
});

// Moving the upload step into this test would make it easier to read.
// However, I decided to keep it in beforeEach to avoid duplicating.
test('upload attachment', async ({ attachmentsPage, attachmentFile }) => {
  await expect(attachmentsPage.attachmentRow(attachmentFile.name)).toBeVisible();
  await expect.soft(attachmentsPage.attachmentDescription(attachmentFile.name))
    .toHaveText(attachmentFile.description);
});

test('download attachment', async ({ attachmentsPage, attachmentFile }) => {
  await expect(attachmentsPage.attachmentRow(attachmentFile.name)).toBeVisible();
  const download = await attachmentsPage.download(attachmentFile.name);
  expect.soft(download.suggestedFilename()).toBe(attachmentFile.name);
  const downloadedContents = await readFile(await download.path());
  expect.soft(downloadedContents).toEqual(attachmentFile.contents);
});

test('delete attachment', async ({ attachmentsPage, attachmentFile }) => {
  await expect(attachmentsPage.attachmentRow(attachmentFile.name)).toBeVisible();
  await attachmentsPage.deleteAttachment(attachmentFile.name);
  await attachmentsPage.open();
  await expect(attachmentsPage.attachmentRow(attachmentFile.name)).toHaveCount(0);
});
