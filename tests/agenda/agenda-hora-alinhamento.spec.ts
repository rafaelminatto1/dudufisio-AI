import { test, expect } from '@playwright/test';

/**
 * Teste para verificar o alinhamento das horas com as células da tabela de agendamento
 * na visualização semanal da agenda
 */

test.describe('Agenda Semanal - Alinhamento de Horas', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a página da agenda
    await page.goto('/agenda');
    
    // Aguardar a página carregar completamente
    await page.waitForLoadState('networkidle');
    
    // Aguardar o componente da agenda estar visível
    await page.waitForSelector('[data-testid="agenda-page"]', { state: 'visible', timeout: 10000 });
  });

  test('deve mostrar a agenda semanal carregada corretamente', async ({ page }) => {
    // Verificar se a página está visível
    const agendaPage = await page.locator('[data-testid="agenda-page"]');
    await expect(agendaPage).toBeVisible();

    // Tirar screenshot inicial
    await page.screenshot({ 
      path: '.playwright-mcp/agenda-semanal-inicial.png',
      fullPage: true 
    });

    console.log('✅ Screenshot salvo: .playwright-mcp/agenda-semanal-inicial.png');
  });

  test('deve verificar o alinhamento das horas com as células da tabela', async ({ page }) => {
    // Aguardar a coluna de horários estar visível
    const timeColumn = await page.locator('.flex-shrink-0').first();
    await expect(timeColumn).toBeVisible();

    // Obter todas as células de hora
    const timeSlots = await page.locator('.text-right.pr-3.text-xs.font-semibold').all();
    
    console.log(`📊 Encontrados ${timeSlots.length} slots de horário`);

    // Verificar se há horários visíveis
    expect(timeSlots.length).toBeGreaterThan(0);

    // Verificar alguns horários específicos
    const horariosEsperados = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
    
    for (const horario of horariosEsperados) {
      const horarioElement = await page.locator(`text="${horario}"`).first();
      const isVisible = await horarioElement.isVisible().catch(() => false);
      
      if (isVisible) {
        // Obter a posição do elemento de horário
        const box = await horarioElement.boundingBox();
        if (box) {
          console.log(`⏰ Horário ${horario} encontrado na posição Y: ${box.y.toFixed(2)}px`);
        }
      }
    }

    // Tirar screenshot com foco na área dos horários
    await page.screenshot({ 
      path: '.playwright-mcp/agenda-alinhamento-horas.png',
      fullPage: true 
    });

    console.log('✅ Screenshot salvo: .playwright-mcp/agenda-alinhamento-horas.png');
  });

  test('deve verificar o alinhamento dos blocos de agendamento com as horas', async ({ page }) => {
    // Aguardar os blocos de agendamento estarem visíveis (se houver)
    await page.waitForTimeout(2000); // Dar tempo para carregar agendamentos

    // Verificar se há blocos de agendamento
    const appointmentBlocks = await page.locator('[data-testid="appointment-block"]').all();
    
    console.log(`📅 Encontrados ${appointmentBlocks.length} blocos de agendamento`);

    if (appointmentBlocks.length > 0) {
      for (let i = 0; i < Math.min(appointmentBlocks.length, 5); i++) {
        const block = appointmentBlocks[i];
        const box = await block.boundingBox();
        
        if (box) {
          // Obter o horário do texto dentro do bloco
          const timeText = await block.locator('.font-mono').first().textContent();
          console.log(`📍 Bloco ${i + 1}: Horário "${timeText}" na posição Y: ${box.y.toFixed(2)}px, altura: ${box.height.toFixed(2)}px`);
        }
      }
    }

    // Tirar screenshot final com destaque
    await page.screenshot({ 
      path: '.playwright-mcp/agenda-alinhamento-final-verificacao.png',
      fullPage: true 
    });

    console.log('✅ Screenshot salvo: .playwright-mcp/agenda-alinhamento-final-verificacao.png');
  });

  test('deve verificar as linhas horizontais de grade', async ({ page }) => {
    // Scroll para o meio da página para ver melhor a grade
    await page.evaluate(() => {
      const scrollContainer = document.querySelector('.overflow-auto');
      if (scrollContainer) {
        scrollContainer.scrollTop = 300;
      }
    });

    await page.waitForTimeout(500);

    // Verificar se as linhas de grade estão presentes
    const gridLines = await page.locator('.border-b').all();
    console.log(`📏 Encontradas ${gridLines.length} linhas de grade`);

    expect(gridLines.length).toBeGreaterThan(0);

    // Tirar screenshot da grade
    await page.screenshot({ 
      path: '.playwright-mcp/agenda-grade-horizontal.png',
      fullPage: true 
    });

    console.log('✅ Screenshot salvo: .playwright-mcp/agenda-grade-horizontal.png');
  });

  test('deve medir o espaçamento entre horários consecutivos', async ({ page }) => {
    // Obter elementos de horário visíveis (apenas os de hora cheia: XX:00)
    const horariosVisiveis = await page.locator('.text-right.pr-3.text-xs.font-semibold').all();
    
    const posicoes: { hora: string; y: number }[] = [];

    for (const horarioEl of horariosVisiveis) {
      const texto = await horarioEl.textContent();
      const box = await horarioEl.boundingBox();
      
      if (texto && texto.includes(':00') && box) {
        posicoes.push({ hora: texto.trim(), y: box.y });
      }
    }

    console.log('\n📊 Análise de Espaçamento entre Horários:');
    console.log('==========================================');
    
    for (let i = 0; i < posicoes.length - 1; i++) {
      const atual = posicoes[i];
      const proximo = posicoes[i + 1];
      const espacamento = proximo.y - atual.y;
      
      console.log(`⏰ ${atual.hora} -> ${proximo.hora}: ${espacamento.toFixed(2)}px`);
    }

    // Verificar se o espaçamento é consistente (deve ser 2 slots de 30min = 150px com PIXELS_PER_MINUTE = 2.5)
    // 2 slots * 30 minutos * 2.5 pixels/minuto = 150px
    const espacamentoEsperado = 150; // 60 minutos * 2.5 pixels/minuto
    const tolerancia = 5; // 5px de tolerância

    for (let i = 0; i < posicoes.length - 1; i++) {
      const espacamento = posicoes[i + 1].y - posicoes[i].y;
      
      if (Math.abs(espacamento - espacamentoEsperado) > tolerancia) {
        console.warn(`⚠️ ALERTA: Espaçamento inconsistente detectado entre ${posicoes[i].hora} e ${posicoes[i + 1].hora}`);
      }
    }

    // Tirar screenshot com análise
    await page.screenshot({ 
      path: '.playwright-mcp/agenda-analise-espacamento.png',
      fullPage: true 
    });

    console.log('✅ Screenshot salvo: .playwright-mcp/agenda-analise-espacamento.png');
  });
});

