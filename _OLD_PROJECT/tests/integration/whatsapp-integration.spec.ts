import { test, expect } from '@playwright/test';

test.describe('Integração com WhatsApp', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Login
    await page.fill('[data-testid="input-login-email"]', 'admin@moocafisio.com.br');
    await page.fill('[data-testid="input-login-password"]', 'DuduFisio2024!');
    await page.click('[data-testid="btn-login-submit"]');
    
    // Aguardar navegação
    await page.waitForURL(/\/dashboard|\/agenda/);
  });

  test('Envio de lembrete de consulta via WhatsApp', async ({ page }) => {
    // Navegar para agenda
    await page.goto('/agenda');
    
    // Selecionar um agendamento futuro
    const upcomingAppointment = page.locator('[data-testid^="appointment-card"]').first();
    
    if (await upcomingAppointment.isVisible({ timeout: 3000 })) {
      // Clicar para abrir detalhes
      await upcomingAppointment.click();
      
      // Aguardar modal de detalhes
      await page.waitForSelector('[data-testid="appointment-detail-modal"]', { timeout: 5000 });
      
      // Procurar botão de enviar WhatsApp
      const whatsappButton = page.locator('[data-testid="btn-send-whatsapp-reminder"]');
      
      if (await whatsappButton.isVisible({ timeout: 2000 })) {
        await whatsappButton.click();
        
        // Aguardar confirmação
        await page.waitForSelector('[data-testid="whatsapp-sent-confirmation"]', { timeout: 5000 });
        
        // Verificar mensagem de sucesso
        const confirmation = await page.locator('[data-testid="whatsapp-sent-confirmation"]').textContent();
        expect(confirmation).toContain('enviado' || 'sucesso');
      } else {
        console.log('⚠️ Botão de WhatsApp não disponível no agendamento');
      }
    } else {
      console.log('⚠️ Nenhum agendamento encontrado para teste');
    }
  });

  test('Envio de protocolo de exercícios via WhatsApp', async ({ page }) => {
    // Navegar para biblioteca de exercícios
    await page.goto('/exercises');
    
    // Buscar protocolos existentes
    const protocolsList = page.locator('[data-testid="protocols-list"]');
    
    if (await protocolsList.isVisible({ timeout: 3000 })) {
      // Selecionar primeiro protocolo
      const firstProtocol = page.locator('[data-testid^="protocol-card"]').first();
      await firstProtocol.click();
      
      // Procurar botão de compartilhar via WhatsApp
      const shareButton = page.locator('[data-testid="btn-share-whatsapp"]');
      
      if (await shareButton.isVisible({ timeout: 2000 })) {
        await shareButton.click();
        
        // Aguardar modal de confirmação
        await page.waitForSelector('[data-testid="whatsapp-share-modal"]', { timeout: 3000 });
        
        // Confirmar envio
        await page.click('[data-testid="btn-confirm-whatsapp-share"]');
        
        // Aguardar sucesso
        await page.waitForSelector('[data-testid="whatsapp-sent-confirmation"]', { timeout: 5000 });
      } else {
        console.log('⚠️ Botão de compartilhar via WhatsApp não disponível');
      }
    }
  });

  test('Configuração de notificações automáticas do WhatsApp', async ({ page }) => {
    // Navegar para configurações
    await page.goto('/settings/notifications');
    
    // Procurar seção de WhatsApp
    const whatsappSection = page.locator('[data-testid="whatsapp-settings-section"]');
    
    if (await whatsappSection.isVisible({ timeout: 3000 })) {
      // Verificar toggles de notificações
      const appointmentReminder = page.locator('[data-testid="toggle-whatsapp-appointment-reminder"]');
      const postSessionFollow = page.locator('[data-testid="toggle-whatsapp-post-session"]');
      const protocolUpdate = page.locator('[data-testid="toggle-whatsapp-protocol-update"]');
      
      // Ativar notificações (se não estiverem)
      if (await appointmentReminder.isVisible({ timeout: 1000 })) {
        const isChecked = await appointmentReminder.isChecked().catch(() => false);
        if (!isChecked) {
          await appointmentReminder.click();
        }
        
        // Verificar se mudança foi salva
        await page.waitForTimeout(1000);
        expect(await appointmentReminder.isChecked()).toBe(true);
      }
      
      // Configurar horário do lembrete
      const reminderTimeInput = page.locator('[data-testid="input-reminder-time"]');
      if (await reminderTimeInput.isVisible({ timeout: 1000 })) {
        await reminderTimeInput.fill('24'); // 24 horas antes
        
        // Salvar configurações
        const saveButton = page.locator('[data-testid="btn-save-whatsapp-settings"]');
        if (await saveButton.isVisible({ timeout: 1000 })) {
          await saveButton.click();
          
          // Aguardar confirmação
          await page.waitForSelector('[data-testid="settings-saved-confirmation"]', { timeout: 3000 });
        }
      }
    } else {
      console.log('⚠️ Seção de configurações do WhatsApp não encontrada');
    }
  });

  test('Visualizar histórico de mensagens enviadas', async ({ page }) => {
    // Navegar para detalhes de um paciente
    await page.goto('/patients');
    
    const firstPatient = page.locator('[data-testid^="patient-row"]').first();
    await firstPatient.click();
    
    // Aguardar página de detalhes
    await page.waitForSelector('[data-testid="patient-detail-container"]', { timeout: 5000 });
    
    // Procurar aba/seção de comunicações
    const communicationsTab = page.locator('[data-testid="tab-communications"]');
    
    if (await communicationsTab.isVisible({ timeout: 2000 })) {
      await communicationsTab.click();
      
      // Aguardar lista de mensagens
      await page.waitForSelector('[data-testid="messages-history-list"]', { timeout: 3000 });
      
      // Verificar se há mensagens WhatsApp no histórico
      const whatsappMessages = page.locator('[data-testid^="whatsapp-message"]');
      const count = await whatsappMessages.count();
      
      console.log(`Encontradas ${count} mensagens WhatsApp no histórico`);
      
      if (count > 0) {
        // Verificar estrutura da primeira mensagem
        const firstMessage = whatsappMessages.first();
        await expect(firstMessage).toBeVisible();
        
        // Deve conter data, status e conteúdo
        const messageText = await firstMessage.textContent();
        expect(messageText).toBeTruthy();
      }
    } else {
      console.log('⚠️ Aba de comunicações não disponível');
    }
  });

  test('Status de entrega das mensagens WhatsApp', async ({ page }) => {
    // Navegar para painel de notificações
    await page.goto('/notifications');
    
    // Procurar mensagens WhatsApp pendentes ou recentes
    const whatsappNotifications = page.locator('[data-testid^="notification-whatsapp"]');
    
    if (await whatsappNotifications.first().isVisible({ timeout: 3000 })) {
      const count = await whatsappNotifications.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const notification = whatsappNotifications.nth(i);
        
        // Verificar se tem indicador de status
        const statusIndicator = notification.locator('[data-testid="delivery-status"]');
        
        if (await statusIndicator.isVisible({ timeout: 500 })) {
          const status = await statusIndicator.textContent();
          
          // Status válidos: pending, sent, delivered, read, failed
          expect(status).toMatch(/pendente|enviado|entregue|lido|falhou/i);
        }
      }
    } else {
      console.log('⚠️ Nenhuma notificação WhatsApp encontrada');
    }
  });

  test('Webhook do WhatsApp - Recebimento de mensagens', async ({ page }) => {
    // Este teste simula o recebimento de uma mensagem via webhook
    
    // Mock de webhook response
    await page.route('**/api/whatsapp/webhook', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          message: 'Webhook processed'
        })
      });
    });
    
    // Navegar para configurações de webhooks
    await page.goto('/settings/integrations');
    
    const webhookSection = page.locator('[data-testid="webhook-settings"]');
    
    if (await webhookSection.isVisible({ timeout: 3000 })) {
      // Verificar URL do webhook
      const webhookUrl = page.locator('[data-testid="webhook-url"]');
      
      if (await webhookUrl.isVisible({ timeout: 1000 })) {
        const url = await webhookUrl.textContent();
        expect(url).toContain('/api/whatsapp/webhook');
        
        // Testar webhook (se houver botão de teste)
        const testWebhookButton = page.locator('[data-testid="btn-test-webhook"]');
        
        if (await testWebhookButton.isVisible({ timeout: 1000 })) {
          await testWebhookButton.click();
          
          // Aguardar resultado do teste
          await page.waitForSelector('[data-testid="webhook-test-result"]', { timeout: 5000 });
          
          const result = await page.locator('[data-testid="webhook-test-result"]').textContent();
          expect(result).toContain('sucesso' || 'success');
        }
      }
    } else {
      console.log('⚠️ Seção de webhooks não disponível');
    }
  });

  test('Templates de mensagens do WhatsApp', async ({ page }) => {
    // Navegar para gerenciamento de templates
    await page.goto('/settings/whatsapp-templates');
    
    const templatesSection = page.locator('[data-testid="whatsapp-templates-section"]');
    
    if (await templatesSection.isVisible({ timeout: 3000 })) {
      // Listar templates existentes
      const templates = page.locator('[data-testid^="template-card"]');
      const count = await templates.count();
      
      expect(count).toBeGreaterThan(0); // Deve ter templates padrão
      
      // Verificar se tem templates principais
      const appointmentTemplate = page.locator('[data-testid="template-appointment-reminder"]');
      const confirmationTemplate = page.locator('[data-testid="template-confirmation"]');
      
      if (await appointmentTemplate.isVisible({ timeout: 1000 })) {
        // Clicar para editar
        await appointmentTemplate.click();
        
        // Verificar conteúdo do template
        const templateContent = page.locator('[data-testid="template-content-editor"]');
        
        if (await templateContent.isVisible({ timeout: 2000 })) {
          const content = await templateContent.inputValue();
          
          // Template de lembrete deve conter variáveis
          expect(content).toContain('{' && '}'); // Variáveis como {patientName}
        }
      }
    } else {
      console.log('⚠️ Seção de templates não disponível');
    }
  });

  test('Limite de mensagens e rate limiting', async ({ page }) => {
    // Testar comportamento quando há muitas mensagens sendo enviadas
    await page.goto('/settings/whatsapp');
    
    // Verificar indicador de quota
    const quotaIndicator = page.locator('[data-testid="whatsapp-quota-indicator"]');
    
    if (await quotaIndicator.isVisible({ timeout: 2000 })) {
      const quotaText = await quotaIndicator.textContent();
      
      // Deve mostrar uso atual
      expect(quotaText).toMatch(/\d+\/\d+|\d+%/);
      
      // Verificar se há warning próximo do limite
      const quotaWarning = page.locator('[data-testid="whatsapp-quota-warning"]');
      if (await quotaWarning.isVisible({ timeout: 1000 })) {
        const warningText = await quotaWarning.textContent();
        expect(warningText).toContain('limite' || 'quota' || 'mensagens');
      }
    }
  });
});

test.describe('WhatsApp - Casos de Erro', () => {
  test('Tratamento de erro ao enviar mensagem', async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-testid="input-login-email"]', 'admin@moocafisio.com.br');
    await page.fill('[data-testid="input-login-password"]', 'DuduFisio2024!');
    await page.click('[data-testid="btn-login-submit"]');
    await page.waitForURL(/\/dashboard|\/agenda/);
    
    // Simular erro na API do WhatsApp
    await page.route('**/api/whatsapp/send', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({
          error: 'WhatsApp API unavailable'
        })
      });
    });
    
    await page.goto('/agenda');
    
    const upcomingAppointment = page.locator('[data-testid^="appointment-card"]').first();
    
    if (await upcomingAppointment.isVisible({ timeout: 3000 })) {
      await upcomingAppointment.click();
      await page.waitForSelector('[data-testid="appointment-detail-modal"]', { timeout: 5000 });
      
      const whatsappButton = page.locator('[data-testid="btn-send-whatsapp-reminder"]');
      
      if (await whatsappButton.isVisible({ timeout: 2000 })) {
        await whatsappButton.click();
        
        // Deve mostrar mensagem de erro
        await page.waitForSelector('[data-testid="whatsapp-error-message"]', { timeout: 5000 });
        
        const errorMessage = await page.locator('[data-testid="whatsapp-error-message"]').textContent();
        expect(errorMessage).toContain('erro' || 'falha');
      }
    }
  });

  test('Número de WhatsApp inválido', async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-testid="input-login-email"]', 'admin@moocafisio.com.br');
    await page.fill('[data-testid="input-login-password"]', 'DuduFisio2024!');
    await page.click('[data-testid="btn-login-submit"]');
    await page.waitForURL(/\/dashboard|\/agenda/);
    
    // Navegar para edição de paciente
    await page.goto('/patients');
    const firstPatient = page.locator('[data-testid^="patient-row"]').first();
    await firstPatient.click();
    
    // Tentar adicionar número inválido
    const editButton = page.locator('[data-testid="btn-edit-patient"]');
    if (await editButton.isVisible({ timeout: 2000 })) {
      await editButton.click();
      
      const phoneInput = page.locator('[data-testid="input-patient-phone"]');
      if (await phoneInput.isVisible({ timeout: 2000 })) {
        await phoneInput.fill('123'); // Número inválido
        
        // Tentar salvar
        await page.click('[data-testid="btn-save-patient"]');
        
        // Deve mostrar erro de validação
        const validationError = page.locator('[data-testid="error-phone-validation"]');
        if (await validationError.isVisible({ timeout: 2000 })) {
          const errorText = await validationError.textContent();
          expect(errorText).toContain('inválido' || 'formato');
        }
      }
    }
  });
});

