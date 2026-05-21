import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../mocks/api-mocks.js';
import { setupAuthenticated } from '../helpers/setup-authenticated.js';

// Helper: mount a fresh authenticated page with all base mocks active
async function boot(page) {
  await setupAuthenticated(page);
  await setupApiMocks(page);
  await page.goto('/');
  await page.waitForSelector('header h1', { timeout: 8000 });
}

test.describe('Error States — AI Advisor', () => {
  test('shows an error message when the AI advice endpoint returns a 500', async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);

    // Override the ai-advice route to return a server error
    await page.route('**/ai-advice', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal server error — Gemini quota exceeded' }),
      });
    });

    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });

    await page.getByRole('button', { name: /ask gemini/i }).click();

    // The component shows the server error detail string
    await expect(page.getByText(/gemini quota exceeded/i)).toBeVisible({ timeout: 5000 });
  });

  test('shows a connection error when the AI advice endpoint is unreachable', async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);

    // Abort the request to simulate a network failure
    await page.route('**/ai-advice', (route) => route.abort());

    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });

    await page.getByRole('button', { name: /ask gemini/i }).click();

    await expect(page.getByText(/cannot reach the ai server/i)).toBeVisible({ timeout: 5000 });
  });

  test('the ASK GEMINI button becomes re-enabled after an error', async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);
    await page.route('**/ai-advice', (route) => route.abort());

    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });

    await page.getByRole('button', { name: /ask gemini/i }).click();
    await expect(page.getByText(/cannot reach/i)).toBeVisible({ timeout: 5000 });

    // The button should not be stuck in a loading/disabled state
    await expect(page.getByRole('button', { name: /ask gemini/i })).toBeEnabled();
  });

  test('the result panel can be closed with the × button after an error', async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);
    await page.route('**/ai-advice', (route) => route.abort());

    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });

    await page.getByRole('button', { name: /ask gemini/i }).click();
    await expect(page.getByText(/cannot reach/i)).toBeVisible({ timeout: 5000 });

    // Close the result panel
    await page.locator('div').filter({ hasText: "Gemini's Advice" }).locator('button').last().click();
    await expect(page.getByText(/cannot reach/i)).not.toBeVisible({ timeout: 2000 });
  });
});

test.describe('Error States — AI Meal Analysis (AIInput)', () => {
  test('shows an error when the analyze-meal endpoint returns a 500', async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);

    await page.route('**/analyze-meal', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'AI model unavailable' }),
      });
    });

    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });

    // The AIInput component is on the Dashboard tab
    const aiInput = page.getByPlaceholder(/what did you eat/i);
    await aiInput.fill('3 boiled eggs and a banana');
    await page.getByRole('button', { name: /analyze meal/i }).click();

    await expect(page.getByText(/ai model unavailable|error|failed/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Error States — AI Cardio Analysis', () => {
  test('shows an error when the analyze-cardio endpoint returns a 500', async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);

    await page.route('**/analyze-cardio', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Cardio model error' }),
      });
    });

    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });
    await page.getByRole('tab', { name: 'Training tab' }).click();
    await page.waitForSelector('text=Gym Routine', { timeout: 4000 });

    const cardioInput = page.getByPlaceholder(/what did you do|walked|ran/i).first();
    await cardioInput.fill('ran 5km in 25 mins');
    await page.getByRole('button', { name: /analyze cardio/i }).click();

    await expect(page.getByText(/cardio model error|error|failed/i)).toBeVisible({ timeout: 5000 });
  });
});
