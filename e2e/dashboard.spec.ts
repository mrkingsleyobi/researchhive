import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should load dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // In demo mode, should allow access
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display demo mode indicator', async ({ page }) => {
    await page.goto('/dashboard');

    // Check for demo mode badge
    const demoIndicator = page.getByText(/demo mode/i);
    await expect(demoIndicator).toBeVisible();
  });

  test('should have navigation sidebar', async ({ page }) => {
    await page.goto('/dashboard');

    // Check for navigation items
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Should have key navigation items
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /research/i })).toBeVisible();
  });

  test('should display statistics cards', async ({ page }) => {
    await page.goto('/dashboard');

    // Dashboard should have stats
    const cards = page.locator('[class*="card"]');
    const count = await cards.count();

    expect(count).toBeGreaterThan(0);
  });
});
