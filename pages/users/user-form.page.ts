import type { Locator, Page } from '@playwright/test';
import type { Credentials } from '../../test-data/credentials';
import type { UserRole, UserStatus } from '../../types/user';

// Add User and Edit User share these form controls.
export class UserFormPage {
  private readonly usernameInput: Locator;
  private readonly roleDropdown: Locator;
  private readonly statusDropdown: Locator;
  private readonly employeeInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly employeeSuggestions: Locator;
  private readonly saveButton: Locator;
  private readonly usersHeading: Locator;

  constructor(private readonly page: Page) {
    const field = (label: string): Locator => page.locator('.oxd-input-group')
      .filter({ has: page.getByText(label, { exact: true }) });
    this.usernameInput = field('Username').getByRole('textbox');
    this.roleDropdown = field('User Role').locator('.oxd-select-text');
    this.statusDropdown = field('Status').locator('.oxd-select-text');
    this.employeeInput = page.getByPlaceholder('Type for hints...', { exact: true });
    this.passwordInput = field('Password').locator('input');
    this.confirmPasswordInput = field('Confirm Password').locator('input');
    this.employeeSuggestions = page.getByRole('listbox').getByRole('option');
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
    this.usersHeading = page.getByRole('heading', { name: 'System Users', exact: true });
  }

  getUsernameInput(): Locator {
    return this.usernameInput;
  }

  async createUser(user: Credentials, role: UserRole, status: UserStatus): Promise<string> {
    await this.selectUserRole(role);
    await this.selectStatus(status);
    const employeeName = await this.selectEmployee('a');
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.confirmPasswordInput.fill(user.password);
    await this.save();
    return employeeName;
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
    const suggestion = this.employeeSuggestions.filter({ hasText: /^\S+\s+\S+$/ }).first();
    const employeeName = await suggestion.innerText();
    await suggestion.click();
    return employeeName;
  }

  async save(): Promise<void> {
    // Keep the return navigation on its own budget before checking UI readiness.
    await Promise.all([
      this.page.waitForURL('/web/index.php/admin/viewSystemUsers', { waitUntil: 'domcontentloaded' }),
      this.saveButton.click({ noWaitAfter: true }),
    ]);
    await this.usersHeading.waitFor({ state: 'visible' });
  }
}
