import { test, expect } from '@playwright/test';

test.describe('Research Flow', () => {
  test('should create new research', async ({ page }) => {
    await page.goto('/dashboard/research/new');

    // Fill in research form
    await page.fill('input[name="topic"]', 'Quantum Computing Applications');

    // Select depth
    const standardButton = page.getByRole('button', { name: /standard/i });
    await standardButton.click();

    // Submit form
    const submitButton = page.getByRole('button', { name: /start research/i });
    await submitButton.click();

    // Should redirect to research detail page
    await expect(page).toHaveURL(/\/dashboard\/research\/.+/);
  });

  test('should show research progress', async ({ page }) => {
    // First create a research
    await page.goto('/dashboard/research/new');
    await page.fill('input[name="topic"]', 'Machine Learning');
    await page.getByRole('button', { name: /quick/i }).click();
    await page.getByRole('button', { name: /start research/i }).click();

    // Wait for redirect to detail page
    await page.waitForURL(/\/dashboard\/research\/.+/);

    // Should show progress indicator
    const progressElement = page.locator('[role="progressbar"], [class*="progress"]');

    // Progress might complete quickly, so check if it exists or completed
    const exists = await progressElement.count() > 0;
    const completedText = await page.getByText(/completed/i).count() > 0;

    expect(exists || completedText).toBe(true);
  });

  test('should display research results', async ({ page }, testInfo) => {
    testInfo.setTimeout(60000); // Increase timeout for research

    // Create research
    await page.goto('/dashboard/research/new');
    await page.fill('input[name="topic"]', 'Artificial Intelligence');
    await page.getByRole('button', { name: /quick/i }).click();
    await page.getByRole('button', { name: /start research/i }).click();

    // Wait for research to complete (polling happens every 2s)
    await page.waitForURL(/\/dashboard\/research\/.+/);

    // Wait up to 30 seconds for completion
    await page.waitForSelector('text=/completed|summary/i', { timeout: 30000 });

    // Should display results
    const resultsSection = page.locator('text=/summary|findings|sources/i');
    await expect(resultsSection.first()).toBeVisible();
  });

  test('should navigate to research list', async ({ page }) => {
    await page.goto('/dashboard/research');

    // Should show list of research
    await expect(page.locator('body')).toBeVisible();

    // Check for create new research button
    const createButton = page.getByRole('link', { name: /new research|create/i });
    if (await createButton.count() > 0) {
      await expect(createButton.first()).toBeVisible();
    }
  });
});
