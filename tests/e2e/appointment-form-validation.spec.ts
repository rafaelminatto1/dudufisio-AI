import { test, expect } from '@playwright/test';

test.describe('Validação do Formulário de Agendamento com RHF', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForLoadState('networkidle');
  });
  
  test('deve mostrar erro ao tentar salvar sem paciente', async ({ page }) => {
    // Clicar em um horário vazio
    const timeSlot = page.locator('[class*="hover:bg-blue"]').first();
    await timeSlot.click();
    
    // Tentar submeter sem paciente
    await page.getByTestId('submit-button').click();
    
    // Verificar mensagem de erro do Zod
    await expect(page.getByText(/selecione um paciente/i)).toBeVisible();
    
    // Verificar animação shake
    await expect(page.locator('.animate-shake')).toBeVisible();
  });
  
  test('deve validar observações com mais de 500 caracteres', async ({ page }) => {
    const timeSlot = page.locator('[class*="hover:bg-blue"]').first();
    await timeSlot.click();
    
    const notesField = page.getByTestId('notes-textarea');
    const longText = 'A'.repeat(501);
    
    await notesField.fill(longText);
    await notesField.blur();
    
    // Validação em tempo real (onChange)
    await expect(page.getByText(/500 caracteres/i)).toBeVisible();
  });
  
  test('deve mostrar contador de caracteres em observações', async ({ page }) => {
    const timeSlot = page.locator('[class*="hover:bg-blue"]').first();
    await timeSlot.click();
    
    const notesField = page.getByTestId('notes-textarea');
    await notesField.fill('Teste de observação');
    
    // Verificar contador
    await expect(page.getByText(/\d+\/500 caracteres/)).toBeVisible();
  });
  
  test('deve validar todos os campos ao submeter formulário vazio', async ({ page }) => {
    const timeSlot = page.locator('[class*="hover:bg-blue"]').first();
    await timeSlot.click();
    
    // Submeter formulário vazio
    await page.getByTestId('submit-button').click();
    
    // Verificar que validação do RHF previne submit
    await expect(page.getByTestId('appointment-form-modal')).toBeVisible();
    await expect(page.getByText(/selecione um paciente/i)).toBeVisible();
  });
  
  test('deve validar duração com opções corretas', async ({ page }) => {
    const timeSlot = page.locator('[class*="hover:bg-blue"]').first();
    await timeSlot.click();
    
    // Verificar opções de duração
    await expect(page.getByLabel('30 min')).toBeVisible();
    await expect(page.getByLabel('45 min')).toBeVisible();
    await expect(page.getByLabel('60 min')).toBeVisible();
    
    // Selecionar 45 minutos
    await page.getByLabel('45 min').click();
    
    // Verificar seleção
    await expect(page.getByLabel('45 min')).toBeChecked();
  });
  
  test('deve mostrar badge "Obrigatório" em campo paciente', async ({ page }) => {
    const timeSlot = page.locator('[class*="hover:bg-blue"]').first();
    await timeSlot.click();
    
    await expect(page.getByText('Obrigatório')).toBeVisible();
  });
  
  test('deve permitir alterar horário e validar formato', async ({ page }) => {
    const timeSlot = page.locator('[class*="hover:bg-blue"]').first();
    await timeSlot.click();
    
    const timeInput = page.getByTestId('time-input');
    await expect(timeInput).toBeVisible();
    
    // Alterar para horário válido
    await timeInput.fill('14:30');
    await expect(timeInput).toHaveValue('14:30');
  });
});

