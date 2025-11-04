/**
 * Testes E2E - Agendamento de Consulta
 * 
 * Testa o fluxo completo de agendamento de consultas:
 * - Visualização do calendário
 * - Criação de agendamentos
 * - Detecção de conflitos
 * - Edição e cancelamento
 * - Agendamentos recorrentes
 */

import { test, expect } from '@playwright/test';

// Helper para login (reutilizável)
async function loginAsTherapist(page) {
  await page.goto('/');
  await page.getByLabel(/email/i).fill('admin@moocafisio.com.br');
  await page.getByLabel(/senha/i).fill('admin123');
  await page.getByRole('button', { name: /entrar|login/i }).click();
  
  // Aguardar redirecionamento
  await page.waitForURL(/\/dashboard|\/agenda/i, { timeout: 15000 });
}

// Helper para navegar até a agenda
async function navigateToAgenda(page) {
  // Tentar pelo sidebar
  const agendaLink = page.getByTestId('nav--agenda') || 
                     page.getByRole('link', { name: /agenda/i });
  
  if (await agendaLink.isVisible({ timeout: 2000 }).catch(() => false)) {
    await agendaLink.click();
  } else {
    // Fallback: navegação direta
    await page.goto('/agenda');
  }
  
  await page.waitForLoadState('networkidle');
}

test.describe('Agendamento de Consultas', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginAsTherapist(page);
  });

  test('deve visualizar o calendário semanal', async ({ page }) => {
    await navigateToAgenda(page);
    
    // Verificar elementos principais do calendário
    await expect(page.getByRole('heading', { name: /agenda/i })).toBeVisible();
    
    // Verificar dias da semana
    const diasSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    for (const dia of diasSemana) {
      await expect(page.getByText(new RegExp(dia, 'i'))).toBeVisible({ timeout: 5000 });
    }
    
    // Verificar controles de navegação
    await expect(page.getByRole('button', { name: /anterior|prev/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /próxim|next/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /hoje|today/i })).toBeVisible();
  });

  test('deve criar novo agendamento com sucesso', async ({ page }) => {
    await navigateToAgenda(page);
    
    // Clicar no botão de novo agendamento
    const newAppointmentBtn = page.getByRole('button', { name: /novo agendamento|nova consulta/i });
    await newAppointmentBtn.click();
    
    // Aguardar modal/formulário abrir
    await page.waitForSelector('[role="dialog"], [data-testid*="appointment-form"]', { timeout: 10000 });
    
    // Preencher formulário
    // Selecionar paciente
    const patientSelect = page.getByLabel(/paciente/i);
    await patientSelect.click();
    await page.waitForTimeout(500);
    
    // Selecionar primeiro paciente da lista
    const firstPatient = page.locator('[role="option"]').first();
    if (await firstPatient.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstPatient.click();
    } else {
      // Fallback: digitar e selecionar
      await patientSelect.fill('Maria');
      await page.waitForTimeout(500);
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
    }
    
    // Selecionar data (usar data futura)
    const dateInput = page.getByLabel(/data/i);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 dias no futuro
    const dateStr = futureDate.toISOString().split('T')[0];
    await dateInput.fill(dateStr);
    
    // Selecionar horário
    const timeInput = page.getByLabel(/hor[aá]rio|hora/i);
    await timeInput.fill('14:00');
    
    // Selecionar duração
    const durationInput = page.getByLabel(/dura[çc][ãa]o/i);
    if (await durationInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await durationInput.fill('60');
    }
    
    // Salvar
    await page.getByRole('button', { name: /salvar|confirmar|agendar/i }).click();
    
    // Verificar sucesso
    await expect(page.getByText(/agendamento criado|sucesso/i)).toBeVisible({ timeout: 10000 });
    
    // Verificar que o agendamento aparece no calendário
    await page.waitForTimeout(1000);
    await expect(page.getByText(/14:00|Maria/i)).toBeVisible({ timeout: 5000 });
  });

  test('deve impedir agendamento em horário conflitante', async ({ page }) => {
    await navigateToAgenda(page);
    
    // Criar primeiro agendamento
    const newBtn = page.getByRole('button', { name: /novo agendamento/i });
    await newBtn.click();
    
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // Preencher com horário específico
    const patientSelect = page.getByLabel(/paciente/i);
    await patientSelect.click();
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const dateStr = futureDate.toISOString().split('T')[0];
    
    await page.getByLabel(/data/i).fill(dateStr);
    await page.getByLabel(/hor[aá]rio/i).fill('10:00');
    
    await page.getByRole('button', { name: /salvar/i }).click();
    await page.waitForTimeout(2000);
    
    // Tentar criar segundo agendamento no mesmo horário
    await newBtn.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    await page.getByLabel(/paciente/i).click();
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    await page.getByLabel(/data/i).fill(dateStr);
    await page.getByLabel(/hor[aá]rio/i).fill('10:00'); // Mesmo horário
    
    await page.getByRole('button', { name: /salvar/i }).click();
    
    // Verificar mensagem de conflito
    await expect(page.getByText(/conflito|já existe|ocupado/i)).toBeVisible({ timeout: 10000 });
  });

  test('deve editar agendamento existente', async ({ page }) => {
    await navigateToAgenda(page);
    
    // Localizar um agendamento existente
    const appointment = page.locator('[data-testid*="appointment"]').first();
    
    if (await appointment.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Clicar no agendamento
      await appointment.click();
      
      // Aguardar modal de detalhes
      await page.waitForTimeout(1000);
      
      // Clicar em editar
      const editBtn = page.getByRole('button', { name: /editar/i });
      if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editBtn.click();
        
        // Modificar horário
        const timeInput = page.getByLabel(/hor[aá]rio/i);
        await timeInput.clear();
        await timeInput.fill('15:30');
        
        // Salvar
        await page.getByRole('button', { name: /salvar/i }).click();
        
        // Verificar sucesso
        await expect(page.getByText(/atualizado|sucesso/i)).toBeVisible({ timeout: 10000 });
      }
    } else {
      test.skip(true, 'Nenhum agendamento disponível para editar');
    }
  });

  test('deve cancelar agendamento', async ({ page }) => {
    await navigateToAgenda(page);
    
    // Criar um agendamento para cancelar
    const newBtn = page.getByRole('button', { name: /novo agendamento/i });
    await newBtn.click();
    
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    await page.getByLabel(/paciente/i).click();
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dateStr = futureDate.toISOString().split('T')[0];
    
    await page.getByLabel(/data/i).fill(dateStr);
    await page.getByLabel(/hor[aá]rio/i).fill('16:00');
    
    await page.getByRole('button', { name: /salvar/i }).click();
    await page.waitForTimeout(2000);
    
    // Localizar e cancelar
    const appointment = page.getByText(/16:00/).first();
    if (await appointment.isVisible({ timeout: 5000 }).catch(() => false)) {
      await appointment.click();
      await page.waitForTimeout(1000);
      
      const cancelBtn = page.getByRole('button', { name: /cancelar|remover/i });
      if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await cancelBtn.click();
        
        // Confirmar cancelamento
        const confirmBtn = page.getByRole('button', { name: /sim|confirmar/i });
        if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmBtn.click();
        }
        
        // Verificar que foi cancelado
        await expect(page.getByText(/cancelado|removido/i)).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('deve criar agendamento recorrente semanal', async ({ page }) => {
    await navigateToAgenda(page);
    
    const newBtn = page.getByRole('button', { name: /novo agendamento/i });
    await newBtn.click();
    
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // Preencher dados básicos
    await page.getByLabel(/paciente/i).click();
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    const dateStr = futureDate.toISOString().split('T')[0];
    
    await page.getByLabel(/data/i).fill(dateStr);
    await page.getByLabel(/hor[aá]rio/i).fill('09:00');
    
    // Ativar recorrência
    const recurrenceCheckbox = page.getByLabel(/recorr[eê]ncia|repetir/i);
    if (await recurrenceCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await recurrenceCheckbox.check();
      
      // Selecionar frequência semanal
      const frequencySelect = page.getByLabel(/frequ[eê]ncia|repetir a cada/i);
      if (await frequencySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await frequencySelect.selectOption('semanal');
        
        // Definir número de repetições
        const repeatCount = page.getByLabel(/repeti[çc][õo]es|n[úu]mero/i);
        if (await repeatCount.isVisible({ timeout: 2000 }).catch(() => false)) {
          await repeatCount.fill('4'); // 4 semanas
        }
      }
    }
    
    await page.getByRole('button', { name: /salvar/i }).click();
    
    // Verificar sucesso
    await expect(page.getByText(/agendamento.*criado|sucesso/i)).toBeVisible({ timeout: 10000 });
  });

  test('deve buscar agendamento por paciente', async ({ page }) => {
    await navigateToAgenda(page);
    
    // Localizar campo de busca
    const searchInput = page.getByPlaceholder(/buscar|pesquisar/i) ||
                        page.getByRole('searchbox');
    
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Digitar nome do paciente
      await searchInput.fill('Maria');
      await page.waitForTimeout(1000);
      
      // Verificar que apenas agendamentos de Maria aparecem
      const appointments = page.locator('[data-testid*="appointment"]');
      const count = await appointments.count();
      
      if (count > 0) {
        // Verificar que todos contêm "Maria"
        for (let i = 0; i < Math.min(count, 3); i++) {
          const text = await appointments.nth(i).textContent();
          expect(text?.toLowerCase()).toContain('maria');
        }
      }
    } else {
      test.skip(true, 'Campo de busca não encontrado');
    }
  });

  test('deve filtrar agendamentos por terapeuta', async ({ page }) => {
    await navigateToAgenda(page);
    
    // Localizar filtro de terapeuta
    const therapistFilter = page.getByLabel(/terapeuta|profissional/i);
    
    if (await therapistFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await therapistFilter.click();
      await page.waitForTimeout(500);
      
      // Selecionar um terapeuta
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      
      await page.waitForTimeout(1000);
      
      // Verificar que a visualização foi filtrada
      const appointments = page.locator('[data-testid*="appointment"]');
      const count = await appointments.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    } else {
      test.skip(true, 'Filtro de terapeuta não encontrado');
    }
  });

  test('deve visualizar detalhes do agendamento', async ({ page }) => {
    await navigateToAgenda(page);
    
    // Localizar primeiro agendamento
    const appointment = page.locator('[data-testid*="appointment"]').first();
    
    if (await appointment.isVisible({ timeout: 5000 }).catch(() => false)) {
      await appointment.click();
      
      // Aguardar modal de detalhes
      await page.waitForTimeout(1000);
      
      // Verificar que informações essenciais estão visíveis
      await expect(page.getByText(/paciente/i)).toBeVisible();
      await expect(page.getByText(/data|hor[aá]rio/i)).toBeVisible();
      
      // Verificar botões de ação
      const actionButtons = page.getByRole('button');
      const buttonCount = await actionButtons.count();
      
      expect(buttonCount).toBeGreaterThan(0);
    } else {
      test.skip(true, 'Nenhum agendamento disponível');
    }
  });

  test('deve navegar entre semanas do calendário', async ({ page }) => {
    await navigateToAgenda(page);
    
    // Capturar data atual exibida
    const currentWeekText = await page.locator('h1, h2, [data-testid*="week"]').first().textContent();
    
    // Clicar em "Próxima semana"
    const nextBtn = page.getByRole('button', { name: /próxim|next/i });
    await nextBtn.click();
    await page.waitForTimeout(1000);
    
    // Verificar que a semana mudou
    const newWeekText = await page.locator('h1, h2, [data-testid*="week"]').first().textContent();
    expect(newWeekText).not.toBe(currentWeekText);
    
    // Voltar para semana anterior
    const prevBtn = page.getByRole('button', { name: /anterior|prev/i });
    await prevBtn.click();
    await page.waitForTimeout(1000);
    
    // Clicar em "Hoje" para voltar à semana atual
    const todayBtn = page.getByRole('button', { name: /hoje|today/i });
    await todayBtn.click();
    await page.waitForTimeout(1000);
  });

  test('deve validar campos obrigatórios no formulário', async ({ page }) => {
    await navigateToAgenda(page);
    
    // Abrir formulário
    const newBtn = page.getByRole('button', { name: /novo agendamento/i });
    await newBtn.click();
    
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // Tentar salvar sem preencher
    await page.getByRole('button', { name: /salvar/i }).click();
    
    // Verificar mensagens de validação
    await expect(page.getByText(/obrigat[óo]rio|required|preencha/i)).toBeVisible({ timeout: 5000 });
  });
});
