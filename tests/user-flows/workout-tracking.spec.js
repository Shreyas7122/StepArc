import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../mocks/api-mocks.js';

test.describe('Workout & Cardio Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto('/');
    // Navigate to the Workout tab
    await page.getByRole('tab', { name: 'Workout' }).click();
  });

  test('should log a manual strength workout', async ({ page }) => {
    // Open the SearchSelect for workouts
    await page.getByText('Search database...').click();
    
    // Select the first workout from the mock database (e.g., Bench Press)
    await page.locator('[role="listbox"] > div').first().click();

    // Fill in the number of sets
    const setsInput = page.locator('input[type="number"]').first();
    await setsInput.fill('3');

    // Click Add
    await page.getByRole('button', { name: 'Add' }).click();

    // Verify it was added to the list by checking the sets count
    await expect(page.getByText('3 sets')).toBeVisible();
  });

  test('should analyze cardio via AI and log it', async ({ page }) => {
    // Fill the AI text area for cardio
    const input = page.getByPlaceholder('What did you do? (e.g. ran 5km in 25 mins)');
    await expect(input).toBeVisible();
    await input.fill('walked on treadmill for 30 mins at speed 4.5');

    // Click Analyze Cardio
    await page.getByRole('button', { name: 'Analyze Cardio' }).click();

    // The mock API resolves and shows the Draft Workout Review component
    await expect(page.getByText('Mocked AI Treadmill Cardio')).toBeVisible();
    await expect(page.getByText('312')).toBeVisible(); // Calories
    await expect(page.getByText('30m')).toBeVisible(); // Duration

    // Click "Log Cardio" to save it
    await page.getByRole('button', { name: 'Log Cardio' }).click();

    // It should now appear in the LogList
    await expect(page.getByText('Mocked AI Treadmill Cardio')).toBeVisible();
    
    // Check if the AI indicator is visible
    const aiBadge = page.locator('.lucide-sparkles').first();
    await expect(aiBadge).toBeVisible();
  });
});
