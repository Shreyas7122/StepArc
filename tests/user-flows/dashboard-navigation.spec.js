import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../mocks/api-mocks.js';
import { setupAuthenticated } from '../helpers/setup-authenticated.js';

test.describe('Dashboard & Core Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });
  });

  test('should render header with correct title', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('STEPARC');
    await expect(page.locator('header').getByText('TRACK YOUR GAINS')).toBeVisible();
  });

  test('should navigate between tabs correctly', async ({ page }) => {
    // Default tab is Dashboard/Today
    await expect(page.getByText('MACROS TODAY')).toBeVisible();

    // Click Nutrition Tab
    await page.getByRole('tab', { name: 'Nutrition tab' }).click();
    await expect(page.getByPlaceholder('Search food… e.g. oats')).toBeVisible();

    // Click Training Tab
    await page.getByRole('tab', { name: 'Training tab' }).click();
    await expect(page.getByText('Gym Routine')).toBeVisible();

    // Go back to Today/Dashboard
    await page.getByRole('tab', { name: 'Today tab' }).click();
    await expect(page.getByText('MACROS TODAY')).toBeVisible();
  });

  test('should open and close the User Profile Modal from the header', async ({ page }) => {
    // Click the profile button in the header
    await page.click('button[aria-label="Toggle user profile and settings menu"]');

    // Click Edit Profile in the dropdown
    await page.click('text=Edit Profile');

    // Modal should appear
    await expect(page.getByText('MY PROFILE')).toBeVisible({ timeout: 3000 });

    // Check if the mock data is populated
    await expect(page.getByDisplayValue('23')).toBeVisible(); // Age
    await expect(page.getByDisplayValue('175')).toBeVisible(); // Height

    // Close the modal using the close button (aria-label="Close profile settings")
    await page.click('button[aria-label="Close profile settings"]');
    await expect(page.getByText('MY PROFILE')).toBeHidden({ timeout: 3000 });
  });

  test('should render horizontal progress bars', async ({ page }) => {
    // There are 3 macro horizontal progress bars plus 1 main calorie bar in the dashboard
    await expect(page.getByText('PROTEIN')).toBeVisible();
    await expect(page.getByText('CARBS')).toBeVisible();
    await expect(page.getByText('FATS')).toBeVisible();
  });
});
