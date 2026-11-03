import { test, expect } from '../fixtures/test';
import type { UserStatus } from '../types/user';
import { USER_ROLE, INITIAL_STATUS } from '../constants/user';

// User management tests include several operations, such as user creation,
// updating, deletion, and cleanup. These operations can take longer than
// other tests on the demo site, so we increase the timeout only for these tests.
test.describe.configure({ timeout: 120_000 });

const UPDATED_STATUS: UserStatus = 'Disabled';

// In 'create a system user' test I use a fixture to avoid repeating user creation code.
// Creating the user directly in this test would be easier to read,
// but I chose to keep the shared setup.
test('create a system user', async ({ usersPage, createdUser }) => {
  await expect(usersPage.userRow(createdUser.username)).toHaveCount(1);
  await expect.soft(usersPage.userRole(createdUser.username)).toHaveText(USER_ROLE);
  await expect.soft(usersPage.userEmployee(createdUser.username)).toHaveText(createdUser.employeeName);
  await expect.soft(usersPage.userStatus(createdUser.username)).toHaveText(INITIAL_STATUS);
});

test('update a system user', async ({ usersPage, userFormPage, createdUser }) => {
  await expect(usersPage.userRow(createdUser.username)).toHaveCount(1);
  await expect(usersPage.userStatus(createdUser.username)).toHaveText(INITIAL_STATUS);
  await usersPage.editUser(createdUser.username);
  await expect(userFormPage.getUsernameInput()).toHaveValue(createdUser.username);
  await userFormPage.selectStatus(UPDATED_STATUS);
  await userFormPage.save();
  await usersPage.search(createdUser.username);
  await expect.soft(usersPage.userStatus(createdUser.username)).toHaveText(UPDATED_STATUS);
});

test('delete a system user', async ({ usersPage, createdUser }) => {
  await expect(usersPage.userRow(createdUser.username)).toHaveCount(1);
  await usersPage.deleteUser(createdUser.username);
  await usersPage.search(createdUser.username);
  await expect.soft(usersPage.getNoRecordsMessage()).toBeVisible();
  await expect.soft(usersPage.userRow(createdUser.username)).toHaveCount(0);
});
