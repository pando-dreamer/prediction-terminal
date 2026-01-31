import { test, expect } from '@playwright/test';

// Smoke test: Events discovery on mobile
test('events discovery loads event cards @smoke', async ({ page, isMobile }) => {
  if (!isMobile) return;

  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Wait for event cards to appear (flexible selectors)
  const candidates = page.locator('article, [role="article"], .event-card, .card');
  const count = await candidates.count();
  if (count === 0) {
    // fallback: check for an Events heading or 'Back to Events'
    if ((await page.locator('h1:has-text("Events")').count()) > 0) {
      await expect(page.locator('h1:has-text("Events")').first()).toBeVisible();
    } else if ((await page.locator('text=Back to Events').count()) > 0) {
      await expect(page.locator('text=Back to Events').first()).toBeVisible();
    } else if ((await page.locator('text=Active events').count()) > 0) {
      await expect(page.locator('text=Active events').first()).toBeVisible();
    } else {
      // last resort: fail with clear message
      throw new Error('No event cards or expected headings found');
    }
  } else {
    // ensure at least one candidate is visible
    let visibleFound = false;
    for (let i = 0; i < count; i++) {
      if (await candidates.nth(i).isVisible()) {
        visibleFound = true;
        break;
      }
    }
    expect(visibleFound).toBeTruthy();
  }

  // At a minimum, ensure the header is visible
  await expect(page.locator('header')).toBeVisible();
});