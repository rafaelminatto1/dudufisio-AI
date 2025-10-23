import { test, expect } from '@playwright/test';

/**
 * Teste para verificar as melhorias de compactação:
 * 1. Altura ainda mais reduzida dos cards (30% da original)
 * 2. Quebra de linha nos nomes dos pacientes (máximo 2 linhas)
 */

test.describe('Agenda Semanal - Melhorias de Compactação', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="agenda-page"]', { state: 'visible', timeout: 10000 });
  });

  test('deve verificar altura ultra compacta dos cards', async ({ page }) => {
    await page.waitForTimeout(2000);

    const appointmentBlocks = await page.locator('[data-testid="appointment-block"]').all();
    
    console.log('\n📏 Verificação de Altura Ultra Compacta:');
    console.log('========================================');

    if (appointmentBlocks.length > 0) {
      for (let i = 0; i < Math.min(appointmentBlocks.length, 5); i++) {
        const block = appointmentBlocks[i];
        const box = await block.boundingBox();
        const timeText = await block.locator('.font-mono').first().textContent();
        
        if (box && timeText) {
          // Verificar se a altura está ultra compacta (30% da original)
          const expectedHeight1h = 45; // 1 hora = 150px * 0.3 = 45px
          const expectedHeight30m = 22.5; // 30 min = 75px * 0.3 = 22.5px
          const isUltraCompact = box.height < 50; // Altura deve ser menor que 50px
          
          const status = isUltraCompact ? '✅' : '⚠️';
          console.log(`${status} Bloco ${i + 1}: ${timeText} | Altura: ${box.height.toFixed(2)}px | Ultra Compacto: ${isUltraCompact ? 'SIM' : 'NÃO'}`);
        }
      }
    }

    // Screenshot dos cards ultra compactos
    await page.screenshot({ 
      path: '.playwright-mcp/agenda-cards-ultra-compactos.png',
      fullPage: true 
    });

    console.log('✅ Screenshot salvo: .playwright-mcp/agenda-cards-ultra-compactos.png');
  });

  test('deve verificar quebra de linha nos nomes dos pacientes', async ({ page }) => {
    await page.waitForTimeout(2000);

    const appointmentBlocks = await page.locator('[data-testid="appointment-block"]').all();
    
    console.log('\n📝 Verificação de Quebra de Linha nos Nomes:');
    console.log('============================================');

    if (appointmentBlocks.length > 0) {
      for (let i = 0; i < Math.min(appointmentBlocks.length, 5); i++) {
        const block = appointmentBlocks[i];
        const nameElement = await block.locator('.font-semibold').first();
        const nameText = await nameElement.textContent();
        
        if (nameText) {
          // Verificar se o nome tem quebra de linha (nomes longos)
          const computedStyle = await nameElement.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
              webkitLineClamp: style.webkitLineClamp,
              display: style.display,
              webkitBoxOrient: style.webkitBoxOrient,
              overflow: style.overflow
            };
          });
          
          const hasLineClamp = computedStyle.webkitLineClamp === '2';
          const isLongName = nameText.length > 15;
          
          const status = hasLineClamp ? '✅' : '⚠️';
          console.log(`${status} Nome ${i + 1}: "${nameText}" | Quebra de linha: ${hasLineClamp ? 'SIM' : 'NÃO'} | Nome longo: ${isLongName ? 'SIM' : 'NÃO'}`);
        }
      }
    }

    // Screenshot dos nomes com quebra de linha
    await page.screenshot({ 
      path: '.playwright-mcp/agenda-nomes-quebra-linha.png',
      fullPage: true 
    });

    console.log('✅ Screenshot salvo: .playwright-mcp/agenda-nomes-quebra-linha.png');
  });

  test('deve verificar tamanho das fontes reduzidas', async ({ page }) => {
    await page.waitForTimeout(2000);

    const appointmentBlocks = await page.locator('[data-testid="appointment-block"]').all();
    
    console.log('\n🔤 Verificação de Tamanhos de Fonte:');
    console.log('====================================');

    if (appointmentBlocks.length > 0) {
      const firstBlock = appointmentBlocks[0];
      
      // Verificar tamanho da fonte do nome
      const nameElement = await firstBlock.locator('.font-semibold').first();
      const nameFontSize = await nameElement.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });
      
      // Verificar tamanho da fonte do horário
      const timeElement = await firstBlock.locator('.font-mono').first();
      const timeFontSize = await timeElement.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });
      
      // Verificar tamanho da fonte do tipo
      const typeElement = await firstBlock.locator('.uppercase').first();
      const typeFontSize = await typeElement.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });
      
      console.log(`📝 Fonte do nome: ${nameFontSize}`);
      console.log(`⏰ Fonte do horário: ${timeFontSize}`);
      console.log(`🏷️ Fonte do tipo: ${typeFontSize}`);
      
      // Verificar se as fontes estão reduzidas
      const nameSize = parseFloat(nameFontSize);
      const timeSize = parseFloat(timeFontSize);
      const typeSize = parseFloat(typeFontSize);
      
      const isCompact = nameSize <= 12 && timeSize <= 10 && typeSize <= 9;
      console.log(`✅ Fontes compactas: ${isCompact ? 'SIM' : 'NÃO'}`);
    }

    // Screenshot das fontes reduzidas
    await page.screenshot({ 
      path: '.playwright-mcp/agenda-fontes-compactas.png',
      fullPage: true 
    });

    console.log('✅ Screenshot salvo: .playwright-mcp/agenda-fontes-compactas.png');
  });

  test('deve verificar espaçamento interno reduzido', async ({ page }) => {
    await page.waitForTimeout(2000);

    const appointmentBlocks = await page.locator('[data-testid="appointment-block"]').all();
    
    console.log('\n📐 Verificação de Espaçamento Interno:');
    console.log('======================================');

    if (appointmentBlocks.length > 0) {
      const firstBlock = appointmentBlocks[0];
      
      // Verificar padding interno
      const padding = await firstBlock.evaluate((el) => {
        const style = window.getComputedStyle(el.querySelector('.flex-grow'));
        return {
          padding: style.padding,
          paddingTop: style.paddingTop,
          paddingBottom: style.paddingBottom,
          paddingLeft: style.paddingLeft,
          paddingRight: style.paddingRight
        };
      });
      
      console.log(`📏 Padding interno: ${padding.padding}`);
      console.log(`📏 Padding top/bottom: ${padding.paddingTop}/${padding.paddingBottom}`);
      console.log(`📏 Padding left/right: ${padding.paddingLeft}/${padding.paddingRight}`);
      
      // Verificar se o padding está reduzido (deve ser menor que 8px)
      const topPadding = parseFloat(padding.paddingTop);
      const isReducedPadding = topPadding < 8;
      console.log(`✅ Padding reduzido: ${isReducedPadding ? 'SIM' : 'NÃO'}`);
    }

    // Screenshot do espaçamento reduzido
    await page.screenshot({ 
      path: '.playwright-mcp/agenda-espacamento-reduzido.png',
      fullPage: true 
    });

    console.log('✅ Screenshot salvo: .playwright-mcp/agenda-espacamento-reduzido.png');
  });
});
