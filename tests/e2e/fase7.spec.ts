import { test, expect } from '@playwright/test';

test.describe('Fase 7 - Testes de Componentes e Services', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/test-fase7');
    // Aguardar página carregar
    await page.waitForLoadState('networkidle');
  });

  test('deve carregar a página de teste sem erros', async ({ page }) => {
    // Verificar se a página carregou
    await expect(page.locator('h1')).toContainText('Testes Fase 7');
    
    // Verificar se não há erros de console críticos
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignorar erros conhecidos do Next.js dev
        if (!text.includes('Module not found') && !text.includes('Failed to compile')) {
          errors.push(text);
        }
      }
    });

    await page.waitForTimeout(2000);
    
    // Verificar se há erros não esperados
    const criticalErrors = errors.filter(e => 
      !e.includes('Supabase') && 
      !e.includes('favicon')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('deve renderizar RadioGroup corretamente', async ({ page }) => {
    // Verificar se RadioGroup está presente
    const radioGroup = page.locator('[role="radiogroup"]');
    await expect(radioGroup).toBeVisible();
    
    // Verificar se há opções
    const radioItems = page.locator('input[type="radio"]');
    await expect(radioItems).toHaveCount(3);
    
    // Testar seleção
    await page.locator('#r2').click();
    await expect(page.locator('#r2')).toBeChecked();
  });

  test('deve renderizar Toggle corretamente', async ({ page }) => {
    // Verificar se Toggle está presente
    const toggle = page.locator('button[aria-label="Toggle italic"]');
    await expect(toggle).toBeVisible();
    
    // Testar toggle
    await toggle.click();
    await expect(toggle).toHaveAttribute('data-state', 'on');
    
    await toggle.click();
    await expect(toggle).toHaveAttribute('data-state', 'off');
  });

  test('deve renderizar ToggleGroup corretamente', async ({ page }) => {
    // Verificar se ToggleGroup está presente
    const toggleGroup = page.locator('[role="group"]');
    await expect(toggleGroup.first()).toBeVisible();
    
    // Testar seleção múltipla
    const boldToggle = page.locator('button[aria-label="Toggle bold"]');
    const italicToggle = page.locator('button[aria-label="Toggle italic"]');
    
    await boldToggle.click();
    await expect(boldToggle).toHaveAttribute('data-state', 'on');
    
    await italicToggle.click();
    await expect(italicToggle).toHaveAttribute('data-state', 'on');
  });

  test('deve renderizar ScrollArea corretamente', async ({ page }) => {
    // Verificar se ScrollArea está presente
    const scrollArea = page.locator('[data-radix-scroll-area-viewport]');
    await expect(scrollArea).toBeVisible();
    
    // Verificar se há conteúdo scrollável
    const items = page.locator('text=Item 1');
    await expect(items).toBeVisible();
    
    // Verificar se há múltiplos itens
    const item20 = page.locator('text=Item 20');
    await expect(item20).toBeVisible();
  });

  test('deve testar SystemHealthService', async ({ page }) => {
    // Clicar no botão de teste
    const button = page.locator('button:has-text("SystemHealth")');
    await button.click();
    
    // Aguardar resultado
    await page.waitForTimeout(2000);
    
    // Verificar se há resultado
    const result = page.locator('text=SystemHealth Status');
    await expect(result).toBeVisible({ timeout: 5000 });
    
    // Verificar logs
    const logs = page.locator('text=/Testando SystemHealthService/');
    await expect(logs).toBeVisible();
  });

  test('deve testar PerformanceMonitorService', async ({ page }) => {
    // Clicar no botão de teste
    const button = page.locator('button:has-text("PerformanceMonitor")');
    await button.click();
    
    // Aguardar resultado
    await page.waitForTimeout(2000);
    
    // Verificar se há resultado
    const result = page.locator('text=Performance Stats');
    await expect(result).toBeVisible({ timeout: 5000 });
    
    // Verificar logs
    const logs = page.locator('text=/Testando PerformanceMonitorService/');
    await expect(logs).toBeVisible();
  });

  test('deve testar ErrorTrackingService', async ({ page }) => {
    // Clicar no botão de teste
    const button = page.locator('button:has-text("ErrorTracking")');
    await button.click();
    
    // Aguardar resultado
    await page.waitForTimeout(2000);
    
    // Verificar se há resultado
    const result = page.locator('text=Error Stats');
    await expect(result).toBeVisible({ timeout: 5000 });
    
    // Verificar logs
    const logs = page.locator('text=/Testando ErrorTrackingService/');
    await expect(logs).toBeVisible();
  });

  test('deve testar todos os services juntos', async ({ page }) => {
    // Clicar no botão de teste
    const button = page.locator('button:has-text("Testar Todos")');
    await button.click();
    
    // Aguardar todos os testes
    await page.waitForTimeout(5000);
    
    // Verificar se todos os resultados apareceram
    await expect(page.locator('text=SystemHealth Status')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Performance Stats')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Error Stats')).toBeVisible({ timeout: 10000 });
    
    // Verificar logs
    const logs = page.locator('text=/Testes concluídos/');
    await expect(logs).toBeVisible();
  });

  test('deve exibir logs corretamente', async ({ page }) => {
    // Executar um teste
    const button = page.locator('button:has-text("Testar Todos")');
    await button.click();
    
    // Aguardar logs
    await page.waitForTimeout(3000);
    
    // Verificar se há logs na área de logs
    const logArea = page.locator('text=/Página de teste carregada/');
    await expect(logArea).toBeVisible();
    
    // Verificar se há múltiplos logs
    const logs = page.locator('[class*="font-mono"]').filter({ hasText: /\[/ });
    const count = await logs.count();
    expect(count).toBeGreaterThan(0);
  });
});

