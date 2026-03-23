import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/user.json');

/**
 * This setup file captures authentication state.
 *
 * To use:
 * 1. Run: npx playwright test auth.setup --headed
 * 2. Log in manually in the browser that opens
 * 3. Once logged in and on the /trips page, the test will save your auth state
 * 4. Future tests will use this saved state automatically
 */
setup('authenticate', async ({ page }) => {
  // Go to login page
  await page.goto('/login');

  // Wait for user to manually log in (OAuth or Magic Link)
  // The test will wait until the user is redirected to /trips
  console.log('\n========================================');
  console.log('Please log in manually in the browser.');
  console.log('The test will continue once you reach /trips');
  console.log('========================================\n');

  // Wait for successful login - user should be redirected to /trips
  await page.waitForURL('**/trips**', { timeout: 120000 }); // 2 minute timeout for manual login

  // Verify we're logged in
  await expect(page).toHaveURL(/.*trips.*/);

  // Save the authentication state
  await page.context().storageState({ path: authFile });

  console.log('\n========================================');
  console.log('Authentication state saved!');
  console.log('You can now run authenticated tests.');
  console.log('========================================\n');
});
