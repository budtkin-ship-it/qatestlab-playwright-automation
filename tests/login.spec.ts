import { test, expect } from '../fixtures/test';

test('valid user can log in @smoke', async ({ page, loginPage, credentials }) => {
  await loginPage.goto();
  await expect(loginPage.heading).toBeVisible();

  await loginPage.login(credentials);
  await loginPage.waitForDashboard();

  await expect(page).toHaveURL('/web/index.php/dashboard/index');
  await expect(loginPage.dashboardHeading).toBeVisible();
});

test('invalid credentials show an error and do not authenticate', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.login({ username: 'invalid-qa-user', password: 'invalid-password' });

  await expect(loginPage.errorAlert).toBeVisible();
  await expect(loginPage.errorAlert).toHaveText('Invalid credentials');
  await expect(page).toHaveURL('/web/index.php/auth/login');

  // A protected page must remain inaccessible after the rejected login.
  await loginPage.gotoDashboard();
  await expect(page).toHaveURL('/web/index.php/auth/login');
});
