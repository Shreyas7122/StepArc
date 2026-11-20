import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../mocks/api-mocks.js';
import { setupAuthenticated } from '../helpers/setup-authenticated.js';

// The Training tab (aria-label "Training tab") houses the gym routine, single exercise
// log, AI cardio input, and daily steps. The cardio submit button is a Send icon with
// aria-label "Submit cardio text for AI analysis". Log button reads "LOG SESSION".

test.describe('Workout & Cardio Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });
    await page.getByRole('tab', { name: 'Training tab' }).click();
    await page.waitForSelector('text=Gym Routine', { timeout: 4000 });
  });

  test('should log a manual strength workout', async ({ page }) => {
    await page.waitForSelector('text=02 · SINGLE EXERCISE', { timeout: 4000 });

    // First item in exercise database is Deadlift — click to open, pick first
    await page.getByPlaceholder('Search exercise… e.g. incline').click();
    await page.waitForSelector('.search-option', { timeout: 4000 });
    await page.locator('.search-option').first().click({ force: true });

    await page.getByPlaceholder('e.g. 4').fill('3');
    await page.getByRole('button', { name: /log exercise/i }).click();

    // Verify it appears in the Logs tab
    await page.getByRole('tab', { name: 'Logs tab' }).click();
    await page.waitForSelector('text=Workout Log', { timeout: 4000 });
    await expect(page.getByText('Deadlift')).toBeVisible();
    await expect(page.getByText('3 sets')).toBeVisible();
  });

  test('should analyze cardio via AI and log it', async ({ page }) => {
    // CardioAIInput placeholder is the incline walk example
    const input = page.getByPlaceholder("e.g. '12 mins incline 10° 4.2 speed, 9 mins flat 4.0'");
    await expect(input).toBeVisible();
    await input.fill('walked on treadmill for 30 mins at speed 4.5');

    await page.getByRole('button', { name: /submit cardio text for ai analysis/i }).click();

    // Mock returns "Mocked AI Treadmill Cardio" with 312 kcal and 30 min duration
    await expect(page.getByText('Mocked AI Treadmill Cardio')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('312')).toBeVisible();
    // Duration renders as number + "min total" label in two separate divs
    await expect(page.getByText('30')).toBeVisible();
    await expect(page.getByText('min total')).toBeVisible();

    // Confirm log
    await page.getByRole('button', { name: /log session/i }).click();

    // Verify in Logs tab
    await page.getByRole('tab', { name: 'Logs tab' }).click();
    await page.waitForSelector('text=Cardio Log', { timeout: 4000 });
    await expect(page.getByText('Mocked AI Treadmill Cardio')).toBeVisible();
  });
});
