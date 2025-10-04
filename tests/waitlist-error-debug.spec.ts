import { test, expect } from '@playwright/test';

test.describe('Debug - Erro na Fila de Espera', () => {
  test('investigar erro ao adicionar paciente na fila de espera', async ({ page }) => {
    // Capturar erros do console
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      
      if (type === 'error') {
        consoleErrors.push(text);
        console.error('❌ Console Error:', text);
      } else if (type === 'warning') {
        consoleWarnings.push(text);
        console.warn('⚠️ Console Warning:', text);
      }
    });

    // Capturar erros de página
    page.on('pageerror', error => {
      console.error('💥 Page Error:', error.message);
      consoleErrors.push(error.message);
    });

    // Capturar requisições falhadas
    page.on('requestfailed', request => {
      console.error('🔴 Request Failed:', request.url(), request.failure()?.errorText);
    });

    console.log('🔍 Navegando para a aplicação...');
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    
    // Aguardar um pouco para carregamento completo
    await page.waitForTimeout(3000);

    // Tirar screenshot inicial
    await page.screenshot({ path: 'debug-waitlist-initial.png', fullPage: true });
    console.log('📸 Screenshot inicial salvo');

    // Verificar se há algum botão de agenda ou navegação
    const agendaLink = page.locator('text=Agenda').first();
    if (await agendaLink.isVisible()) {
      console.log('📅 Clicando na Agenda...');
      await agendaLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }

    // Procurar por elementos relacionados à fila de espera
    const waitlistElements = await page.locator('text=Lista de Espera').count();
    console.log(`📋 Elementos "Lista de Espera" encontrados: ${waitlistElements}`);

    // Procurar por botão "Adicionar" na lista de espera
    const addButtons = await page.locator('button:has-text("Adicionar")').count();
    console.log(`➕ Botões "Adicionar" encontrados: ${addButtons}`);

    // Se encontrar botão de adicionar, tentar clicar
    if (addButtons > 0) {
      console.log('🖱️ Tentando clicar no botão "Adicionar"...');
      
      try {
        await page.locator('button:has-text("Adicionar")').first().click();
        await page.waitForTimeout(1000);
        
        // Verificar se modal abriu
        const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]').first();
        if (await modal.isVisible()) {
          console.log('✅ Modal de adicionar à fila aberto');
          
          // Tirar screenshot do modal
          await page.screenshot({ path: 'debug-waitlist-modal.png', fullPage: true });
          
          // Tentar preencher o formulário
          const patientSelect = page.locator('select, [role="combobox"]').first();
          if (await patientSelect.isVisible()) {
            console.log('👤 Campo de paciente encontrado');
            
            // Tentar selecionar um paciente
            await patientSelect.click();
            await page.waitForTimeout(500);
            
            // Procurar por opções de paciente
            const patientOptions = await page.locator('[role="option"], option').count();
            console.log(`👥 Opções de paciente encontradas: ${patientOptions}`);
            
            if (patientOptions > 0) {
              await page.locator('[role="option"], option').first().click();
              await page.waitForTimeout(500);
            }
          }
          
          // Tentar submeter o formulário
          const submitButton = page.locator('button[type="submit"], button:has-text("Salvar"), button:has-text("Adicionar")').first();
          if (await submitButton.isVisible()) {
            console.log('💾 Tentando submeter formulário...');
            await submitButton.click();
            await page.waitForTimeout(2000);
            
            // Verificar se houve erro
            const errorMessage = page.locator('text=erro, text=error, .error, [data-testid*="error"]').first();
            if (await errorMessage.isVisible()) {
              const errorText = await errorMessage.textContent();
              console.error('🚨 Erro encontrado:', errorText);
            }
          }
        } else {
          console.log('❌ Modal não abriu após clicar em "Adicionar"');
        }
      } catch (error) {
        console.error('💥 Erro ao clicar no botão "Adicionar":', error);
      }
    }

    // Capturar logs finais
    await page.waitForTimeout(2000);
    
    // Tirar screenshot final
    await page.screenshot({ path: 'debug-waitlist-final.png', fullPage: true });
    console.log('📸 Screenshot final salvo');

    // Relatório final
    console.log('\n📊 RELATÓRIO DE DEBUG:');
    console.log(`❌ Erros do console: ${consoleErrors.length}`);
    consoleErrors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
    
    console.log(`⚠️ Warnings do console: ${consoleWarnings.length}`);
    consoleWarnings.forEach((warning, index) => {
      console.log(`  ${index + 1}. ${warning}`);
    });

    // Verificar se há elementos de erro na página
    const pageErrors = await page.locator('.error, [data-testid*="error"], text=erro, text=error').count();
    console.log(`🚨 Elementos de erro na página: ${pageErrors}`);

    // Não falhar o teste, apenas reportar
    expect(consoleErrors.length).toBeLessThan(10); // Apenas verificar se não há muitos erros
  });
});
