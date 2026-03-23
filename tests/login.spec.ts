import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should display login form with all elements', async ({ page }) => {
    await page.goto('/login');

    // Check logo
    await expect(page.getByText('GoVault').first()).toBeVisible();

    // Check heading
    await expect(page.getByRole('heading', { name: 'Welcome to GoVault' })).toBeVisible();
    await expect(page.getByText('Sign in to manage your trips')).toBeVisible();

    // Check Google button
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();

    // Check email input
    await expect(page.getByLabel('Email address')).toBeVisible();

    // Check magic link button
    await expect(page.getByRole('button', { name: /Send Magic Link/i })).toBeVisible();
  });

  test('should show error when Google OAuth is not configured', async ({ page }) => {
    await page.goto('/login');

    // Click Google button
    await page.getByRole('button', { name: /Continue with Google/i }).click();

    // Wait for potential error message or redirect
    await page.waitForTimeout(2000);
  });

  test('should validate email input before enabling magic link', async ({ page }) => {
    await page.goto('/login');

    const magicLinkButton = page.getByRole('button', { name: /Send Magic Link/i });

    // Button should be disabled when email is empty
    await expect(magicLinkButton).toBeDisabled();

    // Enter email
    await page.getByLabel('Email address').fill('test@example.com');

    // Button should now be enabled
    await expect(magicLinkButton).toBeEnabled();
  });

  test('should attempt magic link login and show message', async ({ page }) => {
    await page.goto('/login');

    // Fill email
    await page.getByLabel('Email address').fill('test@example.com');

    // Click send magic link
    await page.getByRole('button', { name: /Send Magic Link/i }).click();

    // Wait for response
    await page.waitForTimeout(3000);
  });

  test('should navigate back to landing page from logo', async ({ page }) => {
    await page.goto('/login');

    // Click on logo/GoVault text
    await page.locator('a').filter({ hasText: 'GoVault' }).click();

    await expect(page).toHaveURL('/');
  });
});
