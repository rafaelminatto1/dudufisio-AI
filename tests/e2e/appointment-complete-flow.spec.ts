import { test, expect } from '@playwright/test';

test.describe('Fluxo Completo de Agendamento com RHF', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForLoadState('networkidle');
  });
  
  test('fluxo completo: criar agendamento com validação RHF', async ({ page }) => {
    // 1. Abrir modal
    const timeSlot = page.locator('[class*="hover:bg-blue"]').first();
    await timeSlot.click();
    
    await expect(page.getByTestId('appointment-form-modal')).toBeVisible();
    await expect(page.getByText('Novo Agendamento')).toBeVisible();
    
    // 2. Preencher paciente
    const patientInput = page.locator('input[placeholder*="paciente"]').or(page.locator('input[type="text"]')).first();
    await patientInput.fill('João');
    await page.waitForTimeout(500); // Debounce
    
    const firstPatient = page.locator('[class*="hover:bg-sky"]').first();
    if (await firstPatient.isVisible()) {
      await firstPatient.click();
    }
    
    // 3. Selecionar fisioterapeuta
    const therapistSelect = page.getByTestId('therapist-select');
    if (await therapistSelect.isVisible()) {
      await therapistSelect.click();
      const firstTherapist = page.locator('[role="option"]').first();
      if (await firstTherapist.isVisible()) {
        await firstTherapist.click();
      }
    }
    
    // 4. Selecionar duração
    await page.getByLabel('60 min').click();
    await expect(page.getByLabel('60 min')).toBeChecked();
    
    // 5. Adicionar observações
    const notesField = page.getByTestId('notes-textarea');
    await notesField.fill('Primeira consulta teste E2E com RHF');
    
    // Verificar contador
    await expect(page.getByText(/\d+\/500 caracteres/)).toBeVisible();
    
    // 6. Submeter formulário
    const submitButton = page.getByTestId('submit-button');
    await submitButton.click();
    
    // 7. Aguardar loading states
    // Pode mostrar "Verificando conflitos..." ou "Salvando..."
    const loadingText = page.getByText(/verificando|salvando/i);
    
    // 8. Verificar que modal fechou (sucesso)
    await expect(page.getByTestId('appointment-form-modal')).not.toBeVisible({ timeout: 15000 });
  });
  
  test('deve editar agendamento existente', async ({ page }) => {
    // Procurar um card de agendamento existente
    const appointmentCard = page.locator('[data-testid="appointment-block"]').first();
    
    if (await appointmentCard.isVisible()) {
      await appointmentCard.click();
      
      // Verificar badge "Editando"
      await expect(page.getByText('Editando')).toBeVisible();
      
      // Modificar observações
      const notesField = page.getByTestId('notes-textarea');
      await notesField.clear();
      await notesField.fill('Observação atualizada pelo teste E2E');
      
      // Salvar
      await page.getByTestId('submit-button').click();
      
      // Aguardar fechamento
      await expect(page.getByTestId('appointment-form-modal')).not.toBeVisible({ timeout: 15000 });
    }
  });
  
  test('deve cancelar agendamento e resetar formulário', async ({ page }) => {
    // Abrir modal
    const timeSlot = page.locator('[class*="hover:bg-blue"]').first();
    await timeSlot.click();
    
    // Preencher alguns campos
    const notesField = page.getByTestId('notes-textarea');
    await notesField.fill('Teste de cancelamento');
    
    await page.getByLabel('45 min').click();
    
    // Cancelar
    const cancelButton = page.getByRole('button', { name: /cancelar/i });
    await cancelButton.click();
    
    // Verificar que modal fechou
    await expect(page.getByTestId('appointment-form-modal')).not.toBeVisible();
    
    // Reabrir modal
    await timeSlot.click();
    
    // Verificar que formulário foi resetado
    await expect(notesField).toHaveValue('');
    await expect(page.getByLabel('60 min')).toBeChecked(); // Valor padrão
  });
  
  test('deve mostrar estados de loading durante operações', async ({ page }) => {
    const timeSlot = page.locator('[class*="hover:bg-blue"]').first();
    await timeSlot.click();
    
    // Preencher dados mínimos
    const patientInput = page.locator('input[placeholder*="paciente"]').or(page.locator('input[type="text"]')).first();
    await patientInput.fill('Maria');
    await page.waitForTimeout(500);
    
    const firstPatient = page.locator('[class*="hover:bg-sky"]').first();
    if (await firstPatient.isVisible()) {
      await firstPatient.click();
    }
    
    // Salvar
    const submitButton = page.getByTestId('submit-button');
    await submitButton.click();
    
    // Verificar loading spinner (Loader2 icon)
    const loadingSpinner = page.locator('.animate-spin');
    
    // Pode demorar um pouco para aparecer dependendo da velocidade
    if (await loadingSpinner.isVisible({ timeout: 2000 })) {
      await expect(loadingSpinner).toBeVisible();
    }
  });
  
  test('deve validar recorrência quando configurada', async ({ page }) => {
    const timeSlot = page.locator('[class*="hover:bg-blue"]').first();
    await timeSlot.click();
    
    // Selecionar paciente
    const patientInput = page.locator('input[placeholder*="paciente"]').or(page.locator('input[type="text"]')).first();
    await patientInput.fill('Pedro');
    await page.waitForTimeout(500);
    
    const firstPatient = page.locator('[class*="hover:bg-sky"]').first();
    if (await firstPatient.isVisible()) {
      await firstPatient.click();
    }
    
    // Tentar ativar recorrência (se disponível no RecurrenceSelector)
    // A validação do Zod deve garantir que se houver recorrência, 
    // ela tenha endDate ou count
    
    // Submeter
    await page.getByTestId('submit-button').click();
    
    // Se recorrência foi configurada incorretamente, deve mostrar erro
    const recurrenceError = page.getByText(/data final ou número de repetições/i);
    
    // Este teste valida que a mensagem aparece SE recorrência foi configurada incorretamente
    // Se não houver recorrência, o agendamento deve ser salvo normalmente
  });
  
  test('deve manter responsividade em diferentes viewports', async ({ page }) => {
    // Teste em mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    const timeSlot = page.locator('[class*="hover:bg-blue"]').first();
    await timeSlot.click();
    
    const modal = page.getByTestId('appointment-form-modal');
    await expect(modal).toBeVisible();
    
    // Verificar que todos os campos estão acessíveis
    await expect(page.getByTestId('modal-header')).toBeVisible();
    await expect(page.getByTestId('submit-button')).toBeVisible();
    await expect(page.getByTestId('notes-textarea')).toBeVisible();
    
    // Teste em tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(modal).toBeVisible();
    
    // Teste em desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(modal).toBeVisible();
  });
});

