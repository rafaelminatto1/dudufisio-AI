import { test, expect } from '@playwright/test';

test.describe('Authentication and Authorization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should require authentication for clinical forms', async ({ page }) => {
    // Try to access assessment form without authentication
    await page.click('text=Avaliação Inicial');
    
    // Should redirect to login or show auth error
    await expect(page.locator('text=Login') || page.locator('text=Autenticação necessária')).toBeVisible();
  });

  test('should validate user roles', async ({ page }) => {
    // Mock therapist role
    await page.addInitScript(() => {
      window.localStorage.setItem('user_role', 'therapist');
      window.localStorage.setItem('user_id', 'test-therapist-id');
    });
    
    await page.reload();
    
    // Should be able to access clinical forms
    await page.click('text=Avaliação Inicial');
    await expect(page.locator('input[placeholder="UUID do Paciente"]')).toBeVisible();
  });

  test('should restrict access based on patient ownership', async ({ page }) => {
    // Mock patient role
    await page.addInitScript(() => {
      window.localStorage.setItem('user_role', 'patient');
      window.localStorage.setItem('user_id', 'test-patient-id');
    });
    
    await page.reload();
    
    // Should only see own data
    await page.click('text=Timeline Clínica');
    await expect(page.locator('text=test-patient-id')).toBeVisible();
  });

  test('should handle session expiration', async ({ page }) => {
    // Mock expired session
    await page.addInitScript(() => {
      window.localStorage.setItem('session_expired', 'true');
    });
    
    await page.reload();
    
    // Should redirect to login
    await expect(page.locator('text=Login') || page.locator('text=Sessão expirada')).toBeVisible();
  });

  test('should validate digital signature permissions', async ({ page }) => {
    // Mock therapist with signature permissions
    await page.addInitScript(() => {
      window.localStorage.setItem('user_role', 'therapist');
      window.localStorage.setItem('can_sign_documents', 'true');
    });
    
    await page.reload();
    
    // Should be able to sign documents
    await page.click('text=Documentos Clínicos');
    await expect(page.locator('text=Assinar Documento')).toBeVisible();
  });
});
