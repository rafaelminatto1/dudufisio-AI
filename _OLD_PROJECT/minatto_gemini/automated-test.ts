import { chromium, Browser, Page, ConsoleMessage } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PageReport {
  url: string;
  name: string;
  timestamp: string;
  consoleLogs: {
    type: string;
    text: string;
    location?: string;
  }[];
  errors: {
    message: string;
    stack?: string;
  }[];
  networkErrors: {
    url: string;
    error: string;
  }[];
}

interface TestReport {
  timestamp: string;
  totalPages: number;
  pagesWithErrors: number;
  pages: PageReport[];
  summary: {
    totalConsoleErrors: number;
    totalNetworkErrors: number;
    manifestError: boolean;
    corsErrors: number;
  };
}

const PAGES_TO_TEST = [
  { name: 'Login', url: 'http://localhost:5173' },
  { name: 'Dashboard', url: 'http://localhost:5173/dashboard' },
  { name: 'Agenda', url: 'http://localhost:5173/agenda' },
  { name: 'Pacientes', url: 'http://localhost:5173/patients' },
  { name: 'Biblioteca de Exercícios', url: 'http://localhost:5173/exercise-library' },
  { name: 'Protocolos', url: 'http://localhost:5173/protocols' },
  { name: 'Configurações', url: 'http://localhost:5173/settings' },
];

async function collectPageLogs(page: Page, pageName: string, url: string): Promise<PageReport> {
  const consoleLogs: PageReport['consoleLogs'] = [];
  const errors: PageReport['errors'] = [];
  const networkErrors: PageReport['networkErrors'] = [];

  // Captura console logs
  page.on('console', (msg: ConsoleMessage) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()?.url,
    });
  });

  // Captura erros de página
  page.on('pageerror', (error: Error) => {
    errors.push({
      message: error.message,
      stack: error.stack,
    });
  });

  // Captura erros de rede
  page.on('requestfailed', (request) => {
    networkErrors.push({
      url: request.url(),
      error: request.failure()?.errorText || 'Unknown error',
    });
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000); // Aguarda 2s para carregar recursos adicionais
  } catch (error: any) {
    errors.push({
      message: `Erro ao navegar para ${url}: ${error.message}`,
    });
  }

  return {
    url,
    name: pageName,
    timestamp: new Date().toISOString(),
    consoleLogs,
    errors,
    networkErrors,
  };
}

async function performLogin(page: Page): Promise<boolean> {
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // Verifica se já está logado
    const isLoggedIn = await page.locator('[data-testid="user-menu"]').count() > 0;
    if (isLoggedIn) {
      console.log('✓ Usuário já está logado');
      return true;
    }

    // Tenta fazer login
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');

    if (await emailInput.count() > 0) {
      await emailInput.fill('admin@dudufisio.com');
      await passwordInput.fill('demo123456');
      await loginButton.click();

      // Aguarda navegação ou indicação de login bem-sucedido
      await page.waitForTimeout(3000);

      console.log('✓ Login realizado com sucesso');
      return true;
    }

    console.log('⚠ Não foi possível localizar campos de login');
    return false;
  } catch (error: any) {
    console.error('✗ Erro ao fazer login:', error.message);
    return false;
  }
}

async function runTests(): Promise<void> {
  const browser: Browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page: Page = await context.newPage();

  const report: TestReport = {
    timestamp: new Date().toISOString(),
    totalPages: PAGES_TO_TEST.length,
    pagesWithErrors: 0,
    pages: [],
    summary: {
      totalConsoleErrors: 0,
      totalNetworkErrors: 0,
      manifestError: false,
      corsErrors: 0,
    },
  };

  console.log('🚀 Iniciando testes automatizados...\n');
  console.log('=' .repeat(80));

  // Faz login
  console.log('\n[1/8] Fazendo login...');
  const loginSuccess = await performLogin(page);

  if (!loginSuccess) {
    console.error('\n✗ Não foi possível fazer login. Abortando testes.');
    await browser.close();
    return;
  }

  // Navega por cada página e coleta logs
  for (let i = 0; i < PAGES_TO_TEST.length; i++) {
    const pageConfig = PAGES_TO_TEST[i];
    console.log(`\n[${i + 2}/${PAGES_TO_TEST.length + 1}] Testando página: ${pageConfig.name}`);
    console.log('-'.repeat(80));

    const pageReport = await collectPageLogs(page, pageConfig.name, pageConfig.url);
    report.pages.push(pageReport);

    // Analisa logs
    const consoleErrors = pageReport.consoleLogs.filter(log => log.type === 'error');
    const corsErrors = pageReport.networkErrors.filter(err => err.error.includes('CORS'));
    const manifestErrors = pageReport.consoleLogs.filter(log =>
      log.text.toLowerCase().includes('manifest') && log.type === 'error'
    );

    if (consoleErrors.length > 0 || pageReport.errors.length > 0 || pageReport.networkErrors.length > 0) {
      report.pagesWithErrors++;
    }

    report.summary.totalConsoleErrors += consoleErrors.length;
    report.summary.totalNetworkErrors += pageReport.networkErrors.length;
    report.summary.corsErrors += corsErrors.length;

    if (manifestErrors.length > 0) {
      report.summary.manifestError = true;
    }

    // Exibe resumo da página
    console.log(`  Console Errors: ${consoleErrors.length}`);
    console.log(`  Page Errors: ${pageReport.errors.length}`);
    console.log(`  Network Errors: ${pageReport.networkErrors.length}`);

    if (consoleErrors.length > 0) {
      console.log('  Erros do console:');
      consoleErrors.slice(0, 3).forEach(err => {
        console.log(`    - ${err.text.substring(0, 100)}`);
      });
    }
  }

  // Salva relatório
  const reportPath = path.join(__dirname, `test-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  // Exibe resumo final
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(80));
  console.log(`Total de páginas testadas: ${report.totalPages}`);
  console.log(`Páginas com erros: ${report.pagesWithErrors}`);
  console.log(`Total de erros no console: ${report.summary.totalConsoleErrors}`);
  console.log(`Total de erros de rede: ${report.summary.totalNetworkErrors}`);
  console.log(`Erros de CORS: ${report.summary.corsErrors}`);
  console.log(`Erro no manifest.json: ${report.summary.manifestError ? 'SIM' : 'NÃO'}`);
  console.log('\n📁 Relatório salvo em:', reportPath);
  console.log('='.repeat(80));

  await browser.close();
}

runTests().catch((error) => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
