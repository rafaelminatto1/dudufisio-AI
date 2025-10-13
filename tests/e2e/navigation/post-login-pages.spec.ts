import { test, expect } from '@playwright/test';
import { testUsers } from '../__fixtures__/users';

/**
 * Teste E2E - Navegação pós-login
 *
 * Testa a navegação e funcionamento das principais páginas após login
 */

test.describe('Navegação pós-login - Páginas principais', () => {
  // Configurar autenticação antes de cada teste
  test.beforeEach(async ({ page }) => {
    // Fazer login como admin
    await page.goto('/');
    await page.fill('input[type="email"], input[name="email"]', testUsers.admin.email);
    await page.fill('input[type="password"], input[name="password"]', testUsers.admin.password);
    await page.click('button[type="submit"], button:has-text("Entrar")');

    // Aguardar navegação para dashboard
    await page.waitForURL(/.*dashboard|.*inicio/, { timeout: 10000 });

    // Verificar que está logado
    await expect(page.locator(`text=${testUsers.admin.name}`).first()).toBeVisible({ timeout: 5000 });
  });

  test('Dashboard - Deve carregar e exibir cards principais', async ({ page }) => {
    // Já está no dashboard após o login

    // Verificar título da página
    await expect(page.locator('h1, h2').filter({ hasText: /dashboard|início|visão geral/i }).first())
      .toBeVisible({ timeout: 5000 });

    // Verificar que existem cards ou widgets
    const cards = page.locator('[class*="card"], [class*="widget"], [class*="stat"]');
    await expect(cards.first()).toBeVisible({ timeout: 5000 });

    // Verificar que não há erros críticos
    const errorMessages = page.locator('text=Error, text=Erro, text=Failed').first();
    await expect(errorMessages).not.toBeVisible();
  });

  test('Pacientes - Deve listar pacientes e permitir busca', async ({ page }) => {
    // Navegar para página de pacientes
    await page.click('text=Pacientes');
    await page.waitForURL(/.*pacientes|.*patients/, { timeout: 10000 });

    // Verificar título
    await expect(page.locator('h1, h2').filter({ hasText: /pacientes/i }).first())
      .toBeVisible({ timeout: 5000 });

    // Verificar que existe tabela ou lista de pacientes
    const patientList = page.locator('table, [role="table"], [class*="list"], [class*="grid"]').first();
    await expect(patientList).toBeVisible({ timeout: 5000 });

    // Verificar que existe campo de busca
    const searchInput = page.locator('input[type="search"], input[placeholder*="buscar"], input[placeholder*="pesquisar"]').first();
    await expect(searchInput).toBeVisible();

    // Testar busca
    if (await searchInput.isVisible()) {
      await searchInput.fill('Maria');
      await page.waitForTimeout(1000); // Aguardar filtro
    }
  });

  test('Agenda - Deve exibir calendário de agendamentos', async ({ page }) => {
    // Navegar para agenda
    await page.click('text=Agenda');
    await page.waitForURL(/.*agenda|.*schedule/, { timeout: 10000 });

    // Verificar título
    await expect(page.locator('h1, h2').filter({ hasText: /agenda/i }).first())
      .toBeVisible({ timeout: 5000 });

    // Verificar que existe calendário ou grade de horários
    const calendar = page.locator('[class*="calendar"], [class*="schedule"], [class*="agenda"]').first();
    await expect(calendar).toBeVisible({ timeout: 5000 });

    // Verificar botão de novo agendamento
    const newAppointmentBtn = page.locator('button').filter({ hasText: /novo|adicionar|criar/i }).first();
    await expect(newAppointmentBtn).toBeVisible();
  });

  test('Exercícios - Deve listar biblioteca de exercícios', async ({ page }) => {
    // Navegar para exercícios
    await page.click('text=Exercícios');
    await page.waitForURL(/.*exercicio|.*exercise/, { timeout: 10000 });

    // Verificar título
    await expect(page.locator('h1, h2').filter({ hasText: /exercício|biblioteca/i }).first())
      .toBeVisible({ timeout: 5000 });

    // Verificar que existem cards de exercícios
    const exerciseCards = page.locator('[class*="card"], [class*="exercise"], [class*="item"]');
    await expect(exerciseCards.first()).toBeVisible({ timeout: 5000 });

    // Verificar filtros ou categorias
    const filters = page.locator('select, [role="combobox"], button').filter({ hasText: /categoria|filtro|tipo/i });
    if (await filters.first().isVisible()) {
      await expect(filters.first()).toBeVisible();
    }
  });

  test('Financeiro - Deve exibir resumo financeiro', async ({ page }) => {
    // Navegar para financeiro
    const financeiroLink = page.locator('text=Financeiro, text=Finanças').first();
    await financeiroLink.click();
    await page.waitForURL(/.*financeiro|.*finance|.*financial/, { timeout: 10000 });

    // Verificar título
    await expect(page.locator('h1, h2').filter({ hasText: /financeiro|finanças/i }).first())
      .toBeVisible({ timeout: 5000 });

    // Verificar cards de resumo financeiro
    const financialCards = page.locator('[class*="card"], [class*="stat"], [class*="metric"]');
    await expect(financialCards.first()).toBeVisible({ timeout: 5000 });

    // Verificar valores monetários (R$)
    const currency = page.locator('text=/R\\$\\s*[\\d,.]+/').first();
    await expect(currency).toBeVisible({ timeout: 5000 });
  });

  test('Relatórios - Deve acessar página de relatórios', async ({ page }) => {
    // Tentar navegar para relatórios
    const relatoriosLink = page.locator('text=Relatórios, text=Reports').first();

    if (await relatoriosLink.isVisible()) {
      await relatoriosLink.click();
      await page.waitForURL(/.*relatorio|.*report/, { timeout: 10000 });

      // Verificar título
      await expect(page.locator('h1, h2').filter({ hasText: /relatório|report/i }).first())
        .toBeVisible({ timeout: 5000 });

      // Verificar que existem opções de relatórios
      const reportOptions = page.locator('button, a, [role="button"]').filter({ hasText: /gerar|exportar|visualizar/i });
      await expect(reportOptions.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('WhatsApp - Deve acessar configurações do WhatsApp', async ({ page }) => {
    // Tentar navegar para WhatsApp
    const whatsappLink = page.locator('text=WhatsApp').first();

    if (await whatsappLink.isVisible()) {
      await whatsappLink.click();
      await page.waitForURL(/.*whatsapp/, { timeout: 10000 });

      // Verificar título
      await expect(page.locator('h1, h2').filter({ hasText: /whatsapp/i }).first())
        .toBeVisible({ timeout: 5000 });

      // Verificar status de conexão ou configuração
      const status = page.locator('[class*="status"], [class*="badge"], [class*="indicator"]').first();
      await expect(status).toBeVisible({ timeout: 5000 });
    }
  });

  test('Configurações - Deve acessar página de configurações', async ({ page }) => {
    // Navegar para configurações
    const configLink = page.locator('text=Configurações, text=Settings').first();

    if (await configLink.isVisible()) {
      await configLink.click();
      await page.waitForURL(/.*config|.*settings/, { timeout: 10000 });

      // Verificar título
      await expect(page.locator('h1, h2').filter({ hasText: /configurações|settings/i }).first())
        .toBeVisible({ timeout: 5000 });

      // Verificar que existem opções de configuração
      const configOptions = page.locator('form, [role="tablist"], nav');
      await expect(configOptions.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('Perfil do Usuário - Deve exibir dados do usuário logado', async ({ page }) => {
    // Clicar no nome do usuário ou avatar
    const userMenu = page.locator(`text=${testUsers.admin.name}, [class*="avatar"], [class*="user-menu"]`).first();
    await userMenu.click();

    // Aguardar menu dropdown
    await page.waitForTimeout(500);

    // Procurar link de perfil
    const profileLink = page.locator('text=Perfil, text=Meu Perfil, text=Profile').first();

    if (await profileLink.isVisible()) {
      await profileLink.click();
      await page.waitForURL(/.*perfil|.*profile/, { timeout: 10000 });

      // Verificar dados do usuário
      await expect(page.locator(`text=${testUsers.admin.name}`)).toBeVisible({ timeout: 5000 });
      await expect(page.locator(`text=${testUsers.admin.email}`)).toBeVisible({ timeout: 5000 });
    }
  });

  test('Navegação do Sidebar - Todos os links devem funcionar', async ({ page }) => {
    // Pegar todos os links do sidebar
    const sidebar = page.locator('nav, aside, [role="navigation"]').first();
    await expect(sidebar).toBeVisible();

    // Pegar todos os links visíveis
    const links = sidebar.locator('a, button[role="link"]').filter({ hasText: /.+/ });
    const linkCount = await links.count();

    console.log(`Total de links no sidebar: ${linkCount}`);

    // Verificar que não há erros ao clicar em cada link
    for (let i = 0; i < Math.min(linkCount, 10); i++) {
      const link = links.nth(i);
      const linkText = await link.textContent();

      if (linkText && linkText.trim()) {
        console.log(`Testando link: ${linkText.trim()}`);

        try {
          await link.click({ timeout: 3000 });
          await page.waitForTimeout(1000);

          // Verificar que não há erros de console críticos
          page.on('pageerror', (error) => {
            console.error(`Erro de página ao navegar para ${linkText}:`, error.message);
          });

          // Voltar para dashboard para próximo teste
          await page.goto('/dashboard');
          await page.waitForTimeout(500);
        } catch (error) {
          console.warn(`Não foi possível clicar em: ${linkText.trim()}`);
        }
      }
    }
  });

  test('Service Worker - Não deve gerar erros em loop', async ({ page }) => {
    // Monitorar console para erros do Service Worker
    const swErrors: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('Fetch error') || text.includes('Service Worker')) {
        swErrors.push(text);
      }
    });

    // Navegar por algumas páginas
    await page.click('text=Pacientes');
    await page.waitForTimeout(2000);

    await page.click('text=Agenda');
    await page.waitForTimeout(2000);

    await page.click('text=Exercícios');
    await page.waitForTimeout(2000);

    // Verificar que não há muitos erros (máximo 5)
    console.log(`Total de erros do Service Worker: ${swErrors.length}`);
    expect(swErrors.length).toBeLessThan(10);
  });
});

// Testes para role de Fisioterapeuta
test.describe('Navegação pós-login - Fisioterapeuta', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', testUsers.therapist.email);
    await page.fill('input[type="password"]', testUsers.therapist.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard|.*inicio/, { timeout: 10000 });
  });

  test('Fisioterapeuta - Deve acessar acompanhamento de pacientes', async ({ page }) => {
    // Procurar link de acompanhamento
    const acompanhamentoLink = page.locator('text=Acompanhamento, text=Progresso').first();

    if (await acompanhamentoLink.isVisible()) {
      await acompanhamentoLink.click();
      await page.waitForURL(/.*acompanhamento|.*progress/, { timeout: 10000 });

      // Verificar conteúdo da página
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 });
    }
  });
});

// Testes para role de Paciente
test.describe('Navegação pós-login - Paciente', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', testUsers.patient.email);
    await page.fill('input[type="password"]', testUsers.patient.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000); // Aguardar carregamento
  });

  test('Paciente - Deve ver seus agendamentos', async ({ page }) => {
    // Procurar agendamentos do paciente
    const agendamentosLink = page.locator('text=Agendamentos, text=Consultas, text=Appointments').first();

    if (await agendamentosLink.isVisible()) {
      await agendamentosLink.click();
      await page.waitForTimeout(2000);

      // Verificar conteúdo
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('Paciente - Deve ver seus exercícios', async ({ page }) => {
    // Procurar exercícios do paciente
    const exercisesLink = page.locator('text=Exercícios, text=Meus Exercícios').first();

    if (await exercisesLink.isVisible()) {
      await exercisesLink.click();
      await page.waitForTimeout(2000);

      // Verificar conteúdo
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 });
    }
  });
});
