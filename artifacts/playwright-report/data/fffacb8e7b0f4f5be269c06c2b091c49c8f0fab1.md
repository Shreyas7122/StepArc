# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: user-flows/profile-advisor.spec.js >> User Profile & AI Advisor Flow >> should edit goals in profile and generate diet with AI
- Location: tests/user-flows/profile-advisor.spec.js:10:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('header button').first()

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic: ARC
    - generic [ref=e5]:
      - img [ref=e7]
      - heading "STEPARC" [level=1] [ref=e9]
      - generic [ref=e10]: TRACK YOUR GAINS
  - generic [ref=e11]:
    - generic [ref=e12]:
      - button "Log In" [ref=e13] [cursor=pointer]
      - button "Sign Up" [ref=e14] [cursor=pointer]
    - generic [ref=e15]:
      - generic [ref=e16]:
        - generic:
          - img
        - textbox "Email address" [ref=e17]
      - generic [ref=e18]:
        - generic:
          - img
        - textbox "Password (min 6 chars)" [ref=e19]
        - button [ref=e20] [cursor=pointer]:
          - img [ref=e21]
      - button "LOG IN" [ref=e24] [cursor=pointer]:
        - img [ref=e25]
        - text: LOG IN
  - generic [ref=e28]: Your data syncs across devices · Powered by Supabase
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { setupApiMocks } from '../mocks/api-mocks.js';
  3  | 
  4  | test.describe('User Profile & AI Advisor Flow', () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await setupApiMocks(page);
  7  |     await page.goto('/');
  8  |   });
  9  | 
  10 |   test('should edit goals in profile and generate diet with AI', async ({ page }) => {
  11 |     // Open Profile
> 12 |     await page.locator('header button').first().click();
     |                                                 ^ Error: locator.click: Test timeout of 30000ms exceeded.
  13 |     await expect(page.getByRole('heading', { name: 'User Profile' })).toBeVisible();
  14 | 
  15 |     // Verify initial values from mock
  16 |     const calGoal = page.getByDisplayValue('2870');
  17 |     await expect(calGoal).toBeVisible();
  18 | 
  19 |     // Edit calorie goal
  20 |     await calGoal.fill('3000');
  21 |     
  22 |     // Switch to Diet Plan tab in the modal
  23 |     await page.getByRole('button', { name: 'Diet Plan' }).click();
  24 | 
  25 |     // Setup an intercept specifically for the generate diet endpoint since it wasn't broadly mocked
  26 |     await page.route('**/recommend-diet', async (route) => {
  27 |       await route.fulfill({
  28 |         status: 200,
  29 |         contentType: 'application/json',
  30 |         body: JSON.stringify({
  31 |           recommendation: {
  32 |             meals: [
  33 |               { name: "AI Breakfast", items: [] },
  34 |               { name: "AI Lunch", items: [] }
  35 |             ]
  36 |           }
  37 |         }),
  38 |       });
  39 |     });
  40 | 
  41 |     // Click Generate Diet with AI
  42 |     await page.getByRole('button', { name: /generate diet/i }).click();
  43 | 
  44 |     // Verify the AI breakfast meal was added
  45 |     await expect(page.locator('input[value="AI Breakfast"]')).toBeVisible();
  46 | 
  47 |     // Save Profile
  48 |     await page.getByRole('button', { name: 'Save Changes' }).click();
  49 |     
  50 |     // Should close and return to dashboard
  51 |     await expect(page.getByRole('heading', { name: 'User Profile' })).toBeHidden();
  52 |   });
  53 | 
  54 |   test('should open AI Advisor and display insights', async ({ page }) => {
  55 |     // The AI Advisor is a floating button on the bottom right of the Dashboard tab
  56 |     const advisorButton = page.locator('button').filter({ hasText: 'AI Coach' });
  57 |     await expect(advisorButton).toBeVisible();
  58 |     
  59 |     // Click the advisor button
  60 |     await advisorButton.click();
  61 | 
  62 |     // Verify the AI advice response renders (which is mocked in api-mocks.js)
  63 |     await expect(page.getByText('You are tracking beautifully today!')).toBeVisible();
  64 |     await expect(page.getByText('Suggest Meal 5')).toBeVisible();
  65 | 
  66 |     // Close the advisor
  67 |     await page.locator('.fixed.inset-0 button').first().click(); // Click the close 'X' or backdrop
  68 |   });
  69 | });
  70 | 
```