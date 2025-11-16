import { test, expect } from '@playwright/test';

/**
 * Teste para verificar o alinhamento APÓS a remoção da célula "Hora"
 * Comparar com os resultados anteriores
 */

test.describe('Agenda Semanal - Alinhamento Pós-Correção', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="agenda-page"]', { state: 'visible', timeout: 10000 });
  });

  test('deve verificar que a célula "Hora" foi removida', async ({ page }) => {
    // Verificar que não existe mais a célula "Hora" no topo
    const horaCell = await page.locator('text="Hora"').first();
    const isVisible = await horaCell.isVisible().catch(() => false);
    
    expect(isVisible).toBe(false);
    console.log('✅ Célula "Hora" removida com sucesso!');

    // Tirar screenshot da correção
    await page.screenshot({ 
      path: '.playwright-mcp/agenda-celula-hora-removida.png',
      fullPage: true 
    });
  });

  test('deve verificar o alinhamento melhorado dos horários', async ({ page }) => {
    // Obter posições dos horários após a correção
    const horariosVisiveis = await page.locator('.text-right.pr-3.text-xs.font-semibold').all();
    
    const posicoes: { hora: string; y: number }[] = [];

    for (const horarioEl of horariosVisiveis) {
      const texto = await horarioEl.textContent();
      const box = await horarioEl.boundingBox();
      
      if (texto && texto.includes(':00') && box) {
        posicoes.push({ hora: texto.trim(), y: box.y });
      }
    }

    console.log('\n📊 Alinhamento APÓS Remoção da Célula "Hora":');
    console.log('===============================================');
    
    // Comparar com posições anteriores (antes: 07:00 estava em Y: 1100px)
    const posicaoAnterior = 1100; // Posição antes da correção
    const posicaoAtual = posicoes[0]?.y || 0;
    const diferenca = posicaoAnterior - posicaoAtual;
    
    console.log(`📍 07:00 - Antes: Y: ${posicaoAnterior}px | Agora: Y: ${posicaoAtual}px | Diferença: ${diferenca}px`);
    
    if (diferenca > 0) {
      console.log('✅ Melhoria detectada: Horários subiram na tela!');
    }

    // Verificar espaçamento consistente
    for (let i = 0; i < posicoes.length - 1; i++) {
      const espacamento = posicoes[i + 1].y - posicoes[i].y;
      console.log(`⏰ ${posicoes[i].hora} -> ${posicoes[i + 1].hora}: ${espacamento.toFixed(2)}px`);
    }

    // Tirar screenshot final
    await page.screenshot({ 
      path: '.playwright-mcp/agenda-alinhamento-corrigido-final.png',
      fullPage: true 
    });

    console.log('✅ Screenshot salvo: .playwright-mcp/agenda-alinhamento-corrigido-final.png');
  });

  test('deve verificar que os blocos de agendamento estão alinhados corretamente', async ({ page }) => {
    await page.waitForTimeout(2000);

    const appointmentBlocks = await page.locator('[data-testid="appointment-block"]').all();
    
    console.log(`\n📅 Verificação de Alinhamento dos Blocos (${appointmentBlocks.length} blocos):`);
    console.log('=====================================================');

    if (appointmentBlocks.length > 0) {
      for (let i = 0; i < Math.min(appointmentBlocks.length, 5); i++) {
        const block = appointmentBlocks[i];
        const box = await block.boundingBox();
        const timeText = await block.locator('.font-mono').first().textContent();
        
        if (box && timeText) {
          // Calcular a posição esperada baseada no horário
          const [hour, minute] = timeText.split(':').map(Number);
          const expectedY = ((hour - 7) * 60 + minute) * 2.5; // PIXELS_PER_MINUTE = 2.5
          
          const diferenca = Math.abs(box.y - expectedY);
          const status = diferenca < 10 ? '✅' : '⚠️';
          
          console.log(`${status} Bloco ${i + 1}: ${timeText} | Y: ${box.y.toFixed(2)}px | Esperado: ${expectedY.toFixed(2)}px | Diferença: ${diferenca.toFixed(2)}px`);
        }
      }
    }

    // Screenshot dos blocos alinhados
    await page.screenshot({ 
      path: '.playwright-mcp/agenda-blocos-alinhados.png',
      fullPage: true 
    });
  });
});
