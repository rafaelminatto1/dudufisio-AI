/**
 * Testes E2E - Risk Stratification Module
 * Testa fluxo completo de uso do módulo de estratificação de risco
 */

import { test, expect } from '@playwright/test';

test.describe('Risk Stratification Module', () => {
  // Setup: Login antes de cada teste
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    
    // Login como fisioterapeuta
    await page.fill('[name="email"]', 'fisio@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento para dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('deve carregar página de estratificação de risco', async ({ page }) => {
    // Navegar para módulo (usando ID de paciente de teste)
    await page.goto('http://localhost:5173/risk-stratification/test-patient-id');
    
    // Verificar elementos principais da página
    await expect(page.locator('h1')).toContainText('Estratificação de Risco');
    await expect(page.locator('[data-testid="risk-dashboard"]')).toBeVisible();
  });

  test('deve criar nova avaliação de risco', async ({ page }) => {
    await page.goto('http://localhost:5173/risk-stratification/test-patient-id');
    
    // Clicar em "Nova Avaliação"
    await page.click('button:has-text("Nova Avaliação")');
    
    // Aguardar modal abrir
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Preencher formulário
    await page.selectOption('[name="risk_type"]', 'fall');
    await page.fill('[name="score"]', '75');
    
    // Salvar
    await page.click('button:has-text("Salvar")');
    
    // Verificar toast de sucesso
    await expect(page.locator('.Toastify__toast--success')).toBeVisible();
    
    // Verificar se nova avaliação aparece na lista
    await expect(page.locator('.assessment-card').first()).toBeVisible();
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    await page.goto('http://localhost:5173/risk-stratification/test-patient-id');
    
    await page.click('button:has-text("Nova Avaliação")');
    
    // Tentar salvar sem preencher
    await page.click('button:has-text("Salvar")');
    
    // Verificar mensagens de erro
    await expect(page.locator('.error-message')).toHaveCount(2);
  });

  test('deve filtrar avaliações por tipo de risco', async ({ page }) => {
    await page.goto('http://localhost:5173/risk-stratification/test-patient-id');
    
    // Selecionar filtro
    await page.selectOption('[name="filter_type"]', 'fall');
    
    // Aguardar atualização
    await page.waitForTimeout(500);
    
    // Verificar que apenas avaliações de queda aparecem
    const cards = await page.locator('.assessment-card').all();
    
    for (const card of cards) {
      await expect(card.locator('.risk-type')).toContainText('Queda');
    }
  });

  test('deve exportar relatório em PDF', async ({ page }) => {
    await page.goto('http://localhost:5173/risk-stratification/test-patient-id');
    
    // Configurar listener para download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Exportar PDF")'),
    ]);
    
    // Verificar arquivo baixado
    expect(download.suggestedFilename()).toContain('.pdf');
    expect(download.suggestedFilename()).toContain('risk');
  });

  test('deve exibir gráfico de tendências', async ({ page }) => {
    await page.goto('http://localhost:5173/risk-stratification/test-patient-id');
    
    // Scroll até seção de gráficos
    await page.locator('[data-testid="trends-chart"]').scrollIntoViewIfNeeded();
    
    // Verificar que gráfico renderizou
    await expect(page.locator('[data-testid="trends-chart"] svg')).toBeVisible();
    
    // Verificar elementos do gráfico (eixos, linhas, etc)
    await expect(page.locator('.recharts-line')).toBeVisible();
  });

  test('deve editar avaliação existente', async ({ page }) => {
    await page.goto('http://localhost:5173/risk-stratification/test-patient-id');
    
    // Clicar em primeira avaliação
    await page.click('.assessment-card:first-child button[aria-label="Editar"]');
    
    // Aguardar modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Verificar que campos estão preenchidos
    const scoreInput = page.locator('[name="score"]');
    await expect(scoreInput).not.toHaveValue('');
    
    // Editar score
    await scoreInput.fill('85');
    
    // Salvar
    await page.click('button:has-text("Atualizar")');
    
    // Verificar sucesso
    await expect(page.locator('.Toastify__toast--success')).toBeVisible();
  });

  test('deve deletar avaliação com confirmação', async ({ page }) => {
    await page.goto('http://localhost:5173/risk-stratification/test-patient-id');
    
    // Contar avaliações iniciais
    const initialCount = await page.locator('.assessment-card').count();
    
    // Clicar em deletar
    await page.click('.assessment-card:first-child button[aria-label="Deletar"]');
    
    // Aguardar dialog de confirmação
    await expect(page.locator('[role="alertdialog"]')).toBeVisible();
    await expect(page.locator('text=Tem certeza')).toBeVisible();
    
    // Confirmar
    await page.click('button:has-text("Confirmar")');
    
    // Verificar que foi removida
    await waitFor(async () => {
      const newCount = await page.locator('.assessment-card').count();
      expect(newCount).toBe(initialCount - 1);
    });
  });

  test('deve exibir alertas de alto risco', async ({ page }) => {
    await page.goto('http://localhost:5173/risk-stratification/test-patient-id');
    
    // Criar avaliação com risco alto
    await page.click('button:has-text("Nova Avaliação")');
    await page.selectOption('[name="risk_type"]', 'fall');
    await page.fill('[name="score"]', '95');
    await page.click('button:has-text("Salvar")');
    
    // Aguardar processamento
    await page.waitForTimeout(1000);
    
    // Verificar se alerta foi criado
    await expect(page.locator('[data-testid="risk-alert"]')).toBeVisible();
    await expect(page.locator('[data-testid="risk-alert"]')).toHaveClass(/alert-critical|alert-high/);
  });

  test('deve ser responsivo em mobile', async ({ page }) => {
    // Redimensionar para mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:5173/risk-stratification/test-patient-id');
    
    // Verificar que elementos principais estão visíveis
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.assessment-card').first()).toBeVisible();
    
    // Verificar que não há scroll horizontal
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBe(clientWidth);
  });
});




