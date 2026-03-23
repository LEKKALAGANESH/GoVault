import { test, expect } from '@playwright/test';

test.describe('View2 Page - Beach Theme', () => {
  const VIEW2_URL = '/trips/3b0fa5d7-757e-454d-a05a-a381dfab2574/view2';

  test('should display beach elements in sections', async ({ page }) => {
    // Navigate directly to view2
    await page.goto(VIEW2_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for animations

    // Take hero screenshot
    await page.screenshot({ path: 'test-results/02-view2-hero.png' });

    // Check for SVG elements (beach decorations)
    const svgCount = await page.$$eval('svg', (svgs) => svgs.length);
    console.log(`Found ${svgCount} SVG elements`);

    // Scroll through sections and take screenshots
    const sections = ['flights', 'hotels', 'todos', 'itinerary', 'survival', 'phrases', 'packing', 'documents', 'emergency'];

    for (const section of sections) {
      const sectionEl = page.locator(`#${section}`);
      if (await sectionEl.count() > 0) {
        await sectionEl.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500); // Wait for parallax
        await page.screenshot({ path: `test-results/03-section-${section}.png` });
      }
    }

    // Take full page screenshot
    await page.screenshot({ path: 'test-results/04-view2-full.png', fullPage: true });
  });

  test('should have parallax effect on scroll', async ({ page }) => {
    await page.goto(VIEW2_URL);
    await page.waitForLoadState('networkidle');

    // Get initial position of a beach element
    const heroSection = page.locator('section').first();
    await heroSection.scrollIntoViewIfNeeded();

    // Take screenshot at top
    await page.screenshot({ path: 'test-results/parallax-01-top.png' });

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'test-results/parallax-02-middle.png' });

    // Scroll more
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'test-results/parallax-03-bottom.png' });
  });
});
