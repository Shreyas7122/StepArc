import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../mocks/api-mocks.js';
import { setupAuthenticated } from '../helpers/setup-authenticated.js';

// AI meal analysis (AIInput) lives on the Dashboard tab, not the Nutrition tab.
// Submit button is a Send icon with aria-label "Submit text for AI analysis".
// After mock resolves, "LOG THIS MEAL" logs the meal.

test.describe('Diet & Nutrition Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });
    // AI meal input is on the Dashboard (Today) tab — no tab switch needed
  });

  test('should analyze a meal via AI and log it', async ({ page }) => {
    const input = page.getByPlaceholder("e.g. '2 slices pizza, a cola, garlic bread'");
    await expect(input).toBeVisible();
    await input.fill('150g chicken and 1 cup rice');

    await page.getByRole('button', { name: /submit text for ai analysis/i }).click();

    // Mock returns "Mocked AI Protein Plate" with its ingredients
    await expect(page.getByText('Mocked AI Protein Plate')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Grilled Chicken')).toBeVisible();
    await expect(page.getByText('Steamed Rice')).toBeVisible();

    // Log the meal
    await page.getByRole('button', { name: /log this meal/i }).click();

    // Navigate to logs to confirm entry was saved
    await page.getByRole('tab', { name: 'Logs tab' }).click();
    await page.waitForSelector('text=Food Log', { timeout: 4000 });
    await expect(page.getByText('Mocked AI Protein Plate')).toBeVisible();
  });

  test('should add a meal manually via food database search', async ({ page }) => {
    // Navigate to the Nutrition tab — food database search is in section 02
    await page.getByRole('tab', { name: 'Nutrition tab' }).click();
    await page.waitForSelector('text=02 · FROM DATABASE', { timeout: 4000 });

    // Open dropdown and pick first food item — no typing needed for this validation test
    await page.getByPlaceholder('Search food… e.g. oats').click();
    await page.waitForSelector('.search-option', { timeout: 4000 });
    await page.locator('.search-option').first().click({ force: true });

    const amountInput = page.getByLabel('Amount (grams)');
    await amountInput.fill('50');

    await page.getByRole('button', { name: /add food/i }).click();

    // Navigate to logs to confirm
    await page.getByRole('tab', { name: 'Logs tab' }).click();
    await page.waitForSelector('text=Food Log', { timeout: 4000 });
    await expect(page.getByText('Oats (Dry/Raw)')).toBeVisible();
  });

  test('should delete a logged meal from the Logs tab', async ({ page }) => {
    // Log a meal via AI on Dashboard
    const input = page.getByPlaceholder("e.g. '2 slices pizza, a cola, garlic bread'");
    await input.fill('Apple');
    await page.getByRole('button', { name: /submit text for ai analysis/i }).click();
    await expect(page.getByText('Mocked AI Protein Plate')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /log this meal/i }).click();

    await page.getByRole('tab', { name: 'Logs tab' }).click();
    await page.waitForSelector('text=Food Log', { timeout: 4000 });
    await expect(page.getByText('Mocked AI Protein Plate')).toBeVisible();

    // LogList renders delete button with aria-label="Delete food log"
    await page.getByRole('button', { name: 'Delete food log' }).first().click();

    await expect(page.getByText('Mocked AI Protein Plate')).not.toBeVisible({ timeout: 3000 });
  });
});
