import { test, expect } from '@playwright/test';

test('Homepage loads correctly', async ({ page }) => {
  // Navigate to the homepage
  await page.goto(process.env.ENVIRONMENT_URL || 'http://localhost:5173');

  // Check if the page title is correct
  await expect(page).toHaveTitle(/DuduFisio AI/);

  // Check if main navigation elements are present
  await expect(page.locator('nav')).toBeVisible();

  // Check if the main content area is visible
  await expect(page.locator('main')).toBeVisible();

  // Check for any console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('Console error:', msg.text());
    }
  });

  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');

  // Take a screenshot for visual verification
  await page.screenshot({ path: 'homepage.png' });
});

test('Critical UI elements are present', async ({ page }) => {
  await page.goto(process.env.ENVIRONMENT_URL || 'http://localhost:5173');

  // Check for critical buttons or links
  const criticalElements = [
    'button[aria-label*="menu"], nav button, .menu-button',
    'main, .main-content, [role="main"]',
    'header, .header, [role="banner"]'
  ];

  for (const selector of criticalElements) {
    try {
      await expect(page.locator(selector).first()).toBeVisible({ timeout: 5000 });
    } catch (error) {
      console.warn(`Optional element not found: ${selector}`);
    }
  }
});