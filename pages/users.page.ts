import type { Locator, Page } from '@playwright/test';
import type { Credentials } from '../test-data/credentials';

type UserRole = 'Admin' | 'ESS';
type UserStatus = 'Enabled' | 'Disabled';

export class UsersPage {
  private readonly heading: Locator;
  private readonly usernameInput: Locator;
  private readonly noRecords: Locator;
  private readonly roleDropdown: Locator;
  private readonly statusDropdown: Locator;
  private readonly employeeInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly adminLink: Locator;
  private readonly userManagementMenu: Locator;
  private readonly usersMenuItem: Locator;
  private readonly addButton: Locator;
  private readonly employeeSuggestions: Locator;
  private readonly searchButton: Locator;
  private readonly tableLoader: Locator;
  private readonly saveButton: Locator;
  private readonly confirmDeleteButton: Locator;
  private readonly deleteSuccessMessage: Locator;
  private readonly userRows: Locator;
  private readonly editIcon: Locator;
  private readonly deleteIcon: Locator;
  private submittedUsername?: string;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'System Users', exact: true });
    this.noRecords = page.locator('.orangehrm-paper-container').getByText('No Records Found', { exact: true });

    // These visible labels have no for/id association in OrangeHRM's DOM.
    const field = (label: string): Locator => page.locator('.oxd-input-group')
      .filter({ has: page.getByText(label, { exact: true }) });
    this.usernameInput = field('Username').getByRole('textbox');
    this.roleDropdown = field('User Role').locator('.oxd-select-text');
    this.statusDropdown = field('Status').locator('.oxd-select-text');
    this.employeeInput = page.getByPlaceholder('Type for hints...', { exact: true });
    this.passwordInput = field('Password').locator('input');
    this.confirmPasswordInput = field('Confirm Password').locator('input');
    this.adminLink = page.getByRole('link', { name: 'Admin', exact: true });
    this.userManagementMenu = page.getByRole('navigation', { name: 'Topbar Menu' })
      .getByText('User Management', { exact: true });
    this.usersMenuItem = page.getByRole('menuitem', { name: 'Users', exact: true });
    // The Add button's accessible name also contains an icon.
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.employeeSuggestions = page.getByRole('listbox').getByRole('option');
    this.searchButton = page.getByRole('button', { name: 'Search', exact: true });
    this.tableLoader = page.locator('.oxd-table-loader');
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
    this.confirmDeleteButton = page.getByRole('dialog').getByRole('button', { name: 'Yes, Delete' });
    this.deleteSuccessMessage = page.getByText('Successfully Deleted', { exact: true });
    this.userRows = page.getByRole('row');
    // Row action buttons expose only icon glyphs, without meaningful labels.
    this.editIcon = page.locator('.bi-pencil-fill');
    this.deleteIcon = page.locator('.bi-trash');
  }

  getUsernameInput(): Locator {
    return this.usernameInput;
  }

  getNoRecordsMessage(): Locator {
    return this.noRecords;
  }

  async open(): Promise<void> {
    await this.adminLink.click();
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

  async createUser(user: Credentials, role: UserRole, status: UserStatus): Promise<string> {
    await this.addButton.click();
    await this.selectUserRole(role);
    await this.selectStatus(status);
    const employeeName = await this.selectEmployee('a');
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.confirmPasswordInput.fill(user.password);
    this.submittedUsername = user.username;
    await this.save();
    return employeeName;
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

  private async selectUserRole(role: UserRole): Promise<void> {
    await this.roleDropdown.click();
    await this.page.getByRole('option', { name: role, exact: true }).click();
  }

  async selectStatus(status: UserStatus): Promise<void> {
    await this.statusDropdown.click();
    await this.page.getByRole('option', { name: status, exact: true }).click();
  }

  private async selectEmployee(searchText: string): Promise<string> {
    await this.employeeInput.fill(searchText);
    // Loading/empty placeholders do not match; the Users table omits middle names.
    const suggestion = this.employeeSuggestions.filter({ hasText: /^\S+\s+\S+$/ }).first();
    const employeeName = await suggestion.innerText();
    await suggestion.click();
    return employeeName;
  }

  async save(): Promise<void> {
    await this.saveButton.click();
    await this.heading.waitFor({ state: 'visible' });
  }

  async deleteUser(username: string): Promise<void> {
    await this.deleteButton(username).click();
    await this.confirmDeleteButton.click();
    await this.deleteSuccessMessage.waitFor({ state: 'visible' });
  }

  async deleteUserIfExists(username: string): Promise<void> {
    if (this.submittedUsername !== username) {
      return;
    }
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
