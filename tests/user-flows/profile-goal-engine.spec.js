import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../mocks/api-mocks.js';
import { setupAuthenticated } from '../helpers/setup-authenticated.js';
import { calcBMR, calcGoalCalories } from '../../src/calc.js';

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
    // With no workouts/cardio/steps, adjustedGoal = baseGoal = MAINTENANCE_CAL
    await expect(page.getByText(String(MAINTENANCE_CAL))).toBeVisible({ timeout: 3000 });
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

    // Select the fat_loss goal type
    await page.getByLabel(/goal type/i).selectOption('fat_loss');
    await page.getByRole('button', { name: /save/i }).click();
    await page.waitForSelector('text=MY PROFILE', { state: 'detached', timeout: 4000 });

    // Dashboard should now display a lower calorie target
    await expect(page.getByText(String(FAT_LOSS_CAL))).toBeVisible({ timeout: 3000 });
  });

  test('changing goal_type to bulk in profile raises the calorie goal', async ({ page }) => {
    await boot(page);
    await openProfile(page);

    await page.getByLabel(/goal type/i).selectOption('bulk');
    await page.getByRole('button', { name: /save/i }).click();
    await page.waitForSelector('text=MY PROFILE', { state: 'detached', timeout: 4000 });

    await expect(page.getByText(String(BULK_CAL))).toBeVisible({ timeout: 3000 });
  });

  test('updating weight in profile recalculates protein and fat macro goals', async ({ page }) => {
    await boot(page);
    await openProfile(page);

    // Change weight from 75.5kg to 90kg
    const weightInput = page.getByLabel(/weight/i);
    await weightInput.fill('90');
    await page.getByRole('button', { name: /save/i }).click();
    await page.waitForSelector('text=MY PROFILE', { state: 'detached', timeout: 4000 });

    // New protein goal = 2 * 90 = 180g; displayed on Dashboard macro bar
    await expect(page.getByText('/ 180g')).toBeVisible({ timeout: 3000 });
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
    await expect(page.getByDisplayValue('23')).toBeVisible();   // age
    await expect(page.getByDisplayValue('175')).toBeVisible();  // height_cm
    await expect(page.getByDisplayValue('75.5')).toBeVisible(); // weight_kg
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
    await page.getByRole('button', { name: /training plan/i }).click();
    await expect(page.getByRole('button', { name: /generate ai plan/i }).or(
      page.getByText(/monday/i).or(page.getByText(/gym/i))
    )).toBeVisible({ timeout: 3000 });
  });
});
