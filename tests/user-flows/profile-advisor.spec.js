import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../mocks/api-mocks.js';

test.describe('User Profile & AI Advisor Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto('/');
  });

  test('should edit goals in profile and generate diet with AI', async ({ page }) => {
    // Open Profile
    await page.locator('header button').first().click();
    await expect(page.getByRole('heading', { name: 'User Profile' })).toBeVisible();

    // Verify initial values from mock
    const calGoal = page.getByDisplayValue('2870');
    await expect(calGoal).toBeVisible();

    // Edit calorie goal
    await calGoal.fill('3000');
    
    // Switch to Diet Plan tab in the modal
    await page.getByRole('button', { name: 'Diet Plan' }).click();

    // Setup an intercept specifically for the generate diet endpoint since it wasn't broadly mocked
    await page.route('**/recommend-diet', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          recommendation: {
            meals: [
              { name: "AI Breakfast", items: [] },
              { name: "AI Lunch", items: [] }
            ]
          }
        }),
      });
    });

    // Click Generate Diet with AI
    await page.getByRole('button', { name: /generate diet/i }).click();

    // Verify the AI breakfast meal was added
    await expect(page.locator('input[value="AI Breakfast"]')).toBeVisible();

    // Save Profile
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Should close and return to dashboard
    await expect(page.getByRole('heading', { name: 'User Profile' })).toBeHidden();
  });

  test('should open AI Advisor and display insights', async ({ page }) => {
    // The AI Advisor is a floating button on the bottom right of the Dashboard tab
    const advisorButton = page.locator('button').filter({ hasText: 'AI Coach' });
    await expect(advisorButton).toBeVisible();
    
    // Click the advisor button
    await advisorButton.click();

    // Verify the AI advice response renders (which is mocked in api-mocks.js)
    await expect(page.getByText('You are tracking beautifully today!')).toBeVisible();
    await expect(page.getByText('Suggest Meal 5')).toBeVisible();

    // Close the advisor
    await page.locator('.fixed.inset-0 button').first().click(); // Click the close 'X' or backdrop
  });
});
