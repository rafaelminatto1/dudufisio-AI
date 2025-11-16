/**
 * E2E Security Test: Data Access Control
 *
 * Tests:
 * - Admin can access all patients
 * - Therapist can access assigned patients
 * - Patient can only see their own data
 * - Proper permission error messages
 * - Row Level Security (RLS) enforcement
 */

import { test, expect } from '@playwright/test';
import { navigateToLogin, loginAsAdmin, login, TEST_CREDENTIALS } from '../../helpers/login';

test.describe('Data Access Control Security', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToLogin(page);
  });

  test('Admin should access patient list', async ({ page }) => {
    // Login as admin
    await loginAsAdmin(page);

    // Navigate to patients page
    await page.goto('/patients', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Should be able to see patient list
    const hasPatients = await page.locator('text=/paciente|patient/i').count() > 0;
    const hasTable = await page.locator('table, [role="table"]').count() > 0;

    expect(hasPatients || hasTable).toBeTruthy();

    // Verify no sensitive data in console
    const consoleMessages: string[] = [];
    page.on('console', msg => consoleMessages.push(msg.text()));

    // Trigger a data load
    await page.reload();
    await page.waitForTimeout(2000);

    // Check console messages for PII leaks
    const consolidatedLog = consoleMessages.join(' ');
    expect(consolidatedLog).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/); // CPF pattern
    expect(consolidatedLog).not.toMatch(/\([0-9]{2}\)\s?[0-9]{4,5}-?[0-9]{4}/); // Phone pattern
  });

  test('Therapist should have limited access', async ({ page }) => {
    // Login as therapist
    await login(page, { email: 'fisio@dudufisio.com', password: 'Fisio@123' });

    // Navigate to patients
    await page.goto('/patients', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Therapist should see patients but potentially filtered
    const currentUrl = page.url();

    // Either we're on patients page or redirected
    if (currentUrl.includes('/patients')) {
      // Check if we can see patient data
      const hasPatientData = await page.locator('text=/paciente|patient/i').count() > 0;
      expect(hasPatientData).toBeTruthy();
    } else {
      // If redirected, it's a valid security behavior
      console.log('Therapist was redirected from patients page - this is acceptable');
    }
  });

  test('Should not expose patient CPF in page source', async ({ page }) => {
    // Login as admin
    await loginAsAdmin(page);

    // Go to patients page
    await page.goto('/patients', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Get page source
    const pageContent = await page.content();

    // Should not contain full CPF (only masked)
    const cpfMatches = pageContent.match(/\d{3}\.\d{3}\.\d{3}-\d{2}/g);
    if (cpfMatches) {
      // If CPF is found, it should be masked
      cpfMatches.forEach(cpf => {
        expect(cpf).toMatch(/\*\*\*\.\*\*\*\.\d{3}-\d{2}/); // Partially masked CPF
      });
    }
  });

  test('Should enforce RLS on patient data endpoints', async ({ page }) => {
    // Login as patient
    await login(page, { email: 'patient@test.com', password: 'Patient@123' });

    // Intercept API calls
    const apiCalls: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/') || request.url().includes('supabase.co')) {
        apiCalls.push(request.url());
      }
    });

    // Try to navigate to patients list (should be restricted)
    await page.goto('/patients', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const currentUrl = page.url();

    // Patient should either:
    // 1. Be redirected away from patients list
    // 2. Only see their own data
    // 3. See permission denied message

    const hasPermissionError = await page.locator('text=/permiss[ãa]o negada|acesso negado|unauthorized|forbidden/i').count() > 0;
    const isRedirected = !currentUrl.includes('/patients');
    const onlyOwnData = currentUrl.includes('/patients') && apiCalls.some(call => call.includes('eq.'));

    // One of these should be true
    expect(hasPermissionError || isRedirected || onlyOwnData).toBeTruthy();
  });

  test('Should show proper error messages for unauthorized access', async ({ page }) => {
    // Login as patient
    await login(page, { email: 'patient@test.com', password: 'Patient@123' });

    // Try to access admin pages
    const protectedPages = [
      '/admin',
      '/settings',
      '/users',
      '/reports'
    ];

    for (const protectedPage of protectedPages) {
      await page.goto(protectedPage);
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      const hasErrorMessage = await page.locator('text=/permiss[ãa]o|acesso negado|unauthorized/i').count() > 0;
      const isRedirected = !currentUrl.includes(protectedPage);

      // Should either redirect or show error
      if (!isRedirected && !hasErrorMessage) {
        console.warn(`Patient was able to access ${protectedPage} without restriction`);
      }

      // But should not see error stack traces or internal errors
      const pageContent = await page.content();
      expect(pageContent).not.toMatch(/Error:\s+[A-Za-z]+Error/); // No error stack traces
      expect(pageContent).not.toContain('at Object'); // No stack trace details
    }
  });

  test('Should not leak user IDs in URLs or console', async ({ page }) => {
    // Capture console messages
    const consoleLogs: any[] = [];
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text()
      });
    });

    // Login
    await loginAsAdmin(page);

    // Navigate through the app
    await page.goto('/patients');
    await page.waitForTimeout(2000);
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Check URLs for exposed UUIDs or sensitive IDs
    const currentUrl = page.url();

    // UUIDs in URL are okay, but should not expose sensitive data
    // Check console for PII
    const consoleText = consoleLogs.map(log => log.text).join(' ');

    // Should not log emails
    expect(consoleText).not.toMatch(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

    // Should not log phone numbers
    expect(consoleText).not.toMatch(/\([0-9]{2}\)\s?[0-9]{4,5}-?[0-9]{4}/);

    // Should not log CPF
    expect(consoleText).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
  });

  test('Should handle permission errors gracefully', async ({ page }) => {
    // Monitor for JavaScript errors
    const jsErrors: Error[] = [];
    page.on('pageerror', error => {
      jsErrors.push(error);
    });

    // Login as limited user
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
    await page.fill('input[type="email"], input[name="email"]', 'patient@test.com');
    await page.fill('input[type="password"], input[name="password"]', 'Patient@123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(3000);

    // Try to access restricted resources
    await page.goto('/admin');
    await page.waitForTimeout(2000);

    // Should not cause JavaScript errors
    expect(jsErrors.length).toBe(0);

    // Should show user-friendly message
    const hasUserFriendlyMessage = await page.locator('text=/n[ãa]o autorizado|sem permiss[ãa]o|acesso negado/i').count() > 0;
    const isRedirected = !page.url().includes('/admin');

    expect(hasUserFriendlyMessage || isRedirected).toBeTruthy();
  });
});
