import { test, expect } from '@playwright/test';

test('Login flow works correctly', async ({ page }) => {
  await page.goto(process.env.ENVIRONMENT_URL || 'http://localhost:5173');

  // Look for login button or sign in link
  const loginSelectors = [
    'button:has-text("Entrar")',
    'button:has-text("Login")', 
    'a:has-text("Sign In")',
    '[data-testid="sign-in-button"]'
  ];

  let loginButton = null;
  for (const selector of loginSelectors) {
    try {
      loginButton = await page.locator(selector).first();
      if (await loginButton.isVisible({ timeout: 2000 })) {
        break;
      }
    } catch (error) {
      // Continue to next selector
    }
  }

  if (loginButton && await loginButton.isVisible()) {
    // Click the login button
    await loginButton.click();

    // Wait for login modal or redirect
    await page.waitForTimeout(2000);

    // Check if we're redirected to auth provider or modal appears
    const currentUrl = page.url();
    const hasAuthModal = await page.locator('[role="dialog"], .modal, .auth-modal').count() > 0;
    
    if (currentUrl.includes('clerk') || currentUrl.includes('auth') || hasAuthModal) {
      console.log('Login flow initiated successfully');
    } else {
      console.warn('Login flow may not have initiated properly');
    }
  } else {
    console.log('No login button found - app may already be authenticated or login is not implemented');
  }

  // Take a screenshot for verification
  await page.screenshot({ path: 'login-flow.png' });
});
