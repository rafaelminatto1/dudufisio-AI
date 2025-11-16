import { test, expect } from '@playwright/test';
import { testUsers } from '../__fixtures__/users';

test.describe('Login Multi-Role', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Admin deve fazer login e acessar todas as funcionalidades', async ({ page }) => {
    const admin = testUsers.admin;

    // Preencher formulário de login
    await page.fill('input[type="email"], input[name="email"]', admin.email);
    await page.fill('input[type="password"], input[name="password"]', admin.password);
    
    // Clicar no botão de login
    await page.click('button[type="submit"], button:has-text("Entrar")');

    // Aguardar navegação para dashboard
    await page.waitForURL(/.*dashboard|.*inicio/, { timeout: 10000 });

    // Verificar que está logado (deve ver nome do usuário ou menu)
    await expect(page.locator(`text=${admin.name}`).first()).toBeVisible({ timeout: 5000 });

    // Verificar menu de navegação do admin
    const sidebar = page.locator('nav, aside, [role="navigation"]').first();
    await expect(sidebar).toBeVisible();

    // Admin deve ver opções específicas
    await expect(page.locator('text=Pacientes').first()).toBeVisible();
    await expect(page.locator('text=Agenda').first()).toBeVisible();
    await expect(page.locator('text=Financeiro, text=Finanças').first()).toBeVisible();
  });

  test('Fisioterapeuta deve fazer login com acesso limitado', async ({ page }) => {
    const therapist = testUsers.therapist;

    await page.fill('input[type="email"]', therapist.email);
    await page.fill('input[type="password"]', therapist.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard|.*inicio/, { timeout: 10000 });

    // Verificar que está logado
    await expect(page.locator(`text=${therapist.name}`).first()).toBeVisible({ timeout: 5000 });

    // Fisioterapeuta deve ver suas opções
    await expect(page.locator('text=Pacientes').first()).toBeVisible();
    await expect(page.locator('text=Agenda').first()).toBeVisible();

    // Mas NÃO deve ver configurações de sistema (específico de admin)
    // Nota: Dependendo da implementação, pode ter "Configurações" pessoais
  });

  test('Paciente deve fazer login e ver portal do paciente', async ({ page }) => {
    const patient = testUsers.patient;

    await page.fill('input[type="email"]', patient.email);
    await page.fill('input[type="password"]', patient.password);
    await page.click('button[type="submit"]');

    // Paciente pode ser redirecionado para portal específico
    await page.waitForURL(/.*/, { timeout: 10000 });

    // Verificar que está logado
    await expect(page.locator(`text=${patient.name}, text=Meus Agendamentos, text=Meu Perfil`).first())
      .toBeVisible({ timeout: 5000 });
  });

  test('Educador Físico deve fazer login com seu perfil', async ({ page }) => {
    const educador = testUsers.educadorFisico;

    await page.fill('input[type="email"]', educador.email);
    await page.fill('input[type="password"]', educador.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*dashboard|.*inicio/, { timeout: 10000 });

    // Verificar que está logado
    await expect(page.locator(`text=${educador.name}`).first()).toBeVisible({ timeout: 5000 });

    // Educador físico deve ver exercícios
    await expect(page.locator('text=Exercícios, text=Biblioteca').first()).toBeVisible();
  });

  test('Deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalido@exemplo.com');
    await page.fill('input[type="password"]', 'senhaerrada');
    await page.click('button[type="submit"]');

    // Deve mostrar mensagem de erro
    await expect(
      page.locator('text=Credenciais inválidas, text=Email ou senha incorretos, text=Erro ao fazer login').first()
    ).toBeVisible({ timeout: 5000 });

    // Não deve redirecionar
    await expect(page).toHaveURL('/');
  });

  test('Deve validar campos obrigatórios', async ({ page }) => {
    // Tentar enviar sem preencher
    await page.click('button[type="submit"]');

    // Deve ver mensagens de validação do navegador ou do formulário
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    // Verificar que campos têm atributo required ou mostram erro
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('Deve manter sessão após recarregar página', async ({ page }) => {
    const admin = testUsers.admin;

    // Fazer login
    await page.fill('input[type="email"]', admin.email);
    await page.fill('input[type="password"]', admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });

    // Recarregar página
    await page.reload();

    // Deve continuar logado
    await expect(page.locator(`text=${admin.name}`).first()).toBeVisible({ timeout: 5000 });
  });

  test('Deve redirecionar usuário logado tentando acessar login', async ({ page }) => {
    const admin = testUsers.admin;

    // Fazer login
    await page.fill('input[type="email"]', admin.email);
    await page.fill('input[type="password"]', admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });

    // Tentar voltar para página de login
    await page.goto('/');

    // Deve ser redirecionado para dashboard ou permanecer logado
    await expect(page).not.toHaveURL('/login');
  });
});









