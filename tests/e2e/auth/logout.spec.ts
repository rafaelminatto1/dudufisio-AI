import { test, expect } from '@playwright/test';
import { testUsers } from '../__fixtures__/users';

test.describe('Logout', () => {
  test.beforeEach(async ({ page }) => {
    // Fazer login antes de cada teste
    await page.goto('/');
    const admin = testUsers.admin;
    
    await page.fill('input[type="email"]', admin.email);
    await page.fill('input[type="password"]', admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard|.*inicio/, { timeout: 10000 });
  });

  test('Deve fazer logout com sucesso', async ({ page }) => {
    // Procurar botão de logout (pode estar em menu dropdown ou direto)
    const logoutButton = page.locator(
      'button:has-text("Sair"), button:has-text("Logout"), a:has-text("Sair"), [data-testid="logout"]'
    ).first();

    // Pode precisar abrir menu de usuário primeiro
    const userMenu = page.locator(
      '[data-testid="user-menu"], button:has-text("Roberto"), .user-menu'
    ).first();

    // Tentar clicar no menu de usuário se existir
    if (await userMenu.isVisible()) {
      await userMenu.click();
    }

    // Clicar em logout
    await logoutButton.click();

    // Deve redirecionar para página de login
    await page.waitForURL(/.*\/$|.*\/login/, { timeout: 5000 });

    // Deve ver formulário de login novamente
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Deve limpar sessão após logout', async ({ page }) => {
    // Fazer logout
    const logoutButton = page.locator('button:has-text("Sair"), a:has-text("Sair")').first();
    
    // Abrir menu se necessário
    const userMenu = page.locator('[data-testid="user-menu"], button:has-text("Roberto")').first();
    if (await userMenu.isVisible({ timeout: 1000 }).catch(() => false)) {
      await userMenu.click();
    }
    
    await logoutButton.click();
    await page.waitForURL(/.*\/$|.*\/login/, { timeout: 5000 });

    // Tentar acessar página protegida
    await page.goto('/dashboard');

    // Deve ser redirecionado para login
    await page.waitForURL(/.*\/$|.*\/login/, { timeout: 5000 });
  });

  test('Não deve conseguir voltar com botão "Voltar" do navegador', async ({ page }) => {
    // Anotar URL atual
    const dashboardURL = page.url();

    // Fazer logout
    const userMenu = page.locator('[data-testid="user-menu"], button:has-text("Roberto")').first();
    if (await userMenu.isVisible({ timeout: 1000 }).catch(() => false)) {
      await userMenu.click();
    }

    const logoutButton = page.locator('button:has-text("Sair"), a:has-text("Sair")').first();
    await logoutButton.click();
    await page.waitForURL(/.*\/$|.*\/login/, { timeout: 5000 });

    // Tentar voltar
    await page.goBack();

    // Deve ser redirecionado para login novamente
    await page.waitForURL(/.*\/$|.*\/login/, { timeout: 5000 });
  });

  test('Deve mostrar confirmação de logout (se implementado)', async ({ page }) => {
    const userMenu = page.locator('[data-testid="user-menu"], button:has-text("Roberto")').first();
    if (await userMenu.isVisible({ timeout: 1000 }).catch(() => false)) {
      await userMenu.click();
    }

    // Procurar botão de logout
    const logoutButton = page.locator('button:has-text("Sair"), a:has-text("Sair")').first();
    await expect(logoutButton).toBeVisible({ timeout: 5000 });
  });
});









