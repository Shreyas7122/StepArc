# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: user-flows/dashboard-navigation.spec.js >> Dashboard & Core Navigation Flow >> should render header with correct title
- Location: tests/user-flows/dashboard-navigation.spec.js:10:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('header').getByText('TRACK YOUR GAINS')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('header').getByText('TRACK YOUR GAINS')

```

```yaml
- heading "STEPARC" [level=1]
- text: TRACK YOUR GAINS
- button "Log In"
- button "Sign Up"
- textbox "Email address"
- textbox "Password (min 6 chars)"
- button
- button "LOG IN"
- text: Your data syncs across devices · Powered by Supabase
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { setupApiMocks } from '../mocks/api-mocks.js';
  3  | 
  4  | test.describe('Dashboard & Core Navigation Flow', () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await setupApiMocks(page);
  7  |     await page.goto('/');
  8  |   });
  9  | 
  10 |   test('should render header with correct title', async ({ page }) => {
  11 |     await expect(page.locator('h1')).toHaveText('STEPARC');
> 12 |     await expect(page.locator('header').getByText('TRACK YOUR GAINS')).toBeVisible();
     |                                                                        ^ Error: expect(locator).toBeVisible() failed
  13 |   });
  14 | 
  15 |   test('should navigate between tabs correctly', async ({ page }) => {
  16 |     // Default tab is Dashboard
  17 |     await expect(page.getByText('MACROS TODAY')).toBeVisible();
  18 | 
  19 |     // Click Food Tab
  20 |     await page.getByRole('tab', { name: 'Food' }).click();
  21 |     await expect(page.getByPlaceholder('What did you eat?')).toBeVisible();
  22 | 
  23 |     // Click Workout Tab
  24 |     await page.getByRole('tab', { name: 'Workout' }).click();
  25 |     await expect(page.getByPlaceholder('What did you do?')).toBeVisible();
  26 | 
  27 |     // Go back to Dashboard
  28 |     await page.getByRole('tab', { name: 'Dashboard' }).click();
  29 |     await expect(page.getByText('MACROS TODAY')).toBeVisible();
  30 |   });
  31 | 
  32 |   test('should open and close the User Profile Modal from the header', async ({ page }) => {
  33 |     // Click the profile area in the header (which is a button)
  34 |     await page.locator('header button').first().click();
  35 |     
  36 |     // Modal should appear
  37 |     await expect(page.getByRole('heading', { name: 'User Profile' })).toBeVisible();
  38 |     
  39 |     // Check if the mock data is populated
  40 |     await expect(page.getByDisplayValue('23')).toBeVisible(); // Age
  41 |     await expect(page.getByDisplayValue('175')).toBeVisible(); // Height
  42 | 
  43 |     // Close the modal
  44 |     await page.getByRole('button', { name: 'Close profile' }).click();
  45 |     await expect(page.getByRole('heading', { name: 'User Profile' })).toBeHidden();
  46 |   });
  47 | 
  48 |   test('should render horizontal progress bars', async ({ page }) => {
  49 |     // There are 3 macro horizontal progress bars plus 1 main calorie bar in the dashboard
  50 |     await expect(page.getByText('PROTEIN')).toBeVisible();
  51 |     await expect(page.getByText('CARBS')).toBeVisible();
  52 |     await expect(page.getByText('FATS')).toBeVisible();
  53 |   });
  54 | });
  55 | 
```