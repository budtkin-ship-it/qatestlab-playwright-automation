import type { Locator, Page } from '@playwright/test';

export class UsersPage {
  private readonly heading: Locator;
  private readonly usernameInput: Locator;
  private readonly noRecords: Locator;
  private readonly adminLink: Locator;
  private readonly userManagementMenu: Locator;
  private readonly usersMenuItem: Locator;
  private readonly addButton: Locator;
  private readonly searchButton: Locator;
  private readonly tableLoader: Locator;
  private readonly confirmDeleteButton: Locator;
  private readonly deleteSuccessMessage: Locator;
  private readonly userRows: Locator;
  private readonly editIcon: Locator;
  private readonly deleteIcon: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'System Users', exact: true });
    this.noRecords = page.locator('.orangehrm-paper-container').getByText('No Records Found', { exact: true });

    // These visible labels have no for/id association in OrangeHRM's DOM.
    const field = (label: string): Locator => page.locator('.oxd-input-group')
      .filter({ has: page.getByText(label, { exact: true }) });
    this.usernameInput = field('Username').getByRole('textbox');
    this.adminLink = page.getByRole('link', { name: 'Admin', exact: true });
    this.userManagementMenu = page.getByRole('navigation', { name: 'Topbar Menu' })
      .getByText('User Management', { exact: true });
    this.usersMenuItem = page.getByRole('menuitem', { name: 'Users', exact: true });
    // The Add button's accessible name also contains an icon.
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.searchButton = page.getByRole('button', { name: 'Search', exact: true });
    this.tableLoader = page.locator('.oxd-table-loader');
    this.confirmDeleteButton = page.getByRole('dialog').getByRole('button', { name: 'Yes, Delete' });
    this.deleteSuccessMessage = page.getByText('Successfully Deleted', { exact: true });
    this.userRows = page.getByRole('row');
    // Row action buttons expose only icon glyphs, without meaningful labels.
    this.editIcon = page.locator('.bi-pencil-fill');
    this.deleteIcon = page.locator('.bi-trash');
  }

  getNoRecordsMessage(): Locator {
    return this.noRecords;
  }

  async open(): Promise<void> {
    // Keep the redirect chain on the navigation budget, separate from actionability.
    await Promise.all([
      this.page.waitForURL('/web/index.php/admin/viewSystemUsers', { waitUntil: 'domcontentloaded' }),
      this.adminLink.click({ noWaitAfter: true }),
    ]);
    await this.userManagementMenu.click();
    await this.usersMenuItem.click();
    await this.heading.waitFor({ state: 'visible' });
  }

  userRow(username: string): Locator {
    return this.userRows.filter({
      has: this.page.getByRole('cell', { name: username, exact: true }),
    });
  }

  userRole(username: string): Locator {
    return this.userRow(username).getByRole('cell').nth(2);
  }

  userEmployee(username: string): Locator {
    return this.userRow(username).getByRole('cell').nth(3);
  }

  userStatus(username: string): Locator {
    return this.userRow(username).getByRole('cell').nth(4);
  }

  private editButton(username: string): Locator {
    return this.userRow(username).getByRole('button').filter({ has: this.editIcon });
  }

  private deleteButton(username: string): Locator {
    return this.userRow(username).getByRole('button').filter({ has: this.deleteIcon });
  }

  async addUser(): Promise<void> {
    await this.addButton.click();
  }

  async search(username: string): Promise<void> {
    await this.tableLoader.waitFor({ state: 'hidden' });
    await this.usernameInput.fill(username);
    // The table is temporarily empty during loading; wait for this search's
    // response and its loader before checking absence or attempting cleanup.
    await Promise.all([
      this.page.waitForResponse(response => {
        const url = new URL(response.url());
        return response.request().method() === 'GET'
          && url.pathname === '/web/index.php/api/v2/admin/users'
          && url.searchParams.get('username') === username;
      }),
      this.searchButton.click(),
    ]);
    await this.tableLoader.waitFor({ state: 'hidden' });
  }

  async editUser(username: string): Promise<void> {
    await this.editButton(username).click();
  }

  async deleteUser(username: string): Promise<void> {
    await this.deleteButton(username).click();
    await this.confirmDeleteButton.click();
    await this.deleteSuccessMessage.waitFor({ state: 'visible' });
  }

  async deleteUserIfExists(username: string): Promise<void> {
    // Recover from an interrupted Add/Edit form, retaining the current session.
    await this.page.goto('/web/index.php/admin/viewSystemUsers');
    await this.heading.waitFor({ state: 'visible' });
    await this.search(username);
    if (await this.userRow(username).count() > 0) {
      await this.deleteUser(username);
      await this.search(username);
    }
    await this.noRecords.waitFor({ state: 'visible' });
  }
}
