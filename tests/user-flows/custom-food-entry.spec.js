import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../mocks/api-mocks.js';
import { setupAuthenticated } from '../helpers/setup-authenticated.js';

test.describe('03 · Custom Food Entry — Manual Macro Form', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });
    await page.getByRole('tab', { name: 'Nutrition tab' }).click();
    await page.waitForSelector('text=03 · CUSTOM ENTRY', { timeout: 4000 });
  });

  // ── Render ──────────────────────────────────────────────────────────────────

  test('custom entry section renders all six macro input fields', async ({ page }) => {
    await expect(page.getByText('03 · CUSTOM ENTRY')).toBeVisible();
    await expect(page.getByText('Enter Macros')).toBeVisible();
    await expect(page.getByPlaceholder('e.g. Low Fat Paneer, Chicken Subji…')).toBeVisible();
    await expect(page.getByPlaceholder('e.g. 180')).toBeVisible();  // Calories
    await expect(page.getByPlaceholder('e.g. 20')).toBeVisible();   // Protein
    await expect(page.getByPlaceholder('e.g. 4')).toBeVisible();    // Carbs
    await expect(page.getByPlaceholder('e.g. 10')).toBeVisible();   // Fats
    await expect(page.getByPlaceholder('e.g. 0')).toBeVisible();    // Fibre
  });

  // ── Disabled-state guards ────────────────────────────────────────────────────

  test('submit button is disabled when form is blank', async ({ page }) => {
    await expect(page.getByRole('button', { name: /log custom food/i })).toBeDisabled();
  });

  test('submit button stays disabled when only name is filled (no calories)', async ({ page }) => {
    await page.getByPlaceholder('e.g. Low Fat Paneer, Chicken Subji…').fill('Mystery Snack');
    await expect(page.getByRole('button', { name: /log custom food/i })).toBeDisabled();
  });

  test('submit button stays disabled when only calories are filled (no name)', async ({ page }) => {
    await page.getByPlaceholder('e.g. 180').fill('300');
    await expect(page.getByRole('button', { name: /log custom food/i })).toBeDisabled();
  });

  test('submit button becomes enabled once both name and calories are filled', async ({ page }) => {
    await page.getByPlaceholder('e.g. Low Fat Paneer, Chicken Subji…').fill('Egg White Omelette');
    await page.getByPlaceholder('e.g. 180').fill('220');
    await expect(page.getByRole('button', { name: /log custom food/i })).toBeEnabled();
  });

  // ── Happy path ───────────────────────────────────────────────────────────────

  test('submitting navigates to dashboard and shows consumed calories', async ({ page }) => {
    await page.getByPlaceholder('e.g. Low Fat Paneer, Chicken Subji…').fill('Low Fat Paneer');
    await page.getByPlaceholder('e.g. 180').fill('180');
    await page.getByPlaceholder('e.g. 20').fill('20');
    await page.getByPlaceholder('e.g. 4').fill('4');
    await page.getByPlaceholder('e.g. 10').fill('10');
    await page.getByPlaceholder('e.g. 0').fill('0');
    await page.getByRole('button', { name: /log custom food/i }).click();

    // App auto-navigates to dashboard after logging
    await expect(page.getByText('CALORIES LEFT').or(page.getByText('OVER GOAL'))).toBeVisible({ timeout: 3000 });
    // CONSUMED card should show 180
    await expect(page.getByText('kcal eaten')).toBeVisible();
    const consumedSection = page.locator('text=kcal eaten').locator('..');
    await expect(consumedSection.getByText('180')).toBeVisible();
  });

  test('the form resets after a successful submission', async ({ page }) => {
    await page.getByPlaceholder('e.g. Low Fat Paneer, Chicken Subji…').fill('Test Food');
    await page.getByPlaceholder('e.g. 180').fill('300');
    await page.getByRole('button', { name: /log custom food/i }).click();

    // Navigate back to the Nutrition tab
    await page.getByRole('tab', { name: 'Nutrition tab' }).click();
    await page.waitForSelector('text=03 · CUSTOM ENTRY', { timeout: 4000 });

    // Name field should be blank again
    await expect(page.getByPlaceholder('e.g. Low Fat Paneer, Chicken Subji…')).toHaveValue('');
    await expect(page.getByPlaceholder('e.g. 180')).toHaveValue('');
  });

  // ── Fibre feature ─────────────────────────────────────────────────────────

  test('custom food with fibre shows Fb badge in the Logs tab', async ({ page }) => {
    await page.getByPlaceholder('e.g. Low Fat Paneer, Chicken Subji…').fill('High Fibre Oats');
    await page.getByPlaceholder('e.g. 180').fill('350');
    await page.getByPlaceholder('e.g. 20').fill('12');
    await page.getByPlaceholder('e.g. 4').fill('60');
    await page.getByPlaceholder('e.g. 10').fill('7');
    await page.getByPlaceholder('e.g. 0').fill('8');
    await page.getByRole('button', { name: /log custom food/i }).click();

    await page.getByRole('tab', { name: 'Logs tab' }).click();
    await page.waitForSelector('text=Food Log', { timeout: 4000 });

    // Fibre badge: MonoBadge renders "Fb 8.0g"
    await expect(page.getByText('Fb 8.0g')).toBeVisible();
  });

  test('custom food with zero fibre shows no Fb badge', async ({ page }) => {
    await page.getByPlaceholder('e.g. Low Fat Paneer, Chicken Subji…').fill('Sugar Water');
    await page.getByPlaceholder('e.g. 180').fill('50');
    await page.getByRole('button', { name: /log custom food/i }).click();

    await page.getByRole('tab', { name: 'Logs tab' }).click();
    await page.waitForSelector('text=Food Log', { timeout: 4000 });

    await expect(page.getByText('Fb 0.0g')).not.toBeVisible();
  });

  test('logged custom food appears in food log with AI badge', async ({ page }) => {
    await page.getByPlaceholder('e.g. Low Fat Paneer, Chicken Subji…').fill('Chicken Subji');
    await page.getByPlaceholder('e.g. 180').fill('185');
    await page.getByRole('button', { name: /log custom food/i }).click();

    await page.getByRole('tab', { name: 'Logs tab' }).click();
    await page.waitForSelector('text=Food Log', { timeout: 4000 });

    await expect(page.getByText('Chicken Subji')).toBeVisible();
    // Custom foods are logged via handleAILog so they carry the "AI" badge
    await expect(page.getByText('AI')).toBeVisible();
  });
});
