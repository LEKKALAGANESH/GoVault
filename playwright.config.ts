import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.auth/user.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'on',
  },
  projects: [
    // Auth setup - run first to capture credentials
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      timeout: 180000, // 3 minute timeout for manual login
      use: { ...devices['Desktop Chrome'] },
    },
    // Unauthenticated tests (landing, login pages)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: [/auth\.setup\.ts/, /\.authenticated\./],
    },
    // Authenticated tests - uses saved auth state (run 'setup' first if auth expired)
    {
      name: 'chromium-authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
      testMatch: /.*\.authenticated\.(spec|test)\.ts/,
    },
  ],
  // Comment out webServer when running manually (server already running)
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
