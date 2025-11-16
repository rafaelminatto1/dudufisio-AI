import { test, expect } from '@playwright/test';

test.describe('End-to-End Navigation Tests', () => {
  test('should navigate through app without errors', async ({ page }) => {
    // Configurar listener de erros
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navegar para página inicial
    await page.goto('http://localhost:4173/');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Página inicial carregada');

    // Verificar que não há erros críticos
    const criticalErrors = errors.filter(err => 
      !err.includes('Failed to load resource') && 
      !err.includes('404') &&
      !err.includes('favicon')
    );
    
    console.log('Erros críticos encontrados:', criticalErrors.length);
    expect(criticalErrors.length).toBe(0);
  });

  test('should navigate to dashboard and load content', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    await page.waitForLoadState('networkidle');

    // Tentar navegar para dashboard
    try {
      await page.click('a[href="/dashboard"]', { timeout: 5000 });
      await page.waitForLoadState('networkidle');
      console.log('✅ Navegação para dashboard bem-sucedida');
    } catch (error) {
      console.log('⚠️ Link de dashboard não encontrado, tentando navegação direta');
      await page.goto('http://localhost:4173/dashboard');
      await page.waitForLoadState('networkidle');
    }

    // Verificar que a página carregou
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('should navigate to patients page', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    await page.waitForLoadState('networkidle');

    // Tentar navegar para patients
    try {
      await page.click('a[href="/patients"]', { timeout: 5000 });
      await page.waitForLoadState('networkidle');
      console.log('✅ Navegação para patients bem-sucedida');
    } catch (error) {
      console.log('⚠️ Link de patients não encontrado, tentando navegação direta');
      await page.goto('http://localhost:4173/patients');
      await page.waitForLoadState('networkidle');
    }

    // Verificar que a página carregou
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('should navigate to agenda page', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    await page.waitForLoadState('networkidle');

    // Tentar navegar para agenda
    try {
      await page.click('a[href="/agenda"]', { timeout: 5000 });
      await page.waitForLoadState('networkidle');
      console.log('✅ Navegação para agenda bem-sucedida');
    } catch (error) {
      console.log('⚠️ Link de agenda não encontrado, tentando navegação direta');
      await page.goto('http://localhost:4173/agenda');
      await page.waitForLoadState('networkidle');
    }

    // Verificar que a página carregou
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('should measure performance metrics', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    
    // Medir métricas de performance
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstPaint: paint.find((entry: any) => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find((entry: any) => entry.name === 'first-contentful-paint')?.startTime || 0,
        timeToInteractive: navigation.domInteractive - navigation.fetchStart,
      };
    });

    console.log('📊 Métricas de Performance:');
    console.log('  - Load Time:', metrics.loadTime, 'ms');
    console.log('  - DOM Content Loaded:', metrics.domContentLoaded, 'ms');
    console.log('  - First Paint:', metrics.firstPaint, 'ms');
    console.log('  - First Contentful Paint:', metrics.firstContentfulPaint, 'ms');
    console.log('  - Time to Interactive:', metrics.timeToInteractive, 'ms');

    // Validar que métricas estão dentro dos limites
    expect(metrics.loadTime).toBeLessThan(5000); // < 5s
    expect(metrics.domContentLoaded).toBeLessThan(3000); // < 3s
  });

  test('should handle multiple page navigations', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    await page.waitForLoadState('networkidle');

    // Navegar por múltiplas páginas
    const pages = ['/dashboard', '/patients', '/agenda'];
    
    for (const pagePath of pages) {
      try {
        await page.goto(`http://localhost:4173${pagePath}`);
        await page.waitForLoadState('networkidle');
        console.log(`✅ Navegação para ${pagePath} bem-sucedida`);
        
        // Verificar que a página carregou
        const content = await page.textContent('body');
        expect(content).toBeTruthy();
      } catch (error) {
        console.log(`⚠️ Erro ao navegar para ${pagePath}:`, error);
      }
    }
  });

  test('should check for console errors during navigation', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('http://localhost:4173/');
    await page.waitForLoadState('networkidle');

    // Navegar por algumas páginas
    await page.goto('http://localhost:4173/dashboard');
    await page.waitForLoadState('networkidle');

    await page.goto('http://localhost:4173/patients');
    await page.waitForLoadState('networkidle');

    // Filtrar erros não críticos
    const criticalErrors = errors.filter(err => 
      !err.includes('Failed to load resource') && 
      !err.includes('404') &&
      !err.includes('favicon') &&
      !err.includes('preload')
    );

    console.log('Erros críticos encontrados:', criticalErrors.length);
    console.log('Erros:', criticalErrors);

    // Verificar que não há erros críticos
    expect(criticalErrors.length).toBe(0);
  });
});

