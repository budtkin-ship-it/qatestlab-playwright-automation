import { test, expect } from '../fixtures/test';
import { routes } from '../utils/routes';

test('valid user can log', async ({ page, loginPage, credentials }) => {
  await loginPage.goto();
  await expect(loginPage.heading).toBeVisible();

  await loginPage.login(credentials);
  await loginPage.waitForDashboard();

  await expect.soft(page).toHaveURL(routes.dashboard);
  await expect(loginPage.dashboardHeading).toBeVisible();
});

test('invalid credentials show an error and do not authenticate', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.login({ username: 'invalid-qa-user', password: 'invalid-password' });

  await expect.soft(loginPage.errorAlert).toBeVisible();
  await expect.soft(loginPage.errorAlert).toHaveText('Invalid credentials');
  await expect.soft(page).toHaveURL(routes.login);

  // A protected page must remain inaccessible after the rejected login.
  await loginPage.gotoDashboard();
  await expect(page).toHaveURL(routes.login);
});
