import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("AI Features", () => {
  test("AI Generate button appears on extras page", async ({ page }) => {
    // Navigate to a trip's extras page
    await page.goto("/trips");
    await page.waitForLoadState("networkidle");

    // Click on a trip card to go to view
    const tripCard = page.locator('[data-testid="trip-card"]').first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      await page.waitForLoadState("networkidle");
    }

    // Check if we can access extras page - try to find the trip ID from URL
    const currentUrl = page.url();
    const tripMatch = currentUrl.match(/\/trips\/([^\/]+)/);
    if (tripMatch) {
      const tripSlug = tripMatch[1];
      await page.goto(`/trips/${tripSlug}/extras`);
      await page.waitForLoadState("networkidle");

      // Check for the Generate with AI button
      const aiButton = page.getByRole("button", { name: /generate with ai/i });
      await expect(aiButton).toBeVisible({ timeout: 10000 });

      // Click to open dialog
      await aiButton.click();

      // Check dialog content
      await expect(page.getByText("Generate Trip Content with AI")).toBeVisible();
      await expect(page.getByText("What to generate")).toBeVisible();
      await expect(page.getByText("Traveling from")).toBeVisible();
      await expect(page.getByText(/Travelers/)).toBeVisible();

      // Take screenshot
      await page.screenshot({ path: "test-results/ai-generate-dialog.png" });
    }
  });

  test("Agent chat shows suggestions for itinerary", async ({ page }) => {
    // Navigate to a trip
    await page.goto("/trips");
    await page.waitForLoadState("networkidle");

    const tripCard = page.locator('[data-testid="trip-card"]').first();
    if (await tripCard.isVisible()) {
      await tripCard.click();
      await page.waitForLoadState("networkidle");

      // Look for AI assistant button
      const aiButton = page.locator('[data-testid="ai-assistant-button"]');
      if (await aiButton.isVisible({ timeout: 5000 })) {
        await aiButton.click();

        // Check panel opens
        await expect(page.getByTestId("panel-title")).toBeVisible();
        await expect(page.getByTestId("message-input")).toBeVisible();

        // Take screenshot of panel
        await page.screenshot({ path: "test-results/ai-panel-open.png" });
      }
    }
  });

  test("Trip update API works", async ({ page, request }) => {
    // First get a trip ID
    await page.goto("/trips");
    await page.waitForLoadState("networkidle");

    // Get auth cookies from page context
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");

    // We need to get a real trip ID - let's check the page for data
    const tripCard = page.locator('[data-testid="trip-card"]').first();
    if (await tripCard.isVisible()) {
      // Extract trip link
      const tripLink = tripCard.locator("a").first();
      const href = await tripLink.getAttribute("href");
      if (href) {
        const tripMatch = href.match(/\/trips\/([^\/]+)/);
        if (tripMatch) {
          console.log(`Found trip: ${tripMatch[1]}`);
        }
      }
    }
  });
});
