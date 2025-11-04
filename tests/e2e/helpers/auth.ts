// tests/e2e/helpers/auth.ts
import { Page } from '@playwright/test';

/**
 * Demo accounts disponíveis para testes E2E
 */
export const DEMO_ACCOUNTS = {
  admin: {
    email: 'admin@dudufisio.com',
    password: 'DuduFisio2024!',
    role: 'Administrador'
  },
  therapist: {
    email: 'therapist@dudufisio.com',
    password: 'demo123456',
    role: 'Fisioterapeuta'
  },
  patient: {
    email: 'patient@dudufisio.com',
    password: 'demo123456',
    role: 'Paciente'
  }
};

/**
 * Faz login na aplicação com uma conta demo
 *
 * @param page - Página do Playwright
 * @param account - Tipo de conta ('admin' | 'therapist' | 'patient')
 */
export async function loginWithDemoAccount(
  page: Page,
  account: keyof typeof DEMO_ACCOUNTS = 'therapist'
): Promise<void> {
  const credentials = DEMO_ACCOUNTS[account];

  console.log(`🔐 Fazendo login como: ${credentials.role} (${credentials.email})`);

  // Navegar para a página de login
  await page.goto('http://localhost:5173/login');
  await page.waitForLoadState('networkidle');

  // Preencher credenciais
  const emailInput = page.locator('input[name="email"]');
  const passwordInput = page.locator('input[name="password"]');

  await emailInput.fill(credentials.email);
  await passwordInput.fill(credentials.password);

  // Clicar em "Entrar"
  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();

  // Aguardar redirecionamento (aceitar dashboard ou agenda)
  try {
    await page.waitForURL(/\/(dashboard|agenda|pacientes)/, { timeout: 15000 });
  } catch (error) {
    console.log('⚠️ Timeout aguardando redirect, tentando verificar se já está autenticado...');

    // Verificar se há elementos da UI autenticada
    const sidebar = page.locator('[role="navigation"]').or(page.locator('aside')).first();
    await sidebar.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      throw new Error('Login falhou - não foi possível detectar interface autenticada');
    });
  }

  await page.waitForLoadState('networkidle');

  console.log(`✅ Login bem-sucedido como ${credentials.role}`);
}

/**
 * Faz logout da aplicação
 */
export async function logout(page: Page): Promise<void> {
  // Implementar se necessário
  console.log('🚪 Fazendo logout...');

  // Navegar para login (força logout)
  await page.goto('http://localhost:5173/login');
  await page.waitForLoadState('networkidle');
}
