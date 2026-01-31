import { test, expect } from '@playwright/test';

// Smoke test: Portfolio page accessible on mobile
test('portfolio page loads and shows placeholder @smoke', async ({ page, isMobile }) => {
  if (!isMobile) return;

  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/portfolio');
  await page.waitForLoadState('networkidle');

  // Check that the Portfolio title or empty state is visible
  // Prefer a heading for Portfolio to avoid ambiguous matches
  const heading = page.locator('h1:has-text("Portfolio"), h2:has-text("Portfolio")').first();
  await expect(heading).toBeVisible();

  // If there are no positions, a placeholder or "No positions" text should be visible
  const noPositions = page.locator('text=No positions').first();
  if ((await noPositions.count()) === 0) {
    // Accept presence of connect wallet or positions header as fallback
    const connectCount = await page.locator('text=Connect Wallet').count();
    const h2Positions = await page.locator('h2:has-text("Positions")').count();
    const headerCount = await page.locator('header:has-text("Portfolio")').count();
    const headingPortfolio = await page.locator('h1:has-text("Portfolio")').count();
    expect(connectCount + h2Positions + headerCount + headingPortfolio).toBeGreaterThan(0);
  }
});