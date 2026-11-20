import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../mocks/api-mocks.js';
import { setupAuthenticated } from '../helpers/setup-authenticated.js';
import { calcBMR, calcGoalCalories } from '../../src/lib/calc.js';

// The api-mock returns: age 23, height_cm 175, weight_kg 75.5, (gender defaults to 'male',
// goal_type defaults to 'maintenance').
// Expected baseGoal = calcGoalCalories(calcBMR('male', 75.5, 175, 23), 'maintenance')
const MOCK_BMR        = calcBMR('male', 75.5, 175, 23);
const MAINTENANCE_CAL = calcGoalCalories(MOCK_BMR, 'maintenance');
const FAT_LOSS_CAL    = calcGoalCalories(MOCK_BMR, 'fat_loss');
const BULK_CAL        = calcGoalCalories(MOCK_BMR, 'bulk');

async function boot(page) {
  await setupAuthenticated(page);
  await setupApiMocks(page);
  await page.goto('/');
  await page.waitForSelector('header h1', { timeout: 8000 });
}

async function openProfile(page) {
  await page.click('button[aria-label="Toggle user profile and settings menu"]');
  await page.click('text=Edit Profile');
  await page.waitForSelector('text=MY PROFILE', { timeout: 3000 });
}

test.describe('Profile — BMR-Driven Goal Engine', () => {
  test('dashboard shows the correct computed baseGoal calories (no activity)', async ({ page }) => {
    await boot(page);
    // value-bump is the live calorie number (excludes aria-hidden ghost watermark)
    await expect(page.locator('.dashboard-hero .value-bump')).toHaveText(String(MAINTENANCE_CAL), { timeout: 3000 });
  });

  test('BMR breakdown chips are visible on the dashboard hero card', async ({ page }) => {
    await boot(page);
    await expect(page.getByText('BMR')).toBeVisible();
    await expect(page.getByText('Base goal')).toBeVisible();
    await expect(page.getByText('Activity')).toBeVisible();
  });

  test('fibre goal on dashboard equals adjustedGoal / 1000 * 14 (DRI formula)', async ({ page }) => {
    await boot(page);
    const expectedFibre = Math.round(MAINTENANCE_CAL / 1000 * 14);
    // The Fibre macro bar shows "X / Yg" — Y = goal
    await expect(page.getByText(`/ ${expectedFibre}g`)).toBeVisible();
  });

  test('changing goal_type to fat_loss in profile lowers the calorie goal', async ({ page }) => {
    await boot(page);
    await openProfile(page);

    // Select the fat_loss goal type by clicking the "Standard Cut" button
    await page.getByRole('button', { name: /Standard Cut/i }).click();
    await page.getByRole('button', { name: /save/i }).click();
    await page.waitForSelector('text=MY PROFILE', { state: 'detached', timeout: 4000 });

    await expect(page.locator('.value-bump')).toHaveText(String(FAT_LOSS_CAL), { timeout: 3000 });
  });

  test('changing goal_type to bulk in profile raises the calorie goal', async ({ page }) => {
    await boot(page);
    await openProfile(page);

    // Select the bulk goal type by clicking the "Standard Bulk" button
    await page.getByRole('button', { name: /Standard Bulk/i }).click();
    await page.getByRole('button', { name: /save/i }).click();
    await page.waitForSelector('text=MY PROFILE', { state: 'detached', timeout: 4000 });

    await expect(page.locator('.value-bump')).toHaveText(String(BULK_CAL), { timeout: 3000 });
  });

  test('updating weight in profile recalculates protein and fat macro goals', async ({ page }) => {
    await boot(page);
    await openProfile(page);

    // Change weight from 75.5kg to 90kg
    const weightInput = page.getByLabel(/weight/i);
    await weightInput.fill('90');
    await page.getByRole('button', { name: /save/i }).click();
    await page.waitForSelector('text=MY PROFILE', { state: 'detached', timeout: 4000 });

    // New protein goal = 2.2 * 90 = 198g; displayed on Dashboard macro bar
    await expect(page.getByText('/ 198g')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Profile Modal — Structural Checks', () => {
  test.beforeEach(async ({ page }) => {
    await boot(page);
  });

  test('profile modal opens and shows MY PROFILE heading', async ({ page }) => {
    await openProfile(page);
    await expect(page.getByText('MY PROFILE')).toBeVisible();
  });

  test('profile modal pre-fills age, height and weight from settings', async ({ page }) => {
    await openProfile(page);
    await expect(page.locator('input[aria-label="Age"]')).toHaveValue('23');
    await expect(page.locator('input[aria-label="Height"]')).toHaveValue('175');
    await expect(page.locator('input[aria-label="Weight"]')).toHaveValue('75.5');
  });

  test('closing the modal with Cancel does not navigate away from dashboard', async ({ page }) => {
    await openProfile(page);
    await page.getByRole('button', { name: /cancel/i }).click();
    await page.waitForSelector('text=MY PROFILE', { state: 'detached', timeout: 3000 });
    await expect(page.getByText('MACROS TODAY')).toBeVisible();
  });

  test('Diet Plan tab is accessible from within the profile modal', async ({ page }) => {
    await openProfile(page);
    await page.getByRole('button', { name: /diet plan/i }).click();
    await expect(page.getByRole('button', { name: /generate ai plan/i }).or(
      page.getByText(/pre-workout/i)
    )).toBeVisible({ timeout: 3000 });
  });

  test('Training Plan tab is accessible from within the profile modal', async ({ page }) => {
    await openProfile(page);
    // Tab button label is "Training" not "Training Plan"
    await page.getByRole('button', { name: /^training$/i }).click();
    await expect(page.getByText(/ai generate plan/i).or(
      page.getByText(/monday/i).or(page.getByText(/gym/i))
    )).toBeVisible({ timeout: 3000 });
  });
});
