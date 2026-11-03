import type { Locator, Page } from '@playwright/test';
import type { Credentials } from '../test-data/credentials';
import { routes } from '../constants/routes';

export class LoginPage {
  private readonly heading: Locator;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorAlert: Locator;
  private readonly dashboardHeading: Locator;
  private readonly usernameRequiredMessage: Locator;
  private readonly passwordRequiredMessage: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Login', exact: true });
    this.usernameInput = page.getByPlaceholder('Username', { exact: true });
    // Password inputs have no implicit textbox role; use the visible placeholder.
    this.passwordInput = page.getByPlaceholder('Password', { exact: true });
    this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
    this.errorAlert = page.getByRole('alert');
    this.dashboardHeading = page.getByRole('heading', { name: 'Dashboard', exact: true });
    this.usernameRequiredMessage = page.locator('.oxd-input-group')
      .filter({ has: this.usernameInput }).getByText('Required', { exact: true });
    this.passwordRequiredMessage = page.locator('.oxd-input-group')
      .filter({ has: this.passwordInput }).getByText('Required', { exact: true });
  }

  getHeading(): Locator {
    return this.heading;
  }

  getDashboardHeading(): Locator {
    return this.dashboardHeading;
  }

  getErrorAlert(): Locator {
    return this.errorAlert;
  }

  getUsernameRequiredMessage(): Locator {
    return this.usernameRequiredMessage;
  }

  getPasswordRequiredMessage(): Locator {
    return this.passwordRequiredMessage;
  }

  async goto(): Promise<void> {
    await this.page.goto(routes.login);
  }

  // Login can succeed or fail, so this method does not return a DashboardPage.
  async login(credentials: Credentials): Promise<void> {
    await this.usernameInput.fill(credentials.username);
    await this.passwordInput.fill(credentials.password);
    await this.loginButton.click({ noWaitAfter: true });
  }

  async waitForDashboard(): Promise<void> {
    await this.page.waitForURL(routes.dashboard, { waitUntil: 'domcontentloaded' });
  }

  async gotoDashboard(): Promise<void> {
    await this.page.goto(routes.dashboard);
  }
}
