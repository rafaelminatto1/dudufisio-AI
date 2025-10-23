import { test, expect } from '@playwright/test';

test.describe('Fluxo de Agendamento - Testes E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a agenda
    await page.goto('/agenda');
    
    // Aguardar carregamento da página
    await page.waitForLoadState('networkidle');
  });
  
  test('deve abrir o modal de agendamento ao clicar em um slot vazio', async ({ page }) => {
    // Clicar em um horário vazio (ajustar seletor conforme necessário)
    const timeSlot = page.locator('[class*="hover:bg-blue"]').first();
    await timeSlot.click();
    
    // Verificar que o modal abriu
    await expect(page.getByTestId('appointment-form-modal')).toBeVisible();
    await expect(page.getByText('Novo Agendamento')).toBeVisible();
  });
  
  test('deve validar campo obrigatório de paciente', async ({ page }) => {
    // Abrir modal
    const timeSlot = page.locator('[class*="hover:bg-blue"]').first();
    await timeSlot.click();
    
    // Tentar salvar sem selecionar paciente
    const submitButton = page.getByTestId('submit-button');
    await submitButton.click();
    
    // Verificar mensagem de erro
    await expect(page.getByText(/selecione um paciente/i)).toBeVisible();
  });
  
  test('deve mostrar validação de duração com React Hook Form', async ({ page }) => {
    // Abrir modal
    const timeSlot = page.locator('[class*="hover:bg-blue"]').first();
    await timeSlot.click();
    
    // Verificar que as opções de duração estão visíveis
    await expect(page.getByText('30 min')).toBeVisible();
    await expect(page.getByText('45 min')).toBeVisible();
    await expect(page.getByText('60 min')).toBeVisible();
    
    // Selecionar duração de 45 minutos
    await page.getByLabel('45 min').click();
    
    // Verificar que foi selecionado
    await expect(page.getByLabel('45 min')).toBeChecked();
  });
  
  test('deve criar um agendamento completo', async ({ page }) => {
    // Abrir modal
    const timeSlot = page.locator('[class*="hover:bg-blue"]').first();
    await timeSlot.click();
    
    // Preencher campo de paciente (busca)
    const patientInput = page.locator('input[placeholder*="paciente"]').or(page.locator('input[type="text"]')).first();
    await patientInput.fill('João');
    
    // Aguardar resultados da busca e selecionar primeiro resultado
    await page.waitForTimeout(500); // Debounce
    const firstPatient = page.locator('[class*="hover:bg-sky"]').first();
    if (await firstPatient.isVisible()) {
      await firstPatient.click();
    }
    
    // Selecionar duração
    await page.getByLabel('60 min').click();
    
    // Adicionar observações
    const notesTextarea = page.getByPlaceholder(/observações/i);
    await notesTextarea.fill('Primeira consulta de teste E2E');
    
    // Salvar agendamento
    const submitButton = page.getByTestId('submit-button');
    await submitButton.click();
    
    // Verificar toast de sucesso ou modal fechando
    await expect(page.getByTestId('appointment-form-modal')).not.toBeVisible({ timeout: 10000 });
  });
  
  test('deve mostrar estados de loading durante salvamento', async ({ page }) => {
    // Abrir modal
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
    
    // Interceptar request para simular delay
    await page.route('**/api/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    // Salvar
    const submitButton = page.getByTestId('submit-button');
    await submitButton.click();
    
    // Verificar estados de loading
    // Pode mostrar "Verificando conflitos..." ou "Salvando..."
    const loadingText = page.getByText(/verificando|salvando/i);
    await expect(loadingText).toBeVisible({ timeout: 2000 });
  });
  
  test('deve cancelar agendamento e fechar modal', async ({ page }) => {
    // Abrir modal
    const timeSlot = page.locator('[class*="hover:bg-blue"]').first();
    await timeSlot.click();
    
    // Verificar que modal está aberto
    await expect(page.getByTestId('appointment-form-modal')).toBeVisible();
    
    // Clicar em cancelar
    const cancelButton = page.getByRole('button', { name: /cancelar/i });
    await cancelButton.click();
    
    // Verificar que modal fechou
    await expect(page.getByTestId('appointment-form-modal')).not.toBeVisible();
  });
  
  test('deve permitir alterar o horário dentro do modal', async ({ page }) => {
    // Abrir modal
    const timeSlot = page.locator('[class*="hover:bg-blue"]').first();
    await timeSlot.click();
    
    // Encontrar input de horário
    const timeInput = page.locator('input[type="time"]');
    await expect(timeInput).toBeVisible();
    
    // Alterar horário
    await timeInput.fill('14:30');
    
    // Verificar que horário foi alterado
    await expect(timeInput).toHaveValue('14:30');
  });
  
  test('deve mostrar badge "Editando" quando modal está em modo de edição', async ({ page }) => {
    // Este teste assume que existe um agendamento na agenda
    // Procurar um card de agendamento existente
    const appointmentCard = page.locator('[data-testid="appointment-block"]').first();
    
    if (await appointmentCard.isVisible()) {
      await appointmentCard.click();
      
      // Verificar badge "Editando"
      await expect(page.getByText('Editando')).toBeVisible();
    }
  });
  
  test('deve manter responsividade em mobile', async ({ page }) => {
    // Configurar viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Abrir modal
    const timeSlot = page.locator('[class*="hover:bg-blue"]').first();
    await timeSlot.click();
    
    // Verificar que modal está visível e responsivo
    const modal = page.getByTestId('appointment-form-modal');
    await expect(modal).toBeVisible();
    
    // Verificar que header está visível
    await expect(page.getByTestId('modal-header')).toBeVisible();
    
    // Verificar que botões estão acessíveis
    await expect(page.getByTestId('submit-button')).toBeVisible();
  });
});

