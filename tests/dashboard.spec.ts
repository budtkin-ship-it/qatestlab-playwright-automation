import { test, expect } from '../fixtures/test';
import { negativeDashboardLabels } from '../test-data/dashboard';

test('validate employee distribution by sub unit', async ({
  loginPage, credentials, dashboardPage,
}) => {
  await loginPage.goto();
  await loginPage.login(credentials);
  await loginPage.waitForDashboard();

  await expect(dashboardPage.getSubUnitChart()).toBeVisible();
  await expect.soft(dashboardPage.subUnitLabel('Engineering')).toBeVisible();
  await expect.soft(dashboardPage.subUnitLabel('Unassigned')).toBeVisible();
  await expect.soft(dashboardPage.subUnitLabel(negativeDashboardLabels.subUnit)).not.toBeVisible();
});

test('validate employee distribution by location', async ({
  loginPage, credentials, dashboardPage,
}) => {
  await loginPage.goto();
  await loginPage.login(credentials);
  await loginPage.waitForDashboard();

  await expect(dashboardPage.getLocationChart()).toBeVisible();
  await expect.soft(dashboardPage.locationLabel('Texas R&D')).toBeVisible();
  await expect.soft(dashboardPage.locationLabel('Unassigned')).toBeVisible();

  await expect.soft(dashboardPage.locationLabel(negativeDashboardLabels.location)).not.toBeVisible();
});
