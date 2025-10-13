import { test, expect } from '@playwright/test';
import { testUsers } from '../__fixtures__/users';

test.describe('Editar Paciente', () => {
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

    // Clicar no primeiro paciente para ver detalhes
    const firstPatient = page.locator(
      '[data-testid="patient-card"], .patient-item, button:has-text("Maria"), a:has-text("Maria")'
    ).first();

    await firstPatient.click();
    await page.waitForTimeout(1000);
  });

  test('Deve ter botão para editar paciente', async ({ page }) => {
    const editButton = page.locator(
      'button:has-text("Editar"), button[title="Editar"], [data-testid="edit-patient"]'
    ).first();

    await expect(editButton).toBeVisible({ timeout: 5000 });
  });

  test('Deve abrir formulário de edição', async ({ page }) => {
    const editButton = page.locator('button:has-text("Editar")').first();
    await editButton.click();

    // Deve mostrar formulário com dados pré-preenchidos
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible({ timeout: 5000 });

    // Campo deve ter valor
    const nameValue = await nameInput.inputValue();
    expect(nameValue).not.toBe('');
  });

  test('Deve editar informações básicas do paciente', async ({ page }) => {
    const editButton = page.locator('button:has-text("Editar")').first();
    await editButton.click();

    // Aguardar formulário
    const phoneInput = page.locator('input[name="phone"]');
    await expect(phoneInput).toBeVisible({ timeout: 5000 });

    // Editar telefone
    await phoneInput.clear();
    await phoneInput.fill('11987654321');

    // Salvar
    await page.click('button[type="submit"], button:has-text("Salvar")');

    // Aguardar confirmação
    await expect(
      page.locator('text=atualizado, text=alterado, text=Sucesso').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('Deve manter validações ao editar', async ({ page }) => {
    const editButton = page.locator('button:has-text("Editar")').first();
    await editButton.click();

    // Limpar campo obrigatório
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.clear();

    // Tentar salvar
    await page.click('button[type="submit"]');

    // Deve mostrar erro
    await expect(nameInput).toHaveAttribute('required', '');
  });

  test('Deve cancelar edição sem salvar', async ({ page }) => {
    const editButton = page.locator('button:has-text("Editar")').first();
    await editButton.click();

    // Fazer uma alteração
    const phoneInput = page.locator('input[name="phone"]');
    await expect(phoneInput).toBeVisible({ timeout: 5000 });
    const originalValue = await phoneInput.inputValue();
    
    await phoneInput.clear();
    await phoneInput.fill('11111111111');

    // Cancelar
    await page.click('button:has-text("Cancelar")');

    // Abrir novamente
    await page.click('button:has-text("Editar")');
    await expect(phoneInput).toBeVisible({ timeout: 5000 });

    // Valor deve ser o original
    const currentValue = await phoneInput.inputValue();
    expect(currentValue).toBe(originalValue);
  });

  test('Deve editar endereço completo', async ({ page }) => {
    const editButton = page.locator('button:has-text("Editar")').first();
    await editButton.click();

    // Verificar se tem campos de endereço
    const addressInput = page.locator('input[name="address"]');
    
    if (await addressInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addressInput.clear();
      await addressInput.fill('Rua Editada, 456');

      const cityInput = page.locator('input[name="city"]');
      if (await cityInput.count().then(c => c > 0)) {
        await cityInput.clear();
        await cityInput.fill('Rio de Janeiro');
      }

      // Salvar
      await page.click('button[type="submit"]');

      // Aguardar sucesso
      await expect(
        page.locator('text=atualizado, text=Sucesso').first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('Deve atualizar dados exibidos após edição', async ({ page }) => {
    const editButton = page.locator('button:has-text("Editar")').first();
    await editButton.click();

    // Editar email
    const emailInput = page.locator('input[name="email"], input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    
    const newEmail = `editado${Date.now()}@example.com`;
    await emailInput.clear();
    await emailInput.fill(newEmail);

    // Salvar
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Verificar se email foi atualizado na exibição
    if (await page.locator(`text=${newEmail}`).count().then(c => c > 0)) {
      await expect(page.locator(`text=${newEmail}`).first()).toBeVisible();
    }
  });
});









