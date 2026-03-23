import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display hero section with GoVault branding', async ({ page }) => {
    await page.goto('/');

    // Check main heading
    await expect(page.locator('h1')).toContainText('GoVault');

    // Check tagline
    await expect(page.getByText('Your Smart Travel Companion')).toBeVisible();

    // Check CTA buttons (use first() since there are multiple)
    await expect(page.getByRole('link', { name: /Get Started Free/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /See How It Works/i })).toBeVisible();
  });

  test('should display features section', async ({ page }) => {
    await page.goto('/');

    // Scroll to features
    await page.locator('#features').scrollIntoViewIfNeeded();

    // Check feature cards exist
    await expect(page.getByRole('heading', { name: 'Centralized Booking Vault' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Real-Time Expense Tracker' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Fully Offline-Ready' })).toBeVisible();
  });

  test('should display family section with traveler badges', async ({ page }) => {
    await page.goto('/');

    // Scroll to family section
    await page.getByRole('heading', { name: /Built for.*Family.*Travel/i }).scrollIntoViewIfNeeded();

    // Check traveler badges exist
    await expect(page.getByText('You', { exact: true })).toBeVisible();
    await expect(page.getByText('Partner', { exact: true })).toBeVisible();
    await expect(page.getByText('Mom (67)', { exact: true })).toBeVisible();
    await expect(page.getByText('Baby (20mo)', { exact: true })).toBeVisible();
  });

  test('should navigate to login page when clicking Get Started', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /Get Started Free/i }).first().click();

    await expect(page).toHaveURL('/login');
  });
});
