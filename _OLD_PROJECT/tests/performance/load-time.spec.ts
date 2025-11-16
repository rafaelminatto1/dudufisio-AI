import { test, expect } from '@playwright/test';

/**
 * FASE 5.1: Testes de Performance
 *
 * Cenários testados:
 * 1. Tempo de carregamento inicial da aplicação
 * 2. Performance de navegação entre páginas
 * 3. Performance de busca/filtros
 * 4. Renderização de listas grandes
 * 5. Análise de bundle size
 * 6. Tempo de resposta de formulários
 * 7. Performance de scroll em listas longas
 * 8. Lazy loading de componentes
 * 9. Cache e Service Worker
 * 10. Core Web Vitals (LCP, FID, CLS)
 */

test.describe('Performance - Análise Completa', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const sidebar = page.locator('aside');

    try {
      await sidebar.waitFor({ state: 'visible', timeout: 2000 });
      console.log('✅ Já está logado');
    } catch {
      console.log('ℹ️  Fazendo login...');
      await page.fill('[data-testid="login-email"]', 'admin@dudufisio.com');
      await page.fill('[data-testid="login-password"]', 'demo123456');
      await page.click('[data-testid="login-submit"]');
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      await sidebar.waitFor({ state: 'visible', timeout: 10000 });
      console.log('✅ Login realizado com sucesso');
    }
  });

  test('1. Tempo de carregamento inicial - Dashboard', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    const domLoadTime = Date.now() - startTime;

    await page.waitForLoadState('networkidle');
    const fullLoadTime = Date.now() - startTime;

    console.log(`📊 DOM Content Loaded: ${domLoadTime}ms`);
    console.log(`📊 Network Idle: ${fullLoadTime}ms`);

    if (fullLoadTime < 1000) {
      console.log('🚀 EXCELENTE: < 1s');
    } else if (fullLoadTime < 3000) {
      console.log('✅ BOM: < 3s');
    } else if (fullLoadTime < 5000) {
      console.log('⚠️  ACEITÁVEL: < 5s');
    } else {
      console.log('❌ LENTO: > 5s');
    }

    await page.screenshot({
      path: 'test-results/screenshots/perf-dashboard-load.png',
      fullPage: true
    });

    expect(fullLoadTime).toBeLessThan(10000); // Máximo 10s
  });

  test('2. Performance de navegação entre páginas', async ({ page }) => {
    const pages = [
      { name: 'Pacientes', selector: 'a:has-text("Pacientes")' },
      { name: 'Agenda', selector: 'a:has-text("Agenda")' },
      { name: 'Exercícios', selector: 'a:has-text("Exercícios")' },
      { name: 'Dashboard', selector: 'a:has-text("Dashboard")' },
    ];

    const navigationTimes: { page: string; time: number }[] = [];

    for (const targetPage of pages) {
      const link = page.locator(targetPage.selector);
      const hasLink = await link.isVisible().catch(() => false);

      if (hasLink) {
        const startTime = Date.now();
        await link.first().click();
        await page.waitForLoadState('domcontentloaded');
        const navTime = Date.now() - startTime;

        navigationTimes.push({ page: targetPage.name, time: navTime });
        console.log(`⏱️  ${targetPage.name}: ${navTime}ms`);
      }
    }

    const avgTime = navigationTimes.reduce((sum, item) => sum + item.time, 0) / navigationTimes.length;
    console.log(`📊 Tempo médio de navegação: ${avgTime.toFixed(0)}ms`);

    if (avgTime < 500) {
      console.log('🚀 Navegação muito rápida!');
    } else if (avgTime < 1500) {
      console.log('✅ Navegação rápida');
    } else {
      console.log('⚠️  Navegação pode ser otimizada');
    }

    expect(avgTime).toBeLessThan(3000);
  });

  test('3. Performance de busca/filtros', async ({ page }) => {
    await page.click('a:has-text("Pacientes")');
    await page.waitForLoadState('domcontentloaded');

    const searchInput = page.locator('input[type="search"], input[type="text"]').first();
    const hasSearch = await searchInput.isVisible().catch(() => false);

    if (hasSearch) {
      const startTime = Date.now();

      await searchInput.fill('João Silva');
      await page.waitForTimeout(500); // Aguardar debounce

      const searchTime = Date.now() - startTime;
      console.log(`⏱️  Tempo de busca: ${searchTime}ms`);

      if (searchTime < 300) {
        console.log('🚀 Busca instantânea');
      } else if (searchTime < 1000) {
        console.log('✅ Busca rápida');
      } else {
        console.log('⚠️  Busca lenta (pode precisar otimização)');
      }

      await page.screenshot({
        path: 'test-results/screenshots/perf-search.png',
        fullPage: true
      });

      expect(searchTime).toBeLessThan(2000);
    } else {
      console.log('ℹ️  Campo de busca não encontrado');
    }
  });

  test('4. Renderização de lista grande - Biblioteca de Exercícios', async ({ page }) => {
    const startTime = Date.now();

    await page.click('a:has-text("Biblioteca de Exercícios")');
    await page.waitForLoadState('domcontentloaded');

    const renderTime = Date.now() - startTime;

    // Contar itens renderizados
    const items = page.locator('[class*="exercise"], [class*="card"], [class*="item"]');
    const itemCount = await items.count();

    console.log(`📊 ${itemCount} exercícios renderizados em ${renderTime}ms`);

    const timePerItem = itemCount > 0 ? renderTime / itemCount : 0;
    console.log(`⏱️  Tempo por item: ${timePerItem.toFixed(2)}ms`);

    if (renderTime < 1000) {
      console.log('🚀 Renderização muito rápida');
    } else if (renderTime < 3000) {
      console.log('✅ Renderização rápida');
    } else {
      console.log('⚠️  Renderização lenta - considere virtualização');
    }

    await page.screenshot({
      path: 'test-results/screenshots/perf-large-list.png',
      fullPage: true
    });

    expect(renderTime).toBeLessThan(5000);
  });

  test('5. Análise de recursos carregados', async ({ page }) => {
    const resources: { type: string; count: number; totalSize: number }[] = [];
    const resourceTypes = ['script', 'stylesheet', 'image', 'font', 'fetch'];

    // Monitorar requisições
    const requestSizes = new Map<string, number>();

    page.on('response', async (response) => {
      const headers = await response.allHeaders();
      const contentLength = headers['content-length'];
      if (contentLength) {
        requestSizes.set(response.url(), parseInt(contentLength));
      }
    });

    await page.goto('/dashboard', { waitUntil: 'networkidle' });

    // Avaliar performance
    const performance = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        domInteractive: perfData.domInteractive - perfData.fetchStart,
      };
    });

    console.log(`📊 Performance Metrics:`);
    console.log(`   DOM Content Loaded: ${performance.domContentLoaded.toFixed(0)}ms`);
    console.log(`   Load Complete: ${performance.loadComplete.toFixed(0)}ms`);
    console.log(`   DOM Interactive: ${performance.domInteractive.toFixed(0)}ms`);

    // Calcular tamanho total de recursos
    let totalSize = 0;
    requestSizes.forEach(size => totalSize += size);
    console.log(`📦 Total de recursos carregados: ${(totalSize / 1024).toFixed(2)} KB`);

    if (totalSize < 500000) {
      console.log('🚀 Bundle size excelente (< 500KB)');
    } else if (totalSize < 1000000) {
      console.log('✅ Bundle size bom (< 1MB)');
    } else if (totalSize < 3000000) {
      console.log('⚠️  Bundle size pode ser otimizado (< 3MB)');
    } else {
      console.log('❌ Bundle size muito grande (> 3MB)');
    }
  });

  test('6. Tempo de resposta de formulários', async ({ page }) => {
    await page.click('a:has-text("Pacientes")');
    await page.waitForLoadState('domcontentloaded');

    const newButton = page.locator('button').filter({ hasText: /novo|adicionar/i }).first();
    const hasButton = await newButton.isVisible().catch(() => false);

    if (hasButton) {
      const startTime = Date.now();
      await newButton.click();

      // Aguardar modal/formulário abrir
      await page.waitForTimeout(500);
      const formOpenTime = Date.now() - startTime;

      console.log(`⏱️  Tempo para abrir formulário: ${formOpenTime}ms`);

      // Testar preenchimento
      const input = page.locator('input[type="text"]').first();
      const hasInput = await input.isVisible().catch(() => false);

      if (hasInput) {
        const typeStart = Date.now();
        await input.fill('Teste Performance');
        const typeTime = Date.now() - typeStart;

        console.log(`⏱️  Tempo de preenchimento: ${typeTime}ms`);

        if (typeTime < 100) {
          console.log('🚀 Input super responsivo');
        } else if (typeTime < 500) {
          console.log('✅ Input responsivo');
        } else {
          console.log('⚠️  Input com lag detectado');
        }
      }

      await page.screenshot({
        path: 'test-results/screenshots/perf-form-response.png',
        fullPage: true
      });

      expect(formOpenTime).toBeLessThan(2000);
    }
  });

  test('7. Performance de scroll em listas', async ({ page }) => {
    await page.click('a:has-text("Biblioteca de Exercícios")');
    await page.waitForLoadState('domcontentloaded');

    // Medir FPS durante scroll
    const startTime = Date.now();

    // Scroll para baixo
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(100);
    }

    const scrollTime = Date.now() - startTime;
    console.log(`⏱️  Tempo de scroll: ${scrollTime}ms`);

    // Verificar se lazy loading está funcionando
    const initialItems = await page.locator('[class*="exercise"], [class*="card"]').count();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const afterScrollItems = await page.locator('[class*="exercise"], [class*="card"]').count();

    if (afterScrollItems > initialItems) {
      console.log(`✅ Lazy loading detectado: ${initialItems} → ${afterScrollItems} itens`);
    } else {
      console.log(`ℹ️  Todos os ${initialItems} itens carregados de uma vez`);
    }

    await page.screenshot({
      path: 'test-results/screenshots/perf-scroll.png',
      fullPage: true
    });
  });

  test('8. Verificar lazy loading de rotas', async ({ page }) => {
    // Monitorar chunks carregados
    const loadedChunks: string[] = [];

    page.on('response', response => {
      const url = response.url();
      if (url.includes('.js') && !url.includes('node_modules')) {
        loadedChunks.push(url.split('/').pop() || '');
      }
    });

    // Navegar por diferentes páginas
    const routes = ['Pacientes', 'Agenda', 'Exercícios'];

    for (const route of routes) {
      const link = page.locator(`a:has-text("${route}")`);
      const hasLink = await link.isVisible().catch(() => false);

      if (hasLink) {
        await link.first().click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);
      }
    }

    console.log(`📦 Total de chunks JavaScript carregados: ${loadedChunks.length}`);

    const uniqueChunks = [...new Set(loadedChunks)];
    console.log(`📦 Chunks únicos: ${uniqueChunks.length}`);

    if (uniqueChunks.length > 5) {
      console.log('✅ Code splitting ativo - múltiplos chunks detectados');
    } else {
      console.log('⚠️  Poucos chunks - considere melhorar code splitting');
    }
  });

  test('9. Verificar Service Worker e cache', async ({ page }) => {
    // Verificar se service worker está registrado
    const swRegistered = await page.evaluate(() => {
      return navigator.serviceWorker.getRegistrations().then(regs => regs.length > 0);
    });

    if (swRegistered) {
      console.log('✅ Service Worker registrado');

      // Verificar cache
      const cacheExists = await page.evaluate(async () => {
        const cacheNames = await caches.keys();
        return cacheNames.length > 0;
      });

      if (cacheExists) {
        console.log('✅ Cache API sendo utilizado');
      } else {
        console.log('ℹ️  Cache API não detectado');
      }
    } else {
      console.log('ℹ️  Service Worker não registrado');
    }

    // Testar carregamento com cache
    const firstLoadStart = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const firstLoadTime = Date.now() - firstLoadStart;

    // Reload para testar cache
    const cachedLoadStart = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const cachedLoadTime = Date.now() - cachedLoadStart;

    console.log(`⏱️  Primeiro carregamento: ${firstLoadTime}ms`);
    console.log(`⏱️  Carregamento com cache: ${cachedLoadTime}ms`);

    const improvement = ((firstLoadTime - cachedLoadTime) / firstLoadTime) * 100;

    if (improvement > 20) {
      console.log(`🚀 Cache melhorou performance em ${improvement.toFixed(0)}%`);
    } else if (improvement > 0) {
      console.log(`✅ Cache ativo, melhoria de ${improvement.toFixed(0)}%`);
    } else {
      console.log('⚠️  Cache não está melhorando performance significativamente');
    }
  });

  test('10. Core Web Vitals - LCP, FID, CLS', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });

    // Medir Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: any = {
          lcp: 0,
          fid: 0,
          cls: 0,
        };

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // First Input Delay
        new PerformanceObserver((list) => {
          const entries = list.getEntries() as any[];
          entries.forEach((entry) => {
            vitals.fid = entry.processingStart - entry.startTime;
          });
        }).observe({ type: 'first-input', buffered: true });

        // Cumulative Layout Shift
        new PerformanceObserver((list) => {
          const entries = list.getEntries() as any[];
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              vitals.cls += entry.value;
            }
          });
        }).observe({ type: 'layout-shift', buffered: true });

        // Aguardar um pouco para coletar métricas
        setTimeout(() => resolve(vitals), 2000);
      });
    });

    console.log(`📊 Core Web Vitals:`);
    console.log(`   LCP (Largest Contentful Paint): ${(webVitals as any).lcp.toFixed(0)}ms`);
    console.log(`   FID (First Input Delay): ${(webVitals as any).fid.toFixed(0)}ms`);
    console.log(`   CLS (Cumulative Layout Shift): ${(webVitals as any).cls.toFixed(3)}`);

    // Avaliar LCP
    if ((webVitals as any).lcp < 2500) {
      console.log('🚀 LCP: Excelente');
    } else if ((webVitals as any).lcp < 4000) {
      console.log('✅ LCP: Bom');
    } else {
      console.log('⚠️  LCP: Precisa melhorar');
    }

    // Avaliar FID
    if ((webVitals as any).fid < 100) {
      console.log('🚀 FID: Excelente');
    } else if ((webVitals as any).fid < 300) {
      console.log('✅ FID: Bom');
    } else {
      console.log('⚠️  FID: Precisa melhorar');
    }

    // Avaliar CLS
    if ((webVitals as any).cls < 0.1) {
      console.log('🚀 CLS: Excelente');
    } else if ((webVitals as any).cls < 0.25) {
      console.log('✅ CLS: Bom');
    } else {
      console.log('⚠️  CLS: Precisa melhorar');
    }

    await page.screenshot({
      path: 'test-results/screenshots/perf-web-vitals.png',
      fullPage: true
    });
  });
});
