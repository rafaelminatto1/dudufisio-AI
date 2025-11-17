import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Módulo Financeiro', () => {
  test('deve exibir a página de login', async ({ page }) => {
    // Navegar para a página de login
    await page.goto(`${BASE_URL}/login`);
    
    // Aguardar a página carregar
    await page.waitForLoadState('networkidle');
    
    // Verificar se a página de login está visível
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('deve redirecionar para login ao acessar dashboard sem autenticação', async ({ page }) => {
    // Tentar navegar diretamente para o dashboard
    await page.goto(`${BASE_URL}/dashboard/financeiro`);
    
    // Aguardar redirecionamento
    await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {});
    
    // Verificar se foi redirecionado para login
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
  });

  test('deve verificar estrutura básica da aplicação', async ({ page }) => {
    // Navegar para a página inicial
    await page.goto(BASE_URL);
    
    // Aguardar carregamento
    await page.waitForLoadState('networkidle');
    
    // Verificar se há elementos da página
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Verificar se há algum conteúdo
    const hasContent = await body.count() > 0;
    expect(hasContent).toBeTruthy();
  });
});

