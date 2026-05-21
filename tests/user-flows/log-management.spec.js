import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../mocks/api-mocks.js';
import { setupAuthenticated } from '../helpers/setup-authenticated.js';

// Shared helper: log a custom food entry from the Nutrition tab
async function logCustomFood(page, name, calories, protein = '0', fibre = '0') {
  await page.getByRole('tab', { name: 'Nutrition tab' }).click();
  await page.waitForSelector('text=03 · CUSTOM ENTRY', { timeout: 4000 });
  await page.getByPlaceholder('e.g. Low Fat Paneer, Chicken Subji…').fill(name);
  await page.getByPlaceholder('e.g. 180').fill(String(calories));
  if (protein !== '0') await page.getByPlaceholder('e.g. 20').fill(protein);
  if (fibre !== '0')   await page.getByPlaceholder('e.g. 0').fill(fibre);
  await page.getByRole('button', { name: /log custom food/i }).click();
  // Returns to dashboard; navigate caller to Logs
  await page.getByRole('tab', { name: 'Logs tab' }).click();
  await page.waitForSelector('text=Food Log', { timeout: 4000 });
}

// Shared helper: log a workout from the Training tab
async function logWorkout(page, sets = '3') {
  await page.getByRole('tab', { name: 'Training tab' }).click();
  await page.waitForSelector('text=02 · SINGLE EXERCISE', { timeout: 4000 });
  await page.getByPlaceholder('Search exercise… e.g. incline').click();
  await page.getByPlaceholder('Search exercise… e.g. incline').fill('Deadlift');
  await page.locator('[role="listbox"]').locator('div').first().click();
  await page.getByPlaceholder('e.g. 4').fill(sets);
  await page.getByRole('button', { name: /log exercise/i }).click();
  await page.getByRole('tab', { name: 'Logs tab' }).click();
  await page.waitForSelector('text=Workout Log', { timeout: 4000 });
}

test.describe('Log Management — Food Logs', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });
  });

  test('empty state shows "No food logged yet." when no food is logged', async ({ page }) => {
    await page.getByRole('tab', { name: 'Logs tab' }).click();
    await page.waitForSelector('text=Food Log', { timeout: 4000 });
    await expect(page.getByText('No food logged yet.')).toBeVisible();
  });

  test('a logged food entry is visible in the food log list', async ({ page }) => {
    await logCustomFood(page, 'Grilled Paneer', 180);
    await expect(page.getByText('Grilled Paneer')).toBeVisible();
  });

  test('deleting a food log removes it from the list', async ({ page }) => {
    await logCustomFood(page, 'Delete Me Food', 100);
    await expect(page.getByText('Delete Me Food')).toBeVisible();

    // AI logs don't have an edit button — only a delete (red ×) button
    const logRow = page.locator('div').filter({ hasText: 'Delete Me Food' }).last();
    await logRow.getByRole('button').last().click();

    await expect(page.getByText('Delete Me Food')).not.toBeVisible({ timeout: 2000 });
  });

  test('deleting the only food log shows the empty state message', async ({ page }) => {
    await logCustomFood(page, 'Solo Food', 200);
    const logRow = page.locator('div').filter({ hasText: 'Solo Food' }).last();
    await logRow.getByRole('button').last().click();

    await expect(page.getByText('No food logged yet.')).toBeVisible({ timeout: 3000 });
  });

  test('multiple food entries all appear in the list', async ({ page }) => {
    await logCustomFood(page, 'First Meal', 300);
    await page.getByRole('tab', { name: 'Nutrition tab' }).click();
    await page.waitForSelector('text=03 · CUSTOM ENTRY', { timeout: 4000 });
    await page.getByPlaceholder('e.g. Low Fat Paneer, Chicken Subji…').fill('Second Meal');
    await page.getByPlaceholder('e.g. 180').fill('250');
    await page.getByRole('button', { name: /log custom food/i }).click();
    await page.getByRole('tab', { name: 'Logs tab' }).click();
    await page.waitForSelector('text=Food Log', { timeout: 4000 });

    await expect(page.getByText('First Meal')).toBeVisible();
    await expect(page.getByText('Second Meal')).toBeVisible();
  });
});

test.describe('Log Management — Workout Logs', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });
  });

  test('empty state shows "No workout logged yet." before any workout', async ({ page }) => {
    await page.getByRole('tab', { name: 'Logs tab' }).click();
    await page.waitForSelector('text=Workout Log', { timeout: 4000 });
    await expect(page.getByText('No workout logged yet.')).toBeVisible();
  });

  test('a logged workout appears with its set count', async ({ page }) => {
    await logWorkout(page, '4');
    await expect(page.getByText('Deadlift')).toBeVisible();
    await expect(page.getByText('4 sets')).toBeVisible();
  });

  test('editing a workout log updates the set count displayed', async ({ page }) => {
    await logWorkout(page, '3');
    await expect(page.getByText('3 sets')).toBeVisible();

    // Click the edit (pencil) button
    const workoutRow = page.locator('div').filter({ hasText: 'Deadlift' }).last();
    const editBtn = workoutRow.locator('button').nth(0); // first button = edit (pencil)
    await editBtn.click();

    // Inline number input appears — change from 3 to 5
    const setsInput = workoutRow.locator('input[type="number"]');
    await setsInput.fill('5');
    // Confirm (check icon)
    await workoutRow.locator('button').filter({ has: page.locator('svg.lucide-check') }).click();

    await expect(page.getByText('5 sets')).toBeVisible({ timeout: 2000 });
    await expect(page.getByText('3 sets')).not.toBeVisible({ timeout: 2000 });
  });

  test('deleting a workout log removes it from the list', async ({ page }) => {
    await logWorkout(page, '3');
    await expect(page.getByText('Deadlift')).toBeVisible();

    const workoutRow = page.locator('div').filter({ hasText: 'Deadlift' }).last();
    // Last button in row = red delete ×
    await workoutRow.getByRole('button').last().click();

    await expect(page.getByText('Deadlift')).not.toBeVisible({ timeout: 2000 });
    await expect(page.getByText('No workout logged yet.')).toBeVisible({ timeout: 2000 });
  });
});

test.describe('Log Management — Cardio Logs', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });
  });

  test('empty state shows "No cardio logged yet." before any cardio', async ({ page }) => {
    await page.getByRole('tab', { name: 'Logs tab' }).click();
    await page.waitForSelector('text=Cardio Log', { timeout: 4000 });
    await expect(page.getByText('No cardio logged yet.')).toBeVisible();
  });

  test('a logged cardio entry is visible with its duration and calories', async ({ page }) => {
    // Log via AI cardio route (mocked)
    await page.getByRole('tab', { name: 'Training tab' }).click();
    await page.waitForSelector('text=Gym Routine', { timeout: 4000 });

    const cardioInput = page.getByPlaceholder(/what did you do|walked|ran/i).first();
    await cardioInput.fill('walked on treadmill 30 mins');
    await page.getByRole('button', { name: /analyze cardio/i }).click();
    // Mock returns "Mocked AI Treadmill Cardio" — confirm it
    await expect(page.getByText('Mocked AI Treadmill Cardio')).toBeVisible({ timeout: 4000 });
    await page.getByRole('button', { name: /log cardio/i }).click();

    await page.getByRole('tab', { name: 'Logs tab' }).click();
    await page.waitForSelector('text=Cardio Log', { timeout: 4000 });
    await expect(page.getByText('Mocked AI Treadmill Cardio')).toBeVisible();
    await expect(page.getByText('30 min')).toBeVisible();
  });

  test('deleting a cardio log removes it', async ({ page }) => {
    // Log cardio first
    await page.getByRole('tab', { name: 'Training tab' }).click();
    await page.waitForSelector('text=Gym Routine', { timeout: 4000 });
    const cardioInput = page.getByPlaceholder(/what did you do|walked|ran/i).first();
    await cardioInput.fill('run 5km');
    await page.getByRole('button', { name: /analyze cardio/i }).click();
    await expect(page.getByText('Mocked AI Treadmill Cardio')).toBeVisible({ timeout: 4000 });
    await page.getByRole('button', { name: /log cardio/i }).click();

    await page.getByRole('tab', { name: 'Logs tab' }).click();
    await page.waitForSelector('text=Cardio Log', { timeout: 4000 });
    await expect(page.getByText('Mocked AI Treadmill Cardio')).toBeVisible();

    const cardioRow = page.locator('div').filter({ hasText: 'Mocked AI Treadmill Cardio' }).last();
    await cardioRow.getByRole('button').last().click();

    await expect(page.getByText('Mocked AI Treadmill Cardio')).not.toBeVisible({ timeout: 2000 });
    await expect(page.getByText('No cardio logged yet.')).toBeVisible({ timeout: 2000 });
  });
});
