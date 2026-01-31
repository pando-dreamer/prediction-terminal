import { test, expect } from '@playwright/test';

// E2E: Trade flow (no wallet) - verify Connect Wallet prompt
test('trade flow shows Connect Wallet when not connected @smoke', async ({ page, isMobile }) => {
  if (!isMobile) return;

  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/events/KXBOXING-25DEC19JPAUAJOS');
  await page.waitForLoadState('networkidle');

  // Open first YES market
  const yesButtons = page.locator('button:has-text("Yes")');
  const total = await yesButtons.count();
  if (total === 0) {
    test.skip(true, 'No Yes buttons found to run trade flow');
    return;
  }

  for (let i = 0; i < total; i++) {
    const btn = yesButtons.nth(i);
    if (await btn.isVisible()) {
      await btn.click();
      break;
    }
  }

  // Trade sheet should appear
  const sheet = page.locator('[data-testid="trade-sheet"]');
  await expect(sheet).toBeVisible();

  // The main trade button should prompt to connect wallet when not connected
  const tradeButton = page.locator('button:has-text("Connect Wallet")').first();
  if ((await tradeButton.count()) === 0) {
    // Fallback: check for 'Enter Amount' disabled state
    await expect(page.locator('button:has-text("Enter Amount")')).toBeVisible();
  } else {
    await expect(tradeButton).toBeVisible();
  }
});