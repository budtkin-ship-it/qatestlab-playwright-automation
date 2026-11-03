import { test, expect } from '../fixtures/test';
import { routes } from '../utils/routes';

test('valid user can log in', async ({ page, loginPage, credentials }) => {
  await loginPage.goto();
  await expect(loginPage.getHeading()).toBeVisible();

  await loginPage.login(credentials);
  await loginPage.waitForDashboard();

  await expect.soft(page).toHaveURL(routes.dashboard);
  await expect(loginPage.getDashboardHeading()).toBeVisible();
});

test('invalid credentials show an error and do not authenticate', async ({ page, loginPage }) => {
  const invalidUsername = 'invalid-qa-user';
  const invalidPassword = 'invalid-password';

  await loginPage.goto();
  await loginPage.login({ username: invalidUsername, password: invalidPassword });

  await expect.soft(loginPage.getErrorAlert()).toBeVisible();
  await expect.soft(loginPage.getErrorAlert()).toHaveText('Invalid credentials');
  await expect.soft(page).toHaveURL(routes.login);

  // A protected page must remain inaccessible after the rejected login.
  await loginPage.gotoDashboard();
  await expect(page).toHaveURL(routes.login);
});

test('empty credentials show required-field validation and do not authenticate', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.login({ username: '', password: '' });

  await expect.soft(loginPage.getUsernameRequiredMessage()).toBeVisible();
  await expect.soft(loginPage.getPasswordRequiredMessage()).toBeVisible();
  await expect(page).toHaveURL(routes.login);
  await expect(loginPage.getDashboardHeading()).not.toBeVisible();

  await loginPage.gotoDashboard();
  await expect(page).toHaveURL(routes.login);
});
