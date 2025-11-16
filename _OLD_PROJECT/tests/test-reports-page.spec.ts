import { test, expect } from '@playwright/test';

test.describe('ReportsPage - Teste de Timeout', () => {
  
  test('deve carregar ReportsPage sem timeout', async ({ page }) => {
    console.log('\n🔍 Testando ReportsPage...');
    
    // Capturar todos os console.log do browser
    page.on('console', msg => {
      console.log(`[BROWSER ${msg.type()}]:`, msg.text());
    });
    
    // Capturar erros de página
    page.on('pageerror', error => {
      console.log(`[PAGE ERROR]:`, error.message);
    });
    
    // 1. Fazer login primeiro
    console.log('1. Fazendo login...');
    await page.goto('http://localhost:5175');
    
    // Aguardar e preencher formulário
    await page.waitForSelector('[data-testid="login-email"]');
    await page.fill('[data-testid="login-email"]', 'admin@dudufisio.com');
    await page.fill('[data-testid="login-password"]', 'demo123456');
    
    // Clicar no botão de login
    await page.click('[data-testid="login-submit"]');
    
    // Aguardar layout autenticado aparecer (client-side navigation)
    await page.waitForSelector('[data-testid="main-content"]', { timeout: 30000 });
    
    // Garantir que está totalmente carregado
    await page.waitForTimeout(1000);
    console.log('✅ Login OK');
    
    // 2. Navegar para /reports
    console.log('2. Navegando para /reports...');
    const startTime = Date.now();
    
    try {
      await page.goto('http://localhost:5175/reports', {
        waitUntil: 'networkidle',
        timeout: 30000 // 30s timeout
      });
      
      const loadTime = Date.now() - startTime;
      console.log(`✅ Página carregou em ${loadTime}ms`);
      
      // 3. Verificar se elementos da página estão visíveis
      await page.waitForSelector('text=Relatórios e Analytics', { timeout: 5000 });
      console.log('✅ Título encontrado');
      
      await page.waitForSelector('text=Dashboard', { timeout: 5000 });
      console.log('✅ Tab Dashboard encontrada');
      
      await page.waitForSelector('text=Receita Total', { timeout: 5000 });
      console.log('✅ Card de métricas encontrado');
      
      // Tirar screenshot de sucesso
      await page.screenshot({ 
        path: 'test-results/screenshots/reports-page-success.png',
        fullPage: true 
      });
      
      console.log('✅ ReportsPage FUNCIONA PERFEITAMENTE!');
      console.log(`⏱️  Tempo total de carregamento: ${loadTime}ms`);
      
    } catch (error: any) {
      const loadTime = Date.now() - startTime;
      console.log(`❌ ERRO após ${loadTime}ms: ${error.message}`);
      
      // Capturar screenshot do erro
      await page.screenshot({ 
        path: 'test-results/screenshots/reports-page-error.png',
        fullPage: true 
      });
      
      // Capturar erros do console
      const consoleLogs = await page.evaluate(() => {
        return (window as any).__console_errors || [];
      });
      
      console.log('Console errors:', consoleLogs);
      
      throw error;
    }
  });
  
  test('deve testar navegação entre tabs', async ({ page }) => {
    console.log('\n🔍 Testando navegação entre tabs...');
    
    // Login
    await page.goto('http://localhost:5175');
    await page.waitForSelector('[data-testid="login-email"]');
    await page.fill('[data-testid="login-email"]', 'admin@dudufisio.com');
    await page.fill('[data-testid="login-password"]', 'demo123456');
    
    // Clicar no botão de login
    await page.click('[data-testid="login-submit"]');
    
    // Aguardar layout autenticado (client-side navigation)
    await page.waitForSelector('[data-testid="main-content"]', { timeout: 30000 });
    
    await page.waitForTimeout(1000);
    
    // Ir para /reports
    await page.goto('http://localhost:5175/reports');
    await page.waitForSelector('text=Relatórios e Analytics');
    
    // Testar cada tab
    const tabs = ['Consumo', 'Custos', 'Configurações'];
    
    for (const tab of tabs) {
      console.log(`📑 Testando tab: ${tab}`);
      await page.click(`text=${tab}`);
      await page.waitForTimeout(500);
      console.log(`✅ Tab ${tab} OK`);
    }
    
    console.log('✅ Todas as tabs funcionam!');
  });
  
});

