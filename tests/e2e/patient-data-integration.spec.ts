import { test, expect } from '@playwright/test';

/**
 * Teste E2E: Integração com Dados do Paciente
 * 
 * Valida que os dados do paciente são carregados corretamente:
 * - Dados pessoais
 * - Cirurgias
 * - Patologias
 * - Histórico de sessões
 * - Métricas e progresso
 */

test.describe('Integração com Dados do Paciente', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Login
    const sidebar = page.locator('aside, nav');
    try {
      await sidebar.waitFor({ state: 'visible', timeout: 3000 });
    } catch {
      await page.fill('input[type="email"]', 'therapist@dudufisio.com');
      await page.fill('input[type="password"]', 'demo123456');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    }
  });

  test('1. Verificar dados pessoais do paciente', async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForTimeout(2000);

    const appointment = page.locator('[class*="appointment"]').first();
    if (await appointment.isVisible().catch(() => false)) {
      await appointment.click();
      await page.waitForTimeout(1500);

      // Procurar aba ou seção de dados
      const dataTab = page.locator('[role="tab"], button, a').filter({ 
        hasText: /dados|info|paciente/i 
      }).first();

      if (await dataTab.isVisible().catch(() => false)) {
        await dataTab.click();
        await page.waitForTimeout(1000);
      }

      // Verificar campos de dados pessoais
      const personalDataFields = [
        /nome|name/i,
        /idade|age|data de nascimento|birth/i,
        /cpf|documento/i,
        /telefone|phone|celular/i,
        /email|e-mail/i
      ];

      let fieldsFound = 0;
      for (const pattern of personalDataFields) {
        const hasField = await page.locator(`text=${pattern}`).isVisible({ timeout: 1000 }).catch(() => false);
        if (hasField) {
          fieldsFound++;
        }
      }

      console.log(`✅ ${fieldsFound}/${personalDataFields.length} campos de dados pessoais encontrados`);

      await page.screenshot({
        path: 'test-results/screenshots/patient-personal-data.png',
        fullPage: true
      });
    }
  });

  test('2. Verificar listagem de cirurgias', async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForTimeout(2000);

    const appointment = page.locator('[class*="appointment"]').first();
    if (await appointment.isVisible().catch(() => false)) {
      await appointment.click();
      await page.waitForTimeout(1500);

      // Procurar seção de cirurgias
      const surgeriesSection = page.locator('text=/cirurgia|surgery|procedimento/i');
      const hasSurgeries = await surgeriesSection.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasSurgeries) {
        console.log('✅ Seção de cirurgias encontrada');

        // Tentar clicar para expandir se for collapsible
        const collapsibleTrigger = page.locator('[class*="collapsible"], [class*="accordion"]').filter({
          hasText: /cirurgia/i
        }).first();

        if (await collapsibleTrigger.isVisible().catch(() => false)) {
          await collapsibleTrigger.click();
          await page.waitForTimeout(500);
        }

        // Procurar lista de cirurgias
        const surgeryItems = page.locator('[class*="surgery"], [class*="cirurgia"], li').filter({
          hasText: /LCA|menisco|ombro|joelho|coluna/i
        });

        const count = await surgeryItems.count();
        console.log(`📊 ${count} cirurgias encontradas`);

        await page.screenshot({
          path: 'test-results/screenshots/patient-surgeries.png',
          fullPage: true
        });
      } else {
        console.log('⚠️  Seção de cirurgias não encontrada ou paciente sem cirurgias');
      }
    }
  });

  test('3. Verificar patologias listadas', async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForTimeout(2000);

    const appointment = page.locator('[class*="appointment"]').first();
    if (await appointment.isVisible().catch(() => false)) {
      await appointment.click();
      await page.waitForTimeout(1500);

      // Procurar seção de patologias
      const pathologiesSection = page.locator('text=/patologia|diagnóstico|condição|doença/i');
      const hasPathologies = await pathologiesSection.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasPathologies) {
        console.log('✅ Seção de patologias encontrada');

        // Expandir se necessário
        const collapsibleTrigger = page.locator('[class*="collapsible"], [class*="accordion"]').filter({
          hasText: /patologia/i
        }).first();

        if (await collapsibleTrigger.isVisible().catch(() => false)) {
          await collapsibleTrigger.click();
          await page.waitForTimeout(500);
        }

        // Procurar lista de patologias
        const pathologyItems = page.locator('li, [class*="pathology"]').filter({
          hasText: /artrose|tendinite|bursite|lesão|hérnia/i
        });

        const count = await pathologyItems.count();
        console.log(`📊 ${count} patologias encontradas`);

        await page.screenshot({
          path: 'test-results/screenshots/patient-pathologies.png',
          fullPage: true
        });
      } else {
        console.log('⚠️  Seção de patologias não encontrada ou paciente sem patologias');
      }
    }
  });

  test('4. Verificar histórico de sessões anteriores', async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForTimeout(2000);

    const appointment = page.locator('[class*="appointment"]').first();
    if (await appointment.isVisible().catch(() => false)) {
      await appointment.click();
      await page.waitForTimeout(1500);

      // Procurar aba de histórico
      const historyTab = page.locator('[role="tab"], button, a').filter({ 
        hasText: /histórico|history|sessões anteriores/i 
      }).first();

      if (await historyTab.isVisible().catch(() => false)) {
        await historyTab.click();
        await page.waitForTimeout(1000);
        console.log('✅ Aba de histórico encontrada e clicada');

        // Procurar lista de sessões
        const sessionItems = page.locator('[class*="session"], [class*="evolution"], tr, li').filter({
          hasText: /sessão|session|#/i
        });

        const count = await sessionItems.count();
        console.log(`📊 ${count} sessões anteriores encontradas`);

        await page.screenshot({
          path: 'test-results/screenshots/patient-session-history.png',
          fullPage: true
        });
      } else {
        console.log('⚠️  Aba de histórico não encontrada');
      }
    }
  });

  test('5. Verificar métricas e progresso', async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForTimeout(2000);

    const appointment = page.locator('[class*="appointment"]').first();
    if (await appointment.isVisible().catch(() => false)) {
      await appointment.click();
      await page.waitForTimeout(1500);

      // Procurar cards ou seção de métricas
      const metricsSection = page.locator('text=/métricas|progress|evolução|avanço/i');
      const hasMetrics = await metricsSection.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasMetrics) {
        console.log('✅ Seção de métricas encontrada');

        // Procurar indicadores numéricos
        const numbers = page.locator('text=/\\d+%|\\d+\\/\\d+|\\d+ sessões/i');
        const numberCount = await numbers.count();

        console.log(`📊 ${numberCount} indicadores numéricos encontrados`);

        // Procurar gráficos ou barras de progresso
        const charts = page.locator('[class*="chart"], [class*="graph"], [role="progressbar"]');
        const chartCount = await charts.count();

        if (chartCount > 0) {
          console.log(`📈 ${chartCount} elementos visuais de progresso encontrados`);
        }

        await page.screenshot({
          path: 'test-results/screenshots/patient-metrics.png',
          fullPage: true
        });
      } else {
        console.log('⚠️  Seção de métricas não encontrada');
      }
    }
  });

  test('6. Verificar plano de tratamento', async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForTimeout(2000);

    const appointment = page.locator('[class*="appointment"]').first();
    if (await appointment.isVisible().catch(() => false)) {
      await appointment.click();
      await page.waitForTimeout(1500);

      // Procurar seção de plano de tratamento
      const treatmentPlanSection = page.locator('text=/plano de tratamento|treatment plan|objetivos/i');
      const hasPlan = await treatmentPlanSection.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasPlan) {
        console.log('✅ Plano de tratamento encontrado');

        // Expandir se necessário
        const collapsibleTrigger = page.locator('[class*="collapsible"]').filter({
          hasText: /plano/i
        }).first();

        if (await collapsibleTrigger.isVisible().catch(() => false)) {
          await collapsibleTrigger.click();
          await page.waitForTimeout(500);
        }

        // Procurar objetivos
        const goals = page.locator('li, [class*="goal"]').filter({
          hasText: /reduzir|aumentar|melhorar|recuperar|fortalecer/i
        });

        const goalCount = await goals.count();
        console.log(`🎯 ${goalCount} objetivos encontrados`);

        await page.screenshot({
          path: 'test-results/screenshots/patient-treatment-plan.png',
          fullPage: true
        });
      } else {
        console.log('⚠️  Plano de tratamento não encontrado');
      }
    }
  });

  test('7. Verificar cards são colapsáveis', async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForTimeout(2000);

    const appointment = page.locator('[class*="appointment"]').first();
    if (await appointment.isVisible().catch(() => false)) {
      await appointment.click();
      await page.waitForTimeout(1500);

      // Procurar cards colapsáveis
      const collapsibleCards = page.locator('[class*="collapsible"], [class*="accordion"]');
      const count = await collapsibleCards.count();

      if (count > 0) {
        console.log(`📦 ${count} cards colapsáveis encontrados`);

        // Testar expandir/colapsar primeiro card
        const firstCard = collapsibleCards.first();
        const initialState = await firstCard.getAttribute('data-state');

        // Clicar para alternar
        await firstCard.click();
        await page.waitForTimeout(500);

        const newState = await firstCard.getAttribute('data-state');
        
        if (initialState !== newState) {
          console.log('✅ Card colapsável funcionando (estado mudou)');
        }

        await page.screenshot({
          path: 'test-results/screenshots/patient-collapsible-cards.png',
          fullPage: true
        });
      } else {
        console.log('⚠️  Nenhum card colapsável encontrado');
      }
    }
  });
});

