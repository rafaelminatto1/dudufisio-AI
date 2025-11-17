import { test, expect } from '@playwright/test';

test.describe('Basic Functionality', () => {
  test('server should start and respond', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FisioFlow|Next.js/i);
  });

  test('should navigate to agenda page', async ({ page }) => {
    await page.goto('/dashboard/agenda');
    // Verificar se a página carrega (mesmo que redirecione para login)
    await page.waitForLoadState('networkidle');
  });
});

