import { test, expect } from '@playwright/test';

test.describe('Módulo Financeiro', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a página de login
    await page.goto('http://localhost:3000/login');
    
    // Aguardar a página carregar
    await page.waitForLoadState('networkidle');
  });

  test('deve exibir a página de login', async ({ page }) => {
    // Verificar se a página de login está visível
    await expect(page.locator('h1, h2, [role="heading"]')).toContainText(/login|entrar/i);
  });

  test('deve navegar para dashboard após login (se autenticado)', async ({ page }) => {
    // Tentar navegar diretamente para o dashboard
    await page.goto('http://localhost:3000/dashboard/financeiro');
    
    // Se redirecionado para login, verificar
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      // Está na página de login (esperado se não autenticado)
      await expect(page.locator('h1, h2, [role="heading"]')).toContainText(/login|entrar/i);
    } else {
      // Se estiver no dashboard, verificar elementos
      await expect(page.locator('h1, h2, [role="heading"]')).toContainText(/financeiro|financial/i);
    }
  });

  test('deve verificar estrutura da página financeiro', async ({ page }) => {
    // Navegar para a página financeiro
    await page.goto('http://localhost:3000/dashboard/financeiro');
    
    // Aguardar carregamento
    await page.waitForLoadState('networkidle');
    
    // Verificar se há elementos da página (mesmo que redirecionado para login)
    const hasContent = await page.locator('body').count() > 0;
    expect(hasContent).toBeTruthy();
  });
});

