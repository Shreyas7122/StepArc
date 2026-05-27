# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: user-flows/input-validation.spec.js >> Input Validation — Workout Tab >> LOG EXERCISE is blocked with an empty sets field
- Location: tests/user-flows/input-validation.spec.js:76:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[role="listbox"]').locator('div').first()

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic: ARC
      - button "Toggle user profile and settings menu" [ref=e6] [cursor=pointer]:
        - img [ref=e7]
      - generic [ref=e10]: FRIDAY, MAY 22
      - heading "STEPARC" [level=1] [ref=e11]
      - generic [ref=e12]: TRACK YOUR GAINS
    - tablist "Main Navigation" [ref=e13]:
      - tab "Today tab" [ref=e14] [cursor=pointer]:
        - img [ref=e15]
        - generic [ref=e20]: Today
      - tab "History tab" [ref=e21] [cursor=pointer]:
        - img [ref=e22]
        - generic [ref=e23]: History
      - tab "Nutrition tab" [ref=e24] [cursor=pointer]:
        - img [ref=e25]
        - generic [ref=e28]: Nutrition
      - tab "Training tab" [selected] [ref=e29] [cursor=pointer]:
        - img [ref=e30]
        - generic [ref=e36]: Training
      - tab "Logs tab" [ref=e37] [cursor=pointer]:
        - img [ref=e38]
        - generic [ref=e41]: Logs
    - main [ref=e42]:
      - generic [ref=e43]:
        - generic [ref=e44]:
          - generic [ref=e45]:
            - generic [ref=e46]:
              - generic [ref=e47]:
                - img [ref=e48]
                - text: 01 · QUICK LOG
              - generic [ref=e54]: Gym Routine
            - generic [ref=e55]: QUICK
          - generic [ref=e56]:
            - 'button "Monday: Back, Biceps & Abs" [ref=e57] [cursor=pointer]':
              - generic [ref=e58]: "Monday: Back, Biceps & Abs"
              - img [ref=e59]
            - 'button "Tuesday: Chest & Triceps" [ref=e61] [cursor=pointer]':
              - generic [ref=e62]: "Tuesday: Chest & Triceps"
              - img [ref=e63]
            - 'button "Wednesday: Legs (Quad) & Abs" [ref=e65] [cursor=pointer]':
              - generic [ref=e66]: "Wednesday: Legs (Quad) & Abs"
              - img [ref=e67]
            - 'button "Thursday: Shoulder, Traps & Abs" [ref=e69] [cursor=pointer]':
              - generic [ref=e70]: "Thursday: Shoulder, Traps & Abs"
              - img [ref=e71]
            - 'button "Friday: Chest & Back" [ref=e73] [cursor=pointer]':
              - generic [ref=e74]: "Friday: Chest & Back"
              - img [ref=e75]
            - 'button "Saturday: Legs (Ham) & Calves" [ref=e77] [cursor=pointer]':
              - generic [ref=e78]: "Saturday: Legs (Ham) & Calves"
              - img [ref=e79]
        - generic [ref=e83]: or log manually
        - generic [ref=e86]:
          - generic [ref=e87]:
            - img [ref=e88]
            - text: AI CARDIO
          - generic [ref=e91]: Log Cardio with AIAI
          - generic [ref=e92]:
            - textbox "e.g. '12 mins incline 10° 4.2 speed, 9 mins flat 4.0'" [ref=e93]
            - button "Submit cardio text for AI analysis" [disabled] [ref=e94]:
              - img [ref=e95]
        - generic [ref=e98]:
          - generic [ref=e99]:
            - generic [ref=e100]:
              - img [ref=e101]
              - text: 02 · SINGLE EXERCISE
            - generic [ref=e107]: Log Exercise
          - generic [ref=e108]:
            - generic [ref=e109]: Exercise
            - generic [ref=e111]:
              - img
              - textbox "Search exercise… e.g. incline" [active] [ref=e112]: Deadlift
          - generic [ref=e113]:
            - generic [ref=e114]: Number of Sets
            - spinbutton [ref=e115]
          - button "LOG EXERCISE" [ref=e116] [cursor=pointer]:
            - img [ref=e117]
            - text: LOG EXERCISE
        - generic [ref=e118]:
          - generic [ref=e119]:
            - generic [ref=e120]:
              - img [ref=e121]
              - text: 03 · DAILY STEPS
            - generic [ref=e124]: Step Count
          - generic [ref=e125]:
            - generic [ref=e126]: Total Steps Today
            - spinbutton [ref=e127]
          - button "UPDATE STEPS" [ref=e128] [cursor=pointer]:
            - img [ref=e129]
            - text: UPDATE STEPS
  - generic [ref=e132]:
    - generic [ref=e133] [cursor=pointer]:
      - generic [ref=e134]: Deadlift
      - generic [ref=e135]: ~18.3 kcal/set
    - generic [ref=e136] [cursor=pointer]:
      - generic [ref=e137]: Sumo Deadlift
      - generic [ref=e138]: ~18.3 kcal/set
    - generic [ref=e139] [cursor=pointer]:
      - generic [ref=e140]: Dumbbell Romanian Deadlift
      - generic [ref=e141]: ~13.3 kcal/set
    - generic [ref=e142] [cursor=pointer]:
      - generic [ref=e143]: Trap Bar Deadlift
      - generic [ref=e144]: ~18.3 kcal/set
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { setupApiMocks } from '../mocks/api-mocks.js';
  3   | import { setupAuthenticated } from '../helpers/setup-authenticated.js';
  4   | 
  5   | test.describe('Input Validation — Food Tab', () => {
  6   |   test.beforeEach(async ({ page }) => {
  7   |     await setupAuthenticated(page);
  8   |     await setupApiMocks(page);
  9   |     await page.goto('/');
  10  |     await page.waitForSelector('header h1', { timeout: 8000 });
  11  |     await page.getByRole('tab', { name: 'Nutrition tab' }).click();
  12  |     await page.waitForSelector('text=02 · FROM DATABASE', { timeout: 4000 });
  13  |   });
  14  | 
  15  |   test('ADD FOOD is blocked with an empty amount field', async ({ page }) => {
  16  |     // Select a food from the search dropdown
  17  |     await page.getByPlaceholder('Search food… e.g. oats').click();
  18  |     await page.getByPlaceholder('Search food… e.g. oats').fill('Banana');
  19  |     await page.locator('[role="listbox"]').locator('div').first().click();
  20  | 
  21  |     // Submit with no amount
  22  |     await page.getByRole('button', { name: /add food/i }).click();
  23  | 
  24  |     // Should stay on Food tab — no navigation to dashboard
  25  |     await expect(page.getByText('02 · FROM DATABASE')).toBeVisible();
  26  |     // Logs tab should still show empty state
  27  |     await page.getByRole('tab', { name: 'Logs tab' }).click();
  28  |     await page.waitForSelector('text=Food Log', { timeout: 3000 });
  29  |     await expect(page.getByText('No food logged yet.')).toBeVisible();
  30  |   });
  31  | 
  32  |   test('ADD FOOD is blocked when amount is 0', async ({ page }) => {
  33  |     await page.getByPlaceholder('Search food… e.g. oats').click();
  34  |     await page.getByPlaceholder('Search food… e.g. oats').fill('Oats');
  35  |     await page.locator('[role="listbox"]').locator('div').first().click();
  36  | 
  37  |     const amountInput = page.getByLabel('Amount (grams)');
  38  |     await amountInput.fill('0');
  39  |     await page.getByRole('button', { name: /add food/i }).click();
  40  | 
  41  |     await expect(page.getByText('02 · FROM DATABASE')).toBeVisible();
  42  |   });
  43  | 
  44  |   test('ADD FOOD is blocked with a negative amount', async ({ page }) => {
  45  |     await page.getByPlaceholder('Search food… e.g. oats').click();
  46  |     await page.getByPlaceholder('Search food… e.g. oats').fill('Banana');
  47  |     await page.locator('[role="listbox"]').locator('div').first().click();
  48  | 
  49  |     const amountInput = page.getByLabel('Amount (grams)');
  50  |     await amountInput.fill('-50');
  51  |     await page.getByRole('button', { name: /add food/i }).click();
  52  | 
  53  |     // Should stay on food tab
  54  |     await expect(page.getByText('02 · FROM DATABASE')).toBeVisible();
  55  |   });
  56  | 
  57  |   test('custom macro submit is blocked with a whitespace-only name', async ({ page }) => {
  58  |     await page.getByPlaceholder('e.g. Low Fat Paneer, Chicken Subji…').fill('   ');
  59  |     await page.getByPlaceholder('e.g. 180').fill('250');
  60  |     // The button has a JS `disabled` check: !customForm.name.trim() || !customForm.calories
  61  |     // Space-only name.trim() === '' → disabled
  62  |     await expect(page.getByRole('button', { name: /log custom food/i })).toBeDisabled();
  63  |   });
  64  | });
  65  | 
  66  | test.describe('Input Validation — Workout Tab', () => {
  67  |   test.beforeEach(async ({ page }) => {
  68  |     await setupAuthenticated(page);
  69  |     await setupApiMocks(page);
  70  |     await page.goto('/');
  71  |     await page.waitForSelector('header h1', { timeout: 8000 });
  72  |     await page.getByRole('tab', { name: 'Training tab' }).click();
  73  |     await page.waitForSelector('text=02 · SINGLE EXERCISE', { timeout: 4000 });
  74  |   });
  75  | 
  76  |   test('LOG EXERCISE is blocked with an empty sets field', async ({ page }) => {
  77  |     await page.getByPlaceholder('Search exercise… e.g. incline').click();
  78  |     await page.getByPlaceholder('Search exercise… e.g. incline').fill('Deadlift');
> 79  |     await page.locator('[role="listbox"]').locator('div').first().click();
      |                                                                   ^ Error: locator.click: Test timeout of 30000ms exceeded.
  80  | 
  81  |     // Submit without filling sets
  82  |     await page.getByRole('button', { name: /log exercise/i }).click();
  83  | 
  84  |     // Should remain on Training tab
  85  |     await expect(page.getByText('02 · SINGLE EXERCISE')).toBeVisible();
  86  |   });
  87  | 
  88  |   test('LOG EXERCISE is blocked when sets is 0', async ({ page }) => {
  89  |     await page.getByPlaceholder('Search exercise… e.g. incline').click();
  90  |     await page.getByPlaceholder('Search exercise… e.g. incline').fill('Squat');
  91  |     await page.locator('[role="listbox"]').locator('div').first().click();
  92  | 
  93  |     await page.getByPlaceholder('e.g. 4').fill('0');
  94  |     await page.getByRole('button', { name: /log exercise/i }).click();
  95  | 
  96  |     await expect(page.getByText('02 · SINGLE EXERCISE')).toBeVisible();
  97  |   });
  98  | 
  99  |   test('estimated calorie preview is only shown when sets > 0', async ({ page }) => {
  100 |     // No preview before entry
  101 |     await expect(page.getByText(/est. burn/i)).not.toBeVisible();
  102 | 
  103 |     await page.getByPlaceholder('Search exercise… e.g. incline').click();
  104 |     await page.getByPlaceholder('Search exercise… e.g. incline').fill('Deadlift');
  105 |     await page.locator('[role="listbox"]').locator('div').first().click();
  106 |     await page.getByPlaceholder('e.g. 4').fill('3');
  107 | 
  108 |     // Preview should now appear
  109 |     await expect(page.getByText(/est. burn/i)).toBeVisible();
  110 |   });
  111 | });
  112 | 
  113 | test.describe('Input Validation — Steps', () => {
  114 |   test.beforeEach(async ({ page }) => {
  115 |     await setupAuthenticated(page);
  116 |     await setupApiMocks(page);
  117 |     await page.goto('/');
  118 |     await page.waitForSelector('header h1', { timeout: 8000 });
  119 |     await page.getByRole('tab', { name: 'Training tab' }).click();
  120 |     await page.waitForSelector('text=03 · DAILY STEPS', { timeout: 4000 });
  121 |   });
  122 | 
  123 |   test('UPDATE STEPS is blocked with an empty steps field', async ({ page }) => {
  124 |     await page.getByRole('button', { name: /update steps/i }).click();
  125 |     // Stays on Training tab
  126 |     await expect(page.getByText('03 · DAILY STEPS')).toBeVisible();
  127 |   });
  128 | 
  129 |   test('calorie preview shows correctly for a typical step count', async ({ page }) => {
  130 |     await page.getByPlaceholder('e.g. 14000').fill('12000');
  131 |     // STEP_CALORIES_MULTIPLIER = 0.04 → 12000 * 0.04 = 480 kcal
  132 |     await expect(page.getByText('480 kcal')).toBeVisible();
  133 |   });
  134 | });
  135 | 
```