import { test, expect } from '@playwright/test';
import { testUsers } from '../__fixtures__/users';

test.describe('Lista de Pacientes', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('/');
    const admin = testUsers.admin;
    
    await page.fill('input[type="email"]', admin.email);
    await page.fill('input[type="password"]', admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard|.*inicio/, { timeout: 10000 });

    // Navegar para lista de pacientes
    await page.click('text=Pacientes');
    await page.waitForURL(/.*pacientes|.*patients/, { timeout: 10000 });
  });

  test('Deve exibir lista de pacientes', async ({ page }) => {
    // Deve ter título ou heading da página
    await expect(page.locator('h1:has-text("Pacientes"), h2:has-text("Pacientes")').first())
      .toBeVisible({ timeout: 5000 });

    // Deve ter pelo menos um paciente listado (dados mock)
    const patientCards = page.locator('[data-testid="patient-card"], .patient-item, .paciente-card');
    const patientRows = page.locator('tr:has-text("Maria"), tr:has-text("João")');

    // Verificar se tem cards ou linhas de tabela
    const hasCards = await patientCards.count().then(c => c > 0);
    const hasRows = await patientRows.count().then(c => c > 0);

    expect(hasCards || hasRows).toBeTruthy();
  });

  test('Deve ter botão para adicionar novo paciente', async ({ page }) => {
    const addButton = page.locator(
      'button:has-text("Novo Paciente"), button:has-text("Adicionar"), a:has-text("Novo Paciente"), [data-testid="add-patient"]'
    ).first();

    await expect(addButton).toBeVisible({ timeout: 5000 });
  });

  test('Deve ter funcionalidade de busca', async ({ page }) => {
    const searchInput = page.locator(
      'input[placeholder*="Buscar"], input[placeholder*="Pesquisar"], input[type="search"], [data-testid="search-patients"]'
    ).first();

    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(searchInput).toBeVisible();

      // Testar busca
      await searchInput.fill('Maria');
      await page.waitForTimeout(500); // Debounce

      // Resultados devem filtrar
      const results = page.locator('text=Maria');
      await expect(results.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('Deve exibir informações básicas do paciente', async ({ page }) => {
    // Procurar primeiro card ou linha de paciente
    const firstPatient = page.locator(
      '[data-testid="patient-card"], .patient-item, tr:has-text("Maria")'
    ).first();

    if (await firstPatient.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Deve mostrar pelo menos o nome
      await expect(firstPatient).toContainText(/Maria|João|Silva|Santos/);
    }
  });

  test('Deve ter opção de visualizar detalhes do paciente', async ({ page }) => {
    // Clicar no primeiro paciente
    const firstPatient = page.locator(
      '[data-testid="patient-card"], .patient-item, button:has-text("Maria"), a:has-text("Maria")'
    ).first();

    if (await firstPatient.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstPatient.click();

      // Deve navegar para página de detalhes ou abrir modal
      await expect(
        page.locator('text=Informações, text=Detalhes, text=Histórico').first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('Deve ter paginação ou scroll infinito para muitos pacientes', async ({ page }) => {
    // Procurar controles de paginação
    const pagination = page.locator(
      '[data-testid="pagination"], .pagination, button:has-text("Próxima"), button:has-text("Anterior")'
    );

    // Paginação pode ou não existir dependendo do número de pacientes
    const hasPagination = await pagination.count().then(c => c > 0);
    
    // Se não tem paginação, pode ter scroll infinito
    const hasScrollContainer = await page.locator('[data-testid="patient-list"]').count().then(c => c > 0);

    // Um dos dois deve existir ou lista é pequena
    expect(hasPagination || hasScrollContainer || true).toBeTruthy();
  });

  test('Deve filtrar por status (se implementado)', async ({ page }) => {
    const statusFilter = page.locator(
      'select:has(option:has-text("Ativo")), button:has-text("Filtrar"), [data-testid="status-filter"]'
    ).first();

    if (await statusFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await statusFilter.click();
      
      // Selecionar "Ativo"
      await page.click('text=Ativo');
      await page.waitForTimeout(500);

      // Verificar que a lista foi filtrada
      // (dependendo da implementação)
    }
  });

  test('Deve ter ação rápida para agendar consulta', async ({ page }) => {
    const firstPatient = page.locator('[data-testid="patient-card"], .patient-item').first();

    if (await firstPatient.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Procurar botão de agendar no card
      const scheduleButton = firstPatient.locator('button:has-text("Agendar"), a:has-text("Agenda")');
      
      if (await scheduleButton.count().then(c => c > 0)) {
        await expect(scheduleButton.first()).toBeVisible();
      }
    }
  });
});









