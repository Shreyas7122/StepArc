import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../mocks/api-mocks.js';
import { setupAuthenticated } from '../helpers/setup-authenticated.js';

test.describe('Input Validation — Food Tab', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });
    await page.getByRole('tab', { name: 'Nutrition tab' }).click();
    await page.waitForSelector('text=02 · FROM DATABASE', { timeout: 4000 });
  });

  test('ADD FOOD is blocked with an empty amount field', async ({ page }) => {
    // Select a food from the search dropdown
    await page.getByPlaceholder('Search food… e.g. oats').click();
    await page.getByPlaceholder('Search food… e.g. oats').fill('Banana');
    await page.locator('[role="listbox"]').locator('div').first().click();

    // Submit with no amount
    await page.getByRole('button', { name: /add food/i }).click();

    // Should stay on Food tab — no navigation to dashboard
    await expect(page.getByText('02 · FROM DATABASE')).toBeVisible();
    // Logs tab should still show empty state
    await page.getByRole('tab', { name: 'Logs tab' }).click();
    await page.waitForSelector('text=Food Log', { timeout: 3000 });
    await expect(page.getByText('No food logged yet.')).toBeVisible();
  });

  test('ADD FOOD is blocked when amount is 0', async ({ page }) => {
    await page.getByPlaceholder('Search food… e.g. oats').click();
    await page.getByPlaceholder('Search food… e.g. oats').fill('Oats');
    await page.locator('[role="listbox"]').locator('div').first().click();

    const amountInput = page.getByLabel('Amount (grams)');
    await amountInput.fill('0');
    await page.getByRole('button', { name: /add food/i }).click();

    await expect(page.getByText('02 · FROM DATABASE')).toBeVisible();
  });

  test('ADD FOOD is blocked with a negative amount', async ({ page }) => {
    await page.getByPlaceholder('Search food… e.g. oats').click();
    await page.getByPlaceholder('Search food… e.g. oats').fill('Banana');
    await page.locator('[role="listbox"]').locator('div').first().click();

    const amountInput = page.getByLabel('Amount (grams)');
    await amountInput.fill('-50');
    await page.getByRole('button', { name: /add food/i }).click();

    // Should stay on food tab
    await expect(page.getByText('02 · FROM DATABASE')).toBeVisible();
  });

  test('custom macro submit is blocked with a whitespace-only name', async ({ page }) => {
    await page.getByPlaceholder('e.g. Low Fat Paneer, Chicken Subji…').fill('   ');
    await page.getByPlaceholder('e.g. 180').fill('250');
    // The button has a JS `disabled` check: !customForm.name.trim() || !customForm.calories
    // Space-only name.trim() === '' → disabled
    await expect(page.getByRole('button', { name: /log custom food/i })).toBeDisabled();
  });
});

test.describe('Input Validation — Workout Tab', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });
    await page.getByRole('tab', { name: 'Training tab' }).click();
    await page.waitForSelector('text=02 · SINGLE EXERCISE', { timeout: 4000 });
  });

  test('LOG EXERCISE is blocked with an empty sets field', async ({ page }) => {
    await page.getByPlaceholder('Search exercise… e.g. incline').click();
    await page.getByPlaceholder('Search exercise… e.g. incline').fill('Deadlift');
    await page.locator('[role="listbox"]').locator('div').first().click();

    // Submit without filling sets
    await page.getByRole('button', { name: /log exercise/i }).click();

    // Should remain on Training tab
    await expect(page.getByText('02 · SINGLE EXERCISE')).toBeVisible();
  });

  test('LOG EXERCISE is blocked when sets is 0', async ({ page }) => {
    await page.getByPlaceholder('Search exercise… e.g. incline').click();
    await page.getByPlaceholder('Search exercise… e.g. incline').fill('Squat');
    await page.locator('[role="listbox"]').locator('div').first().click();

    await page.getByPlaceholder('e.g. 4').fill('0');
    await page.getByRole('button', { name: /log exercise/i }).click();

    await expect(page.getByText('02 · SINGLE EXERCISE')).toBeVisible();
  });

  test('estimated calorie preview is only shown when sets > 0', async ({ page }) => {
    // No preview before entry
    await expect(page.getByText(/est. burn/i)).not.toBeVisible();

    await page.getByPlaceholder('Search exercise… e.g. incline').click();
    await page.getByPlaceholder('Search exercise… e.g. incline').fill('Deadlift');
    await page.locator('[role="listbox"]').locator('div').first().click();
    await page.getByPlaceholder('e.g. 4').fill('3');

    // Preview should now appear
    await expect(page.getByText(/est. burn/i)).toBeVisible();
  });
});

test.describe('Input Validation — Steps', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });
    await page.getByRole('tab', { name: 'Training tab' }).click();
    await page.waitForSelector('text=03 · DAILY STEPS', { timeout: 4000 });
  });

  test('UPDATE STEPS is blocked with an empty steps field', async ({ page }) => {
    await page.getByRole('button', { name: /update steps/i }).click();
    // Stays on Training tab
    await expect(page.getByText('03 · DAILY STEPS')).toBeVisible();
  });

  test('calorie preview shows correctly for a typical step count', async ({ page }) => {
    await page.getByPlaceholder('e.g. 14000').fill('12000');
    // STEP_CALORIES_MULTIPLIER = 0.04 → 12000 * 0.04 = 480 kcal
    await expect(page.getByText('480 kcal')).toBeVisible();
  });
});
