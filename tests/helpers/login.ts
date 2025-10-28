/**
 * Login Helper for E2E Tests
 * 
 * Provides robust login functionality with proper waits and error handling
 */

import { Page, expect } from '@playwright/test';

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Default test credentials
 */
export const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@dudufisio.com',
    password: 'Admin@123'
  },
  therapist: {
    email: 'therapist@dudufisio.com',
    password: 'Therapist@123'
  },
  patient: {
    email: 'patient@dudufisio.com',
    password: 'Patient@123'
  }
};

/**
 * Waits for the page to be fully loaded and ready for interaction
 */
export async function waitForPageReady(page: Page): Promise<void> {
  // Wait for the page to be loaded
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for network to be idle (no ongoing requests)
  await page.waitForLoadState('networkidle', { timeout: 30000 });
  
  // Wait a bit for React hydration
  await page.waitForTimeout(1000);
}

/**
 * Navigates to the login page and waits for it to be ready
 */
export async function navigateToLogin(page: Page): Promise<void> {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await waitForPageReady(page);
  
  // Verify we're on the login page
  await expect(page.getByTestId('login-email')).toBeVisible({ timeout: 15000 });
}

/**
 * Performs login with given credentials
 * 
 * @param page - Playwright page object
 * @param credentials - Login credentials (email and password)
 * @param waitForNavigation - Whether to wait for navigation after login (default: true)
 */
export async function login(
  page: Page, 
  credentials: LoginCredentials,
  waitForNavigation: boolean = true
): Promise<void> {
  // Wait for login form to be visible and ready
  await expect(page.getByTestId('login-email')).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('login-password')).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('login-submit')).toBeVisible({ timeout: 15000 });
  
  // Fill in credentials
  await page.getByTestId('login-email').fill(credentials.email);
  await page.getByTestId('login-password').fill(credentials.password);
  
  // Click login button
  await page.getByTestId('login-submit').click();
  
  if (waitForNavigation) {
    // Wait for navigation to complete
    await page.waitForURL(/\/(dashboard|agenda|home)/, { timeout: 20000 });
    
    // Wait for the new page to be ready
    await waitForPageReady(page);
    
    // Verify we're no longer on login page
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    expect(currentUrl).not.toContain('/auth');
  }
}

/**
 * Performs login as admin
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await login(page, TEST_CREDENTIALS.admin);
}

/**
 * Performs login as therapist
 */
export async function loginAsTherapist(page: Page): Promise<void> {
  await login(page, TEST_CREDENTIALS.therapist);
}

/**
 * Performs login as patient
 */
export async function loginAsPatient(page: Page): Promise<void> {
  await login(page, TEST_CREDENTIALS.patient);
}

/**
 * Checks if user is currently logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  const currentUrl = page.url();
  return !currentUrl.includes('/login') && !currentUrl.includes('/auth');
}

/**
 * Performs logout
 */
export async function logout(page: Page): Promise<void> {
  // Try to find logout button/link
  const logoutSelectors = [
    'button:has-text("Sair")',
    'button:has-text("Logout")',
    'a:has-text("Sair")',
    'a:has-text("Logout")',
    '[data-testid="logout-button"]'
  ];
  
  for (const selector of logoutSelectors) {
    const element = page.locator(selector).first();
    if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
      await element.click();
      break;
    }
  }
  
  // Wait for redirect to login page
  await page.waitForURL(/\/(login|auth|\/)/, { timeout: 10000 });
  await waitForPageReady(page);
}

/**
 * Attempts login with invalid credentials and expects failure
 */
export async function loginWithInvalidCredentials(
  page: Page,
  credentials: LoginCredentials
): Promise<void> {
  await expect(page.getByTestId('login-email')).toBeVisible({ timeout: 15000 });
  
  await page.getByTestId('login-email').fill(credentials.email);
  await page.getByTestId('login-password').fill(credentials.password);
  await page.getByTestId('login-submit').click();
  
  // Wait for error message to appear
  await page.waitForTimeout(2000);
  
  // Should still be on login page
  const currentUrl = page.url();
  expect(currentUrl).toMatch(/\/(login|auth|\/)/);
}

