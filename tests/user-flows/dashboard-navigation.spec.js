import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../mocks/api-mocks.js';

test.describe('Dashboard & Core Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto('/');
  });

  test('should render header with correct title', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('STEPARC');
    await expect(page.locator('header').getByText('TRACK YOUR GAINS')).toBeVisible();
  });

  test('should navigate between tabs correctly', async ({ page }) => {
    // Default tab is Dashboard
    await expect(page.getByText('MACROS TODAY')).toBeVisible();

    // Click Food Tab
    await page.getByRole('tab', { name: 'Food' }).click();
    await expect(page.getByPlaceholder('What did you eat?')).toBeVisible();

    // Click Workout Tab
    await page.getByRole('tab', { name: 'Workout' }).click();
    await expect(page.getByPlaceholder('What did you do?')).toBeVisible();

    // Go back to Dashboard
    await page.getByRole('tab', { name: 'Dashboard' }).click();
    await expect(page.getByText('MACROS TODAY')).toBeVisible();
  });

  test('should open and close the User Profile Modal from the header', async ({ page }) => {
    // Click the profile area in the header (which is a button)
    await page.locator('header button').first().click();
    
    // Modal should appear
    await expect(page.getByRole('heading', { name: 'User Profile' })).toBeVisible();
    
    // Check if the mock data is populated
    await expect(page.getByDisplayValue('23')).toBeVisible(); // Age
    await expect(page.getByDisplayValue('175')).toBeVisible(); // Height

    // Close the modal
    await page.getByRole('button', { name: 'Close profile' }).click();
    await expect(page.getByRole('heading', { name: 'User Profile' })).toBeHidden();
  });

  test('should render horizontal progress bars', async ({ page }) => {
    // There are 3 macro horizontal progress bars plus 1 main calorie bar in the dashboard
    await expect(page.getByText('PROTEIN')).toBeVisible();
    await expect(page.getByText('CARBS')).toBeVisible();
    await expect(page.getByText('FATS')).toBeVisible();
  });
});
