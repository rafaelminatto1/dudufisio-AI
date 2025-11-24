// e2e/waitlist.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Waitlist Management E2E Tests', () => {
  test('should allow a patient to be added to the waitlist via form submission', async ({ page }) => {
    // Assumindo que existe uma página no frontend para adicionar pacientes à lista de espera
    // e que o formulário chama a Server Action `addPatientToWaitlist`

    await page.goto('http://localhost:3000/admin/waitlist'); // Substitua pela URL real do seu dashboard/formulário

    // Simular preenchimento do formulário
    await page.fill('input[name="patientId"]', 'test-patient-e2e-id');
    await page.selectOption('select[name="priority"]', 'Alta');

    // Simular submissão do formulário (assumindo um botão de submit)
    await page.click('button[type="submit"]');

    // Verificar se a mensagem de sucesso é exibida
    await expect(page.locator('text=Paciente adicionado à lista de espera com sucesso.')).toBeVisible();

    // Opcional: Verificar se o paciente aparece na lista (se o dashboard atualizar dinamicamente)
    // await expect(page.locator('text=test-patient-e2e-id')).toBeVisible();
  });

  test('should display an error if patient is already in active waitlist', async ({ page }) => {
    // Este teste dependeria de um estado inicial onde o paciente já está na lista
    // Para simplificar, vamos simular a tentativa de adicionar o mesmo paciente duas vezes

    await page.goto('http://localhost:3000/admin/waitlist');

    // Primeira submissão (deve ser bem-sucedida)
    await page.fill('input[name="patientId"]', 'duplicate-patient-e2e-id');
    await page.selectOption('select[name="priority"]', 'Normal');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Paciente adicionado à lista de espera com sucesso.')).toBeVisible();

    // Segunda submissão com o mesmo paciente (deve falhar)
    await page.fill('input[name="patientId"]', 'duplicate-patient-e2e-id');
    await page.selectOption('select[name="priority"]', 'Normal');
    await page.click('button[type="submit"]');

    // Verificar se a mensagem de erro é exibida
    await expect(page.locator('text=Paciente já está na lista de espera ativa.')).toBeVisible();
  });

  // TODO: Adicionar mais testes E2E para outros fluxos críticos da lista de espera
  // - Processamento de resposta do paciente (aceitar/recusar)
  // - Verificação de timeout
  // - Visualização no dashboard
});
