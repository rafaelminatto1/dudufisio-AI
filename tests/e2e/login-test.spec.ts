// tests/e2e/login-test.spec.ts
import { test, expect } from '@playwright/test';

/**
 * Teste simples de login para validar correções:
 * 1. RLS Infinite Recursion fix
 * 2. Re-render loop fix
 */

test.describe('Login e Dashboard - Validação de Correções', () => {
  test('Deve fazer login com credenciais reais e carregar dashboard', async ({ page }) => {
    // 🎯 Console listener para capturar erros
    const consoleErrors: string[] = [];
    const console500Errors: string[] = [];
    const recursionErrors: string[] = [];
    const rerenderWarnings: string[] = [];

    page.on('console', msg => {
      const text = msg.text();

      // Capturar erros 500 (mas ignorar warnings de performance)
      if ((text.includes('500') || text.includes('Internal Server Error')) && 
          !text.includes('Performance issue') && 
          !text.includes('⚠️')) {
        console500Errors.push(text);
      }

      // Capturar erros de recursão
      if (text.includes('infinite recursion') || text.includes('recursion detected')) {
        recursionErrors.push(text);
      }

      // Capturar warnings de re-render
      if (text.includes('Maximum update depth') || text.includes('update depth exceeded')) {
        rerenderWarnings.push(text);
      }

      // Capturar erros gerais
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
    });

    console.log('🔐 Iniciando teste de login...');

    // 1. Navegar para login
    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    console.log('📝 Preenchendo credenciais...');

    // 2. Preencher credenciais
    await page.fill('input[name="email"]', 'admin@dudufisio.com');
    await page.fill('input[name="password"]', 'DuduFisio2024!');

    // 3. Aguardar um momento antes de clicar
    await page.waitForTimeout(1000);

    console.log('🚀 Clicando em Login...');

    // 4. Clicar em login
    await page.click('button[type="submit"]');

    // 5. Aguardar redirecionamento
    console.log('⏳ Aguardando redirecionamento...');

    try {
      await page.waitForURL(/\/(dashboard|agenda|pacientes)/, { timeout: 15000 });
      console.log('✅ Redirecionamento bem-sucedido!');
    } catch (error) {
      console.log('⚠️ Timeout no redirect, verificando se está autenticado...');

      // Tirar screenshot para análise
      await page.screenshot({ path: 'test-results/login-timeout.png', fullPage: true });

      throw new Error(`Login falhou - timeout aguardando redirect. URL atual: ${page.url()}`);
    }

    // 6. Aguardar dashboard carregar
    await page.waitForTimeout(3000); // Aguardar possíveis re-renders

    console.log('📸 Tirando screenshot do dashboard...');
    await page.screenshot({ path: 'test-results/dashboard-loaded.png', fullPage: true });

    // 7. VALIDAÇÕES

    console.log('\n📊 Relatório de Validações:\n');

    // ✅ Verificar se não há erros 500
    console.log(`- Erros 500: ${console500Errors.length}`);
    if (console500Errors.length > 0) {
      console.log('  ❌ FALHOU - Erros 500 detectados:');
      console500Errors.forEach(err => console.log(`     ${err}`));
    } else {
      console.log('  ✅ PASSOU - Nenhum erro 500');
    }

    expect(console500Errors.length, '❌ Erros 500 detectados no console').toBe(0);

    // ✅ Verificar se não há erros de recursão
    console.log(`\n- Erros de recursão infinita: ${recursionErrors.length}`);
    if (recursionErrors.length > 0) {
      console.log('  ❌ FALHOU - Erros de recursão detectados:');
      recursionErrors.forEach(err => console.log(`     ${err}`));
    } else {
      console.log('  ✅ PASSOU - Nenhum erro de recursão');
    }

    expect(recursionErrors.length, '❌ Erros de recursão infinita detectados').toBe(0);

    // ✅ Verificar se não há warnings de re-render
    console.log(`\n- Warnings de re-render loop: ${rerenderWarnings.length}`);
    if (rerenderWarnings.length > 0) {
      console.log('  ❌ FALHOU - Warnings de re-render detectados:');
      rerenderWarnings.forEach(warn => console.log(`     ${warn}`));
    } else {
      console.log('  ✅ PASSOU - Nenhum warning de re-render');
    }

    expect(rerenderWarnings.length, '❌ Warnings de re-render loop detectados').toBe(0);

    // ✅ Verificar que está na página correta (dashboard/agenda)
    const currentURL = page.url();
    console.log(`\n- URL atual: ${currentURL}`);

    const isOnAuthenticatedPage = /\/(dashboard|agenda|pacientes)/.test(currentURL);
    console.log(`  ${isOnAuthenticatedPage ? '✅' : '❌'} Está em página autenticada`);

    expect(isOnAuthenticatedPage, 'Não está em página autenticada').toBe(true);

    // ✅ Verificar que há elementos da UI autenticada
    console.log(`\n- Verificando elementos da UI autenticada...`);

    const hasNavigation = await page.locator('[role="navigation"]').or(page.locator('aside')).count() > 0;
    console.log(`  ${hasNavigation ? '✅' : '❌'} Sidebar/Navigation presente`);

    expect(hasNavigation, 'Sidebar/Navigation não encontrada').toBe(true);

    // 📊 Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DOS TESTES');
    console.log('='.repeat(60));
    console.log(`✅ Login: Bem-sucedido`);
    console.log(`✅ Erros 500: ${console500Errors.length === 0 ? 'Nenhum' : 'DETECTADOS'}`);
    console.log(`✅ Recursão infinita: ${recursionErrors.length === 0 ? 'Nenhuma' : 'DETECTADA'}`);
    console.log(`✅ Re-render loop: ${rerenderWarnings.length === 0 ? 'Nenhum' : 'DETECTADO'}`);
    console.log(`✅ Dashboard: Carregou corretamente`);
    console.log('='.repeat(60));

    if (console500Errors.length === 0 &&
        recursionErrors.length === 0 &&
        rerenderWarnings.length === 0) {
      console.log('\n🎉 TODAS AS CORREÇÕES VALIDADAS COM SUCESSO! 🎉\n');
    } else {
      console.log('\n❌ ALGUMAS CORREÇÕES FALHARAM - Ver logs acima\n');
    }
  });

  test('Deve testar Bug #1 - Quick Patient Registration', async ({ page }) => {
    console.log('🔐 Fazendo login...');

    // 1. Login
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="email"]', 'admin@dudufisio.com');
    await page.fill('input[name="password"]', 'DuduFisio2024!');
    await page.click('button[type="submit"]');

    // 2. Aguardar redirect
    await page.waitForURL(/\/(dashboard|agenda)/, { timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('📅 Navegando para agenda...');

    // 3. Clicar em "Agendamentos" ou "Agenda" na sidebar
    // Tentar múltiplos seletores para maior resiliência
    const agendamentosLink = page.locator('a[href="/agenda"], a:has-text("Agenda"), a:has-text("Agendamentos")').first();
    await expect(agendamentosLink).toBeVisible({ timeout: 10000 });
    await agendamentosLink.click();

    // Aguardar navegação para /agenda
    await page.waitForURL(/\/agenda/, { timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('➕ Abrindo modal de novo agendamento...');

    // 4. Procurar botão "Novo Agendamento" - tentar vários seletores
    const newAppointmentButton = page.locator('button').filter({ hasText: /novo.*agendamento/i }).first();
    await expect(newAppointmentButton).toBeVisible({ timeout: 10000 });
    await newAppointmentButton.click();

    // 5. Aguardar modal abrir
    await page.waitForTimeout(1000);

    console.log('👤 Criando paciente rápido...');

    // 6. Digitar nome de paciente inexistente
    const patientInput = page.locator('input[placeholder*="paciente" i], input[name="patient"]').first();
    await expect(patientInput).toBeVisible({ timeout: 5000 });
    await patientInput.fill('DEMO TesteBug3Nov');

    // 7. Aguardar sugestão de criar paciente aparecer
    await page.waitForTimeout(500);

    // 8. Clicar em "cadastrar" (botão de quick registration)
    const createButton = page.getByRole('button', { name: /cadastrar/i }).first();
    await expect(createButton).toBeVisible({ timeout: 3000 });
    await createButton.click();

    console.log('⏳ Aguardando paciente ser criado e selecionado...');

    // 9. Aguardar paciente ser criado (2 segundos como no código)
    await page.waitForTimeout(2500);

    console.log('📝 Preenchendo restante do formulário...');

    // 10. Preencher restante do formulário (o paciente já foi selecionado)
    // Preencher horário (slotTime)
    const timeInput = page.locator('input[type="time"], input[data-testid="time-input"]').first();
    await expect(timeInput).toBeVisible({ timeout: 5000 });
    await timeInput.fill('14:00');

    // Preencher tipo de atendimento (se necessário - geralmente já tem valor default)
    // Preencher duração (se necessário - geralmente já tem valor default)

    // Preencher observações (opcional)
    const notesInput = page.locator('textarea[name="notes"], textarea').first();
    if (await notesInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await notesInput.fill('Teste de cadastro rápido');
    }

    console.log('✅ Confirmando agendamento...');

    // 11. Capturar console logs
    const validationErrors: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('❌') || text.includes('VALIDAÇÃO FALHOU')) {
        validationErrors.push(text);
        console.log(`Console: ${text}`);
      }
    });

    // 12. Clicar em confirmar usando JavaScript (mais confiável em modais)
    const confirmButton = page.locator('button[data-testid="submit-button"], button:has-text("Confirmar")').first();
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    
    // Clicar usando JavaScript para evitar problemas de viewport
    await confirmButton.evaluate((btn: HTMLElement) => btn.click());

    // 13. Aguardar modal fechar ou erro aparecer
    await page.waitForTimeout(3000);

    // 14. Tirar screenshot
    await page.screenshot({ path: 'test-results/bug1-result.png', fullPage: true });

    // 15. VALIDAÇÕES
    console.log('\n📊 Validando Bug #1...\n');

    // Verificar se modal fechou (não está mais visível)
    const modalStillVisible = await page.locator('[role="dialog"]').isVisible().catch(() => false);
    console.log(`Modal fechou: ${!modalStillVisible ? '✅' : '❌'}`);

    // Verificar URL ainda é /agenda
    const onAgendaPage = /\/agenda/.test(page.url());
    console.log(`Ainda em /agenda: ${onAgendaPage ? '✅' : '❌'}`);

    // Verificar se houve erros de validação
    console.log(`Erros de validação: ${validationErrors.length === 0 ? '✅ Nenhum' : '❌ ' + validationErrors.length}`);

    if (validationErrors.length > 0) {
      console.log('\nErros capturados:');
      validationErrors.forEach(err => console.log(`  ${err}`));
    }

    // Assertion
    expect(modalStillVisible, 'Modal não fechou após confirmação').toBe(false);
    expect(validationErrors.length, 'Erros de validação detectados').toBe(0);

    console.log('\n🎉 Bug #1 - Quick Registration: VALIDADO!\n');
  });
});
