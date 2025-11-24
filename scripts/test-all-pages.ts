/**
 * Script para testar todas as páginas do sistema
 * Navega por todas as rotas e captura logs/erros do console
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'node:fs';
import * as path from 'node:path';

const BASE_URL = 'http://localhost:3000';
const LOGIN_EMAIL = 'cursor@moocafisio.com.br';
const LOGIN_PASSWORD = '256256';

// Lista de todas as páginas para testar
const PAGES_TO_TEST = [
  // Autenticação
  { path: '/login', name: 'Login', requiresAuth: false },

  // Dashboard
  { path: '/dashboard', name: 'Dashboard Principal', requiresAuth: true },

  // Pacientes
  { path: '/dashboard/pacientes', name: 'Lista de Pacientes', requiresAuth: true },
  { path: '/dashboard/pacientes/novo', name: 'Novo Paciente', requiresAuth: true },

  // Agenda
  { path: '/dashboard/agenda', name: 'Agenda', requiresAuth: true },

  // Tratamentos
  { path: '/dashboard/tratamentos', name: 'Tratamentos', requiresAuth: true },

  // Financeiro
  { path: '/dashboard/financeiro', name: 'Financeiro', requiresAuth: true },

  // Relatórios
  { path: '/dashboard/relatorios', name: 'Relatórios', requiresAuth: true },

  // Configurações
  { path: '/dashboard/configuracoes', name: 'Configurações', requiresAuth: true },
  { path: '/dashboard/configuracoes/perfil', name: 'Perfil', requiresAuth: true },
  { path: '/dashboard/configuracoes/clinica', name: 'Clínica', requiresAuth: true },
  { path: '/dashboard/configuracoes/notificacoes', name: 'Notificações', requiresAuth: true },
  { path: '/dashboard/configuracoes/integracao', name: 'Integrações', requiresAuth: true },
];

interface PageTestResult {
  path: string;
  name: string;
  status: 'success' | 'error' | 'warning';
  consoleLogs: Array<{ type: string; text: string }>;
  consoleErrors: Array<{ type: string; text: string }>;
  networkErrors: string[];
  loadTime: number;
  screenshot?: string;
}

async function login(page: Page): Promise<boolean> {
  try {
    console.log('🔐 Fazendo login...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Preencher formulário de login
    await page.fill('input[type="email"]', LOGIN_EMAIL);
    await page.fill('input[type="password"]', LOGIN_PASSWORD);

    // Clicar no botão de login
    await page.click('button[type="submit"]');

    // Aguardar redirecionamento
    await page.waitForURL('**/dashboard**', { timeout: 10000 });

    console.log('✅ Login realizado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error);
    return false;
  }
}

async function testPage(page: Page, pageInfo: typeof PAGES_TO_TEST[0]): Promise<PageTestResult> {
  const result: PageTestResult = {
    path: pageInfo.path,
    name: pageInfo.name,
    status: 'success',
    consoleLogs: [],
    consoleErrors: [],
    networkErrors: [],
    loadTime: 0,
  };

  // Capturar logs do console
  page.on('console', (msg) => {
    const logEntry = { type: msg.type(), text: msg.text() };

    if (msg.type() === 'error' || msg.type() === 'warning') {
      result.consoleErrors.push(logEntry);
    } else {
      result.consoleLogs.push(logEntry);
    }
  });

  // Capturar erros de rede
  page.on('requestfailed', (request) => {
    result.networkErrors.push(`${request.url()} - ${request.failure()?.errorText}`);
  });

  try {
    const startTime = Date.now();

    console.log(`\n📄 Testando: ${pageInfo.name} (${pageInfo.path})`);

    // Navegar para a página
    await page.goto(`${BASE_URL}${pageInfo.path}`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    result.loadTime = Date.now() - startTime;

    // Aguardar um pouco para garantir que tudo carregou
    await page.waitForTimeout(2000);

    // Tirar screenshot
    const screenshotPath = `screenshots/${pageInfo.path.replace(/\//g, '_')}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    result.screenshot = screenshotPath;

    // Verificar status
    if (result.consoleErrors.length > 0) {
      result.status = 'warning';
    }

    if (result.networkErrors.length > 0) {
      result.status = 'error';
    }

    console.log(`✅ Página carregada em ${result.loadTime}ms`);
    console.log(`   📊 Console logs: ${result.consoleLogs.length}`);
    console.log(`   ⚠️  Console errors: ${result.consoleErrors.length}`);
    console.log(`   🌐 Network errors: ${result.networkErrors.length}`);

  } catch (error) {
    result.status = 'error';
    result.consoleErrors.push({
      type: 'error',
      text: `Erro ao carregar página: ${error}`
    });
    console.error(`❌ Erro ao testar página: ${error}`);
  }

  return result;
}

async function generateReport(results: PageTestResult[]) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const reportPath = `test-reports/page-test-${timestamp}.md`;

  let report = `# Relatório de Testes de Páginas - FisioFlow\n\n`;
  report += `**Data**: ${new Date().toLocaleString('pt-BR')}\n`;
  report += `**Total de páginas testadas**: ${results.length}\n\n`;

  // Resumo
  const successful = results.filter(r => r.status === 'success').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const errors = results.filter(r => r.status === 'error').length;

  report += `## 📊 Resumo\n\n`;
  report += `- ✅ Sucesso: ${successful}\n`;
  report += `- ⚠️ Warnings: ${warnings}\n`;
  report += `- ❌ Erros: ${errors}\n\n`;

  // Detalhes por página
  report += `## 📄 Detalhes por Página\n\n`;

  for (const result of results) {
    const icon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';

    report += `### ${icon} ${result.name}\n\n`;
    report += `- **Path**: ${result.path}\n`;
    report += `- **Status**: ${result.status.toUpperCase()}\n`;
    report += `- **Tempo de carregamento**: ${result.loadTime}ms\n`;
    report += `- **Console logs**: ${result.consoleLogs.length}\n`;
    report += `- **Console errors**: ${result.consoleErrors.length}\n`;
    report += `- **Network errors**: ${result.networkErrors.length}\n`;

    if (result.screenshot) {
      report += `- **Screenshot**: ${result.screenshot}\n`;
    }

    // Console Errors
    if (result.consoleErrors.length > 0) {
      report += `\n#### ⚠️ Console Errors:\n\n`;
      report += '```\n';
      result.consoleErrors.forEach(err => {
        report += `[${err.type.toUpperCase()}] ${err.text}\n`;
      });
      report += '```\n';
    }

    // Network Errors
    if (result.networkErrors.length > 0) {
      report += `\n#### 🌐 Network Errors:\n\n`;
      report += '```\n';
      result.networkErrors.forEach(err => {
        report += `${err}\n`;
      });
      report += '```\n';
    }

    // Console Logs importantes (filtrar apenas erros e warnings)
    const importantLogs = result.consoleLogs.filter(log =>
      log.text.toLowerCase().includes('error') ||
      log.text.toLowerCase().includes('warning') ||
      log.text.toLowerCase().includes('failed')
    );

    if (importantLogs.length > 0) {
      report += `\n#### 📝 Logs Importantes:\n\n`;
      report += '```\n';
      importantLogs.forEach(log => {
        report += `[${log.type}] ${log.text}\n`;
      });
      report += '```\n';
    }

    report += '\n---\n\n';
  }

  // Salvar relatório
  const dir = path.dirname(reportPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(reportPath, report);
  console.log(`\n📝 Relatório salvo em: ${reportPath}`);

  return reportPath;
}

async function main() {
  console.log('🚀 Iniciando testes de páginas...\n');

  // Criar diretório de screenshots
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots', { recursive: true });
  }

  let browser: Browser | null = null;

  try {
    // Iniciar navegador
    browser = await chromium.launch({
      headless: false,  // Mostrar navegador
      slowMo: 500,      // Diminuir velocidade para visualização
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();

    // Fazer login
    const loginSuccess = await login(page);

    if (!loginSuccess) {
      console.error('❌ Não foi possível fazer login. Abortando testes.');
      await browser.close();
      return;
    }

    // Testar todas as páginas
    const results: PageTestResult[] = [];

    for (const pageInfo of PAGES_TO_TEST) {
      if (!pageInfo.requiresAuth || loginSuccess) {
        const result = await testPage(page, pageInfo);
        results.push(result);

        // Pequena pausa entre páginas
        await page.waitForTimeout(1000);
      }
    }

    // Gerar relatório
    await generateReport(results);

    console.log('\n✅ Testes concluídos!');

    // Fechar navegador
    await browser.close();

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    if (browser) {
      await browser.close();
    }
  }
}

// Executar
main().catch(console.error);
