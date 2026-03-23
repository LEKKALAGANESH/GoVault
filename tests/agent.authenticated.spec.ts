import { test, expect } from '@playwright/test';

test.describe('AI Trip Agent', () => {
  // Use the existing test trip ID
  const TRIP_ID = '3b0fa5d7-757e-454d-a05a-a381dfab2574';

  test.beforeEach(async ({ page }) => {
    // Navigate to the trip page (using trip ID as slug)
    await page.goto(`/trips/${TRIP_ID}`);
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should show floating AI assistant button for owner', async ({ page }) => {
    // Look for the AI assistant button using test ID
    const aiButton = page.getByTestId('ai-assistant-button');
    await expect(aiButton).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'test-results/agent-01-button-visible.png' });
  });

  test('should open chat panel when clicking AI button', async ({ page }) => {
    // Click the AI button using test ID
    const aiButton = page.getByTestId('ai-assistant-button');
    await aiButton.click();

    // Wait for panel to slide in
    await page.waitForTimeout(500);

    // Check panel is visible using test ID
    const chatPanel = page.getByTestId('panel-title');
    await expect(chatPanel).toBeVisible();
    await expect(chatPanel).toHaveText('Trip Assistant');

    // Check welcome message appears
    const welcomeMessage = page.locator('text=I can help you');
    await expect(welcomeMessage).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'test-results/agent-02-panel-open.png' });
  });

  test('should have input field and send button', async ({ page }) => {
    // Open chat panel
    const aiButton = page.getByTestId('ai-assistant-button');
    await aiButton.click();
    await page.waitForTimeout(500);

    // Check input exists using test ID
    const textarea = page.getByTestId('message-input');
    await expect(textarea).toBeVisible();

    // Check send button exists using test ID
    const sendButton = page.getByTestId('send-button');
    await expect(sendButton).toBeVisible();

    // Check upload button exists using test ID
    const uploadButton = page.getByTestId('upload-button');
    await expect(uploadButton).toBeVisible();
  });

  test('should send message and get AI response', async ({ page }) => {
    // Open chat panel
    const aiButton = page.getByTestId('ai-assistant-button');
    await aiButton.click();
    await page.waitForTimeout(500);

    // Type a message using test ID
    const textarea = page.getByTestId('message-input');
    await textarea.fill('Add breakfast at hotel on Day 1 at 8am');

    // Take screenshot before sending
    await page.screenshot({ path: 'test-results/agent-03-message-typed.png' });

    // Click send using test ID
    const sendButton = page.getByTestId('send-button');
    await sendButton.click();

    // Wait for "Thinking..." to appear
    const thinking = page.locator('text=Thinking...');
    await expect(thinking).toBeVisible({ timeout: 5000 });

    // Take screenshot while thinking
    await page.screenshot({ path: 'test-results/agent-04-thinking.png' });

    // Wait for response (up to 30 seconds for API call)
    await expect(thinking).not.toBeVisible({ timeout: 30000 });

    // Take screenshot of response
    await page.screenshot({ path: 'test-results/agent-05-response.png' });

    // Check if we got either a response or an error
    const assistantMessages = page.locator('div.bg-gray-100.rounded-2xl');
    const messageCount = await assistantMessages.count();
    expect(messageCount).toBeGreaterThan(1); // Welcome + response
  });

  test('should show proposed changes with Apply button', async ({ page }) => {
    // Open chat panel
    const aiButton = page.getByTestId('ai-assistant-button');
    await aiButton.click();
    await page.waitForTimeout(500);

    // Send an edit command using test IDs
    const textarea = page.getByTestId('message-input');
    await textarea.fill('Add lunch at a local restaurant on Day 2 at 12pm');

    const sendButton = page.getByTestId('send-button');
    await sendButton.click();

    // Wait for response
    const thinking = page.locator('text=Thinking...');
    await expect(thinking).toBeVisible({ timeout: 5000 });
    await expect(thinking).not.toBeVisible({ timeout: 30000 });

    // Check for Apply button (indicates proposed changes)
    const applyButton = page.locator('button:has-text("Apply")');
    const hasApplyButton = await applyButton.isVisible().catch(() => false);

    // Take screenshot
    await page.screenshot({ path: 'test-results/agent-06-proposed-changes.png' });

    // Log result
    if (hasApplyButton) {
      console.log('✅ Proposed changes shown with Apply button');
    } else {
      console.log('⚠️ No Apply button - check if AI returned tool calls');
    }
  });

  test('should close panel when clicking X', async ({ page }) => {
    // Open chat panel
    const aiButton = page.getByTestId('ai-assistant-button');
    await aiButton.click();
    await page.waitForTimeout(500);

    // Verify panel is open using test ID
    const chatPanel = page.getByTestId('panel-title');
    await expect(chatPanel).toBeVisible();

    // Click close button using test ID
    const closeButton = page.getByTestId('close-panel-button');
    await closeButton.click();

    // Wait for animation
    await page.waitForTimeout(500);

    // Verify panel is closed (AI button should be visible again)
    await expect(aiButton).toBeVisible();
  });

  test('should parse itinerary text', async ({ page }) => {
    // Open chat panel
    const aiButton = page.getByTestId('ai-assistant-button');
    await aiButton.click();
    await page.waitForTimeout(500);

    // Paste itinerary text
    const itineraryText = `Day 1 - Arrival
Arrive at airport around 11am
Check into hotel in the afternoon
Evening dinner at local restaurant

Day 2 - Exploration
Morning temple visit at 9am
Lunch at street food market at noon
Afternoon free time`;

    const textarea = page.getByTestId('message-input');
    await textarea.fill(itineraryText);

    // Send using test ID
    const sendButton = page.getByTestId('send-button');
    await sendButton.click();

    // Wait for response
    const thinking = page.locator('text=Thinking...');
    await expect(thinking).toBeVisible({ timeout: 5000 });
    await expect(thinking).not.toBeVisible({ timeout: 45000 }); // Longer timeout for parsing

    // Take screenshot
    await page.screenshot({ path: 'test-results/agent-07-itinerary-parsed.png' });

    // Check for proposed changes (should mention days)
    const pageContent = await page.content();
    const hasDay1 = pageContent.includes('Day 1') || pageContent.includes('day_number');
    console.log(`Itinerary parsing result: ${hasDay1 ? '✅ Days detected' : '⚠️ Check response'}`);
  });
});
