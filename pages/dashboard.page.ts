import type { Locator, Page } from '@playwright/test';

export class DashboardPage {
  readonly subUnitChart: Locator;
  readonly locationChart: Locator;
  private readonly subUnitLegend: Locator;
  private readonly locationLegend: Locator;

  constructor(page: Page) {
    // Chart titles are paragraphs and canvases have no accessible labels.
    const employeeDistributionBySubUnitWidget = page.locator('.oxd-sheet.orangehrm-dashboard-widget').filter({
      has: page.getByText('Employee Distribution by Sub Unit', { exact: true }),
    });
    const employeeDistributionByLocationWidget = page.locator('.oxd-sheet.orangehrm-dashboard-widget').filter({
      has: page.getByText('Employee Distribution by Location', { exact: true }),
    });
    this.subUnitChart = employeeDistributionBySubUnitWidget.locator('canvas');
    this.locationChart = employeeDistributionByLocationWidget.locator('canvas');
    this.subUnitLegend = employeeDistributionBySubUnitWidget.getByRole('list');
    this.locationLegend = employeeDistributionByLocationWidget.getByRole('list');
  }

  subUnitLabel(name: string): Locator {
    return this.subUnitLegend.getByText(name, { exact: true });
  }

  locationLabel(name: string): Locator {
    return this.locationLegend.getByText(name, { exact: true });
  }
}
