import { test, expect } from '../fixtures/test';

test('create, update, and delete a system user', async ({
  loginPage, credentials, usersPage, userAccount,
}) => {
  await loginPage.goto();
  await loginPage.login(credentials);
  await loginPage.waitForDashboard();
  await usersPage.open();

  const employeeName = await usersPage.createUser(userAccount, 'ESS', 'Enabled');
  await usersPage.search(userAccount.username);
  await expect(usersPage.userRow(userAccount.username)).toHaveCount(1);
  await expect.soft(usersPage.userRole(userAccount.username)).toHaveText('ESS');
  await expect.soft(usersPage.userEmployee(userAccount.username)).toHaveText(employeeName);
  await expect.soft(usersPage.userStatus(userAccount.username)).toHaveText('Enabled');

  await usersPage.editUser(userAccount.username);
  await expect(usersPage.getUsernameInput()).toHaveValue(userAccount.username);
  await usersPage.selectStatus('Disabled');
  await usersPage.save();
  await usersPage.search(userAccount.username);
  await expect.soft(usersPage.userStatus(userAccount.username)).toHaveText('Disabled');

  await usersPage.deleteUser(userAccount.username);
  await usersPage.search(userAccount.username);
  await expect.soft(usersPage.getNoRecordsMessage()).toBeVisible();
  await expect.soft(usersPage.userRow(userAccount.username)).toHaveCount(0);
});
