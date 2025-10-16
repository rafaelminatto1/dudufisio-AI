import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 🧪 Teste Completo da Aplicação DuduFisio-AI
 * 
 * Testa todos os perfis de usuário e todas as páginas da aplicação
 * Captura erros, mede performance e detecta problemas
 */

interface TestResult {
  profile: string;
  page: string;
  url: string;
  status: 'success' | 'error' | '404' | 'timeout';
  consoleErrors: any[];
  performance: any;
  loadTime: number;
  errors: string[];
  warnings: string[];
  timestamp: string;
}

interface ProfileConfig {
  name: string;
  email: string;
  password: string;
  expectedRole: string;
}

// Configurações dos perfis de teste
const PROFILES: ProfileConfig[] = [
  {
    name: 'Admin',
    email: 'admin@dudufisio.com',
    password: 'demo123456',
    expectedRole: 'Admin'
  },
  {
    name: 'Fisioterapeuta',
    email: 'therapist@dudufisio.com',
    password: 'demo123456',
    expectedRole: 'Fisioterapeuta'
  },
  {
    name: 'Paciente',
    email: 'patient@dudufisio.com',
    password: 'demo123456',
    expectedRole: 'Paciente'
  },
  {
    name: 'Educador Físico',
    email: 'educator@dudufisio.com',
    password: 'demo123456',
    expectedRole: 'EducadorFisico'
  }
];

// Rotas para cada perfil (baseado na estrutura do AppRoutes.tsx)
const ROUTES_BY_PROFILE = {
  'Admin': [
    '/dashboard',
    '/patients',
    '/patients/new',
    '/agenda',
    '/sessions',
    '/exercises',
    '/protocols',
    '/materials',
    '/reports',
    '/analytics',
    '/ai-analytics',
    '/ai-settings',
    '/settings',
    '/users',
    '/audit-log',
    '/backup',
    '/integrations',
    '/bi-integration',
    '/crm',
    '/events',
    '/quality-assurance',
    '/population-health',
    '/notifications',
    '/whatsapp',
    '/inventory',
    '/supplies',
    '/mentorship',
    '/assignments',
    '/kanban',
    '/knowledge-base',
    '/legal',
    '/subscription'
  ],
  'Fisioterapeuta': [
    '/dashboard',
    '/patients',
    '/patients/new',
    '/agenda',
    '/sessions',
    '/sessions/new',
    '/acompanhamento',
    '/exercises',
    '/protocols',
    '/materials',
    '/assessments',
    '/body-map',
    '/groups',
    '/reports',
    '/teleconsulta',
    '/whatsapp',
    '/notifications',
    '/inventory',
    '/supplies',
    '/mentorship'
  ],
  'Paciente': [
    '/dashboard',
    '/my-appointments',
    '/my-exercises',
    '/my-progress',
    '/pain-diary',
    '/documents',
    '/gamification',
    '/my-vouchers',
    '/voucher-store'
  ],
  'Educador Físico': [
    '/dashboard',
    '/clients',
    '/exercises',
    '/financials'
  ]
};

// Armazenar resultados dos testes
const testResults: TestResult[] = [];

/**
 * Helper para fazer login
 */
async function login(page: Page, profile: ProfileConfig): Promise<void> {
  console.log(`\n🔐 Fazendo login como ${profile.name} (${profile.email})...`);
  
  await page.goto('/');
  
  // Aguardar página de login carregar
  await page.waitForSelector('button:has-text("Contas de Demonstração")', { timeout: 10000 });
  
  // Clicar em "Contas de Demonstração"
  await page.click('button:has-text("Contas de Demonstração")');
  
  // Aguardar menu aparecer
  await page.waitForTimeout(500);
  
  // Selecionar perfil pelo email
  const profileButton = page.locator(`button:has-text("${profile.email}")`);
  await profileButton.click();
  
  // Aguardar formulário preenchido
  await page.waitForTimeout(500);
  
  // Clicar em Login
  await page.click('button[type="submit"]');
  
  // Aguardar redirecionamento
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  
  console.log(`✅ Login realizado com sucesso como ${profile.name}`);
}

/**
 * Helper para capturar erros do console
 */
async function captureConsoleErrors(page: Page): Promise<{ errors: any[], warnings: any[] }> {
  const consoleMessages: any[] = [];
  const warnings: any[] = [];
  const errors: any[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    
    consoleMessages.push({
      type,
      text,
      location: msg.location()
    });
    
    if (type === 'warning') {
      warnings.push(text);
    } else if (type === 'error') {
      errors.push(text);
    }
  });
  
  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      stack: error.stack
    });
  });
  
  return { errors, warnings };
}

/**
 * Helper para medir performance
 */
async function measurePerformance(page: Page): Promise<any> {
  try {
    const performanceMetrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      return {
        // Core Web Vitals
        fcp: perfData.responseStart - perfData.fetchStart,
        lcp: perfData.loadEventEnd - perfData.fetchStart,
        tti: perfData.domInteractive - perfData.fetchStart,
        cls: 0, // CLS precisa ser medido com observer
        
        // Métricas detalhadas
        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcp: perfData.connectEnd - perfData.connectStart,
        request: perfData.responseStart - perfData.requestStart,
        response: perfData.responseEnd - perfData.responseStart,
        dom: perfData.domComplete - perfData.domLoading,
        load: perfData.loadEventEnd - perfData.loadEventStart,
        
        // Total
        total: perfData.loadEventEnd - perfData.fetchStart
      };
    });
    
    return performanceMetrics;
  } catch (error) {
    console.warn('⚠️ Erro ao medir performance:', error);
    return null;
  }
}

/**
 * Helper para testar uma página
 */
async function testPage(
  page: Page, 
  profile: ProfileConfig, 
  route: string
): Promise<TestResult> {
  const startTime = Date.now();
  const { errors, warnings } = await captureConsoleErrors(page);
  
  console.log(`  📄 Testando: ${route}`);
  
  try {
    // Navegar para a página
    await page.goto(route, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Aguardar 3 segundos para detectar erros assíncronos
    console.log(`  ⏱️  Aguardando 3 segundos para detectar erros assíncronos...`);
    await page.waitForTimeout(3000);
    
    // Verificar se não é página 404
    const is404 = await page.locator('text=404, text=Página não encontrada, text=Not Found').count() > 0;
    
    if (is404) {
      console.log(`  ❌ Erro 404 detectado!`);
      return {
        profile: profile.name,
        page: route,
        url: page.url(),
        status: '404',
        consoleErrors: errors,
        performance: null,
        loadTime: Date.now() - startTime,
        errors: ['Página não encontrada (404)'],
        warnings,
        timestamp: new Date().toISOString()
      };
    }
    
    // Medir performance
    const performance = await measurePerformance(page);
    
    // Verificar se há erros críticos
    const criticalErrors = errors.filter(e => 
      typeof e === 'string' && (
        e.includes('Failed to load') ||
        e.includes('ChunkLoadError') ||
        e.includes('Module not found') ||
        e.includes('Cannot read property') ||
        e.includes('is not defined')
      )
    );
    
    const status = criticalErrors.length > 0 ? 'error' : 'success';
    
    if (status === 'error') {
      console.log(`  ❌ Erros detectados: ${criticalErrors.length}`);
    } else {
      console.log(`  ✅ Página carregada com sucesso`);
    }
    
    return {
      profile: profile.name,
      page: route,
      url: page.url(),
      status,
      consoleErrors: errors,
      performance,
      loadTime: Date.now() - startTime,
      errors: criticalErrors,
      warnings,
      timestamp: new Date().toISOString()
    };
    
  } catch (error: any) {
    console.log(`  ❌ Erro ao carregar página: ${error.message}`);
    
    return {
      profile: profile.name,
      page: route,
      url: route,
      status: 'error',
      consoleErrors: errors,
      performance: null,
      loadTime: Date.now() - startTime,
      errors: [error.message],
      warnings,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Teste principal para cada perfil
 */
test.describe('Teste Completo da Aplicação', () => {
  
  for (const profile of PROFILES) {
    test.describe(`Perfil: ${profile.name}`, () => {
      let page: Page;
      
      test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        
        // Configurar captura de console
        page.on('console', msg => {
          const type = msg.type();
          if (type === 'error' || type === 'warning') {
            console.log(`[${type.toUpperCase()}] ${msg.text()}`);
          }
        });
        
        // Fazer login
        await login(page, profile);
      });
      
      test.afterAll(async () => {
        await page.close();
      });
      
      const routes = ROUTES_BY_PROFILE[profile.name as keyof typeof ROUTES_BY_PROFILE] || [];
      
      for (const route of routes) {
        test(`Navegar para ${route}`, async () => {
          const result = await testPage(page, profile, route);
          testResults.push(result);
          
          // Assertions
          expect(result.status).not.toBe('404');
          
          if (result.status === 'error') {
            console.error(`Erros encontrados em ${route}:`, result.errors);
          }
        });
      }
    });
  }
  
  test.afterAll(async () => {
    // Salvar resultados em arquivo
    const resultsDir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const resultsFile = path.join(resultsDir, 'comprehensive-test-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));
    console.log(`\n📊 Resultados salvos em: ${resultsFile}`);
    
    // Gerar relatório em CSV
    const csvFile = path.join(resultsDir, 'ERROS_ENCONTRADOS.csv');
    const csvHeader = 'Perfil,Página,URL,Status,Tempo de Carregamento (ms),Erros,Avisos,Performance FCP,Performance LCP,Performance TTI,Timestamp\n';
    const csvRows = testResults.map(r => {
      const errors = r.errors.join('; ');
      const warnings = r.warnings.join('; ');
      const perfFcp = r.performance?.fcp || 'N/A';
      const perfLcp = r.performance?.lcp || 'N/A';
      const perfTti = r.performance?.tti || 'N/A';
      
      return `"${r.profile}","${r.page}","${r.url}","${r.status}",${r.loadTime},"${errors}","${warnings}",${perfFcp},${perfLcp},${perfTti},"${r.timestamp}"`;
    }).join('\n');
    
    fs.writeFileSync(csvFile, csvHeader + csvRows);
    console.log(`📊 Relatório CSV salvo em: ${csvFile}`);
    
    // Gerar relatório markdown
    generateMarkdownReport(testResults, path.join(resultsDir, 'TESTE_RELATORIO.md'));
    
    // Estatísticas
    const totalTests = testResults.length;
    const successTests = testResults.filter(r => r.status === 'success').length;
    const errorTests = testResults.filter(r => r.status === 'error').length;
    const notFoundTests = testResults.filter(r => r.status === '404').length;
    const totalErrors = testResults.reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = testResults.reduce((sum, r) => sum + r.warnings.length, 0);
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMO DO TESTE');
    console.log('='.repeat(80));
    console.log(`Total de páginas testadas: ${totalTests}`);
    console.log(`✅ Sucesso: ${successTests} (${((successTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`❌ Erros: ${errorTests} (${((errorTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`🔍 404: ${notFoundTests} (${((notFoundTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`⚠️  Total de erros capturados: ${totalErrors}`);
    console.log(`⚠️  Total de avisos: ${totalWarnings}`);
    console.log('='.repeat(80));
  });
});

/**
 * Gerar relatório em Markdown
 */
function generateMarkdownReport(results: TestResult[], filePath: string): void {
  const timestamp = new Date().toLocaleString('pt-BR');
  
  let markdown = `# Relatório de Teste Completo - DuduFisio-AI\n\n`;
  markdown += `**Data/Hora:** ${timestamp}\n\n`;
  markdown += `**Total de Páginas Testadas:** ${results.length}\n\n`;
  
  // Estatísticas por perfil
  const profiles = [...new Set(results.map(r => r.profile))];
  markdown += `## Estatísticas por Perfil\n\n`;
  
  for (const profile of profiles) {
    const profileResults = results.filter(r => r.profile === profile);
    const success = profileResults.filter(r => r.status === 'success').length;
    const errors = profileResults.filter(r => r.status === 'error').length;
    const notFound = profileResults.filter(r => r.status === '404').length;
    
    markdown += `### ${profile}\n\n`;
    markdown += `- Total de páginas: ${profileResults.length}\n`;
    markdown += `- ✅ Sucesso: ${success}\n`;
    markdown += `- ❌ Erros: ${errors}\n`;
    markdown += `- 🔍 404: ${notFound}\n\n`;
  }
  
  // Páginas com erro
  const errorPages = results.filter(r => r.status === 'error' || r.status === '404');
  if (errorPages.length > 0) {
    markdown += `## 🔴 Páginas com Problemas\n\n`;
    
    for (const result of errorPages) {
      markdown += `### ${result.page}\n\n`;
      markdown += `- **Perfil:** ${result.profile}\n`;
      markdown += `- **URL:** ${result.url}\n`;
      markdown += `- **Status:** ${result.status}\n`;
      markdown += `- **Tempo de Carregamento:** ${result.loadTime}ms\n`;
      
      if (result.errors.length > 0) {
        markdown += `\n**Erros:**\n`;
        result.errors.forEach(e => {
          markdown += `- ${e}\n`;
        });
      }
      
      if (result.warnings.length > 0) {
        markdown += `\n**Avisos:**\n`;
        result.warnings.forEach(w => {
          markdown += `- ${w}\n`;
        });
      }
      
      markdown += `\n---\n\n`;
    }
  }
  
  // Páginas com performance ruim
  const slowPages = results.filter(r => r.performance && r.performance.lcp > 2500);
  if (slowPages.length > 0) {
    markdown += `## 🐌 Páginas com Performance Ruim (LCP > 2.5s)\n\n`;
    
    for (const result of slowPages) {
      markdown += `### ${result.page}\n\n`;
      markdown += `- **Perfil:** ${result.profile}\n`;
      markdown += `- **LCP:** ${result.performance.lcp}ms\n`;
      markdown += `- **FCP:** ${result.performance.fcp}ms\n`;
      markdown += `- **TTI:** ${result.performance.tti}ms\n\n`;
    }
  }
  
  // Recomendações
  markdown += `## 📋 Recomendações\n\n`;
  
  if (errorPages.length > 0) {
    markdown += `### Correções Prioritárias\n\n`;
    markdown += `1. Corrigir páginas com erro 404\n`;
    markdown += `2. Resolver erros críticos de carregamento\n`;
    markdown += `3. Verificar imports e lazy loading\n\n`;
  }
  
  if (slowPages.length > 0) {
    markdown += `### Otimizações de Performance\n\n`;
    markdown += `1. Implementar code splitting nas páginas lentas\n`;
    markdown += `2. Otimizar imagens e assets\n`;
    markdown += `3. Implementar cache de dados\n`;
    markdown += `4. Reduzir bundle size\n\n`;
  }
  
  fs.writeFileSync(filePath, markdown);
  console.log(`📄 Relatório Markdown salvo em: ${filePath}`);
}

