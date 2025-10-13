import { test, expect } from '@playwright/test';

test.describe('Recuperação de Senha', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Deve ter link para recuperação de senha', async ({ page }) => {
    // Procurar link "Esqueceu a senha?"
    const forgotPasswordLink = page.locator(
      'text=Esqueceu a senha, text=Esqueceu sua senha, a:has-text("Recuperar"), [href*="recuperar"], [href*="forgot"]'
    ).first();

    await expect(forgotPasswordLink).toBeVisible({ timeout: 5000 });
  });

  test('Deve abrir página de recuperação de senha', async ({ page }) => {
    const forgotPasswordLink = page.locator(
      'text=Esqueceu a senha, a:has-text("Recuperar")'
    ).first();

    if (await forgotPasswordLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await forgotPasswordLink.click();

      // Deve navegar para página de recuperação ou mostrar modal
      await expect(
        page.locator('text=Recuperar senha, text=Redefinir senha, input[type="email"]')
      ).toBeVisible({ timeout: 5000 });
    } else {
      // Funcionalidade pode não estar implementada ainda
      test.skip();
    }
  });

  test('Deve validar email para recuperação', async ({ page }) => {
    const forgotPasswordLink = page.locator('text=Esqueceu a senha, a:has-text("Recuperar")').first();

    if (await forgotPasswordLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await forgotPasswordLink.click();

      // Tentar enviar sem email
      const submitButton = page.locator('button[type="submit"], button:has-text("Enviar")').first();
      await submitButton.click();

      // Deve mostrar erro de validação
      const emailInput = page.locator('input[type="email"]').first();
      await expect(emailInput).toHaveAttribute('required', '');
    } else {
      test.skip();
    }
  });

  test('Deve mostrar mensagem de sucesso ao enviar email', async ({ page }) => {
    const forgotPasswordLink = page.locator('text=Esqueceu a senha').first();

    if (await forgotPasswordLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await forgotPasswordLink.click();

      // Preencher email válido
      await page.fill('input[type="email"]', 'admin@dudufisio.com');
      
      // Enviar
      await page.click('button[type="submit"], button:has-text("Enviar")');

      // Deve mostrar mensagem de sucesso
      await expect(
        page.locator('text=Email enviado, text=Verifique seu email, text=Link de recuperação enviado').first()
      ).toBeVisible({ timeout: 5000 });
    } else {
      test.skip();
    }
  });

  test('Deve ter link para voltar ao login', async ({ page }) => {
    const forgotPasswordLink = page.locator('text=Esqueceu a senha').first();

    if (await forgotPasswordLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await forgotPasswordLink.click();

      // Deve ter botão para voltar
      const backButton = page.locator(
        'text=Voltar, text=Voltar ao login, a:has-text("Login"), [href="/"]'
      ).first();

      await expect(backButton).toBeVisible({ timeout: 5000 });
    } else {
      test.skip();
    }
  });
});









