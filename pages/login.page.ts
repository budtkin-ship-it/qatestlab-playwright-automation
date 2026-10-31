import type { Locator, Page } from '@playwright/test';
import type { Credentials } from '../test-data/credentials';

export class LoginPage {
  readonly heading: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorAlert: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Login', exact: true });
    this.usernameInput = page.getByPlaceholder('Username', { exact: true });
    // Password inputs have no implicit textbox role; use the visible placeholder.
    this.passwordInput = page.getByPlaceholder('Password', { exact: true });
    this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
    this.errorAlert = page.getByRole('alert');
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/auth/login');
  }

  async login(credentials: Credentials): Promise<void> {
    await this.usernameInput.fill(credentials.username);
    await this.passwordInput.fill(credentials.password);
    await this.loginButton.click();
  }
}
