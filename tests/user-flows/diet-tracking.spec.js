import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../mocks/api-mocks.js';

test.describe('Diet & Nutrition Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto('/');
    // Navigate to the Food tab
    await page.getByRole('tab', { name: 'Food' }).click();
  });

  test('should analyze a meal via AI and log it', async ({ page }) => {
    // Fill the AI text area
    const input = page.getByPlaceholder('What did you eat? (e.g. 150g chicken and 1 cup rice)');
    await expect(input).toBeVisible();
    await input.fill('150g chicken and 1 cup rice');

    // Click the submit button
    await page.getByRole('button', { name: 'Analyze Meal' }).click();

    // The mock API resolves and shows the Draft Meal Review component
    await expect(page.getByText('Mocked AI Protein Plate')).toBeVisible();
    await expect(page.getByText('Grilled Chicken')).toBeVisible();
    await expect(page.getByText('Steamed Rice')).toBeVisible();

    // Click "Log Meal" to save it
    await page.getByRole('button', { name: 'Log Meal' }).click();

    // It should now appear in the LogList
    await expect(page.getByText('Mocked AI Protein Plate')).toBeVisible();
    
    // Check if the AI indicator is visible on the logged item
    const aiBadge = page.locator('.lucide-sparkles').first();
    await expect(aiBadge).toBeVisible();
  });

  test('should add a meal manually via SearchSelect', async ({ page }) => {
    // Open the manual search select
    await page.getByText('Search database...').click();
    
    // Type in the search box
    await page.getByPlaceholder('Search...').fill('Oats');
    
    // Select the "Oats" item from the mock database list (assuming Oats is in data.js)
    // We can just click the first item in the dropdown
    await page.locator('[role="listbox"] > div').first().click();

    // We should see the manual entry form with amount
    const amountInput = page.locator('input[type="number"]').first();
    await amountInput.fill('50');

    // Add item
    await page.getByRole('button', { name: 'Add' }).click();

    // Verify it was added to the list (the first item from the database is usually Apple or Oats, we will check if an amount is shown)
    // We check that a generic "g" unit or amount is visible
    await expect(page.getByText('50g')).toBeVisible();
  });

  test('should delete a logged meal', async ({ page }) => {
    // First log a meal
    await page.getByPlaceholder('What did you eat?').fill('Apple');
    await page.getByRole('button', { name: 'Analyze Meal' }).click();
    await page.getByRole('button', { name: 'Log Meal' }).click();

    // Find the delete button for the logged meal
    // Since there are multiple delete buttons in the app, we target the one in the log list
    const logItem = page.locator('.log-item').first();
    const deleteButton = logItem.getByRole('button');
    
    await deleteButton.click();

    // Verify it is removed
    await expect(page.getByText('Mocked AI Protein Plate')).toBeHidden();
  });
});
