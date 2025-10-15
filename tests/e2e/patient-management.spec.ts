import { test, expect } from '@playwright/test';

/**
 * FASE 2.1: Testes E2E - Cadastro Completo de Paciente
 */

test.describe('Gestão de Pacientes - Fluxo Completo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Verificar se já está logado
    const sidebar = page.locator('aside');

    try {
      await sidebar.waitFor({ state: 'visible', timeout: 2000 });
    } catch {
      // Não está logado, fazer login
      await page.fill('[data-testid="login-email"]', 'admin@dudufisio.com');
      await page.fill('[data-testid="login-password"]', 'demo123456');
      await page.click('[data-testid="login-submit"]');
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      await sidebar.waitFor({ state: 'visible', timeout: 10000 });
    }
  });

  test('Visualizar lista de pacientes', async ({ page }) => {
    // Navegar para pacientes
    await page.click('a:has-text("Pacientes")');
    await page.waitForTimeout(1500);

    // Verificar elementos da página
    await expect(page.locator('text=Lista de Pacientes')).toBeVisible();
    await expect(page.locator('button:has-text("Novo Paciente")')).toBeVisible();

    // Screenshot
    await page.screenshot({
      path: 'test-results/screenshots/patient-list.png',
      fullPage: true
    });

    console.log('✅ Lista de pacientes exibida');
  });

  test('Buscar paciente na lista', async ({ page }) => {
    await page.click('a:has-text("Pacientes")');
    await page.waitForTimeout(1500);

    // Buscar por paciente
    const searchInput = page.locator('input[placeholder*="Filtrar"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Maria');
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: 'test-results/screenshots/patient-search.png',
        fullPage: true
      });
      console.log('✅ Busca de paciente realizada');
    }
  });

  test('Abrir formulário de novo paciente', async ({ page }) => {
    await page.click('a:has-text("Pacientes")');
    await page.waitForTimeout(1500);

    // Clicar em novo paciente
    const newPatientBtn = page.locator('button:has-text("Novo Paciente")');
    if (await newPatientBtn.isVisible()) {
      await newPatientBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: 'test-results/screenshots/patient-new-form.png',
        fullPage: true
      });
      console.log('✅ Formulário de novo paciente aberto');
    }
  });

  test('Visualizar detalhes de paciente existente', async ({ page }) => {
    await page.click('a:has-text("Pacientes")');
    await page.waitForTimeout(1500);

    // Clicar no primeiro paciente da lista
    const firstPatient = page.locator('table tr').nth(1);
    if (await firstPatient.isVisible()) {
      await firstPatient.click();
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: 'test-results/screenshots/patient-details.png',
        fullPage: true
      });
      console.log('✅ Detalhes do paciente visualizados');
    }
  });
});
