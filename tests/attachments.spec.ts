import { readFile } from 'node:fs/promises';
import { test, expect } from '../fixtures/test';

test('upload, download, and delete a My Info attachment', async ({
  loginPage, credentials, attachmentsPage, attachmentFile,
}) => {
  await loginPage.goto();
  await loginPage.login(credentials);
  await loginPage.waitForDashboard();
  await attachmentsPage.open();

  await attachmentsPage.upload(attachmentFile.path, attachmentFile.description);
  await expect(attachmentsPage.attachmentRow(attachmentFile.name)).toBeVisible();
  await expect(attachmentsPage.attachmentDescription(attachmentFile.name))
    .toHaveText(attachmentFile.description);

  const download = await attachmentsPage.download(attachmentFile.name);
  expect(download.suggestedFilename()).toBe(attachmentFile.name);
  const downloadedContents = await readFile(await download.path());
  expect(downloadedContents).toEqual(attachmentFile.contents);

  await attachmentsPage.deleteAttachment(attachmentFile.name);
  await attachmentsPage.open();
  await expect(attachmentsPage.attachmentRow(attachmentFile.name)).toHaveCount(0);
});
