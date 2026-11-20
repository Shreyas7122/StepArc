import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../mocks/api-mocks.js';
import { setupAuthenticated } from '../helpers/setup-authenticated.js';

// fixedMeals[0] = "Meal 1: Pre-Workout (9:15 AM)"  → items: Whole Egg (Raw) 100g, Banana (Raw) 150g
// fixedMeals[1] = "Meal 2: Post-Workout (12:30 PM)"

test.describe('Quick Log → DraftMealReview → Confirm Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });
    await page.getByRole('tab', { name: 'Nutrition tab' }).click();
    await page.waitForSelector('text=01 · QUICK LOG', { timeout: 4000 });
  });

  // ── Opening the draft review ────────────────────────────────────────────────

  test('clicking a quick meal button opens DraftMealReview', async ({ page }) => {
    await page.getByText('Meal 1: Pre-Workout (9:15 AM)').click();
    await expect(page.getByText('REVIEW MEAL')).toBeVisible({ timeout: 3000 });
  });

  test('DraftMealReview shows the correct meal name', async ({ page }) => {
    await page.getByText('Meal 1: Pre-Workout (9:15 AM)').click();
    await expect(page.getByText('Meal 1: Pre-Workout (9:15 AM)').nth(1).or(
      page.locator('div').filter({ hasText: /Pre-Workout/ }).nth(1)
    )).toBeVisible({ timeout: 3000 });
  });

  test('DraftMealReview shows all food items from the meal', async ({ page }) => {
    await page.getByText('Meal 1: Pre-Workout (9:15 AM)').click();
    await page.waitForSelector('text=REVIEW MEAL', { timeout: 3000 });

    await expect(page.getByText('Whole Egg (Raw)')).toBeVisible();
    await expect(page.getByText('Banana (Raw)')).toBeVisible();
  });

  // ── Amount editing ──────────────────────────────────────────────────────────

  test('can change the amount of a draft item', async ({ page }) => {
    await page.getByText('Meal 1: Pre-Workout (9:15 AM)').click();
    await page.waitForSelector('text=REVIEW MEAL', { timeout: 3000 });

    // The first amount input corresponds to Whole Egg (Raw), default 100g
    const firstAmountInput = page.locator('input[type="number"]').first();
    await firstAmountInput.fill('150');
    await expect(firstAmountInput).toHaveValue('150');
  });

  // ── Removing items ──────────────────────────────────────────────────────────

  test('can remove a food item from the draft', async ({ page }) => {
    await page.getByText('Meal 1: Pre-Workout (9:15 AM)').click();
    await page.waitForSelector('text=REVIEW MEAL', { timeout: 3000 });

    // Each item row has an aria-label="Remove item" button
    await page.getByRole('button', { name: 'Remove item' }).first().click();

    // One fewer row
    await expect(page.getByText('Whole Egg (Raw)')).not.toBeVisible({ timeout: 2000 });
  });

  // ── Adding extra items ──────────────────────────────────────────────────────

  test('can add an extra food item to the draft', async ({ page }) => {
    await page.getByText('Meal 1: Pre-Workout (9:15 AM)').click();
    await page.waitForSelector('text=Add Extra Item', { timeout: 3000 });

    // Type in the extra-item search box and pick the first match
    // Open extra-item search and pick first food from initial dropdown
    await page.getByPlaceholder('Search food… e.g. paneer').click();
    await page.waitForSelector('.search-option', { timeout: 4000 });
    await page.locator('.search-option').first().click({ force: true });

    // Fill amount
    await page.getByPlaceholder('grams').fill('60');
    // Click the + button inside the add-item form
    await page.locator('form').last().getByRole('button').click();

    // The Oats item should now appear
    await expect(page.getByText('Oats (Dry/Raw)')).toBeVisible({ timeout: 3000 });
  });

  // ── Confirm ─────────────────────────────────────────────────────────────────

  test('confirming the meal logs calories and shows on dashboard', async ({ page }) => {
    await page.getByText('Meal 1: Pre-Workout (9:15 AM)').click();
    await page.waitForSelector('text=REVIEW MEAL', { timeout: 3000 });

    await page.getByRole('button', { name: 'Confirm and log meal' }).click();

    // Manually navigate to the Today/Dashboard tab after logging
    await page.getByRole('tab', { name: 'Today tab' }).click();

    // Should be on Dashboard
    await expect(page.getByText('CALORIES LEFT').or(page.getByText('OVER GOAL'))).toBeVisible({ timeout: 3000 });
    // CONSUMED should be non-zero (Egg 100g + Banana 150g ≈ 277 kcal)
    // The calorie number is the second div child of the consumed glass-card (first is the header row)
    const consumedSection = page.locator('text=kcal eaten').locator('..');
    const calText = await consumedSection.locator('div').nth(1).textContent();
    expect(parseInt(calText ?? '0')).toBeGreaterThan(0);
  });

  // ── Cancel ──────────────────────────────────────────────────────────────────

  test('cancelling the draft returns to FoodTab without logging anything', async ({ page }) => {
    await page.getByText('Meal 1: Pre-Workout (9:15 AM)').click();
    await page.waitForSelector('text=REVIEW MEAL', { timeout: 3000 });

    // Cancel via the aria-labelled cancel button in the DraftMealReview header
    await page.getByRole('button', { name: 'Cancel draft' }).click();

    // DraftMealReview should be gone; FoodTab's quick-log section should be back
    await expect(page.getByText('01 · QUICK LOG')).toBeVisible({ timeout: 3000 });

    // Navigate to logs — should be empty
    await page.getByRole('tab', { name: 'Logs tab' }).click();
    await page.waitForSelector('text=Food Log', { timeout: 3000 });
    await expect(page.getByText('No food logged yet.')).toBeVisible();
  });
});

// ── Quick Workout Log → DraftWorkoutReview → Confirm ─────────────────────────

test.describe('Quick Log → DraftWorkoutReview → Confirm Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });
    await page.getByRole('tab', { name: 'Training tab' }).click();
    await page.waitForSelector('text=Gym Routine', { timeout: 4000 });
  });

  test('clicking a quick workout opens DraftWorkoutReview', async ({ page }) => {
    await page.getByText('Monday: Back, Biceps & Abs').click();
    await expect(page.getByText('REVIEW WORKOUT')).toBeVisible({ timeout: 3000 });
  });

  test('DraftWorkoutReview lists all exercises from the day', async ({ page }) => {
    await page.getByText('Monday: Back, Biceps & Abs').click();
    await page.waitForSelector('text=REVIEW WORKOUT', { timeout: 3000 });

    await expect(page.getByText('Deadlift')).toBeVisible();
    await expect(page.getByText('Lat Pull Down')).toBeVisible();
  });

  test('confirming workout logs sets and shows on dashboard', async ({ page }) => {
    await page.getByText('Monday: Back, Biceps & Abs').click();
    await page.waitForSelector('text=REVIEW WORKOUT', { timeout: 3000 });

    await page.getByRole('button', { name: 'Confirm and log workout' }).click();

    // Manually navigate to the Today/Dashboard tab after logging
    await page.getByRole('tab', { name: 'Today tab' }).click();

    await expect(page.getByText('CALORIES LEFT').or(page.getByText('OVER GOAL'))).toBeVisible({ timeout: 3000 });
    // BURNED should be non-zero
    // The calorie number is the second div child of the burned glass-card
    const burnedSection = page.locator('text=kcal active').locator('..');
    const burnText = await burnedSection.locator('div').nth(1).textContent();
    expect(parseInt(burnText ?? '0')).toBeGreaterThan(0);
  });

  test('cancelling returns to WorkoutTab without logging', async ({ page }) => {
    await page.getByText('Monday: Back, Biceps & Abs').click();
    await page.waitForSelector('text=REVIEW WORKOUT', { timeout: 3000 });

    // Cancel via the aria-labelled cancel button
    await page.getByRole('button', { name: 'Cancel draft' }).click();

    await expect(page.getByText('Gym Routine')).toBeVisible({ timeout: 3000 });
  });
});
