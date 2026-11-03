import type { Locator, Page } from '@playwright/test';
import type { VacancyStatus } from '../types/vacancy';

export class VacanciesPage {
  private readonly rows: Locator;
  private readonly resultVacancyName: Locator;
  private readonly resultJobTitle: Locator;
  private readonly resultStatus: Locator;
  private readonly vacancyDropdown: Locator;
  private readonly statusDropdown: Locator;
  private readonly noRecords: Locator;
  private readonly recruitmentLink: Locator;
  private readonly vacanciesLink: Locator;
  private readonly resultHeader: Locator;
  private readonly jobTitleDropdown: Locator;
  private readonly searchButton: Locator;
  private readonly tableLoader: Locator;

  constructor(private readonly page: Page) {
    this.recruitmentLink = page.getByRole('link', { name: 'Recruitment', exact: true });
    this.vacanciesLink = page.getByRole('navigation', { name: 'Topbar Menu' })
      .getByRole('link', { name: 'Vacancies', exact: true });
    // The header's accessible name also contains a sort icon.
    this.resultHeader = page.getByRole('columnheader', { name: 'Vacancy' });
    this.rows = page.getByRole('table').getByRole('row').filter({ has: page.getByRole('cell') });
    const firstRow = this.rows.first();
    this.resultVacancyName = firstRow.getByRole('cell').nth(1);
    this.resultJobTitle = firstRow.getByRole('cell').nth(2);
    this.resultStatus = firstRow.getByRole('cell').nth(4);
    // Custom dropdowns have visible labels without for/id associations.
    const field = (label: string): Locator => page.locator('.oxd-input-group')
      .filter({ has: page.getByText(label, { exact: true }) }).locator('.oxd-select-text');
    this.jobTitleDropdown = field('Job Title');
    this.vacancyDropdown = field('Vacancy');
    this.statusDropdown = field('Status');
    this.searchButton = page.getByRole('button', { name: 'Search', exact: true });
    this.tableLoader = page.locator('.oxd-table-loader');
    // The same message also appears in a toast paragraph; target the table summary.
    this.noRecords = page.getByText('No Records Found', { exact: true })
      .and(page.locator('span.oxd-text--span'));
  }

  getRows(): Locator {
    return this.rows;
  }

  getResultVacancyName(rowIndex = 0): Locator {
    return this.rows.nth(rowIndex).getByRole('cell').nth(1);
  }

  getResultJobTitle(rowIndex = 0): Locator {
    return this.rows.nth(rowIndex).getByRole('cell').nth(2);
  }

  getResultStatus(rowIndex = 0): Locator {
    return this.rows.nth(rowIndex).getByRole('cell').nth(4);
  }

  getVacancyDropdown(): Locator {
    return this.vacancyDropdown;
  }

  getStatusDropdown(): Locator {
    return this.statusDropdown;
  }

  getNoRecordsMessage(): Locator {
    return this.noRecords;
  }

  async open(): Promise<void> {
    // Keep the redirect chain on the navigation budget, separate from actionability.
    await Promise.all([
      this.page.waitForURL('/web/index.php/recruitment/viewCandidates', { waitUntil: 'domcontentloaded' }),
      this.recruitmentLink.click({ timeout: 30_000 }),
    ]);
    await this.vacanciesLink.click();
    await this.resultHeader.waitFor({ state: 'visible' });
  }

  async readFirstVacancy(): Promise<{ name: string; jobTitle: string; status: VacancyStatus }> {
    const name = await this.resultVacancyName.innerText();
    const jobTitle = await this.resultJobTitle.innerText();
    const status = await this.resultStatus.innerText();
    if (status !== 'Active' && status !== 'Closed') {
      throw new Error(`Unsupported vacancy status in the live results: "${status}".`);
    }
    return { name, jobTitle, status };
  }

  async selectJobTitle(jobTitle: string): Promise<void> {
    await this.jobTitleDropdown.click();
    await this.page.getByRole('option', { name: jobTitle, exact: true }).click();
  }

  async readVacancyWithAvailableJobTitle(): Promise<{ name: string; jobTitle: string; status: VacancyStatus }> {
    await this.tableLoader.waitFor({ state: 'hidden' });
    await this.jobTitleDropdown.click();
    const options = this.page.getByRole('option');
    await options.first().waitFor({ state: 'visible' });
    const availableJobTitles = new Set((await options.allTextContents()).map(title => title.trim()));
    await this.jobTitleDropdown.click();

    const rowCount = await this.rows.count();
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const jobTitle = await this.getResultJobTitle(rowIndex).innerText();
      if (!availableJobTitles.has(jobTitle)) {
        continue;
      }
      const name = await this.getResultVacancyName(rowIndex).innerText();
      const status = await this.getResultStatus(rowIndex).innerText();
      if (status !== 'Active' && status !== 'Closed') {
        throw new Error(`Unsupported vacancy status in the live results: "${status}".`);
      }
      return { name, jobTitle, status };
    }
    throw new Error('No displayed vacancy has a job title available in the Job Title filter.');
  }

  async selectVacancy(name: string): Promise<void> {
    await this.vacancyDropdown.click();
    await this.page.getByRole('option', { name, exact: true }).click();
  }

  async selectStatus(status: VacancyStatus): Promise<void> {
    await this.statusDropdown.click();
    await this.page.getByRole('option', { name: status, exact: true }).click();
  }

  async search(): Promise<void> {
    // Observe the UI-triggered request to avoid checking the previous result set.
    const [response] = await Promise.all([
      this.page.waitForResponse(response => response.request().method() === 'GET'
        && new URL(response.url()).pathname === '/web/index.php/api/v2/recruitment/vacancies'),
      this.searchButton.click(),
    ]);
    if (!response.ok()) {
      throw new Error(`Vacancy search failed with HTTP ${response.status()} ${response.statusText()}.`);
    }
    await this.tableLoader.waitFor({ state: 'hidden' });
    await this.resultHeader.waitFor({ state: 'visible' });
  }
}
