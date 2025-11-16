import { test, expect } from '@playwright/test';

test.describe('DuduFisio AI - Testes E2E Básicos', () => {
  test('deve carregar a página principal', async ({ page }) => {
    // Navegar para a aplicação
    await page.goto('/');
    
    // Verificar se a página carregou
    await expect(page).toHaveTitle(/DuduFisio|FisioFlow/);
  });

  test('deve verificar se a aplicação está funcionando', async ({ page }) => {
    // Navegar para a aplicação
    await page.goto('/');
    
    // Aguardar o carregamento
    await page.waitForLoadState('networkidle');
    
    // Verificar se não há erros críticos
    const errors = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('[data-testid="error"]');
      return errorElements.length;
    });
    
    expect(errors).toBe(0);
  });

  test('deve verificar se o Supabase está conectado', async ({ page }) => {
    // Navegar para a aplicação
    await page.goto('/');
    
    // Aguardar o carregamento
    await page.waitForLoadState('networkidle');
    
    // Verificar se não há erros de conexão
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Aguardar um pouco para capturar erros
    await page.waitForTimeout(2000);
    
    // Verificar se não há erros de Supabase
    const supabaseErrors = consoleErrors.filter(error => 
      error.includes('Supabase') || error.includes('supabase')
    );
    
    expect(supabaseErrors.length).toBe(0);
  });
});
