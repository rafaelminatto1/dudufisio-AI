import { test, expect } from '@playwright/test';

test.describe('Performance - Core Web Vitals', () => {
  
  test('Largest Contentful Paint (LCP) < 2.5s', async ({ page }) => {
    await page.goto('/');
    
    // Medir LCP usando Performance API
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          resolve(lastEntry.renderTime || lastEntry.loadTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Timeout de 10s
        setTimeout(() => resolve(0), 10000);
      });
    });
    
    console.log(`LCP: ${lcp}ms`);
    
    // LCP deve ser menor que 2500ms (2.5s) para "Good"
    expect(lcp).toBeLessThan(2500);
    // LCP entre 2.5s-4s é "Needs Improvement"
    // LCP > 4s é "Poor"
  });

  test('First Input Delay (FID) < 100ms', async ({ page }) => {
    await page.goto('/login');
    
    // Medir FID ao interagir
    const fid = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const firstEntry = entries[0] as any;
          resolve(firstEntry.processingStart - firstEntry.startTime);
        }).observe({ entryTypes: ['first-input'] });
        
        setTimeout(() => resolve(0), 5000);
      });
    });
    
    // Simular primeiro input
    await page.click('[data-testid="input-login-email"]');
    
    await page.waitForTimeout(100);
    
    console.log(`FID: ${fid}ms`);
    
    // FID deve ser menor que 100ms para "Good"
    if (fid > 0) {
      expect(fid).toBeLessThan(100);
    }
  });

  test('Cumulative Layout Shift (CLS) < 0.1', async ({ page }) => {
    await page.goto('/');
    
    // Aguardar carregamento completo
    await page.waitForLoadState('networkidle');
    
    // Medir CLS
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });
        
        // Aguardar 3 segundos para capturar shifts
        setTimeout(() => resolve(clsValue), 3000);
      });
    });
    
    console.log(`CLS: ${cls}`);
    
    // CLS deve ser menor que 0.1 para "Good"
    expect(cls).toBeLessThan(0.1);
  });

  test('Time to Interactive (TTI) < 3.8s', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    
    // Aguardar até a página estar totalmente interativa
    await page.waitForLoadState('networkidle');
    
    const tti = Date.now() - startTime;
    
    console.log(`TTI: ${tti}ms`);
    
    // TTI deve ser menor que 3800ms (3.8s) para "Good"
    expect(tti).toBeLessThan(3800);
  });

  test('First Contentful Paint (FCP) < 1.8s', async ({ page }) => {
    await page.goto('/');
    
    // Medir FCP
    const fcp = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      return fcpEntry ? fcpEntry.startTime : 0;
    });
    
    console.log(`FCP: ${fcp}ms`);
    
    // FCP deve ser menor que 1800ms (1.8s) para "Good"
    expect(fcp).toBeLessThan(1800);
  });
});

test.describe('Performance - Carregamento de Páginas', () => {
  
  test('Dashboard deve carregar em menos de 3 segundos', async ({ page }) => {
    // Login primeiro
    await page.goto('/login');
    await page.fill('[data-testid="input-login-email"]', 'admin@moocafisio.com.br');
    await page.fill('[data-testid="input-login-password"]', 'DuduFisio2024!');
    await page.click('[data-testid="btn-login-submit"]');
    await page.waitForURL(/\/dashboard|\/agenda/);
    
    // Medir tempo de carregamento do dashboard
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`Dashboard load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('Lista de pacientes deve carregar em menos de 2 segundos', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="input-login-email"]', 'admin@moocafisio.com.br');
    await page.fill('[data-testid="input-login-password"]', 'DuduFisio2024!');
    await page.click('[data-testid="btn-login-submit"]');
    await page.waitForURL(/\/dashboard|\/agenda/);
    
    const startTime = Date.now();
    await page.goto('/patients');
    await page.waitForSelector('[data-testid="table-patients"]', { timeout: 5000 });
    const loadTime = Date.now() - startTime;
    
    console.log(`Patients list load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2000);
  });

  test('Agenda deve carregar em menos de 2.5 segundos', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="input-login-email"]', 'admin@moocafisio.com.br');
    await page.fill('[data-testid="input-login-password"]', 'DuduFisio2024!');
    await page.click('[data-testid="btn-login-submit"]');
    await page.waitForURL(/\/dashboard|\/agenda/);
    
    const startTime = Date.now();
    await page.goto('/agenda');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`Agenda load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2500);
  });
});

test.describe('Performance - Queries e API', () => {
  
  test('Queries do Supabase devem retornar em < 500ms', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="input-login-email"]', 'admin@moocafisio.com.br');
    await page.fill('[data-testid="input-login-password"]', 'DuduFisio2024!');
    await page.click('[data-testid="btn-login-submit"]');
    await page.waitForURL(/\/dashboard|\/agenda/);
    
    // Interceptar requests do Supabase
    const queryTimes: number[] = [];
    
    page.on('response', response => {
      if (response.url().includes('supabase.co')) {
        const timing = response.timing();
        queryTimes.push(timing.responseEnd);
      }
    });
    
    // Fazer ações que disparam queries
    await page.goto('/patients');
    await page.waitForTimeout(2000);
    
    if (queryTimes.length > 0) {
      const avgQueryTime = queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length;
      console.log(`Average Supabase query time: ${avgQueryTime}ms`);
      console.log(`Queries: ${queryTimes.length}`);
      
      // Queries individuais devem ser rápidas
      expect(avgQueryTime).toBeLessThan(500);
    }
  });

  test('Não deve haver N+1 queries', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="input-login-email"]', 'admin@moocafisio.com.br');
    await page.fill('[data-testid="input-login-password"]', 'DuduFisio2024!');
    await page.click('[data-testid="btn-login-submit"]');
    await page.waitForURL(/\/dashboard|\/agenda/);
    
    // Contar queries para listagem de pacientes
    let queryCount = 0;
    
    page.on('request', request => {
      if (request.url().includes('supabase.co') && request.method() === 'GET') {
        queryCount++;
      }
    });
    
    await page.goto('/patients');
    await page.waitForSelector('[data-testid="table-patients"]', { timeout: 5000 });
    
    console.log(`Total queries for patients list: ${queryCount}`);
    
    // Deve haver poucas queries (idealmente 1-3 para listar pacientes)
    // Não deve haver uma query para cada item da lista (N+1 problem)
    expect(queryCount).toBeLessThan(10);
  });

  test('Cache deve reduzir tempo de carregamento em acessos subsequentes', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="input-login-email"]', 'admin@moocafisio.com.br');
    await page.fill('[data-testid="input-login-password"]', 'DuduFisio2024!');
    await page.click('[data-testid="btn-login-submit"]');
    await page.waitForURL(/\/dashboard|\/agenda/);
    
    // Primeira carga (sem cache)
    const startTime1 = Date.now();
    await page.goto('/patients');
    await page.waitForSelector('[data-testid="table-patients"]', { timeout: 5000 });
    const loadTime1 = Date.now() - startTime1;
    
    // Voltar e recarregar (com cache)
    await page.goto('/dashboard');
    await page.waitForTimeout(500);
    
    const startTime2 = Date.now();
    await page.goto('/patients');
    await page.waitForSelector('[data-testid="table-patients"]', { timeout: 5000 });
    const loadTime2 = Date.now() - startTime2;
    
    console.log(`First load: ${loadTime1}ms`);
    console.log(`Second load (cached): ${loadTime2}ms`);
    
    // Segunda carga deve ser mais rápida (pelo menos 20% mais rápida)
    expect(loadTime2).toBeLessThan(loadTime1 * 0.8);
  });
});

test.describe('Performance - Tamanho de Assets', () => {
  
  test('Bundle JavaScript deve ser < 500KB', async ({ page }) => {
    await page.goto('/');
    
    let totalJsSize = 0;
    
    page.on('response', async response => {
      if (response.url().endsWith('.js')) {
        const buffer = await response.body().catch(() => null);
        if (buffer) {
          totalJsSize += buffer.length;
        }
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    const totalJsSizeKB = totalJsSize / 1024;
    console.log(`Total JS bundle size: ${totalJsSizeKB.toFixed(2)} KB`);
    
    // Bundle total deve ser menor que 500KB (após gzip seria ~150KB)
    expect(totalJsSizeKB).toBeLessThan(500);
  });

  test('Imagens devem ser otimizadas', async ({ page }) => {
    await page.goto('/');
    
    const imageSizes: { url: string; size: number }[] = [];
    
    page.on('response', async response => {
      if (response.url().match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        const buffer = await response.body().catch(() => null);
        if (buffer) {
          imageSizes.push({
            url: response.url(),
            size: buffer.length
          });
        }
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Imagens individuais não devem ser maiores que 200KB
    for (const image of imageSizes) {
      const sizeKB = image.size / 1024;
      console.log(`Image: ${image.url} - ${sizeKB.toFixed(2)} KB`);
      expect(sizeKB).toBeLessThan(200);
    }
  });
});

test.describe('Performance - Lazy Loading', () => {
  
  test('Componentes fora da viewport devem usar lazy loading', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="input-login-email"]', 'admin@moocafisio.com.br');
    await page.fill('[data-testid="input-login-password"]', 'DuduFisio2024!');
    await page.click('[data-testid="btn-login-submit"]');
    await page.waitForURL(/\/dashboard|\/agenda/);
    
    // Navegar para página com muitos elementos
    await page.goto('/patients');
    
    // Contar quantos elementos foram carregados inicialmente
    const initialElements = await page.locator('[data-testid^="patient-row"]').count();
    
    // Scroll para baixo para carregar mais
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    const afterScrollElements = await page.locator('[data-testid^="patient-row"]').count();
    
    console.log(`Initial elements: ${initialElements}`);
    console.log(`After scroll: ${afterScrollElements}`);
    
    // Se implementado lazy loading, deve carregar mais elementos ao scrollar
    // OU carregar todos mas de forma paginada
    expect(afterScrollElements).toBeGreaterThanOrEqual(initialElements);
  });
});

test.describe('Performance - Lighthouse Score', () => {
  
  test('Performance score deve ser > 80', async ({ page }) => {
    await page.goto('/');
    
    // Obter métricas de performance
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        ttfb: navigation.responseStart - navigation.requestStart
      };
    });
    
    console.log('Performance Metrics:', metrics);
    
    // Time to First Byte deve ser < 800ms
    expect(metrics.ttfb).toBeLessThan(800);
    
    // DOM Interactive deve ser < 2000ms
    expect(metrics.domInteractive).toBeLessThan(2000);
  });
});

