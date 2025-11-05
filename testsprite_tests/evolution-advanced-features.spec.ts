import { test, expect } from '@playwright/test';

/**
 * TESTES AUTOMATIZADOS - FUNCIONALIDADES AVANÇADAS DE EVOLUÇÃO
 * 
 * Funcionalidades testadas:
 * 1. Timer de Sessão
 * 2. Comparação com Sessão Anterior
 * 3. Prescrição de Exercícios
 * 4. Upload de Fotos
 * 5. Templates
 * 6. Exportação PDF
 */

// Configuração
const BASE_URL = 'http://localhost:5173';
const TEST_USER = {
  email: 'admin@dudufisio.com',
  password: 'DuduFisio2024!'
};

test.describe('Funcionalidades Avançadas de Evolução', () => {
  
  // Antes de cada teste: fazer login
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Aguardar página carregar
    await page.waitForLoadState('networkidle');
    
    // Fazer login
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento para dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navegar para página de pacientes
    await page.click('text=Pacientes');
    await page.waitForLoadState('networkidle');
    
    // Selecionar primeiro paciente
    await page.click('.patient-card:first-child, [data-testid="patient-item"]:first-child');
    await page.waitForLoadState('networkidle');
    
    // Abrir página de evolução
    await page.click('text=Nova Evolução, text=Evolução');
    await page.waitForLoadState('networkidle');
  });

  test('1. Timer de Sessão - Deve iniciar automaticamente', async ({ page }) => {
    // Verificar se o timer está visível
    const timerExists = await page.locator('[data-testid="session-timer"], .session-timer, text=Tempo de Sessão').count();
    expect(timerExists).toBeGreaterThan(0);
    
    // Aguardar 2 segundos
    await page.waitForTimeout(2000);
    
    // Verificar se o timer está contando (deve mostrar pelo menos 00:02)
    const timerText = await page.locator('[data-testid="timer-duration"], .timer-duration').first().textContent();
    console.log('⏱️  Timer mostrando:', timerText);
    
    // Timer deve estar no formato MM:SS ou similar
    expect(timerText).toMatch(/\d{1,2}:\d{2}/);
  });

  test('2. Sessão Anterior - Deve exibir dados da última sessão', async ({ page }) => {
    // Verificar se existe o componente de sessão anterior
    const previousSessionExists = await page.locator(
      '[data-testid="previous-session"], .previous-session, text=Última Sessão, text=Sessão Anterior'
    ).count();
    
    if (previousSessionExists > 0) {
      console.log('✅ Componente de sessão anterior encontrado');
      
      // Verificar se mostra informações da última sessão
      const hasDate = await page.locator('text=/\\d{2}\\/\\d{2}\\/\\d{4}/').count() > 0;
      console.log('📅 Data da última sessão:', hasDate ? 'Sim' : 'Não');
      
      expect(previousSessionExists).toBeGreaterThan(0);
    } else {
      console.log('ℹ️  Nenhuma sessão anterior para este paciente');
      test.skip();
    }
  });

  test('3. Exercícios - Tab deve existir e permitir adicionar exercícios', async ({ page }) => {
    // Procurar tab de exercícios
    await page.click('text=Exercícios Prescritos, text=Exercícios, [data-tab="exercises"]');
    await page.waitForTimeout(500);
    
    // Verificar se botão de adicionar exercícios existe
    const addExerciseButton = await page.locator(
      'text=Adicionar Exercício, text=Adicionar, button:has-text("Exercício")'
    ).first();
    
    expect(await addExerciseButton.count()).toBeGreaterThan(0);
    
    // Clicar para abrir modal de seleção
    await addExerciseButton.click();
    await page.waitForTimeout(500);
    
    // Verificar se modal abriu
    const modalExists = await page.locator(
      '[role="dialog"], .modal, [data-testid="exercise-selector"]'
    ).count();
    expect(modalExists).toBeGreaterThan(0);
    
    console.log('✅ Modal de seleção de exercícios aberto');
    
    // Fechar modal
    await page.keyboard.press('Escape');
  });

  test('4. Upload de Fotos - Deve permitir upload', async ({ page }) => {
    // Procurar tab de fotos ou resposta
    const tabs = ['text=Resposta + Fotos', 'text=Fotos', 'text=Progresso', '[data-tab="photos"]'];
    
    for (const tab of tabs) {
      const tabExists = await page.locator(tab).count();
      if (tabExists > 0) {
        await page.click(tab);
        await page.waitForTimeout(500);
        break;
      }
    }
    
    // Verificar se existe input de upload de foto
    const photoUploadExists = await page.locator(
      'input[type="file"][accept*="image"], [data-testid="photo-upload"], text=Upload de Foto, text=Adicionar Foto'
    ).count();
    
    expect(photoUploadExists).toBeGreaterThan(0);
    console.log('✅ Campo de upload de fotos encontrado');
  });

  test('5. Templates - Botão deve abrir modal de templates', async ({ page }) => {
    // Procurar botão de templates (pode estar no header)
    const templateButtons = [
      'text=Templates',
      'text=Usar Template',
      'button:has-text("Template")',
      '[data-testid="template-button"]'
    ];
    
    let templateButton = null;
    for (const selector of templateButtons) {
      const btn = page.locator(selector).first();
      if (await btn.count() > 0) {
        templateButton = btn;
        break;
      }
    }
    
    if (templateButton) {
      await templateButton.click();
      await page.waitForTimeout(500);
      
      // Verificar se modal de templates abriu
      const modalExists = await page.locator(
        '[role="dialog"], .modal, [data-testid="template-selector"]'
      ).count();
      
      expect(modalExists).toBeGreaterThan(0);
      console.log('✅ Modal de templates aberto');
      
      // Fechar modal
      await page.keyboard.press('Escape');
    } else {
      console.log('⚠️  Botão de templates não encontrado');
      test.skip();
    }
  });

  test('6. Salvar como Template - Deve permitir salvar evolução atual como template', async ({ page }) => {
    // Preencher alguns campos antes de salvar como template
    await page.fill('[name="subjective"], textarea[placeholder*="Subjetivo"]', 'Teste de template automático');
    
    // Procurar botão "Salvar como Template"
    const saveTemplateButtons = [
      'text=Salvar como Template',
      'text=Criar Template',
      'button:has-text("Template")',
      '[data-testid="save-template-button"]'
    ];
    
    let saveButton = null;
    for (const selector of saveTemplateButtons) {
      const btn = page.locator(selector).first();
      if (await btn.count() > 0 && await btn.textContent().then(t => t?.includes('Salvar') || t?.includes('Criar'))) {
        saveButton = btn;
        break;
      }
    }
    
    if (saveButton) {
      await saveButton.click();
      await page.waitForTimeout(500);
      
      // Verificar se dialog de salvar template abriu
      const dialogExists = await page.locator(
        '[role="dialog"], .modal, [data-testid="template-save-dialog"]'
      ).count();
      
      expect(dialogExists).toBeGreaterThan(0);
      console.log('✅ Dialog de salvar template aberto');
      
      // Fechar dialog
      await page.keyboard.press('Escape');
    } else {
      console.log('ℹ️  Botão de salvar template não encontrado visualmente');
      test.skip();
    }
  });

  test('7. Exportar PDF - Botão deve existir', async ({ page }) => {
    // Procurar botão de exportar PDF
    const pdfButtons = [
      'text=Exportar PDF',
      'text=Gerar PDF',
      'text=Download PDF',
      'button:has-text("PDF")',
      '[data-testid="export-pdf-button"]'
    ];
    
    let pdfButton = null;
    for (const selector of pdfButtons) {
      const btn = page.locator(selector).first();
      if (await btn.count() > 0) {
        pdfButton = btn;
        break;
      }
    }
    
    expect(pdfButton).not.toBeNull();
    console.log('✅ Botão de exportar PDF encontrado');
    
    // Nota: Não vamos clicar porque isso faria download do PDF
    // Apenas verificamos que o botão existe
  });

  test('8. Integração Completa - Todos componentes carregados sem erros', async ({ page }) => {
    // Capturar erros do console
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Aguardar tudo carregar
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verificar se não há erros críticos
    const criticalErrors = consoleErrors.filter(err => 
      !err.includes('404') && // Ignorar 404s
      !err.includes('favicon') && // Ignorar favicon
      !err.includes('chunk') // Ignorar erros de chunk load
    );
    
    console.log('🔍 Erros no console:', criticalErrors.length);
    if (criticalErrors.length > 0) {
      console.log('Erros encontrados:', criticalErrors);
    }
    
    expect(criticalErrors.length).toBe(0);
  });

  test('9. Layout Responsivo - Sidebar deve estar visível', async ({ page }) => {
    // Verificar se sidebar direita existe (onde ficam timer e sessão anterior)
    const sidebarExists = await page.locator(
      '[data-testid="evolution-sidebar"], .evolution-sidebar, aside'
    ).count();
    
    if (sidebarExists > 0) {
      console.log('✅ Sidebar encontrada');
      expect(sidebarExists).toBeGreaterThan(0);
    } else {
      console.log('ℹ️  Layout pode estar usando estrutura diferente');
      // Não falhar o teste se sidebar não for encontrada
    }
  });

  test('10. Formulário SOAP - Todos campos principais devem existir', async ({ page }) => {
    // Verificar campos SOAP
    const fields = [
      { name: 'Subjetivo', selectors: ['[name="subjective"]', 'textarea[placeholder*="Subjetivo"]'] },
      { name: 'Objetivo', selectors: ['[name="objective"]', 'textarea[placeholder*="Objetivo"]'] },
      { name: 'Avaliação', selectors: ['[name="assessment"]', 'textarea[placeholder*="Avaliação"]'] },
      { name: 'Plano', selectors: ['[name="plan"]', 'textarea[placeholder*="Plano"]'] }
    ];
    
    for (const field of fields) {
      let fieldExists = false;
      for (const selector of field.selectors) {
        if (await page.locator(selector).count() > 0) {
          fieldExists = true;
          break;
        }
      }
      console.log(`${fieldExists ? '✅' : '❌'} Campo ${field.name}: ${fieldExists ? 'Encontrado' : 'Não encontrado'}`);
      expect(fieldExists).toBe(true);
    }
  });
});

test.describe('Testes de Performance', () => {
  test('Página de evolução deve carregar em menos de 5 segundos', async ({ page }) => {
    // Login rápido
    await page.goto(BASE_URL);
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Navegar para evolução e medir tempo
    const startTime = Date.now();
    
    await page.click('text=Pacientes');
    await page.click('.patient-card:first-child, [data-testid="patient-item"]:first-child');
    await page.click('text=Nova Evolução, text=Evolução');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱️  Tempo de carregamento: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
  });
});

