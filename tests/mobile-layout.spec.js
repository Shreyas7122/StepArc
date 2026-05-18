import { test, expect } from '@playwright/test';
import { setupApiMocks } from './mocks/api-mocks.js';

test.describe('Mobile Viewport & Layout Integrity Suite', () => {
  // Lock the test strictly to the smallest common modern mobile viewport width
  test.use({
    viewport: { width: 320, height: 568 }, // e.g., iPhone SE / very narrow Androids
  });

  test.beforeEach(async ({ page }) => {
    // Inject mock session into localStorage to bypass Auth screen
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'sb-zskwpeheleppobhqpbpn-auth-token',
        JSON.stringify({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user: { id: 'mocked-user-id-12345', aud: 'authenticated', email: 'test@example.com' },
        })
      );
    });

    // Virtualize all backend endpoints
    await setupApiMocks(page);
  });

  test('Layout does not spawn horizontal scrollbars (Global X-Axis Lock)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    // The document's scrollable width must not exceed the viewport window width
    expect(scrollWidth, `Document scrollWidth (${scrollWidth}px) exceeds clientWidth (${clientWidth}px) — horizontal scrollbar exists!`).toBeLessThanOrEqual(clientWidth);
  });

  test('Header STEPARC title scales dynamically and stays inside bounds', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });

    const h1Box = await page.locator('header h1').boundingBox();
    const viewportWidth = page.viewportSize().width;

    // Ensure the title doesn't break out of the 320px screen width bounds
    expect(h1Box.width, `Title width (${h1Box.width}px) is too wide for ${viewportWidth}px screen`).toBeLessThan(viewportWidth);
    
    // Ensure the right edge of the text is inside the viewport
    expect(h1Box.x + h1Box.width).toBeLessThanOrEqual(viewportWidth);
  });

  test('User Profile Dropdown fits within viewport and is not clipped', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });

    // Open User menu
    await page.click('button[aria-label="Toggle user profile and settings menu"]');
    await page.waitForSelector('text=Edit Profile', { timeout: 3000 });

    // Grab the dropdown menu container
    const dropdownBox = await page.locator('text=Signed in as').locator('..').boundingBox();
    const viewportWidth = page.viewportSize().width;

    // Verify it is fully inside the right edge of the screen
    expect(dropdownBox.x + dropdownBox.width, 'Dropdown menu overflows the right side of the screen').toBeLessThanOrEqual(viewportWidth);
    
    // Verify it is positioned below the absolute top edge (respecting safe area insets offset)
    expect(dropdownBox.y, 'Dropdown menu is clipping through the top of the screen/status bar').toBeGreaterThan(0);
  });

  test('Diet Plan Modal items stay within 320px viewport without overflowing', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header h1', { timeout: 8000 });

    // Open profile modal
    await page.click('button[aria-label="Toggle user profile and settings menu"]');
    await page.click('text=Edit Profile');
    await page.waitForSelector('text=MY PROFILE', { timeout: 3000 });

    // Go to Diet Plan tab
    await page.click('button:has-text("Diet Plan")');
    await page.waitForSelector('text=Add Meal', { timeout: 3000 });
    
    // Measure modal container width
    const modalBox = await page.locator('text=MY PROFILE').locator('..').boundingBox();
    const viewportWidth = page.viewportSize().width;
    
    // Verify modal does not force the screen to horizontally scroll
    expect(modalBox.width).toBeLessThanOrEqual(viewportWidth);
  });
});
