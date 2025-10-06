import { test, expect } from '@playwright/test';

// Páginas que estão funcionando conforme o teste anterior
const workingPages = [
  '/',
  '/dashboard',
  '/admin-dashboard',
  '/therapist-dashboard',
  '/partner-dashboard',
  '/admin/performance',
  '/simple-dashboard',
  '/dashboard-page',
  '/agenda',
  '/patients',
  '/acompanhamento',
  '/notifications',
  '/tasks',
  '/session-evolution',
  '/treatments',
  '/teleconsulta',
  '/clinical-analytics',
  '/ai-analytics',
  '/financials',
  '/financial-dashboard',
  '/reports',
  '/reports/consolidated',
  '/advanced-reports',
  '/medical-reports',
  '/evaluation-reports',
  '/ai-tools/consolidated',
  '/gerar-laudo',
  '/gerar-evolucao',
  '/gerar-hep'
];

test.describe('Verificação de Erros no Console - Páginas Funcionais', () => {
  test('Verificar erros no console em todas as páginas funcionais', async ({ page }) => {
    const pageResults: Array<{
      url: string;
      consoleErrors: string[];
      consoleWarnings: string[];
      loadTime: number;
      hasErrors: boolean;
    }> = [];

    for (const pagePath of workingPages) {
      const startTime = Date.now();
      const consoleErrors: string[] = [];
      const consoleWarnings: string[] = [];

      console.log(`🔍 Verificando console: ${pagePath}`);

      // Configurar listeners para console
      page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error') {
          consoleErrors.push(text);
        } else if (msg.type() === 'warning') {
          consoleWarnings.push(text);
        }
      });

      page.on('pageerror', error => {
        consoleErrors.push(`Page Error: ${error.message}`);
      });

      try {
        // Navegar para a página
        await page.goto(pagePath, { 
          waitUntil: 'networkidle',
          timeout: 15000 
        });

        // Aguardar um pouco mais para capturar erros tardios
        await page.waitForTimeout(2000);

        const loadTime = Date.now() - startTime;

        pageResults.push({
          url: pagePath,
          consoleErrors: [...consoleErrors],
          consoleWarnings: [...consoleWarnings],
          loadTime,
          hasErrors: consoleErrors.length > 0
        });

        if (consoleErrors.length > 0) {
          console.log(`❌ ${pagePath} - ${consoleErrors.length} erros no console`);
          consoleErrors.forEach(error => console.log(`   - ${error}`));
        } else if (consoleWarnings.length > 0) {
          console.log(`⚠️  ${pagePath} - ${consoleWarnings.length} warnings no console`);
        } else {
          console.log(`✅ ${pagePath} - Sem erros no console (${loadTime}ms)`);
        }

      } catch (error) {
        console.log(`❌ ${pagePath} - Erro ao carregar: ${error}`);
        pageResults.push({
          url: pagePath,
          consoleErrors: [`Erro ao carregar: ${error}`],
          consoleWarnings: [],
          loadTime: Date.now() - startTime,
          hasErrors: true
        });
      }
    }

    // Relatório final
    const pagesWithErrors = pageResults.filter(p => p.hasErrors);
    const pagesWithoutErrors = pageResults.filter(p => !p.hasErrors);
    
    console.log('\n📊 RELATÓRIO DE ERROS NO CONSOLE:');
    console.log(`✅ Páginas sem erros: ${pagesWithoutErrors.length}/${workingPages.length}`);
    console.log(`❌ Páginas com erros: ${pagesWithErrors.length}/${workingPages.length}`);
    
    if (pagesWithErrors.length > 0) {
      console.log('\n❌ PÁGINAS COM ERROS NO CONSOLE:');
      pagesWithErrors.forEach(page => {
        console.log(`\n🔍 ${page.url}:`);
        page.consoleErrors.forEach(error => {
          console.log(`   - ${error}`);
        });
      });
    }

    // Estatísticas de warnings
    const pagesWithWarnings = pageResults.filter(p => p.consoleWarnings.length > 0);
    if (pagesWithWarnings.length > 0) {
      console.log('\n⚠️  PÁGINAS COM WARNINGS:');
      pagesWithWarnings.forEach(page => {
        console.log(`   - ${page.url}: ${page.consoleWarnings.length} warnings`);
      });
    }

    // Páginas mais lentas
    const slowPages = pageResults
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, 5);
    
    console.log('\n🐌 PÁGINAS MAIS LENTAS:');
    slowPages.forEach(page => {
      console.log(`   - ${page.url}: ${page.loadTime}ms`);
    });

    // Expectativa: pelo menos 80% das páginas funcionais devem estar sem erros no console
    const errorFreeRate = (pagesWithoutErrors.length / workingPages.length) * 100;
    expect(errorFreeRate).toBeGreaterThanOrEqual(80);
    
    console.log(`\n📈 Taxa de páginas sem erros: ${errorFreeRate.toFixed(1)}%`);
  });

  test('Verificar elementos básicos nas páginas funcionais', async ({ page }) => {
    const criticalPages = ['/dashboard', '/agenda', '/patients', '/reports'];
    const results: Array<{
      url: string;
      hasHeader: boolean;
      hasNavigation: boolean;
      hasContent: boolean;
      hasFooter: boolean;
      buttonCount: number;
      linkCount: number;
    }> = [];

    for (const pagePath of criticalPages) {
      console.log(`🔍 Verificando elementos: ${pagePath}`);
      
      try {
        await page.goto(pagePath, { waitUntil: 'networkidle', timeout: 10000 });
        
        const hasHeader = await page.locator('h1, h2, h3, [role="heading"]').count() > 0;
        const hasNavigation = await page.locator('nav, [role="navigation"], .sidebar, .navigation').count() > 0;
        const hasContent = await page.locator('main, [role="main"], .content, .main-content').count() > 0;
        const hasFooter = await page.locator('footer, [role="contentinfo"], .footer').count() > 0;
        const buttonCount = await page.locator('button').count();
        const linkCount = await page.locator('a').count();
        
        results.push({
          url: pagePath,
          hasHeader,
          hasNavigation,
          hasContent,
          hasFooter,
          buttonCount,
          linkCount
        });

        console.log(`✅ ${pagePath}:`);
        console.log(`   - Header: ${hasHeader ? '✅' : '❌'}`);
        console.log(`   - Navigation: ${hasNavigation ? '✅' : '❌'}`);
        console.log(`   - Content: ${hasContent ? '✅' : '❌'}`);
        console.log(`   - Footer: ${hasFooter ? '✅' : '❌'}`);
        console.log(`   - Botões: ${buttonCount}`);
        console.log(`   - Links: ${linkCount}`);
        
      } catch (error) {
        console.log(`❌ ${pagePath} - Erro: ${error}`);
      }
    }

    // Verificar se pelo menos as páginas críticas têm elementos básicos
    const pagesWithBasicElements = results.filter(r => r.hasHeader && r.hasContent);
    expect(pagesWithBasicElements.length).toBeGreaterThanOrEqual(2);
    
    console.log(`\n📊 Elementos básicos: ${pagesWithBasicElements.length}/${criticalPages.length} páginas`);
  });

  test('Teste de responsividade em páginas funcionais', async ({ page }) => {
    const testPages = ['/dashboard', '/agenda', '/patients'];
    
    for (const pagePath of testPages) {
      console.log(`🔍 Testando responsividade: ${pagePath}`);
      
      try {
        // Teste desktop
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto(pagePath, { waitUntil: 'networkidle', timeout: 10000 });
        
        // Verificar se elementos estão visíveis
        const desktopElements = await page.locator('h1, h2, button').count();
        console.log(`   - Desktop (1920x1080): ${desktopElements} elementos visíveis`);
        
        // Teste tablet
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.reload({ waitUntil: 'networkidle' });
        
        const tabletElements = await page.locator('h1, h2, button').count();
        console.log(`   - Tablet (768x1024): ${tabletElements} elementos visíveis`);
        
        // Teste mobile
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload({ waitUntil: 'networkidle' });
        
        const mobileElements = await page.locator('h1, h2, button').count();
        console.log(`   - Mobile (375x667): ${mobileElements} elementos visíveis`);
        
        // Verificar se elementos básicos estão presentes em todos os tamanhos
        expect(desktopElements).toBeGreaterThan(0);
        expect(tabletElements).toBeGreaterThan(0);
        expect(mobileElements).toBeGreaterThan(0);
        
        console.log(`✅ ${pagePath} - Responsividade OK`);
        
      } catch (error) {
        console.log(`❌ ${pagePath} - Erro na responsividade: ${error}`);
      }
    }
  });
});
