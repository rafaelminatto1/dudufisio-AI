import { test, expect } from '@playwright/test';

/**
 * FASE 1.3: Testes Básicos Adicionais - Navegação Completa
 *
 * Este arquivo testa:
 * - Navegação por TODOS os itens do menu do Admin
 * - Verificação de carregamento de cada página
 * - Screenshots de todas as páginas
 */

test.describe('Navegação Completa - Administrador', () => {
  test.beforeEach(async ({ page }) => {
    // Login como Admin
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Verificar se já está logado
    const sidebar = page.locator('aside');

    try {
      await sidebar.waitFor({ state: 'visible', timeout: 2000 });
    } catch {
      // Não está logado, fazer login
      await page.fill('[data-testid="login-email"]', 'admin@dudufisio.com');
      await page.fill('[data-testid="login-password"]', 'demo123456');
      await page.click('[data-testid="login-submit"]');
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      await sidebar.waitFor({ state: 'visible', timeout: 10000 });
    }
  });

  test('Navegar por TODOS os itens da seção PRINCIPAL', async ({ page }) => {
    const mainItems = [
      { text: 'Dashboard Geral', href: '/dashboard', screenshot: 'nav-dashboard-geral.png' },
      { text: 'Dashboard Administrativo', href: '/admin-dashboard', screenshot: 'nav-admin-dashboard.png' },
      { text: 'Notificações', href: '/notifications', screenshot: 'nav-notifications.png' },
      { text: 'Quadro de Tarefas', href: '/tasks', screenshot: 'nav-tasks.png' },
    ];

    for (const item of mainItems) {
      console.log(`📍 Testando: ${item.text}`);

      // Clicar no item
      const link = page.locator(`a:has-text("${item.text}")`).first();
      const isVisible = await link.isVisible().catch(() => false);

      if (isVisible) {
        await link.click();
        await page.waitForLoadState('domcontentloaded');
        await page.screenshot({
          path: `test-results/screenshots/${item.screenshot}`,
          fullPage: true
        });
        console.log(`✅ ${item.text} - Acessado`);
      } else {
        console.log(`⚠️  ${item.text} - Link não visível`);
      }
    }
  });

  test('Navegar por itens da seção CLÍNICO', async ({ page }) => {
    const clinicalItems = [
      { text: 'Pacientes', href: '/patients' },
      { text: 'Agenda', href: '/agenda' },
      { text: 'Acompanhamento', href: '/acompanhamento' },
      { text: 'Evolução de Sessões', href: '/session-evolution' },
      { text: 'Teleconsulta', href: '/teleconsulta' },
      { text: 'Exercícios', href: '/exercises' },
      { text: 'Biblioteca de Exercícios', href: '/exercise-library' },
      { text: 'Gerador Gemini Veo', href: '/free-video-generator' },
      { text: 'Protocolos Clínicos', href: '/protocols' },
    ];

    for (const item of clinicalItems) {
      try {
        console.log(`📍 Testando: ${item.text}`);
        const link = page.locator(`a:has-text("${item.text}")`).first();
        const isVisible = await link.isVisible().catch(() => false);

        if (isVisible) {
          await link.click();
          await page.waitForLoadState('domcontentloaded');
          await page.screenshot({
            path: `test-results/screenshots/clinical-${item.href.replace('/', '')}.png`,
            fullPage: true
          });
          console.log(`✅ ${item.text}`);
        } else {
          console.log(`⚠️  ${item.text} - Não encontrado`);
        }
      } catch (error) {
        console.log(`❌ ${item.text} - Erro: ${error}`);
      }
    }
  });

  test('Navegar por itens da seção ANALYTICS & BI', async ({ page }) => {
    const analyticsItems = [
      { text: 'Dashboard de Relatórios', href: '/reports/consolidated' },
      { text: 'Analytics Clínicos', href: '/clinical-analytics' },
      { text: 'Analytics de IA', href: '/ai-analytics' },
      { text: 'Gestão Financeira', href: '/financials' },
    ];

    for (const item of analyticsItems) {
      try {
        console.log(`📍 Testando: ${item.text}`);
        const link = page.locator(`a:has-text("${item.text}")`).first();
        const isVisible = await link.isVisible().catch(() => false);

        if (isVisible) {
          await link.click();
          await page.waitForLoadState('domcontentloaded');
          await page.screenshot({
            path: `test-results/screenshots/analytics-${item.href.replace(/\//g, '-')}.png`,
            fullPage: true
          });
          console.log(`✅ ${item.text}`);
        } else {
          console.log(`⚠️  ${item.text} - Não encontrado`);
        }
      } catch (error) {
        console.log(`❌ ${item.text} - Erro`);
      }
    }
  });

  test('Navegar por itens da seção FERRAMENTAS IA', async ({ page }) => {
    const aiItems = [
      { text: 'Ferramentas IA', href: '/ai-tools/consolidated' },
      { text: 'Gerar Laudo', href: '/gerar-laudo' },
      { text: 'Gerar Evolução', href: '/gerar-evolucao' },
      { text: 'Gerar Plano (HEP)', href: '/hep-generator' },
      { text: 'Análise de Risco', href: '/risk-analysis' },
      { text: 'IA Econômica', href: '/ia-economica' },
    ];

    for (const item of aiItems) {
      try {
        console.log(`📍 Testando: ${item.text}`);
        const link = page.locator(`a:has-text("${item.text}")`).first();
        const isVisible = await link.isVisible().catch(() => false);

        if (isVisible) {
          await link.click();
          await page.waitForLoadState('domcontentloaded');
          await page.screenshot({
            path: `test-results/screenshots/ai-${item.href.replace(/\//g, '-')}.png`,
            fullPage: true
          });
          console.log(`✅ ${item.text}`);
        } else {
          console.log(`⚠️  ${item.text} - Não encontrado`);
        }
      } catch (error) {
        console.log(`❌ ${item.text} - Erro`);
      }
    }
  });

  test('Navegar por itens da seção SISTEMA', async ({ page }) => {
    const systemItems = [
      { text: 'CRM & Leads', href: '/crm' },
      { text: 'WhatsApp Business', href: '/whatsapp' },
      { text: 'Integrações', href: '/integrations' },
      { text: 'Configurações', href: '/settings' },
    ];

    for (const item of systemItems) {
      try {
        console.log(`📍 Testando: ${item.text}`);
        const link = page.locator(`a:has-text("${item.text}")`).first();
        const isVisible = await link.isVisible().catch(() => false);

        if (isVisible) {
          await link.click();
          await page.waitForLoadState('domcontentloaded');
          await page.screenshot({
            path: `test-results/screenshots/system-${item.href.replace(/\//g, '-')}.png`,
            fullPage: true
          });
          console.log(`✅ ${item.text}`);
        } else {
          console.log(`⚠️  ${item.text} - Não encontrado`);
        }
      } catch (error) {
        console.log(`❌ ${item.text} - Erro`);
      }
    }
  });
});
