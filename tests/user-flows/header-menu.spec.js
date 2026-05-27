import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../mocks/api-mocks.js';
import { setupAuthenticated } from '../helpers/setup-authenticated.js';

test.describe('Header User Menu', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticated(page);
    await setupApiMocks(page);
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });
  });

  test('user menu button is visible in header', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Toggle user profile and settings menu' })).toBeVisible();
  });

  test('opens dropdown with Edit Profile and Sign Out on click', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle user profile and settings menu' }).click();

    await expect(page.getByRole('button', { name: /Edit Profile/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign Out/i })).toBeVisible();
  });

  test('Sign Out button is not clipped — it is fully visible and interactive', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle user profile and settings menu' }).click();

    const signOutBtn = page.getByRole('button', { name: /Sign Out/i });
    await expect(signOutBtn).toBeVisible();

    // Verify the button is within the viewport (not clipped off-screen)
    const box = await signOutBtn.boundingBox();
    expect(box).not.toBeNull();
    expect(box.y + box.height).toBeLessThan(await page.evaluate(() => window.innerHeight));
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
  });

  test('Sign Out button has sufficient touch target size (min 44px height)', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle user profile and settings menu' }).click();

    const signOutBtn = page.getByRole('button', { name: /Sign Out/i });
    const box = await signOutBtn.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  test('email is shown in the dropdown when signed in', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle user profile and settings menu' }).click();

    // The mock sets email to 'testathlete@steparc.com'
    await expect(page.getByText('testathlete@steparc.com')).toBeVisible();
  });

  test('clicking Edit Profile opens profile modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle user profile and settings menu' }).click();
    await page.getByRole('button', { name: /Edit Profile/i }).click();

    // Profile modal should appear
    await expect(page.getByText(/MY PROFILE/i)).toBeVisible();
  });

  test('dropdown closes when clicking the backdrop', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle user profile and settings menu' }).click();
    await expect(page.getByRole('button', { name: /Sign Out/i })).toBeVisible();

    // Click outside the dropdown (top-left corner away from the menu)
    await page.mouse.click(10, 300);
    await expect(page.getByRole('button', { name: /Sign Out/i })).toBeHidden();
  });

  test('dropdown closes when toggled again', async ({ page }) => {
    const menuBtn = page.getByRole('button', { name: 'Toggle user profile and settings menu' });
    await menuBtn.click();
    await expect(page.getByRole('button', { name: /Sign Out/i })).toBeVisible();

    await menuBtn.click();
    await expect(page.getByRole('button', { name: /Sign Out/i })).toBeHidden();
  });
});
