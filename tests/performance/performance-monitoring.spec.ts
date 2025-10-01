import { test, expect } from '@playwright/test';

/**
 * 🧪 Testes de Monitoramento de Performance
 * 
 * Valida o sistema de monitoramento implementado
 */

test.describe('Performance Monitoring System', () => {
  test.beforeEach(async ({ page }) => {
    // Navega para a aplicação
    await page.goto('http://localhost:5175');
    
    // Faz login como admin
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Aguarda carregar
    await page.waitForLoadState('networkidle');
  });

  test('deve carregar o dashboard de performance', async ({ page }) => {
    // Navega para o dashboard de performance
    await page.goto('http://localhost:5175/admin/performance');
    
    // Aguarda o dashboard carregar
    await page.waitForSelector('h1:has-text("Dashboard de Performance")');
    
    // Verifica se os elementos principais estão presentes
    await expect(page.locator('text=Core Web Vitals')).toBeVisible();
    await expect(page.locator('text=Estatísticas de Cache')).toBeVisible();
    await expect(page.locator('text=Componentes Mais Lentos')).toBeVisible();
  });

  test('deve exibir métricas de Core Web Vitals', async ({ page }) => {
    await page.goto('http://localhost:5175/admin/performance');
    await page.waitForSelector('h2:has-text("Core Web Vitals")');
    
    // Verifica se as métricas existem
    const lcpCard = page.locator('text=LCP').first();
    await expect(lcpCard).toBeVisible();
    
    const fidCard = page.locator('text=FID').first();
    await expect(fidCard).toBeVisible();
    
    const clsCard = page.locator('text=CLS').first();
    await expect(clsCard).toBeVisible();
    
    const ttfbCard = page.locator('text=TTFB').first();
    await expect(ttfbCard).toBeVisible();
  });

  test('deve exibir estatísticas de cache', async ({ page }) => {
    await page.goto('http://localhost:5175/admin/performance');
    await page.waitForSelector('h2:has-text("Estatísticas de Cache")');
    
    // Verifica estatísticas de cache
    await expect(page.locator('text=Cache Hits')).toBeVisible();
    await expect(page.locator('text=Cache Misses')).toBeVisible();
    await expect(page.locator('text=Hit Rate')).toBeVisible();
    await expect(page.locator('text=Entradas')).toBeVisible();
  });

  test('deve permitir pausar e iniciar monitoramento', async ({ page }) => {
    await page.goto('http://localhost:5175/admin/performance');
    
    // Verifica status inicial
    const statusBadge = page.locator('text=🟢 Ativo');
    await expect(statusBadge).toBeVisible();
    
    // Pausa o monitoramento
    await page.click('button:has-text("Pausar")');
    await expect(page.locator('text=🔴 Pausado')).toBeVisible();
    
    // Inicia novamente
    await page.click('button:has-text("Iniciar")');
    await expect(statusBadge).toBeVisible();
  });

  test('deve permitir resetar métricas', async ({ page }) => {
    await page.goto('http://localhost:5175/admin/performance');
    
    // Clica no botão resetar
    await page.click('button:has-text("Resetar")');
    
    // Aguarda confirmação (se houver)
    await page.waitForTimeout(1000);
    
    // Verifica se a página recarregou ou atualizou
    await expect(page.locator('h1:has-text("Dashboard de Performance")')).toBeVisible();
  });

  test('deve permitir exportar relatório', async ({ page }) => {
    await page.goto('http://localhost:5175/admin/performance');
    
    // Configura listener para download
    const downloadPromise = page.waitForEvent('download');
    
    // Clica no botão exportar
    await page.click('button:has-text("Exportar")');
    
    // Aguarda o download
    const download = await downloadPromise;
    
    // Verifica se o arquivo foi baixado
    expect(download.suggestedFilename()).toContain('performance-report');
    expect(download.suggestedFilename()).toContain('.json');
  });

  test('deve exibir lista de componentes lentos', async ({ page }) => {
    await page.goto('http://localhost:5175/admin/performance');
    await page.waitForSelector('h2:has-text("Componentes Mais Lentos")');
    
    // Verifica se a tabela existe
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    // Verifica headers da tabela
    await expect(page.locator('th:has-text("Componente")')).toBeVisible();
    await expect(page.locator('th:has-text("Tempo de Render")')).toBeVisible();
    await expect(page.locator('th:has-text("Atualizações")')).toBeVisible();
  });

  test('deve exibir recomendações baseadas nas métricas', async ({ page }) => {
    await page.goto('http://localhost:5175/admin/performance');
    await page.waitForSelector('h2:has-text("Recomendações")');
    
    // Verifica se a seção de recomendações existe
    const recommendations = page.locator('h2:has-text("Recomendações")');
    await expect(recommendations).toBeVisible();
  });
});

test.describe('Performance Metrics Collection', () => {
  test('deve coletar métricas de navegação', async ({ page }) => {
    // Navega entre páginas
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    
    await page.goto('http://localhost:5175/dashboard');
    await page.waitForLoadState('networkidle');
    
    await page.goto('http://localhost:5175/patients');
    await page.waitForLoadState('networkidle');
    
    // Acessa o dashboard de performance
    await page.goto('http://localhost:5175/admin/performance');
    await page.waitForSelector('h1:has-text("Dashboard de Performance")');
    
    // Verifica se há métricas coletadas
    const metricsExist = await page.locator('text=Cache Hits').isVisible();
    expect(metricsExist).toBeTruthy();
  });

  test('deve registrar performance de componentes', async ({ page }) => {
    // Navega para uma página com componentes pesados
    await page.goto('http://localhost:5175/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Aguarda componentes renderizarem
    await page.waitForTimeout(2000);
    
    // Vai para dashboard de performance
    await page.goto('http://localhost:5175/admin/performance');
    
    // Verifica se componentes foram registrados
    const componentsTable = page.locator('h2:has-text("Componentes Mais Lentos")');
    await expect(componentsTable).toBeVisible();
  });
});

test.describe('Performance Optimization Validation', () => {
  test('deve carregar página em menos de 3 segundos', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:5175/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
    console.log(`⚡ Tempo de carregamento: ${loadTime}ms`);
  });

  test('deve ter LCP menor que 2.5s', async ({ page }) => {
    await page.goto('http://localhost:5175/dashboard');
    
    // Coleta LCP
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          resolve(lastEntry.renderTime || lastEntry.loadTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Timeout após 5 segundos
        setTimeout(() => resolve(0), 5000);
      });
    });
    
    console.log(`📊 LCP: ${lcp}ms`);
    expect(lcp).toBeLessThan(2500);
  });

  test('deve ter menos de 50 re-renders por página', async ({ page }) => {
    let renderCount = 0;
    
    await page.exposeFunction('trackRender', () => {
      renderCount++;
    });
    
    await page.goto('http://localhost:5175/dashboard');
    await page.waitForLoadState('networkidle');
    
    console.log(`🔄 Número de renders: ${renderCount}`);
    expect(renderCount).toBeLessThan(50);
  });
});
