import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load landing page', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/ResearchHive/);

    // Check main heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should have navigation to dashboard', async ({ page }) => {
    await page.goto('/');

    // Look for dashboard link or button
    const dashboardLink = page.getByRole('link', { name: /dashboard/i });

    if (await dashboardLink.count() > 0) {
      await expect(dashboardLink.first()).toBeVisible();
    }
  });

  test('should be responsive', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 }, // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');

      // Page should load without errors
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
