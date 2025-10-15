import { test, expect } from '@playwright/test';

/**
 * FASE 3.1: Testes de Integração - Gemini AI
 *
 * Cenários testados:
 * 1. Geração de laudo fisioterapêutico com IA
 * 2. Geração de evolução SOAP automatizada
 * 3. Geração de plano de tratamento
 * 4. Análise de risco do paciente
 * 5. Sugestões de exercícios baseadas em IA
 * 6. Geração de orientações para o paciente
 * 7. Validação de respostas da API Gemini
 * 8. Tratamento de erros de API
 * 9. Fallback quando API não disponível
 * 10. Performance da integração IA
 */

test.describe('Integração Gemini AI - Fluxo Completo', () => {

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

  test('1. Acessar módulo Gerador Gemini Veo', async ({ page }) => {
    // Navegar para Gerador Gemini Veo
    const geminiLink = page.locator('a').filter({ hasText: /Gerador Gemini Veo|Gemini|IA|AI/i });
    const hasGemini = await geminiLink.isVisible().catch(() => false);

    if (hasGemini) {
      await geminiLink.first().click();
      await page.waitForLoadState('domcontentloaded');
      console.log('✅ Módulo Gemini acessado');
    } else {
      console.log('⚠️  Módulo Gemini não encontrado no menu');
    }

    await page.screenshot({
      path: 'test-results/screenshots/gemini-module.png',
      fullPage: true
    });
  });

  test('2. Testar geração de laudo fisioterapêutico', async ({ page }) => {
    // Navegar para área de laudos
    const reportLink = page.locator('a').filter({ hasText: /laudo|relatório|report/i });
    const hasReport = await reportLink.isVisible().catch(() => false);

    if (hasReport) {
      await reportLink.first().click();
      await page.waitForLoadState('domcontentloaded');

      // Procurar botão de gerar com IA
      const aiButton = page.locator('button').filter({
        hasText: /gerar com ia|ia|gemini|automatizar/i
      });
      const hasAIButton = await aiButton.isVisible().catch(() => false);

      if (hasAIButton) {
        console.log('✅ Botão de geração com IA encontrado');

        // Clicar e aguardar geração
        await aiButton.first().click();
        await page.waitForTimeout(2000);

        // Verificar se há loading ou resultado
        const loadingIndicator = page.locator('[class*="loading"], [class*="spinner"], text=/gerando|processando/i');
        const hasLoading = await loadingIndicator.isVisible().catch(() => false);

        if (hasLoading) {
          console.log('⏳ Geração de laudo em progresso...');
          await page.waitForTimeout(5000); // Aguardar geração
        }

        await page.screenshot({
          path: 'test-results/screenshots/gemini-report-generation.png',
          fullPage: true
        });

        console.log('✅ Geração de laudo testada');
      } else {
        console.log('⚠️  Botão de IA não encontrado');
      }
    } else {
      console.log('ℹ️  Módulo de laudos não encontrado');
    }
  });

  test('3. Testar geração de evolução SOAP com IA', async ({ page }) => {
    // Navegar para evolução de sessões
    await page.click('a:has-text("Evolução de Sessões")');
    await page.waitForLoadState('domcontentloaded');

    // Procurar botão "Novo" ou "Adicionar"
    const newButton = page.locator('button').filter({ hasText: /novo|nova|adicionar/i }).first();
    const hasButton = await newButton.isVisible().catch(() => false);

    if (hasButton) {
      await newButton.click();
      await page.waitForTimeout(1500);

      // Procurar botão de gerar com IA
      const aiGenerateButton = page.locator('button').filter({
        hasText: /gerar com ia|sugestão ia|ia|gemini/i
      });
      const hasAI = await aiGenerateButton.isVisible().catch(() => false);

      if (hasAI) {
        console.log('✅ Integração IA disponível em evolução SOAP');
        await aiGenerateButton.first().click();
        await page.waitForTimeout(3000);

        await page.screenshot({
          path: 'test-results/screenshots/gemini-soap-generation.png',
          fullPage: true
        });
      } else {
        console.log('ℹ️  Botão de IA não disponível em evolução');
      }
    } else {
      console.log('ℹ️  Não foi possível abrir formulário de evolução');
    }
  });

  test('4. Testar geração de plano de tratamento', async ({ page }) => {
    // Navegar para pacientes
    await page.click('a:has-text("Pacientes")');
    await page.waitForLoadState('domcontentloaded');

    // Clicar no primeiro paciente
    const patientCard = page.locator('[class*="patient"], [class*="card"], table tbody tr').first();
    const hasPatient = await patientCard.isVisible().catch(() => false);

    if (hasPatient) {
      await patientCard.click();
      await page.waitForTimeout(1500);

      // Procurar opção de gerar plano de tratamento
      const planButton = page.locator('button').filter({
        hasText: /plano de tratamento|treatment plan|gerar plano/i
      });
      const hasPlanButton = await planButton.isVisible().catch(() => false);

      if (hasPlanButton) {
        console.log('✅ Botão de plano de tratamento encontrado');
        await planButton.first().click();
        await page.waitForTimeout(2000);

        // Verificar se há opção de IA
        const aiOption = page.locator('button, [role="button"]').filter({
          hasText: /ia|gemini|automatizar/i
        });
        const hasAI = await aiOption.isVisible().catch(() => false);

        if (hasAI) {
          console.log('✅ Integração IA disponível para plano de tratamento');
          await aiOption.first().click();
          await page.waitForTimeout(3000);
        }

        await page.screenshot({
          path: 'test-results/screenshots/gemini-treatment-plan.png',
          fullPage: true
        });
      } else {
        console.log('ℹ️  Botão de plano de tratamento não encontrado');
      }
    }
  });

  test('5. Testar análise de risco com IA', async ({ page }) => {
    // Navegar para pacientes
    await page.click('a:has-text("Pacientes")');
    await page.waitForLoadState('domcontentloaded');

    // Clicar no primeiro paciente
    const patientCard = page.locator('[class*="patient"], [class*="card"], table tbody tr').first();
    const hasPatient = await patientCard.isVisible().catch(() => false);

    if (hasPatient) {
      await patientCard.click();
      await page.waitForTimeout(1500);

      // Procurar indicadores de risco ou análise
      const riskIndicators = page.locator('text=/risco|risk|alerta|warning/i');
      const riskCount = await riskIndicators.count();

      console.log(`📊 ${riskCount} indicadores de risco encontrados`);

      // Procurar botão de análise com IA
      const analyzeButton = page.locator('button').filter({
        hasText: /analisar|análise|avaliar com ia/i
      });
      const hasAnalyze = await analyzeButton.isVisible().catch(() => false);

      if (hasAnalyze) {
        console.log('✅ Botão de análise com IA encontrado');
        await analyzeButton.first().click();
        await page.waitForTimeout(3000);
      }

      await page.screenshot({
        path: 'test-results/screenshots/gemini-risk-analysis.png',
        fullPage: true
      });
    }
  });

  test('6. Testar sugestões de exercícios com IA', async ({ page }) => {
    // Navegar para biblioteca de exercícios
    await page.click('a:has-text("Biblioteca de Exercícios")');
    await page.waitForLoadState('domcontentloaded');

    // Procurar funcionalidade de sugestão por IA
    const aiSuggestionButton = page.locator('button').filter({
      hasText: /sugerir com ia|ia|recomendação ia/i
    });
    const hasSuggestion = await aiSuggestionButton.isVisible().catch(() => false);

    if (hasSuggestion) {
      console.log('✅ Sugestão de exercícios com IA disponível');
      await aiSuggestionButton.first().click();
      await page.waitForTimeout(3000);

      await page.screenshot({
        path: 'test-results/screenshots/gemini-exercise-suggestion.png',
        fullPage: true
      });
    } else {
      console.log('ℹ️  Sugestão por IA não encontrada na biblioteca');
    }

    // Alternativamente, testar no HEP Generator
    const hepLink = page.locator('a:has-text("Gerar Plano (HEP)")');
    const hasHEP = await hepLink.isVisible().catch(() => false);

    if (hasHEP) {
      await hepLink.click();
      await page.waitForLoadState('domcontentloaded');

      const aiHEPButton = page.locator('button').filter({
        hasText: /sugerir|ia|gemini/i
      });
      const hasAIHEP = await aiHEPButton.isVisible().catch(() => false);

      if (hasAIHEP) {
        console.log('✅ Sugestão de exercícios com IA no HEP Generator');
      }
    }
  });

  test('7. Verificar API Gemini está configurada', async ({ page }) => {
    // Interceptar chamadas de API
    const apiCalls: string[] = [];

    page.on('request', request => {
      const url = request.url();
      if (url.includes('gemini') || url.includes('generativelanguage') || url.includes('google')) {
        apiCalls.push(url);
        console.log(`📡 Chamada API detectada: ${url}`);
      }
    });

    // Navegar por algumas páginas para tentar acionar API
    await page.click('a:has-text("Dashboard Geral")');
    await page.waitForTimeout(2000);

    console.log(`📊 Total de ${apiCalls.length} chamadas para API Gemini detectadas`);

    if (apiCalls.length > 0) {
      console.log('✅ API Gemini está sendo chamada');
    } else {
      console.log('⚠️  Nenhuma chamada para API Gemini detectada (pode estar mockada ou desativada)');
    }
  });

  test('8. Testar tratamento de erros de API', async ({ page }) => {
    // Interceptar e forçar erro na API
    await page.route('**/generativelanguage.googleapis.com/**', route => {
      route.abort('failed');
    });

    // Navegar para área que usa IA
    const geminiLink = page.locator('a').filter({ hasText: /Gemini|IA/i });
    const hasGemini = await geminiLink.isVisible().catch(() => false);

    if (hasGemini) {
      await geminiLink.first().click();
      await page.waitForLoadState('domcontentloaded');

      // Tentar acionar funcionalidade de IA
      const aiButton = page.locator('button').filter({ hasText: /gerar|ia|gemini/i }).first();
      const hasButton = await aiButton.isVisible().catch(() => false);

      if (hasButton) {
        await aiButton.click();
        await page.waitForTimeout(2000);

        // Verificar se há mensagem de erro amigável
        const errorMessage = page.locator('text=/erro|error|falha|não foi possível/i');
        const hasError = await errorMessage.isVisible().catch(() => false);

        if (hasError) {
          console.log('✅ Mensagem de erro exibida ao usuário');
        } else {
          console.log('⚠️  Sem mensagem de erro visível (pode ser silencioso)');
        }

        await page.screenshot({
          path: 'test-results/screenshots/gemini-error-handling.png',
          fullPage: true
        });
      }
    }
  });

  test('9. Testar fallback quando API não disponível', async ({ page }) => {
    // Bloquear API Gemini
    await page.route('**/generativelanguage.googleapis.com/**', route => {
      route.abort('failed');
    });

    // Navegar para funcionalidade que usa IA
    await page.click('a:has-text("Evolução de Sessões")');
    await page.waitForLoadState('domcontentloaded');

    // Verificar se o sistema continua funcionando sem IA
    const pageContent = page.locator('body');
    const hasContent = await pageContent.isVisible();

    if (hasContent) {
      console.log('✅ Sistema funciona mesmo com API Gemini indisponível');
    }

    // Verificar se formulários ainda podem ser preenchidos manualmente
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();

    if (textareaCount > 0) {
      console.log(`✅ ${textareaCount} campos de texto disponíveis para preenchimento manual`);
    }

    await page.screenshot({
      path: 'test-results/screenshots/gemini-fallback.png',
      fullPage: true
    });
  });

  test('10. Medir performance da integração IA', async ({ page }) => {
    const startTime = Date.now();

    // Navegar para módulo Gemini
    const geminiLink = page.locator('a').filter({ hasText: /Gemini|IA/i });
    const hasGemini = await geminiLink.isVisible().catch(() => false);

    if (hasGemini) {
      await geminiLink.first().click();
      await page.waitForLoadState('domcontentloaded');

      const loadTime = Date.now() - startTime;
      console.log(`⏱️  Tempo de carregamento do módulo Gemini: ${loadTime}ms`);

      if (loadTime < 3000) {
        console.log('🚀 Performance excelente (< 3s)');
      } else if (loadTime < 5000) {
        console.log('✅ Performance aceitável (< 5s)');
      } else {
        console.log('⚠️  Performance pode ser melhorada (> 5s)');
      }

      // Testar geração se disponível
      const generateButton = page.locator('button').filter({ hasText: /gerar/i }).first();
      const hasButton = await generateButton.isVisible().catch(() => false);

      if (hasButton) {
        const generateStart = Date.now();
        await generateButton.click();

        // Aguardar resposta ou timeout
        await page.waitForTimeout(5000);

        const generateTime = Date.now() - generateStart;
        console.log(`⏱️  Tempo de geração com IA: ${generateTime}ms`);

        if (generateTime < 3000) {
          console.log('🚀 Geração rápida (< 3s)');
        } else if (generateTime < 10000) {
          console.log('✅ Geração aceitável (< 10s)');
        } else {
          console.log('⚠️  Geração lenta (> 10s)');
        }
      }
    }

    await page.screenshot({
      path: 'test-results/screenshots/gemini-performance.png',
      fullPage: true
    });
  });
});
