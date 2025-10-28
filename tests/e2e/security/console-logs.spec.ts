/**
 * E2E Security Test: Console Logs Security
 *
 * Tests:
 * - No sensitive data (CPF, email, phone) in console logs
 * - No API keys exposed in console
 * - No authentication tokens in logs
 * - Proper error handling without data leaks
 * - Validates secureLogger implementation
 */

import { test, expect } from '@playwright/test';
import { navigateToLogin, login, TEST_CREDENTIALS } from '../../helpers/login';

test.describe('Console Logs Security', () => {
  let consoleLogs: Array<{ type: string; text: string; args?: any[] }> = [];

  test.beforeEach(async ({ page }) => {
    // Reset console logs
    consoleLogs = [];

    // Capture all console messages
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
      });
    });

    await navigateToLogin(page);
  });

  test('should not log sensitive PII data (CPF, email, phone)', async ({ page }) => {
    // Login and navigate through the app
    await login(page, TEST_CREDENTIALS.admin);

    // Navigate to pages that handle sensitive data
    await page.goto('/patients', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Consolidate all console logs
    const allLogs = consoleLogs.map(log => log.text).join(' ');

    // Test for CPF pattern (123.456.789-00)
    const cpfPattern = /\d{3}\.\d{3}\.\d{3}-\d{2}/;
    const hasCPF = cpfPattern.test(allLogs);
    expect(hasCPF).toBeFalsy();

    // Test for email pattern (except @dudufisio.com which might be in UI)
    const emailPattern = /[a-zA-Z0-9._%+-]+@(?!dudufisio\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const hasEmail = emailPattern.test(allLogs);
    if (hasEmail) {
      console.warn('Email found in logs:', allLogs.match(emailPattern));
    }
    expect(hasEmail).toBeFalsy();

    // Test for phone number pattern (11) 98765-4321 or (11) 3456-7890
    const phonePattern = /\([0-9]{2}\)\s?[0-9]{4,5}-[0-9]{4}/;
    const hasPhone = phonePattern.test(allLogs);
    expect(hasPhone).toBeFalsy();

    // Test for RG pattern
    const rgPattern = /\d{2}\.\d{3}\.\d{3}-\d{1}/;
    const hasRG = rgPattern.test(allLogs);
    expect(hasRG).toBeFalsy();
  });

  test('should not expose API keys or tokens', async ({ page }) => {
    // Login
    await login(page, TEST_CREDENTIALS.admin);

    await page.waitForTimeout(3000);

    // Navigate through app
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    const allLogs = consoleLogs.map(log => log.text).join(' ');

    // Check for API key patterns
    const googleApiKeyPattern = /AIzaSy[a-zA-Z0-9_-]{33}/;
    expect(googleApiKeyPattern.test(allLogs)).toBeFalsy();

    // Check for OpenAI key pattern
    const openAiKeyPattern = /sk-[a-zA-Z0-9]{32,}/;
    expect(openAiKeyPattern.test(allLogs)).toBeFalsy();

    // Check for JWT tokens
    const jwtPattern = /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/;
    expect(jwtPattern.test(allLogs)).toBeFalsy();

    // Check for Bearer tokens
    const bearerPattern = /Bearer\s+[a-zA-Z0-9_-]{20,}/;
    expect(bearerPattern.test(allLogs)).toBeFalsy();

    // Check for common token keywords
    expect(allLogs).not.toMatch(/access_token[:=]\s*[a-zA-Z0-9_-]{20,}/);
    expect(allLogs).not.toMatch(/refresh_token[:=]\s*[a-zA-Z0-9_-]{20,}/);
  });

  test('should use secureLogger instead of console.log', async ({ page }) => {
    // Login
    await login(page, TEST_CREDENTIALS.admin);

    // Navigate through app to trigger logging
    await page.goto('/patients', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Check if logs follow secureLogger format
    // SecureLogger logs have format: [timestamp] LEVEL [Component] Message
    const hasSecureLogFormat = consoleLogs.some(log =>
      /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(log.text) // ISO timestamp
    );

    // Count logs that look like old-style console.log (less structured)
    const unstructuredLogs = consoleLogs.filter(log => {
      const text = log.text.toLowerCase();
      // Old style logs typically have patterns like "User:", "Email:", "Data:"
      return (
        text.includes('email:') ||
        text.includes('user:') ||
        text.includes('password:') ||
        text.includes('token:')
      );
    });

    if (unstructuredLogs.length > 0) {
      console.warn('Found potentially insecure log patterns:', unstructuredLogs.map(l => l.text));
    }

    // There should be few to no unstructured logs
    expect(unstructuredLogs.length).toBeLessThan(3);
  });

  test('should handle errors without exposing sensitive data', async ({ page }) => {
    // Try invalid login to trigger errors
    await page.getByTestId('login-email').fill('invalid@test.com');
    await page.getByTestId('login-password').fill('wrongpass');
    await page.getByTestId('login-submit').click();

    await page.waitForTimeout(2000);

    // Check console for error logs
    const errorLogs = consoleLogs.filter(log => log.type === 'error');

    // Error logs should not contain the password
    const errorText = errorLogs.map(log => log.text).join(' ');
    expect(errorText).not.toContain('wrongpass');
    expect(errorText).not.toContain('invalid@test.com');

    // Error logs should not contain stack traces with file paths
    expect(errorText).not.toMatch(/at\s+\S+\s+\([^)]+:\d+:\d+\)/);
  });

  test('should not log patient names or medical data', async ({ page }) => {
    // Login as admin
    await login(page, TEST_CREDENTIALS.admin);

    // Go to patients page
    await page.goto('/patients', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Click on a patient if available
    const patientLinks = await page.locator('a[href*="/patients/"], button:has-text("Ver detalhes")').count();
    if (patientLinks > 0) {
      await page.locator('a[href*="/patients/"], button:has-text("Ver detalhes")').first().click();
      await page.waitForTimeout(2000);
    }

    // Check logs for patient data patterns
    const allLogs = consoleLogs.map(log => log.text).join(' ');

    // Should not log common patient name patterns
    const commonNames = ['João', 'Maria', 'Carlos', 'Ana', 'Silva', 'Santos'];
    let hasCommonName = false;
    for (const name of commonNames) {
      if (allLogs.includes(name)) {
        console.warn(`Found potential patient name in logs: ${name}`);
        hasCommonName = true;
      }
    }

    // Should not log medical terminology that might be PII
    const medicalTerms = ['diagnóstico:', 'sintomas:', 'medicação:', 'dor em'];
    let hasMedicalData = false;
    for (const term of medicalTerms) {
      if (allLogs.toLowerCase().includes(term)) {
        console.warn(`Found potential medical data in logs: ${term}`);
        hasMedicalData = true;
      }
    }

    // This is a warning test - we don't fail but we log warnings
    if (hasCommonName || hasMedicalData) {
      console.warn('⚠️ Potential PII found in console logs - review needed');
    }
  });

  test('should sanitize Supabase/database errors', async ({ page }) => {
    // Monitor for database-related errors
    const dbErrors: string[] = [];
    page.on('console', msg => {
      const text = msg.text().toLowerCase();
      if (text.includes('supabase') || text.includes('postgres') || text.includes('database')) {
        dbErrors.push(msg.text());
      }
    });

    // Login
    await login(page, TEST_CREDENTIALS.admin);

    // Navigate to trigger database calls
    await page.goto('/patients');
    await page.waitForTimeout(2000);

    // Check database errors
    const dbErrorText = dbErrors.join(' ');

    // Should not expose connection strings
    expect(dbErrorText).not.toMatch(/postgres:\/\//);
    expect(dbErrorText).not.toMatch(/supabase\.co\/.*key=/);

    // Should not expose API keys in Supabase errors
    expect(dbErrorText).not.toMatch(/anon.*key/i);
    expect(dbErrorText).not.toMatch(/service.*role.*key/i);
  });

  test('should not log full HTTP request/response bodies', async ({ page }) => {
    // Monitor network-related logs
    const networkLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text().toLowerCase();
      if (text.includes('http') || text.includes('request') || text.includes('response') || text.includes('fetch')) {
        networkLogs.push(msg.text());
      }
    });

    // Login
    await login(page, TEST_CREDENTIALS.admin);

    await page.goto('/patients', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const networkText = networkLogs.join(' ');

    // Should not log full request bodies
    expect(networkText).not.toContain('"password"');
    expect(networkText).not.toContain('"email"');

    // Should not log Authorization headers
    expect(networkText).not.toMatch(/Authorization:\s*Bearer/);
    expect(networkText).not.toMatch(/apikey:\s*[a-zA-Z0-9]/);
  });

  test('should validate no console.log in production build', async ({ page }) => {
    // This test checks that in production mode, debug logs are suppressed
    // Note: This requires running against a production build

    // Check if we're in production mode
    const isDev = await page.evaluate(() => {
      return import.meta.env.DEV;
    });

    if (!isDev) {
      // In production, there should be minimal console output
      await page.goto('/dashboard');
      await page.waitForTimeout(2000);

      const debugLogs = consoleLogs.filter(log => log.type === 'log' || log.type === 'debug');

      // Production should have very few debug logs
      expect(debugLogs.length).toBeLessThan(10);
    } else {
      console.log('⚠️ Running in development mode - skipping production log check');
    }
  });
});
