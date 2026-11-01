import type { Download, Locator, Page } from '@playwright/test';
import path from 'node:path';

export class AttachmentsPage {
  private readonly attachmentsSection: Locator;
  private readonly heading: Locator;
  private readonly myInfoLink: Locator;
  private readonly fileNameColumn: Locator;
  private readonly addButton: Locator;
  private readonly fileInput: Locator;
  private readonly commentInput: Locator;
  private readonly saveButton: Locator;
  private readonly confirmDeleteButton: Locator;
  private readonly deleteSuccessMessage: Locator;
  private submittedFilename?: string;

  constructor(private readonly page: Page) {
    this.attachmentsSection = page.locator('.orangehrm-attachment');
    this.heading = this.attachmentsSection.getByRole('heading', { name: 'Attachments', exact: true });
    this.myInfoLink = page.getByRole('link', { name: 'My Info', exact: true });
    this.fileNameColumn = this.attachmentsSection.getByRole('columnheader', { name: 'File Name', exact: true });
    this.addButton = this.attachmentsSection.getByRole('button', { name: 'Add' });
    this.fileInput = this.attachmentsSection.locator('input[type="file"]');
    this.commentInput = this.attachmentsSection.getByPlaceholder('Type comment here', { exact: true });
    this.saveButton = this.attachmentsSection.getByRole('button', { name: 'Save', exact: true });
    this.confirmDeleteButton = page.getByRole('dialog').getByRole('button', { name: 'Yes, Delete' });
    this.deleteSuccessMessage = page.getByText('Successfully Deleted', { exact: true });
  }

  async open(): Promise<void> {
    await this.myInfoLink.click();
    // The header is hidden during loading, so cleanup can safely count rows afterward.
    await this.fileNameColumn.waitFor({ state: 'visible' });
  }

  attachmentRow(filename: string): Locator {
    return this.attachmentsSection.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: filename, exact: true }),
    });
  }

  attachmentDescription(filename: string): Locator {
    return this.attachmentRow(filename).getByRole('cell').nth(2);
  }

  async upload(filePath: string, description: string): Promise<void> {
    await this.addButton.click();
    await this.fileInput.setInputFiles(filePath);
    await this.commentInput.fill(description);
    this.submittedFilename = path.basename(filePath);
    await this.saveButton.click();
    await this.heading.waitFor({ state: 'visible' });
  }

  async download(filename: string): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.attachmentRow(filename).getByRole('button')
        .filter({ has: this.page.locator('.bi-download') }).click(),
    ]);
    return download;
  }

  async deleteAttachment(filename: string): Promise<void> {
    await this.attachmentRow(filename).getByRole('button')
      .filter({ has: this.page.locator('.bi-trash') }).click();
    await this.confirmDeleteButton.click();
    await this.deleteSuccessMessage.waitFor({ state: 'visible' });
  }

  async deleteAttachmentIfExists(filename: string): Promise<void> {
    if (this.submittedFilename !== filename) {
      return;
    }
    await this.open();
    if (await this.attachmentRow(filename).count() > 0) {
      await this.deleteAttachment(filename);
      await this.open();
    }
    await this.attachmentRow(filename).waitFor({ state: 'detached' });
  }
}
