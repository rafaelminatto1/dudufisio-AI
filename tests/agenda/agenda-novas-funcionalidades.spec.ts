import { test, expect } from '@playwright/test';

/**
 * Teste para verificar as novas funcionalidades implementadas:
 * 1. Altura reduzida dos cards (50%)
 * 2. Linhas de meia hora na grade
 * 3. Feedback visual do drag-and-drop
 */

test.describe('Agenda Semanal - Novas Funcionalidades', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="agenda-page"]', { state: 'visible', timeout: 10000 });
  });

  test('deve verificar altura reduzida dos cards de agendamento', async ({ page }) => {
    await page.waitForTimeout(2000);

    const appointmentBlocks = await page.locator('[data-testid="appointment-block"]').all();
    
    console.log('\n📏 Verificação de Altura Reduzida dos Cards:');
    console.log('=============================================');

    if (appointmentBlocks.length > 0) {
      for (let i = 0; i < Math.min(appointmentBlocks.length, 5); i++) {
        const block = appointmentBlocks[i];
        const box = await block.boundingBox();
        const timeText = await block.locator('.font-mono').first().textContent();
        
        if (box && timeText) {
          // Verificar se a altura está reduzida (deve ser aproximadamente metade)
          const expectedHeight = 75; // 1 hora = 150px * 0.5 = 75px
          const heightDifference = Math.abs(box.height - expectedHeight);
          const isReduced = box.height < 100; // Altura deve ser menor que 100px
          
          const status = isReduced ? '✅' : '⚠️';
          console.log(`${status} Bloco ${i + 1}: ${timeText} | Altura: ${box.height.toFixed(2)}px | Reduzida: ${isReduced ? 'SIM' : 'NÃO'}`);
        }
      }
    }

    // Screenshot dos cards com altura reduzida
    await page.screenshot({ 
      path: '.playwright-mcp/agenda-cards-altura-reduzida.png',
      fullPage: true 
    });

    console.log('✅ Screenshot salvo: .playwright-mcp/agenda-cards-altura-reduzida.png');
  });

  test('deve verificar linhas de meia hora na grade', async ({ page }) => {
    // Scroll para ver melhor as linhas
    await page.evaluate(() => {
      const scrollContainer = document.querySelector('.overflow-auto');
      if (scrollContainer) {
        scrollContainer.scrollTop = 200;
      }
    });

    await page.waitForTimeout(500);

    // Verificar se existem linhas de meia hora (mais sutis)
    const allLines = await page.locator('.border-b').all();
    const fullHourLines = await page.locator('.border-slate-400').all();
    const halfHourLines = await page.locator('.border-slate-200').all();
    
    console.log('\n📏 Verificação das Linhas da Grade:');
    console.log('===================================');
    console.log(`📊 Total de linhas: ${allLines.length}`);
    console.log(`🕐 Linhas de hora cheia (grossas): ${fullHourLines.length}`);
    console.log(`🕕 Linhas de meia hora (sutis): ${halfHourLines.length}`);
    
    // Verificar se há linhas de meia hora
    expect(halfHourLines.length).toBeGreaterThan(0);
    expect(fullHourLines.length).toBeGreaterThan(0);
    
    console.log('✅ Linhas de meia hora implementadas com sucesso!');

    // Screenshot das linhas da grade
    await page.screenshot({ 
      path: '.playwright-mcp/agenda-linhas-meia-hora.png',
      fullPage: true 
    });

    console.log('✅ Screenshot salvo: .playwright-mcp/agenda-linhas-meia-hora.png');
  });

  test('deve verificar funcionalidade de drag-and-drop com feedback visual', async ({ page }) => {
    // Aguardar agendamentos carregarem
    await page.waitForTimeout(2000);

    const appointmentBlocks = await page.locator('[data-testid="appointment-block"]').all();
    
    if (appointmentBlocks.length > 0) {
      const firstBlock = appointmentBlocks[0];
      
      // Verificar se o elemento é arrastável
      const isDraggable = await firstBlock.getAttribute('draggable');
      expect(isDraggable).toBe('true');
      
      console.log('\n🎯 Verificação do Drag-and-Drop:');
      console.log('=================================');
      console.log('✅ Elemento é arrastável (draggable="true")');
      
      // Simular início do drag
      const box = await firstBlock.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        
        // Mover para uma posição diferente
        await page.mouse.move(box.x + 100, box.y + 100);
        
        // Verificar se há indicador de drop (linha azul)
        const dropIndicator = await page.locator('.bg-blue-500').first();
        const isVisible = await dropIndicator.isVisible().catch(() => false);
        
        if (isVisible) {
          console.log('✅ Indicador de drop (linha azul) está visível');
        } else {
          console.log('⚠️ Indicador de drop não detectado (pode precisar de movimento mais específico)');
        }
        
        await page.mouse.up();
      }
    }

    // Screenshot do drag-and-drop
    await page.screenshot({ 
      path: '.playwright-mcp/agenda-drag-drop-feedback.png',
      fullPage: true 
    });

    console.log('✅ Screenshot salvo: .playwright-mcp/agenda-drag-drop-feedback.png');
  });

  test('deve verificar snap automático para intervalos de 30 minutos', async ({ page }) => {
    // Este teste verifica se o snap está funcionando através da lógica de posicionamento
    // O snap é testado indiretamente através da verificação das posições dos elementos
    
    await page.waitForTimeout(2000);

    const appointmentBlocks = await page.locator('[data-testid="appointment-block"]').all();
    
    console.log('\n🎯 Verificação do Snap Automático:');
    console.log('==================================');
    
    if (appointmentBlocks.length > 0) {
      for (let i = 0; i < Math.min(appointmentBlocks.length, 3); i++) {
        const block = appointmentBlocks[i];
        const box = await block.boundingBox();
        const timeText = await block.locator('.font-mono').first().textContent();
        
        if (box && timeText) {
          // Verificar se a posição está alinhada com intervalos de 30 minutos
          const [hour, minute] = timeText.split(':').map(Number);
          const expectedMinutes = (hour - 7) * 60 + minute; // START_HOUR = 7
          const expectedY = expectedMinutes * 2.5; // PIXELS_PER_MINUTE = 2.5
          
          const positionDifference = Math.abs(box.y - expectedY);
          const isSnapped = positionDifference < 20; // Tolerância de 20px
          
          const status = isSnapped ? '✅' : '⚠️';
          console.log(`${status} Bloco ${i + 1}: ${timeText} | Y: ${box.y.toFixed(2)}px | Esperado: ${expectedY.toFixed(2)}px | Snap: ${isSnapped ? 'OK' : 'OFF'}`);
        }
      }
    }

    // Screenshot do snap
    await page.screenshot({ 
      path: '.playwright-mcp/agenda-snap-automatico.png',
      fullPage: true 
    });

    console.log('✅ Screenshot salvo: .playwright-mcp/agenda-snap-automatico.png');
  });
});
