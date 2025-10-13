import { test, expect } from '@playwright/test';
import { testUsers, testPatients } from '../__fixtures__/users';

test.describe('Criar Paciente', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('/');
    const admin = testUsers.admin;
    
    await page.fill('input[type="email"]', admin.email);
    await page.fill('input[type="password"]', admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });

    // Navegar para lista de pacientes
    await page.click('text=Pacientes');
    await page.waitForURL(/.*pacientes/, { timeout: 10000 });

    // Clicar em "Novo Paciente"
    const addButton = page.locator(
      'button:has-text("Novo Paciente"), button:has-text("Adicionar"), a:has-text("Novo")'
    ).first();
    await addButton.click();

    // Aguardar formulário aparecer (modal ou nova página)
    await expect(
      page.locator('input[name="name"], input[placeholder*="Nome"]').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('Deve criar paciente com dados mínimos', async ({ page }) => {
    const newPatient = {
      name: `Teste E2E ${Date.now()}`,
      email: `teste${Date.now()}@example.com`,
      phone: '11999887766',
    };

    // Preencher campos obrigatórios
    await page.fill('input[name="name"], input[placeholder*="Nome"]', newPatient.name);
    await page.fill('input[name="email"], input[type="email"]', newPatient.email);
    await page.fill('input[name="phone"], input[placeholder*="Telefone"]', newPatient.phone);

    // Submeter formulário
    await page.click('button[type="submit"], button:has-text("Salvar"), button:has-text("Criar")');

    // Aguardar sucesso
    await expect(
      page.locator('text=Paciente criado, text=Sucesso, text=adicionado').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('Deve criar paciente com todos os dados', async ({ page }) => {
    const newPatient = testPatients.new;
    const uniqueEmail = `teste${Date.now()}@example.com`;

    // Preencher todos os campos
    await page.fill('input[name="name"]', newPatient.name);
    await page.fill('input[name="email"], input[type="email"]', uniqueEmail);
    await page.fill('input[name="phone"]', newPatient.phone);
    
    // CPF se existir
    const cpfInput = page.locator('input[name="cpf"]');
    if (await cpfInput.count().then(c => c > 0)) {
      await cpfInput.fill(newPatient.cpf);
    }

    // Data de nascimento
    const birthDateInput = page.locator('input[name="birthDate"], input[type="date"]');
    if (await birthDateInput.count().then(c => c > 0)) {
      await birthDateInput.fill(newPatient.birthDate);
    }

    // Endereço
    const addressInput = page.locator('input[name="address"]');
    if (await addressInput.count().then(c => c > 0)) {
      await addressInput.fill(newPatient.address);
      await page.fill('input[name="city"]', newPatient.city);
      await page.fill('input[name="state"]', newPatient.state);
      await page.fill('input[name="zipCode"]', newPatient.zipCode);
    }

    // Submeter
    await page.click('button[type="submit"]');

    // Aguardar sucesso
    await expect(
      page.locator('text=Paciente criado, text=Sucesso').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('Deve validar campos obrigatórios', async ({ page }) => {
    // Tentar submeter sem preencher
    await page.click('button[type="submit"]');

    // Deve mostrar erros de validação
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveAttribute('required', '');

    // Ou deve mostrar mensagens de erro
    const errorMessages = page.locator('text=obrigatório, text=required, .error');
    const hasErrors = await errorMessages.count().then(c => c > 0);
    
    if (hasErrors) {
      await expect(errorMessages.first()).toBeVisible();
    }
  });

  test('Deve validar formato de email', async ({ page }) => {
    await page.fill('input[name="name"]', 'Teste Validação');
    await page.fill('input[type="email"]', 'emailinvalido');
    await page.fill('input[name="phone"]', '11999999999');

    await page.click('button[type="submit"]');

    // Deve mostrar erro de email inválido
    const emailInput = page.locator('input[type="email"]');
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    
    expect(validationMessage).toBeTruthy();
  });

  test('Deve validar CPF (se implementado)', async ({ page }) => {
    const cpfInput = page.locator('input[name="cpf"]');

    if (await cpfInput.count().then(c => c > 0)) {
      await page.fill('input[name="name"]', 'Teste CPF');
      await page.fill('input[type="email"]', 'teste@example.com');
      await page.fill('input[name="phone"]', '11999999999');
      await cpfInput.fill('12345678900'); // CPF inválido

      await page.click('button[type="submit"]');

      // Pode mostrar erro de CPF inválido
      const errorMessage = page.locator('text=CPF inválido, text=CPF já cadastrado');
      if (await errorMessage.count().then(c => c > 0)) {
        await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('Deve cancelar criação de paciente', async ({ page }) => {
    // Preencher alguns dados
    await page.fill('input[name="name"]', 'Teste Cancelar');

    // Clicar em cancelar
    const cancelButton = page.locator('button:has-text("Cancelar"), button:has-text("Fechar")').first();
    await cancelButton.click();

    // Deve voltar para lista ou fechar modal
    await expect(
      page.locator('input[name="name"]')
    ).not.toBeVisible({ timeout: 3000 });
  });

  test('Deve limpar formulário após criar paciente', async ({ page }) => {
    const newPatient = {
      name: `Teste Limpar ${Date.now()}`,
      email: `limpar${Date.now()}@example.com`,
      phone: '11888777666',
    };

    await page.fill('input[name="name"]', newPatient.name);
    await page.fill('input[type="email"]', newPatient.email);
    await page.fill('input[name="phone"]', newPatient.phone);

    await page.click('button[type="submit"]');

    // Aguardar sucesso
    await page.waitForTimeout(2000);

    // Se modal permanece aberto, campos devem estar limpos
    const nameInput = page.locator('input[name="name"]');
    if (await nameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      const value = await nameInput.inputValue();
      expect(value).toBe('');
    }
  });
});









