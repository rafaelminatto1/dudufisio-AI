import { test, expect, Page } from '@playwright/test';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:3000';
const LOGIN_EMAIL = 'cursor@moocafisio.com.br';
const LOGIN_PASSWORD = '256256';

interface PageError {
  page: string;
  type: string;
  message: string;
  timestamp: string;
}

const consoleMessages: Array<{ page: string; type: string; message: string }> = [];
const errors: PageError[] = [];

test.describe('Teste de todas as páginas do sistema', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    // Criar diretórios
    if (!existsSync('screenshots')) {
      mkdirSync('screenshots', { recursive: true });
    }
    if (!existsSync('test-reports')) {
      mkdirSync('test-reports', { recursive: true });
    }
  });

  test.beforeEach(async ({ page: p }) => {
    page = p;

    // Capturar mensagens do console
    page.on('console', (msg) => {
      consoleMessages.push({
        page: page.url(),
        type: msg.type(),
        message: msg.text(),
      });

      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`[${msg.type().toUpperCase()}] ${page.url()}: ${msg.text()}`);
      }
    });

    // Capturar erros de página
    page.on('pageerror', (error) => {
      errors.push({
        page: page.url(),
        type: 'PageError',
        message: error.message,
        timestamp: new Date().toISOString(),
      });
      console.error(`[PAGE ERROR] ${page.url()}: ${error.message}`);
    });

    // Capturar falhas de request
    page.on('requestfailed', (request) => {
      errors.push({
        page: page.url(),
        type: 'NetworkError',
        message: `${request.url()} - ${request.failure()?.errorText}`,
        timestamp: new Date().toISOString(),
      });
      console.error(`[NETWORK ERROR] ${request.url()}: ${request.failure()?.errorText}`);
    });
  });

  test('Login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Preencher formulário
    await page.fill('input#email', LOGIN_EMAIL);
    await page.fill('input#password', LOGIN_PASSWORD);

    // Screenshot antes do login
    await page.screenshot({ path: 'screenshots/01-login-form.png', fullPage: true });

    // Fazer login
    await page.click('button[type="submit"]');

    // Aguardar redirecionamento
    await page.waitForURL('**/dashboard**', { timeout: 10000 });

    // Verificar que estamos no dashboard
    expect(page.url()).toContain('/dashboard');

    // Screenshot após login
    await page.screenshot({ path: 'screenshots/02-dashboard-initial.png', fullPage: true });
  });

  test('Dashboard Principal', async ({ page }) => {
    // Fazer login primeiro
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', LOGIN_EMAIL);
    await page.fill('input[type="password"]', LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');

    // Navegar para dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'screenshots/03-dashboard.png', fullPage: true });
  });

  test('Lista de Pacientes', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', LOGIN_EMAIL);
    await page.fill('input[type="password"]', LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');

    await page.goto(`${BASE_URL}/dashboard/pacientes`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'screenshots/04-pacientes.png', fullPage: true });
  });

  test('Novo Paciente', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', LOGIN_EMAIL);
    await page.fill('input[type="password"]', LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');

    await page.goto(`${BASE_URL}/dashboard/pacientes/novo`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'screenshots/05-novo-paciente.png', fullPage: true });
  });

  test('Agenda', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', LOGIN_EMAIL);
    await page.fill('input[type="password"]', LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');

    await page.goto(`${BASE_URL}/dashboard/agenda`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'screenshots/06-agenda.png', fullPage: true });
  });

  test('Tratamentos', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', LOGIN_EMAIL);
    await page.fill('input[type="password"]', LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');

    await page.goto(`${BASE_URL}/dashboard/tratamentos`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'screenshots/07-tratamentos.png', fullPage: true });
  });

  test('Financeiro', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', LOGIN_EMAIL);
    await page.fill('input[type="password"]', LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');

    await page.goto(`${BASE_URL}/dashboard/financeiro`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'screenshots/08-financeiro.png', fullPage: true });
  });

  test('Relatórios', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', LOGIN_EMAIL);
    await page.fill('input[type="password"]', LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');

    await page.goto(`${BASE_URL}/dashboard/relatorios`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'screenshots/09-relatorios.png', fullPage: true });
  });

  test('Configurações - Perfil', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', LOGIN_EMAIL);
    await page.fill('input[type="password"]', LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');

    await page.goto(`${BASE_URL}/dashboard/configuracoes/perfil`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'screenshots/10-config-perfil.png', fullPage: true });
  });

  test('Configurações - Clínica', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', LOGIN_EMAIL);
    await page.fill('input[type="password"]', LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');

    await page.goto(`${BASE_URL}/dashboard/configuracoes/clinica`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'screenshots/11-config-clinica.png', fullPage: true });
  });

  test('Configurações - Notificações', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', LOGIN_EMAIL);
    await page.fill('input[type="password"]', LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');

    await page.goto(`${BASE_URL}/dashboard/configuracoes/notificacoes`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'screenshots/12-config-notificacoes.png', fullPage: true });
  });

  test('Configurações - Integrações', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', LOGIN_EMAIL);
    await page.fill('input[type="password"]', LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');

    await page.goto(`${BASE_URL}/dashboard/configuracoes/integracao`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'screenshots/13-config-integracoes.png', fullPage: true });
  });

  test.afterAll(async () => {
    // Gerar relatório final
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const reportPath = join('test-reports', `page-test-${timestamp}.md`);

    let report = `# Relatório de Testes de Páginas - FisioFlow\n\n`;
    report += `**Data**: ${new Date().toLocaleString('pt-BR')}\n\n`;

    // Erros capturados
    report += `## ❌ Erros Encontrados (${errors.length})\n\n`;
    if (errors.length > 0) {
      for (const error of errors) {
        report += `### ${error.type}\n`;
        report += `- **Página**: ${error.page}\n`;
        report += `- **Mensagem**: ${error.message}\n`;
        report += `- **Timestamp**: ${error.timestamp}\n\n`;
      }
    } else {
      report += `✅ Nenhum erro encontrado!\n\n`;
    }

    // Console errors e warnings
    const consoleErrors = consoleMessages.filter(m => m.type === 'error' || m.type === 'warning');
    report += `## ⚠️ Console Logs (Errors e Warnings: ${consoleErrors.length})\n\n`;
    if (consoleErrors.length > 0) {
      for (const msg of consoleErrors) {
        report += `- **[${msg.type.toUpperCase()}]** ${msg.page}: ${msg.message}\n`;
      }
    } else {
      report += `✅ Nenhum erro ou warning no console!\n\n`;
    }

    report += `\n---\n\n`;
    report += `**Total de mensagens no console**: ${consoleMessages.length}\n`;
    report += `**Screenshots salvos**: 13\n`;

    writeFileSync(reportPath, report);
    console.log(`\n✅ Relatório salvo em: ${reportPath}`);
  });
});
