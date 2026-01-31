import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation', () => {
  test.describe.configure({ mode: 'serial' });

  test('should display mobile header and bottom navigation on mobile viewport', async ({
    page,
    isMobile,
  }) => {
    // Skip if not mobile
    if (!isMobile) return;

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to home page
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check mobile header is visible
    await expect(
      page.locator('header').filter({ hasText: 'Prediction Terminal' })
    ).toBeVisible();

    // Check bottom navigation is visible - look for the specific bottom nav with safe-bottom class
    const bottomNav = page.locator('nav.bg-slate-800\\/95');
    await expect(bottomNav).toBeVisible();

    // Check navigation items in bottom nav
    await expect(bottomNav.locator('text=Events')).toBeVisible();
    await expect(bottomNav.locator('text=Portfolio')).toBeVisible();
    await expect(bottomNav.locator('text=Settings')).toBeVisible();
  });

  test.skip('should navigate between pages using bottom navigation', async ({
    page,
    isMobile,
  }) => {
    // Skip navigation test for now - need to fix webpack overlay issue
    return;
  });

  test.skip('should show wallet connection status in bottom nav when connected', async ({
    page,
    isMobile,
  }) => {
    // Skip wallet test for now
    return;
  });
});
