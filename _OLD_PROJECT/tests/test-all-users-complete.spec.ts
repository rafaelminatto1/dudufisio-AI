import { test, expect, Page, Browser, ConsoleMessage } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Configuração
const BASE_URL = 'http://localhost:5178';
const SCREENSHOT_DIR = './test-results/screenshots';
const REPORT_FILE = './test-results/complete-test-report.json';

// Estrutura para armazenar resultados
interface TestResult {
  user: string;
  page: string;
  url: string;
  timestamp: string;
  consoleErrors: string[];
  consoleWarnings: string[];
  networkErrors: string[];
  performanceMetrics: {
    loadTime: number;
    domContentLoaded: number;
    totalRequests: number;
    failedRequests: number;
  };
  screenshot?: string;
  success: boolean;
  error?: string;
}

const allResults: TestResult[] = [];

// Usuários de teste
const testUsers = [
  {
    name: 'Admin',
    email: 'admin@dudufisio.com',
    password: 'demo123456',
    role: 'Admin',
    pages: [
      { name: 'Dashboard Geral', url: '/dashboard' },
      { name: 'Dashboard Administrativo', url: '/admin-dashboard' },
      { name: 'Pacientes', url: '/patients' },
      { name: 'Agenda', url: '/agenda' },
      { name: 'Acompanhamento', url: '/acompanhamento' },
      { name: 'Evolução de Sessões', url: '/session-evolution' },
      { name: 'Teleconsulta', url: '/teleconsulta' },
      { name: 'Exercícios', url: '/exercises' },
      { name: 'Biblioteca de Exercícios', url: '/exercise-library' },
      { name: 'Gerador Gemini Veo', url: '/free-video-generator' },
      { name: 'Protocolos Clínicos', url: '/protocols' },
      { name: 'Relatórios', url: '/reports' },
      { name: 'Analytics com IA', url: '/ai-analytics' },
      { name: 'Financeiro', url: '/financial' },
      { name: 'Gestão de Usuários', url: '/user-management' },
      { name: 'Notificações', url: '/notifications' },
      { name: 'Configurações', url: '/settings' },
      { name: 'CRM WhatsApp', url: '/crm' },
      { name: 'Materiais Clínicos', url: '/materials' },
      { name: 'Inventário', url: '/inventory' },
    ]
  },
  {
    name: 'Therapist',
    email: 'therapist@dudufisio.com',
    password: 'demo123456',
    role: 'Fisioterapeuta',
    pages: [
      { name: 'Dashboard', url: '/dashboard' },
      { name: 'Pacientes', url: '/patients' },
      { name: 'Agenda', url: '/agenda' },
      { name: 'Acompanhamento', url: '/acompanhamento' },
      { name: 'Exercícios', url: '/exercises' },
      { name: 'Relatórios', url: '/reports' },
      { name: 'Analytics com IA', url: '/ai-analytics' },
    ]
  },
  {
    name: 'Patient',
    email: 'patient@dudufisio.com',
    password: 'demo123456',
    role: 'Paciente',
    pages: [
      { name: 'Dashboard', url: '/' },
      { name: 'Consultas', url: '/' },
      { name: 'Exercícios', url: '/' },
      { name: 'Diário da Dor', url: '/' },
      { name: 'Progresso', url: '/' },
      { name: 'Documentos', url: '/' },
    ]
  },
  {
    name: 'EducadorFisico',
    email: 'educator@dudufisio.com',
    password: 'demo123456',
    role: 'EducadorFisico',
    pages: [
      { name: 'Dashboard', url: '/' },
      { name: 'Meus Clientes', url: '/' },
      { name: 'Exercícios', url: '/' },
      { name: 'Financeiro', url: '/' },
    ]
  }
];

// Função auxiliar para fazer login
async function loginUser(page: Page, email: string, password: string) {
  console.log(`\n🔐 Fazendo login como: ${email}`);
  
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  
  // Aguardar formulário de login
  await page.waitForSelector('input[type="email"], input[name="email"], input[placeholder*="email" i]', { timeout: 10000 });
  
  // Preencher credenciais
  await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i]', email);
  await page.fill('input[type="password"], input[name="password"], input[placeholder*="senha" i]', password);
  
  // Clicar no botão de login
  await page.click('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")');
  
  // Aguardar navegação após login
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  
  // Aguardar um pouco para garantir que o dashboard carregou
  await page.waitForTimeout(2000);
  
  console.log('✅ Login realizado com sucesso');
}

// Função para testar uma página
async function testPage(page: Page, userName: string, pageName: string, pageUrl: string): Promise<TestResult> {
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const networkErrors: string[] = [];
  let totalRequests = 0;
  let failedRequests = 0;
  
  const result: TestResult = {
    user: userName,
    page: pageName,
    url: pageUrl,
    timestamp: new Date().toISOString(),
    consoleErrors: [],
    consoleWarnings: [],
    networkErrors: [],
    performanceMetrics: {
      loadTime: 0,
      domContentLoaded: 0,
      totalRequests: 0,
      failedRequests: 0,
    },
    success: false,
  };

  try {
    console.log(`\n📄 Testando página: ${pageName} (${pageUrl})`);

    // Capturar erros do console
    page.on('console', (msg: ConsoleMessage) => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        consoleErrors.push(text);
        console.log(`  ❌ Console Error: ${text.substring(0, 100)}`);
      } else if (type === 'warning') {
        consoleWarnings.push(text);
      }
    });

    // Capturar erros de página
    page.on('pageerror', (error) => {
      consoleErrors.push(`Page Error: ${error.message}`);
      console.log(`  💥 Page Error: ${error.message}`);
    });

    // Capturar falhas de network
    page.on('requestfailed', (request) => {
      const failure = request.failure();
      networkErrors.push(`${request.url()} - ${failure?.errorText || 'Unknown error'}`);
      failedRequests++;
      console.log(`  🚫 Network Error: ${request.url()}`);
    });

    // Contar requests
    page.on('request', () => {
      totalRequests++;
    });

    // Navegar para a página e medir performance
    const startTime = Date.now();
    
    await page.goto(`${BASE_URL}${pageUrl}`, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    // Aguardar um pouco para carregamento completo
    await page.waitForTimeout(3000);
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Obter métricas de performance
    const performanceMetrics = await page.evaluate(() => {
      const perfData = performance.timing;
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
      };
    });

    // Tirar screenshot
    const screenshotPath = path.join(
      SCREENSHOT_DIR,
      `${userName}-${pageName.replace(/[^a-z0-9]/gi, '_')}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: false });

    result.performanceMetrics = {
      loadTime,
      domContentLoaded: performanceMetrics.domContentLoaded,
      totalRequests,
      failedRequests,
    };
    result.consoleErrors = consoleErrors;
    result.consoleWarnings = consoleWarnings;
    result.networkErrors = networkErrors;
    result.screenshot = screenshotPath;
    result.success = true;

    console.log(`  ✅ Página carregada em ${loadTime}ms`);
    console.log(`  📊 Requests: ${totalRequests} (${failedRequests} falharam)`);
    console.log(`  ⚠️  Erros console: ${consoleErrors.length}`);
    console.log(`  ⚠️  Avisos console: ${consoleWarnings.length}`);

  } catch (error: any) {
    result.error = error.message;
    console.log(`  ❌ ERRO: ${error.message}`);
  }

  return result;
}

// Testes principais
test.describe('Teste Completo do Sistema - Todos os Usuários', () => {
  
  test.beforeAll(async () => {
    // Criar diretório de screenshots
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }
  });

  for (const user of testUsers) {
    test(`Testar usuário ${user.name}`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        recordVideo: undefined, // Não gravar vídeo para economizar espaço
      });
      
      const page = await context.newPage();

      try {
        // Fazer login
        await loginUser(page, user.email, user.password);

        // Testar cada página
        for (const pageInfo of user.pages) {
          const result = await testPage(page, user.name, pageInfo.name, pageInfo.url);
          allResults.push(result);
          
          // Aguardar entre páginas
          await page.waitForTimeout(1000);
        }

      } catch (error: any) {
        console.error(`❌ Erro ao testar usuário ${user.name}: ${error.message}`);
        throw error;
      } finally {
        await context.close();
      }
    });
  }

  test.afterAll(async () => {
    // Salvar relatório completo
    const reportDir = path.dirname(REPORT_FILE);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(REPORT_FILE, JSON.stringify(allResults, null, 2));
    console.log(`\n📊 Relatório completo salvo em: ${REPORT_FILE}`);

    // Imprimir resumo
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMO DOS TESTES');
    console.log('='.repeat(80));
    
    const totalTests = allResults.length;
    const successfulTests = allResults.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;
    const totalErrors = allResults.reduce((sum, r) => sum + r.consoleErrors.length, 0);
    const totalWarnings = allResults.reduce((sum, r) => sum + r.consoleWarnings.length, 0);
    const totalNetworkErrors = allResults.reduce((sum, r) => sum + r.networkErrors.length, 0);
    
    console.log(`\nTotal de testes: ${totalTests}`);
    console.log(`✅ Sucessos: ${successfulTests}`);
    console.log(`❌ Falhas: ${failedTests}`);
    console.log(`\n❌ Total de erros console: ${totalErrors}`);
    console.log(`⚠️  Total de avisos console: ${totalWarnings}`);
    console.log(`🚫 Total de erros network: ${totalNetworkErrors}`);
    
    console.log('\n📈 Performance Média:');
    const avgLoadTime = allResults.reduce((sum, r) => sum + r.performanceMetrics.loadTime, 0) / totalTests;
    console.log(`  Tempo de carregamento: ${avgLoadTime.toFixed(0)}ms`);
    
    // Top 5 páginas mais lentas
    console.log('\n🐌 Top 5 Páginas Mais Lentas:');
    const slowest = [...allResults]
      .sort((a, b) => b.performanceMetrics.loadTime - a.performanceMetrics.loadTime)
      .slice(0, 5);
    
    slowest.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.user} - ${r.page}: ${r.performanceMetrics.loadTime}ms`);
    });
    
    // Páginas com mais erros
    console.log('\n❌ Páginas com Mais Erros:');
    const mostErrors = [...allResults]
      .filter(r => r.consoleErrors.length > 0)
      .sort((a, b) => b.consoleErrors.length - a.consoleErrors.length)
      .slice(0, 5);
    
    if (mostErrors.length > 0) {
      mostErrors.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.user} - ${r.page}: ${r.consoleErrors.length} erros`);
      });
    } else {
      console.log('  ✅ Nenhum erro encontrado!');
    }
    
    console.log('\n' + '='.repeat(80));
  });
});

