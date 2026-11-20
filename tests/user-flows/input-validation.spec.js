import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../mocks/api-mocks.js';
import { setupAuthenticated } from '../helpers/setup-authenticated.js';

// Click a SearchSelect input to open the dropdown, then pick the first result.
// No typing needed — the initial dropdown shows valid items for validation tests.
async function pickFirstSearchOption(page, placeholder) {
  await page.getByPlaceholder(placeholder).click();
  await page.waitForSelector('.search-option', { timeout: 4000 });
  await page.locator('.search-option').first().click({ force: true });
}

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
    await pickFirstSearchOption(page, 'Search food… e.g. oats');
    await page.getByRole('button', { name: /add food/i }).click();

    await expect(page.getByText('02 · FROM DATABASE')).toBeVisible();
    await page.getByRole('tab', { name: 'Logs tab' }).click();
    await page.waitForSelector('text=Food Log', { timeout: 3000 });
    await expect(page.getByText('No food logged yet.')).toBeVisible();
  });

  test('ADD FOOD is blocked when amount is 0', async ({ page }) => {
    await pickFirstSearchOption(page, 'Search food… e.g. oats');
    const amountInput = page.getByLabel('Amount (grams)');
    await amountInput.fill('0');
    await page.getByRole('button', { name: /add food/i }).click();
    await expect(page.getByText('02 · FROM DATABASE')).toBeVisible();
  });

  test('ADD FOOD is blocked with a negative amount', async ({ page }) => {
    await pickFirstSearchOption(page, 'Search food… e.g. oats');
    const amountInput = page.getByLabel('Amount (grams)');
    await amountInput.fill('-50');
    await page.getByRole('button', { name: /add food/i }).click();
    await expect(page.getByText('02 · FROM DATABASE')).toBeVisible();
  });

  test('custom macro submit is blocked with a whitespace-only name', async ({ page }) => {
    await page.getByPlaceholder('e.g. Low Fat Paneer, Chicken Subji…').fill('   ');
    await page.getByPlaceholder('e.g. 180').fill('250');
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
    await pickFirstSearchOption(page, 'Search exercise… e.g. incline');
    await page.getByRole('button', { name: /log exercise/i }).click();
    await expect(page.getByText('02 · SINGLE EXERCISE')).toBeVisible();
  });

  test('LOG EXERCISE is blocked when sets is 0', async ({ page }) => {
    await pickFirstSearchOption(page, 'Search exercise… e.g. incline');
    await page.getByPlaceholder('e.g. 4').fill('0');
    await page.getByRole('button', { name: /log exercise/i }).click();
    await expect(page.getByText('02 · SINGLE EXERCISE')).toBeVisible();
  });

  test('estimated calorie preview is only shown when sets > 0', async ({ page }) => {
    await expect(page.getByText(/est. burn/i)).not.toBeVisible();
    await pickFirstSearchOption(page, 'Search exercise… e.g. incline');
    await page.getByPlaceholder('e.g. 4').fill('3');
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
    await expect(page.getByText('03 · DAILY STEPS')).toBeVisible();
  });

  test('calorie preview shows correctly for a typical step count', async ({ page }) => {
    await page.getByPlaceholder('e.g. 14000').fill('12000');
    await expect(page.getByText('480 kcal')).toBeVisible();
  });
});
