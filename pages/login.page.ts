import type { Locator, Page } from '@playwright/test';
import type { Credentials } from '../test-data/credentials';

export class LoginPage {
  readonly heading: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorAlert: Locator;
  readonly dashboardHeading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Login', exact: true });
    this.usernameInput = page.getByPlaceholder('Username', { exact: true });
    // Password inputs have no implicit textbox role; use the visible placeholder.
    this.passwordInput = page.getByPlaceholder('Password', { exact: true });
    this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
    this.errorAlert = page.getByRole('alert');
    this.dashboardHeading = page.getByRole('heading', { name: 'Dashboard', exact: true });
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/auth/login');
  }

  async login(credentials: Credentials): Promise<void> {
    await this.usernameInput.fill(credentials.username);
    await this.passwordInput.fill(credentials.password);
    // Successful flows synchronize the redirect explicitly in waitForDashboard;
    // keep the click's action timeout separate from the server's navigation.
    await this.loginButton.click({ noWaitAfter: true });
  }

  async waitForDashboard(): Promise<void> {
    // Form submission can start after click resolves; use the navigation budget
    // before tests assert the final URL and rendered Dashboard.
    await this.page.waitForURL('/web/index.php/dashboard/index', { waitUntil: 'domcontentloaded' });
  }

  async gotoDashboard(): Promise<void> {
    await this.page.goto('/web/index.php/dashboard/index');
  }
}
