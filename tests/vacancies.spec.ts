import { test, expect } from '../fixtures/test';

test('vacancy search returns records matching the selected filters', async ({
  loginPage, credentials, vacanciesPage,
}) => {
  await loginPage.goto();
  await loginPage.login(credentials);
  await loginPage.waitForDashboard();
  await vacanciesPage.open();

  await expect(vacanciesPage.rows).not.toHaveCount(0);
  const vacancy = await vacanciesPage.readFirstVacancy();
  await vacanciesPage.selectJobTitle(vacancy.jobTitle);
  await vacanciesPage.selectVacancy(vacancy.name);
  await vacanciesPage.selectStatus(vacancy.status);
  await vacanciesPage.search();

  await expect(vacanciesPage.rows).toHaveCount(1);
  await expect.soft(vacanciesPage.resultVacancyName).toHaveText(vacancy.name);
  await expect.soft(vacanciesPage.resultJobTitle).toHaveText(vacancy.jobTitle);
  await expect.soft(vacanciesPage.resultStatus).toHaveText(vacancy.status);
});

test('vacancy search returns no records for a vacancy with the opposite status', async ({
  loginPage, credentials, vacanciesPage,
}) => {
  await loginPage.goto();
  await loginPage.login(credentials);
  await loginPage.waitForDashboard();
  await vacanciesPage.open();

  await expect(vacanciesPage.rows).not.toHaveCount(0);
  const vacancy = await vacanciesPage.readFirstVacancy();
  const oppositeStatus = vacancy.status === 'Active' ? 'Closed' : 'Active';
  await vacanciesPage.selectJobTitle(vacancy.jobTitle);
  await vacanciesPage.selectVacancy(vacancy.name);
  await vacanciesPage.selectStatus(oppositeStatus);
  await expect(vacanciesPage.vacancyDropdown).toHaveText(vacancy.name);
  await expect(vacanciesPage.statusDropdown).toHaveText(oppositeStatus);
  await vacanciesPage.search();

  await expect.soft(vacanciesPage.noRecords).toBeVisible();
  await expect.soft(vacanciesPage.rows).toHaveCount(0);
});
