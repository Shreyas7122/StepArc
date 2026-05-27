import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/unit/**', '**/selenium/**'],
  // Run tests sequentially to avoid state collisions
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  // HTML reporter produces artifacts/playwright-report/index.html; list keeps terminal output
  reporter: [['html', { open: 'never', outputFolder: 'artifacts/playwright-report' }], ['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 480, height: 800 },
        deviceScaleFactor: 2,
        isMobile: true,
      },
    },
  ],
  // Programmatically spin up standard Vite server before testing
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
    timeout: 10 * 1000,
  },
});
