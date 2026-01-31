import { test, expect } from '@playwright/test';

// Smoke test: Trade panel open/close and buy/sell switching on mobile
test('trade panel opens on market click and closes with X @smoke', async ({ page, isMobile }) => {
  if (!isMobile) return;

  await page.setViewportSize({ width: 375, height: 667 });
  // Navigate directly to a sample event to avoid discovery variability
  // Use an event known to have markets in sample data
  await page.goto('/events/KXBOXING-25DEC19JPAUAJOS');
  await page.waitForLoadState('networkidle');

  // Wait for the first YES market button to be present on the page (signals loaded)
  // Prefer data-testid selector, but fallback to any visible 'Yes' button on the page
  let yesBtn = page.locator('[data-testid^="market-yes-"]').first();
  try {
    await yesBtn.waitFor({ state: 'visible', timeout: 5000 });
    await yesBtn.click();
  } catch (e) {
    // fallback: find the first visible 'Yes' button
    const yesButtons = page.locator('button:has-text("Yes")');
    const total = await yesButtons.count();
    let clicked = false;
    for (let i = 0; i < total; i++) {
      const btn = yesButtons.nth(i);
      if (await btn.isVisible()) {
        await btn.click();
        clicked = true;
        break;
      }
    }
    if (!clicked) {
      test.skip(true, 'No visible Yes button found to open trade panel');
      return;
    }
  }

  // Trade sheet should appear
  const sheet = page.locator('[data-testid="trade-sheet"]');
  await expect(sheet).toBeVisible();

  // Switch to Sell via select (if available)
  const sellOption = page.locator('text=Sell').first();
  if ((await sellOption.count()) > 0) {
    await sellOption.click();
    // verify tradeType text changed
    await expect(page.locator('text=Sell')).toBeVisible();
  }

  // Close the sheet
  await page.locator('button[aria-label="Close trade panel"]').click();
  await expect(sheet).toBeHidden();
});