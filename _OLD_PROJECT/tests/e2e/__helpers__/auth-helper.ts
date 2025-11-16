import { Page } from '@playwright/test';
import { testUsers } from '../__fixtures__/users';

/**
 * Helper para autenticação nos testes E2E
 */

export async function loginAsAdmin(page: Page): Promise<void> {
  await login(page, testUsers.admin.email, testUsers.admin.password);
}

export async function loginAsTherapist(page: Page): Promise<void> {
  await login(page, testUsers.therapist.email, testUsers.therapist.password);
}

export async function loginAsPatient(page: Page): Promise<void> {
  await login(page, testUsers.patient.email, testUsers.patient.password);
}

export async function login(page: Page, email: string, password: string): Promise<void> {
  // Navegar para a página de login
  await page.goto('/', { waitUntil: 'networkidle' });

  // Verificar se estamos na página de login ou se já estamos logados
  const isLoginPage = await page.locator('button:has-text("Entrar")').isVisible({ timeout: 2000 }).catch(() => false);

  if (!isLoginPage) {
    console.log('Já está logado ou não está na página de login');
    return;
  }

  // Preencher campos de login
  const emailInput = page.locator('input[type="email"], input[placeholder*="email"]').first();
  const passwordInput = page.locator('input[type="password"], input[placeholder*="senha"]').first();

  await emailInput.waitFor({ state: 'visible', timeout: 5000 });
  await emailInput.fill(email);

  await passwordInput.waitFor({ state: 'visible', timeout: 5000 });
  await passwordInput.fill(password);

  // Clicar no botão de login
  const loginButton = page.locator('button:has-text("Entrar")').first();
  await loginButton.click();

  // Aguardar navegação ou mudança na interface
  await page.waitForTimeout(3000);

  // Verificar se o login foi bem-sucedido
  // (se não estiver mais na tela de login)
  const stillOnLoginPage = await page.locator('button:has-text("Entrar")').isVisible({ timeout: 2000 }).catch(() => false);

  if (stillOnLoginPage) {
    // Verificar se há mensagem de erro
    const errorMessage = await page.locator('[class*="error"], [role="alert"], .text-red-500').first().textContent().catch(() => null);

    if (errorMessage) {
      throw new Error(`Login falhou: ${errorMessage}`);
    } else {
      console.warn('Login pode ter falhado - ainda está na página de login');
    }
  } else {
    console.log('Login realizado com sucesso');
  }
}

export async function logout(page: Page): Promise<void> {
  // Procurar por botão de logout
  const logoutButton = page.locator('button:has-text("Sair"), button:has-text("Logout"), a:has-text("Sair")').first();

  if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await logoutButton.click();
    await page.waitForTimeout(1000);
  }
}

export async function waitForDashboard(page: Page): Promise<void> {
  // Aguardar elementos típicos do dashboard
  await page.waitForTimeout(2000);

  // Verificar se há conteúdo carregado
  const hasContent = await page.locator('h1, h2, h3').first().isVisible({ timeout: 5000 }).catch(() => false);

  if (!hasContent) {
    throw new Error('Dashboard não carregou corretamente');
  }
}
