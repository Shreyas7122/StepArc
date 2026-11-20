import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../mocks/api-mocks.js';
import { setupAuthenticated } from '../helpers/setup-authenticated.js';

// Profile modal opens via the header avatar → Edit Profile dropdown item.
// The modal heading is "MY PROFILE" (not "User Profile").
// AIAdvisor lives on the Dashboard tab — the button text is "ASK GEMINI".
// The response panel is dismissible via its close (X) button.

test.describe('User Profile & AI Advisor Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });
  });

  test('should open the profile modal and show MY PROFILE heading', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle user profile and settings menu' }).click();
    await page.getByRole('button', { name: /Edit Profile/i }).click();

    await expect(page.getByText('MY PROFILE')).toBeVisible({ timeout: 3000 });
  });

  test('should pre-fill body stats from mock settings', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle user profile and settings menu' }).click();
    await page.getByRole('button', { name: /Edit Profile/i }).click();
    await page.waitForSelector('text=MY PROFILE', { timeout: 3000 });

    // Mock returns age 23, height_cm 175, weight_kg 75.5 (inputs have aria-label from Field component)
    await expect(page.locator('input[aria-label="Age"]')).toHaveValue('23');
    await expect(page.locator('input[aria-label="Height"]')).toHaveValue('175');
    await expect(page.locator('input[aria-label="Weight"]')).toHaveValue('75.5');
  });

  test('should close the profile modal with Cancel', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle user profile and settings menu' }).click();
    await page.getByRole('button', { name: /Edit Profile/i }).click();
    await page.waitForSelector('text=MY PROFILE', { timeout: 3000 });

    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByText('MY PROFILE')).toBeHidden({ timeout: 3000 });
    await expect(page.getByText('MACROS TODAY')).toBeVisible();
  });

  test('should navigate to the Diet Plan sub-tab inside the profile modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle user profile and settings menu' }).click();
    await page.getByRole('button', { name: /Edit Profile/i }).click();
    await page.waitForSelector('text=MY PROFILE', { timeout: 3000 });

    await page.getByRole('button', { name: /^diet plan$/i }).click();
    // Both "AI Generate Plan" button and meal slot headers exist simultaneously — just verify one
    await expect(
      page.getByText(/ai generate plan/i).or(page.getByText(/pre-workout/i)).first()
    ).toBeVisible({ timeout: 3000 });
  });

  test('should navigate to the Training Plan sub-tab inside the profile modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle user profile and settings menu' }).click();
    await page.getByRole('button', { name: /Edit Profile/i }).click();
    await page.waitForSelector('text=MY PROFILE', { timeout: 3000 });

    // Tab label is "Training" not "Training Plan"
    await page.getByRole('button', { name: /^training$/i }).click();
    await expect(
      page.getByText(/ai generate plan/i)
        .or(page.getByText(/monday/i))
        .or(page.getByText(/gym/i))
    ).toBeVisible({ timeout: 3000 });
  });

  test('should open AI Advisor and display insights', async ({ page }) => {
    // AIAdvisor is on the Dashboard (Today) tab — the button renders "ASK GEMINI"
    const advisorButton = page.getByRole('button', { name: /ask gemini/i });
    await expect(advisorButton).toBeVisible();

    await advisorButton.click();

    // Mock returns the tracking summary and recommendation text
    await expect(page.getByText(/tracking beautifully today/i)).toBeVisible({ timeout: 5000 });

    // Dismiss via the aria-labelled close button
    await page.getByRole('button', { name: 'Close AI advice' }).click();
    await expect(page.getByText(/tracking beautifully today/i)).not.toBeVisible({ timeout: 3000 });
  });
});
