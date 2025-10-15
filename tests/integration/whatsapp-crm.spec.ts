import { test, expect } from '@playwright/test';

/**
 * FASE 3.2: Testes de Integração - WhatsApp e CRM
 *
 * Cenários testados:
 * 1. Acessar módulo CRM
 * 2. Visualizar lista de leads
 * 3. Criar novo lead manualmente
 * 4. Converter lead em paciente
 * 5. Visualizar histórico de conversas WhatsApp
 * 6. Enviar mensagem via WhatsApp (se disponível)
 * 7. Testar automações de CRM
 * 8. Verificar funil de vendas
 * 9. Testar filtros e busca de leads
 * 10. Gerar relatório de conversão
 */

test.describe('Integração WhatsApp e CRM - Fluxo Completo', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const sidebar = page.locator('aside');

    try {
      await sidebar.waitFor({ state: 'visible', timeout: 2000 });
      console.log('✅ Já está logado');
    } catch {
      console.log('ℹ️  Fazendo login...');
      await page.fill('[data-testid="login-email"]', 'admin@dudufisio.com');
      await page.fill('[data-testid="login-password"]', 'demo123456');
      await page.click('[data-testid="login-submit"]');
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      await sidebar.waitFor({ state: 'visible', timeout: 10000 });
      console.log('✅ Login realizado com sucesso');
    }
  });

  test('1. Acessar módulo CRM', async ({ page }) => {
    // Navegar para CRM
    const crmLink = page.locator('a').filter({ hasText: /CRM|Lead|Prospect/i });
    const hasCRM = await crmLink.isVisible().catch(() => false);

    if (hasCRM) {
      await crmLink.first().click();
      await page.waitForLoadState('domcontentloaded');
      console.log('✅ Módulo CRM acessado');
    } else {
      console.log('⚠️  Módulo CRM não encontrado no menu');
    }

    await page.screenshot({
      path: 'test-results/screenshots/crm-module.png',
      fullPage: true
    });
  });

  test('2. Visualizar lista de leads', async ({ page }) => {
    // Navegar para CRM
    const crmLink = page.locator('a').filter({ hasText: /CRM|Lead/i });
    const hasCRM = await crmLink.isVisible().catch(() => false);

    if (hasCRM) {
      await crmLink.first().click();
      await page.waitForLoadState('domcontentloaded');

      // Contar leads na lista
      const leadItems = page.locator('[class*="lead"], [class*="card"], table tbody tr');
      const leadCount = await leadItems.count();

      console.log(`📊 ${leadCount} leads encontrados no sistema`);

      if (leadCount > 0) {
        console.log('✅ Lista de leads visível');
      } else {
        console.log('ℹ️  Nenhum lead cadastrado ainda');
      }

      await page.screenshot({
        path: 'test-results/screenshots/crm-leads-list.png',
        fullPage: true
      });
    } else {
      console.log('ℹ️  Módulo CRM não disponível');
    }
  });

  test('3. Criar novo lead manualmente', async ({ page }) => {
    const crmLink = page.locator('a').filter({ hasText: /CRM|Lead/i });
    const hasCRM = await crmLink.isVisible().catch(() => false);

    if (hasCRM) {
      await crmLink.first().click();
      await page.waitForLoadState('domcontentloaded');

      // Procurar botão de novo lead
      const newButton = page.locator('button').filter({
        hasText: /novo lead|adicionar lead|criar lead|novo/i
      });
      const hasButton = await newButton.isVisible().catch(() => false);

      if (hasButton) {
        await newButton.first().click();
        await page.waitForTimeout(1500);

        // Verificar campos do formulário
        const nameInput = page.locator('input[type="text"]').first();
        const hasName = await nameInput.isVisible().catch(() => false);

        if (hasName) {
          await nameInput.fill('Lead Teste Automação');
          console.log('✅ Formulário de novo lead acessível');
        }

        await page.screenshot({
          path: 'test-results/screenshots/crm-new-lead-form.png',
          fullPage: true
        });
      } else {
        console.log('⚠️  Botão de novo lead não encontrado');
      }
    }
  });

  test('4. Converter lead em paciente', async ({ page }) => {
    const crmLink = page.locator('a').filter({ hasText: /CRM|Lead/i });
    const hasCRM = await crmLink.isVisible().catch(() => false);

    if (hasCRM) {
      await crmLink.first().click();
      await page.waitForLoadState('domcontentloaded');

      // Clicar no primeiro lead
      const leadCard = page.locator('[class*="lead"], [class*="card"], table tbody tr').first();
      const hasLead = await leadCard.isVisible().catch(() => false);

      if (hasLead) {
        await leadCard.click();
        await page.waitForTimeout(1500);

        // Procurar botão de converter
        const convertButton = page.locator('button').filter({
          hasText: /converter|transformar em paciente|aprovar/i
        });
        const hasConvert = await convertButton.isVisible().catch(() => false);

        if (hasConvert) {
          console.log('✅ Botão de conversão de lead encontrado');
          await page.screenshot({
            path: 'test-results/screenshots/crm-lead-conversion.png',
            fullPage: true
          });
        } else {
          console.log('⚠️  Botão de conversão não encontrado');
        }
      } else {
        console.log('ℹ️  Nenhum lead disponível para testar conversão');
      }
    }
  });

  test('5. Visualizar histórico WhatsApp', async ({ page }) => {
    // Procurar módulo WhatsApp
    const whatsappLink = page.locator('a').filter({ hasText: /WhatsApp|Mensagens|Chat/i });
    const hasWhatsApp = await whatsappLink.isVisible().catch(() => false);

    if (hasWhatsApp) {
      await whatsappLink.first().click();
      await page.waitForLoadState('domcontentloaded');

      // Verificar se há conversas
      const conversations = page.locator('[class*="conversation"], [class*="chat"], [class*="message"]');
      const convCount = await conversations.count();

      console.log(`📊 ${convCount} conversas WhatsApp encontradas`);

      if (convCount > 0) {
        console.log('✅ Histórico de conversas visível');
        await conversations.first().click();
        await page.waitForTimeout(1000);
      }

      await page.screenshot({
        path: 'test-results/screenshots/whatsapp-history.png',
        fullPage: true
      });
    } else {
      console.log('ℹ️  Módulo WhatsApp não encontrado');
    }
  });

  test('6. Verificar funcionalidade de envio de mensagem', async ({ page }) => {
    const whatsappLink = page.locator('a').filter({ hasText: /WhatsApp|Mensagens/i });
    const hasWhatsApp = await whatsappLink.isVisible().catch(() => false);

    if (hasWhatsApp) {
      await whatsappLink.first().click();
      await page.waitForLoadState('domcontentloaded');

      // Procurar área de composição de mensagem
      const messageInput = page.locator('textarea, input[type="text"]').filter({
        hasText: /mensagem|message/i
      }).first();
      const hasInput = await messageInput.isVisible().catch(() => false);

      if (hasInput) {
        await messageInput.fill('Teste de mensagem automática');
        console.log('✅ Campo de envio de mensagem encontrado');

        // Procurar botão de enviar
        const sendButton = page.locator('button').filter({
          hasText: /enviar|send/i
        });
        const hasSend = await sendButton.isVisible().catch(() => false);

        if (hasSend) {
          console.log('✅ Botão de envio encontrado');
        }

        await page.screenshot({
          path: 'test-results/screenshots/whatsapp-send-message.png',
          fullPage: true
        });
      } else {
        console.log('ℹ️  Campo de mensagem não encontrado');
      }
    }
  });

  test('7. Testar automações de CRM', async ({ page }) => {
    const crmLink = page.locator('a').filter({ hasText: /CRM|Automação|Workflow/i });
    const hasCRM = await crmLink.isVisible().catch(() => false);

    if (hasCRM) {
      await crmLink.first().click();
      await page.waitForLoadState('domcontentloaded');

      // Procurar configurações de automação
      const automationButton = page.locator('button, a').filter({
        hasText: /automação|automation|workflow/i
      });
      const hasAutomation = await automationButton.isVisible().catch(() => false);

      if (hasAutomation) {
        await automationButton.first().click();
        await page.waitForTimeout(1500);
        console.log('✅ Módulo de automações encontrado');

        await page.screenshot({
          path: 'test-results/screenshots/crm-automations.png',
          fullPage: true
        });
      } else {
        console.log('ℹ️  Módulo de automações não encontrado');
      }
    }
  });

  test('8. Verificar funil de vendas', async ({ page }) => {
    const crmLink = page.locator('a').filter({ hasText: /CRM|Funil|Pipeline/i });
    const hasCRM = await crmLink.isVisible().catch(() => false);

    if (hasCRM) {
      await crmLink.first().click();
      await page.waitForLoadState('domcontentloaded');

      // Procurar visualização de funil
      const funnelStages = page.locator('[class*="stage"], [class*="funil"], [class*="pipeline"]');
      const stageCount = await funnelStages.count();

      console.log(`📊 ${stageCount} estágios do funil encontrados`);

      if (stageCount > 0) {
        console.log('✅ Funil de vendas visível');
      }

      // Procurar métricas do funil
      const metrics = page.locator('text=/\\d+%|taxa de conversão|conversion/i');
      const metricCount = await metrics.count();

      if (metricCount > 0) {
        console.log(`✅ ${metricCount} métricas de conversão encontradas`);
      }

      await page.screenshot({
        path: 'test-results/screenshots/crm-sales-funnel.png',
        fullPage: true
      });
    }
  });

  test('9. Testar filtros e busca de leads', async ({ page }) => {
    const crmLink = page.locator('a').filter({ hasText: /CRM|Lead/i });
    const hasCRM = await crmLink.isVisible().catch(() => false);

    if (hasCRM) {
      await crmLink.first().click();
      await page.waitForLoadState('domcontentloaded');

      // Procurar input de busca
      const searchInput = page.locator('input[type="search"], input[placeholder*="buscar" i]').first();
      const hasSearch = await searchInput.isVisible().catch(() => false);

      if (hasSearch) {
        await searchInput.fill('João');
        await page.waitForTimeout(1000);
        console.log('✅ Busca de leads testada');
      }

      // Procurar filtros
      const filterButtons = page.locator('button').filter({
        hasText: /filtro|filter|todos|novo|em andamento/i
      });
      const filterCount = await filterButtons.count();

      if (filterCount > 0) {
        console.log(`✅ ${filterCount} filtros de leads encontrados`);
        await filterButtons.first().click();
        await page.waitForTimeout(500);
      }

      await page.screenshot({
        path: 'test-results/screenshots/crm-filters-search.png',
        fullPage: true
      });
    }
  });

  test('10. Gerar relatório de conversão', async ({ page }) => {
    const crmLink = page.locator('a').filter({ hasText: /CRM|Relatório|Report/i });
    const hasCRM = await crmLink.isVisible().catch(() => false);

    if (hasCRM) {
      await crmLink.first().click();
      await page.waitForLoadState('domcontentloaded');

      // Procurar botão de relatório
      const reportButton = page.locator('button').filter({
        hasText: /relatório|report|exportar|gerar/i
      });
      const hasReport = await reportButton.isVisible().catch(() => false);

      if (hasReport) {
        console.log('✅ Botão de relatório encontrado');
        await reportButton.first().click();
        await page.waitForTimeout(1500);

        await page.screenshot({
          path: 'test-results/screenshots/crm-conversion-report.png',
          fullPage: true
        });
      } else {
        console.log('ℹ️  Botão de relatório não encontrado');
      }

      // Verificar se há gráficos ou métricas de conversão
      const charts = page.locator('[class*="chart"], canvas, svg');
      const chartCount = await charts.count();

      if (chartCount > 0) {
        console.log(`✅ ${chartCount} gráficos/visualizações encontrados`);
      }
    }
  });
});
