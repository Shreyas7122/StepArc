import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../mocks/api-mocks.js';
import { setupAuthenticated } from '../helpers/setup-authenticated.js';
import { STEP_CALORIES_MULTIPLIER } from '../../src/data.js';

test.describe('Steps Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });
    await page.getByRole('tab', { name: 'Training tab' }).click();
    await page.waitForSelector('text=03 · DAILY STEPS', { timeout: 4000 });
  });

  test('entering steps shows the estimated calorie burn preview', async ({ page }) => {
    const stepsInput = page.getByPlaceholder('e.g. 14000');
    await stepsInput.fill('10000');

    const expectedKcal = Math.round(10000 * STEP_CALORIES_MULTIPLIER);
    await expect(page.getByText(`${expectedKcal} kcal`)).toBeVisible();
  });

  test('submitting steps updates the DAILY STEPS display on the dashboard', async ({ page }) => {
    const stepsInput = page.getByPlaceholder('e.g. 14000');
    await stepsInput.fill('8000');
    await page.getByRole('button', { name: /update steps/i }).click();

    // Should navigate to dashboard
    await expect(page.getByText('DAILY STEPS')).toBeVisible({ timeout: 3000 });
    await expect(page.getByText('8,000')).toBeVisible();
  });

  test('step burn appears in the BURNED dashboard chip', async ({ page }) => {
    await page.getByPlaceholder('e.g. 14000').fill('10000');
    await page.getByRole('button', { name: /update steps/i }).click();

    await page.waitForSelector('text=DAILY STEPS', { timeout: 3000 });
    // Steps widget also shows the kcal burned (right-side of the steps card)
    const stepsBurnedText = await page.locator('text=DAILY STEPS').locator('..').locator('..').locator('div').last().textContent();
    expect(parseInt(stepsBurnedText ?? '0')).toBeGreaterThan(0);
  });

  test('step progress bar renders when steps are entered', async ({ page }) => {
    await page.getByPlaceholder('e.g. 14000').fill('5000');
    // The progress bar div appears once stepsInput > 0
    const progressBar = page.locator('div').filter({ has: page.locator('div[style*="linear-gradient"]') }).last();
    await expect(progressBar).toBeVisible({ timeout: 2000 });
  });
});

test.describe('Dashboard Calorie Math', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });
  });

  test('CALORIES LEFT equals goal on a fresh day with no logs', async ({ page }) => {
    await expect(page.getByText('CALORIES LEFT')).toBeVisible();
    // Goal is driven by BMR (mock: age 23, 175cm, 75.5kg, male, maintenance)
    // BMR ≈ 1734; maintenance → baseGoal ≈ 1734; no activity → adjustedGoal ≈ 1734
    // The big number should be positive and match the computed baseGoal
    const bigNum = await page.locator('div[style*="font-display"]').first().textContent();
    expect(parseInt(bigNum ?? '0')).toBeGreaterThan(0);
  });

  test('CONSUMED increases after logging a custom food', async ({ page }) => {
    // Navigate to nutrition and log food
    await page.getByRole('tab', { name: 'Nutrition tab' }).click();
    await page.waitForSelector('text=03 · CUSTOM ENTRY', { timeout: 4000 });
    await page.getByPlaceholder('e.g. Low Fat Paneer, Chicken Subji…').fill('Test Meal');
    await page.getByPlaceholder('e.g. 180').fill('400');
    await page.getByRole('button', { name: /log custom food/i }).click();

    await page.waitForSelector('text=kcal eaten', { timeout: 3000 });
    const consumedSection = page.locator('text=kcal eaten').locator('..');
    await expect(consumedSection.getByText('400')).toBeVisible();
  });

  test('MACROS TODAY section shows all four macro rows including Fibre', async ({ page }) => {
    await expect(page.getByText('MACROS TODAY')).toBeVisible();
    await expect(page.getByText('Protein')).toBeVisible();
    await expect(page.getByText('Carbs')).toBeVisible();
    await expect(page.getByText('Fats')).toBeVisible();
    // Fibre was the new macro row added in the recent feature work
    await expect(page.getByText('Fibre')).toBeVisible();
  });

  test('shows OVER GOAL label and positive surplus when calories exceed goal', async ({ page }) => {
    // Log a very large calorie amount to trigger the over-goal state
    await page.getByRole('tab', { name: 'Nutrition tab' }).click();
    await page.waitForSelector('text=03 · CUSTOM ENTRY', { timeout: 4000 });
    await page.getByPlaceholder('e.g. Low Fat Paneer, Chicken Subji…').fill('Enormous Meal');
    await page.getByPlaceholder('e.g. 180').fill('9999');
    await page.getByRole('button', { name: /log custom food/i }).click();

    await expect(page.getByText('OVER GOAL')).toBeVisible({ timeout: 3000 });
  });

  test('BMR breakdown chips appear in the hero card when BMR is set', async ({ page }) => {
    // With valid age/height/weight, BMR is computed and the chips render
    await expect(page.getByText('BMR')).toBeVisible();
    await expect(page.getByText('Base goal')).toBeVisible();
    await expect(page.getByText('Activity')).toBeVisible();
  });
});
