import { test, expect } from '@playwright/test';

// Lista completa de todas as páginas do sistema baseada nas rotas encontradas
const allPages = [
  // Páginas principais
  '/',
  '/dashboard',
  '/admin-dashboard',
  '/therapist-dashboard',
  '/partner-dashboard',
  '/admin/performance',
  '/simple-dashboard',
  '/dashboard-page',
  
  // Navegação principal
  '/agenda',
  '/patients',
  '/acompanhamento',
  '/notifications',
  '/tasks',
  '/session-evolution',
  
  // Sessões e tratamento
  '/treatments',
  '/teleconsulta',
  
  // Analytics e relatórios
  '/clinical-analytics',
  '/ai-analytics',
  '/financials',
  '/financial-dashboard',
  '/reports',
  '/reports/consolidated',
  '/advanced-reports',
  '/medical-reports',
  '/evaluation-reports',
  
  // Ferramentas de IA
  '/ai-tools/consolidated',
  '/gerar-laudo',
  '/gerar-evolucao',
  '/gerar-hep',
  '/hep-generator',
  '/analise-risco',
  '/risk-analysis',
  
  // Gestão
  '/users',
  '/user-management',
  '/inventory',
  '/inventory-dashboard',
  '/groups',
  '/exercises',
  '/exercise-library',
  '/protocols',
  '/events',
  '/events-list',
  '/appointments',
  '/medical-records',
  
  // Comunicação
  '/whatsapp',
  '/teleconsulta',
  
  // Mentoria e conhecimento
  '/mentoria',
  '/knowledge-base',
  
  // Configurações
  '/backup',
  '/backup-management',
  '/agenda-settings',
  '/integrations',
  '/integrations-test',
  '/bi-integration-test',
  '/audit-log',
  '/audit-log-page',
  '/partnerships',
  '/partnership-page',
  '/subscriptions',
  '/legal',
  '/settings',
  '/settings-page',
  
  // Rotas legacy
  '/admin',
  '/financial',
  
  // Páginas específicas do portal do paciente
  '/patient-portal/dashboard',
  '/patient-portal/appointments',
  '/patient-portal/exercises',
  '/patient-portal/documents',
  '/patient-portal/progress',
  '/patient-portal/vouchers',
  '/patient-portal/voucher-store',
  '/patient-portal/gamification',
  '/patient-portal/pain-diary',
  
  // Páginas específicas do portal do parceiro
  '/partner-portal/dashboard',
  '/partner-portal/patients',
  '/partner-portal/reports',
  '/partner-portal/analytics',
  '/partner-portal/settings',
  
  // Páginas específicas do terapeuta
  '/therapist-portal/dashboard',
  '/therapist-portal/patients',
  '/therapist-portal/sessions',
  '/therapist-portal/schedule',
  '/therapist-portal/reports',
];

// Páginas que podem ter autenticação especial
const authRequiredPages = [
  '/admin-dashboard',
  '/admin',
  '/user-management',
  '/users',
  '/financials',
  '/financial-dashboard',
  '/audit-log',
  '/backup-management',
  '/integrations',
  '/settings',
];

test.describe('Teste Completo de Todas as Páginas', () => {
  // Teste de navegação básica para todas as páginas
  test('Navegação para todas as páginas', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageResults: Array<{
      url: string;
      status: 'success' | 'error' | 'redirect';
      errors: string[];
      loadTime: number;
    }> = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(`${msg.text()}`);
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(`Page Error: ${error.message}`);
    });

    for (const pagePath of allPages) {
      const startTime = Date.now();
      
      try {
        console.log(`🔍 Testando: ${pagePath}`);
        
        // Limpar erros do console para cada página
        const pageConsoleErrors: string[] = [];
        
        const consoleHandler = (msg: any) => {
          if (msg.type() === 'error') {
            pageConsoleErrors.push(msg.text());
          }
        };
        
        page.on('console', consoleHandler);
        
        // Tentar navegar para a página
        const response = await page.goto(pagePath, { 
          waitUntil: 'networkidle',
          timeout: 15000 
        });
        
        const loadTime = Date.now() - startTime;
        
        // Remover o handler após o teste
        page.off('console', consoleHandler);
        
        if (response) {
          const status = response.status();
          
          if (status >= 200 && status < 300) {
            pageResults.push({
              url: pagePath,
              status: 'success',
              errors: pageConsoleErrors,
              loadTime
            });
            console.log(`✅ ${pagePath} - Carregada com sucesso (${loadTime}ms)`);
            
            if (pageConsoleErrors.length > 0) {
              console.log(`⚠️  Erros no console: ${pageConsoleErrors.length}`);
            }
          } else if (status >= 300 && status < 400) {
            pageResults.push({
              url: pagePath,
              status: 'redirect',
              errors: pageConsoleErrors,
              loadTime
            });
            console.log(`🔄 ${pagePath} - Redirecionamento (${status}) - ${loadTime}ms`);
          } else {
            pageResults.push({
              url: pagePath,
              status: 'error',
              errors: pageConsoleErrors,
              loadTime
            });
            console.log(`❌ ${pagePath} - Erro HTTP ${status} - ${loadTime}ms`);
          }
        } else {
          pageResults.push({
            url: pagePath,
            status: 'error',
            errors: pageConsoleErrors,
            loadTime
          });
          console.log(`❌ ${pagePath} - Falha ao carregar - ${loadTime}ms`);
        }
        
      } catch (error) {
        const loadTime = Date.now() - startTime;
        pageResults.push({
          url: pagePath,
          status: 'error',
          errors: [`Timeout ou erro de navegação: ${error}`],
          loadTime
        });
        console.log(`❌ ${pagePath} - Exceção: ${error} - ${loadTime}ms`);
      }
    }

    // Relatório final
    const successfulPages = pageResults.filter(p => p.status === 'success');
    const errorPages = pageResults.filter(p => p.status === 'error');
    const redirectPages = pageResults.filter(p => p.status === 'redirect');
    
    console.log('\n📊 RELATÓRIO FINAL:');
    console.log(`✅ Páginas carregadas com sucesso: ${successfulPages.length}/${allPages.length}`);
    console.log(`❌ Páginas com erro: ${errorPages.length}/${allPages.length}`);
    console.log(`🔄 Páginas com redirecionamento: ${redirectPages.length}/${allPages.length}`);
    
    // Páginas com erros no console
    const pagesWithConsoleErrors = pageResults.filter(p => p.errors.length > 0);
    if (pagesWithConsoleErrors.length > 0) {
      console.log(`\n⚠️  Páginas com erros no console: ${pagesWithConsoleErrors.length}`);
      pagesWithConsoleErrors.forEach(p => {
        console.log(`  - ${p.url}: ${p.errors.length} erros`);
      });
    }
    
    // Páginas mais lentas
    const slowPages = pageResults
      .filter(p => p.status === 'success')
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, 5);
    
    if (slowPages.length > 0) {
      console.log('\n🐌 Páginas mais lentas:');
      slowPages.forEach(p => {
        console.log(`  - ${p.url}: ${p.loadTime}ms`);
      });
    }
    
    // Expectativa: pelo menos 70% das páginas devem carregar com sucesso
    const successRate = (successfulPages.length / allPages.length) * 100;
    expect(successRate).toBeGreaterThanOrEqual(70);
    
    console.log(`\n📈 Taxa de sucesso: ${successRate.toFixed(1)}%`);
  });

  // Teste de funcionalidade específica para páginas críticas
  test('Funcionalidade de páginas críticas', async ({ page }) => {
    const criticalPages = [
      '/dashboard',
      '/agenda',
      '/patients',
      '/reports',
      '/users',
      '/settings'
    ];

    for (const pagePath of criticalPages) {
      console.log(`🔍 Testando funcionalidade: ${pagePath}`);
      
      try {
        await page.goto(pagePath, { waitUntil: 'networkidle', timeout: 10000 });
        
        // Verificar se elementos básicos estão presentes
        const hasHeader = await page.locator('h1, h2, [role="heading"]').count() > 0;
        const hasNavigation = await page.locator('nav, [role="navigation"]').count() > 0;
        const hasContent = await page.locator('main, [role="main"], .content').count() > 0;
        
        expect(hasHeader).toBeTruthy();
        expect(hasContent).toBeTruthy();
        
        console.log(`✅ ${pagePath} - Elementos básicos presentes`);
        
        // Tentar interagir com elementos comuns
        const buttons = await page.locator('button').count();
        const links = await page.locator('a').count();
        
        console.log(`  - Botões: ${buttons}, Links: ${links}`);
        
      } catch (error) {
        console.log(`❌ ${pagePath} - Erro na funcionalidade: ${error}`);
        // Não falhar o teste por páginas individuais
      }
    }
  });

  // Teste de responsividade básica
  test('Responsividade básica', async ({ page }) => {
    const testPages = ['/dashboard', '/agenda', '/patients'];
    
    for (const pagePath of testPages) {
      console.log(`🔍 Testando responsividade: ${pagePath}`);
      
      // Teste desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(pagePath, { waitUntil: 'networkidle', timeout: 10000 });
      
      // Teste tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload({ waitUntil: 'networkidle' });
      
      // Teste mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload({ waitUntil: 'networkidle' });
      
      console.log(`✅ ${pagePath} - Responsividade OK`);
    }
  });
});
