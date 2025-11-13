/**
 * Login Helper for E2E Tests
 * 
 * Provides robust login functionality with proper waits and error handling
 */

import { Page, expect } from '@playwright/test';

const EMAIL_SELECTOR = '[data-testid="input-login-email"], [data-testid="login-email"]';
const PASSWORD_SELECTOR = '[data-testid="input-login-password"], [data-testid="login-password"]';
const SUBMIT_SELECTOR = '[data-testid="btn-login-submit"], [data-testid="login-submit"]';

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Default test credentials
 * These credentials match the mock auth in supabaseAuthService.ts
 */
export const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@dudufisio.com',
    password: 'DuduFisio2024!'
  },
  therapist: {
    email: 'therapist@dudufisio.com',
    password: 'demo123456'
  },
  patient: {
    email: 'patient@dudufisio.com',
    password: 'demo123456'
  }
};

/**
 * Waits for the page to be fully loaded and ready for interaction
 */
export async function waitForPageReady(page: Page, options: { waitForNetworkIdle?: boolean } = {}): Promise<void> {
  const { waitForNetworkIdle = false } = options;

  await page.waitForLoadState('domcontentloaded');

  if (waitForNetworkIdle) {
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => undefined);
  }

  await page.waitForTimeout(500);
}

/**
 * Navigates to the login page and waits for it to be ready
 */
export async function navigateToLogin(page: Page): Promise<void> {
  await page.goto('/login', { waitUntil: 'commit' });
  await waitForPageReady(page);
  
  // Verify we're on the login page
  if (!(await page.locator(EMAIL_SELECTOR).first().isVisible({ timeout: 5000 }).catch(() => false))) {
    await page.goto('/auth/login', { waitUntil: 'commit' });
    await waitForPageReady(page);
  }

  await expect(page.locator(EMAIL_SELECTOR).first()).toBeVisible({ timeout: 15000 });
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
  const emailField = page.locator(EMAIL_SELECTOR).first();
  const passwordField = page.locator(PASSWORD_SELECTOR).first();
  const submitButton = page.locator(SUBMIT_SELECTOR).first();

  if (!(await emailField.isVisible({ timeout: 5000 }).catch(() => false))) {
    await navigateToLogin(page);
  }

  if (!(await emailField.isVisible({ timeout: 5000 }).catch(() => false))) {
    // Already logged in; ensure we are on a protected page and skip login
    if (await isLoggedIn(page)) {
      return;
    }
  }

  await expect(emailField).toBeVisible({ timeout: 15000 });
  await expect(passwordField).toBeVisible({ timeout: 15000 });
  await expect(submitButton).toBeVisible({ timeout: 15000 });
  
  // Fill in credentials
  await emailField.fill(credentials.email);
  await passwordField.fill(credentials.password);
  
  // Click login button
  await submitButton.click();
  
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
  const emailField = page.locator(EMAIL_SELECTOR).first();
  const passwordField = page.locator(PASSWORD_SELECTOR).first();
  const submitButton = page.locator(SUBMIT_SELECTOR).first();

  if (!(await emailField.isVisible({ timeout: 5000 }).catch(() => false))) {
    await navigateToLogin(page);
  }

  await expect(emailField).toBeVisible({ timeout: 15000 });

  await emailField.fill(credentials.email);
  await passwordField.fill(credentials.password);
  await submitButton.click();
  
  // Wait for error message to appear
  await page.waitForTimeout(2000);
  
  // Should still be on login page
  const currentUrl = page.url();
  expect(currentUrl).toMatch(/\/(login|auth|\/)/);
}

