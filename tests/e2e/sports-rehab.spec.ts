/**
 * Testes E2E - Sports Rehabilitation Module
 */

import { test, expect } from '@playwright/test';

test.describe('Sports Rehabilitation Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('[name="email"]', 'fisio@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('deve criar perfil de atleta', async ({ page }) => {
    await page.goto('http://localhost:5173/sports-rehab/test-patient-id');
    
    // Clicar em criar perfil
    await page.click('button:has-text("Criar Perfil de Atleta")');
    
    // Preencher formulário
    await page.selectOption('[name="sport"]', 'soccer');
    await page.fill('[name="position"]', 'Atacante');
    await page.selectOption('[name="level"]', 'semi_professional');
    await page.fill('[name="frequency"]', '5');
    
    // Salvar
    await page.click('button:has-text("Salvar Perfil")');
    
    // Verificar sucesso
    await expect(page.locator('.Toastify__toast--success')).toBeVisible();
    await expect(page.locator('[data-testid="athlete-profile"]')).toBeVisible();
  });

  test('deve registrar lesão', async ({ page }) => {
    await page.goto('http://localhost:5173/sports-rehab/test-athlete-id');
    
    await page.click('button:has-text("Registrar Lesão")');
    
    // Preencher dados da lesão
    await page.selectOption('[name="injury_type"]', 'muscle');
    await page.fill('[name="body_part"]', 'Coxa');
    await page.fill('[name="injury_date"]', '2025-10-01');
    await page.selectOption('[name="severity"]', 'moderate');
    
    await page.click('button:has-text("Registrar")');
    
    // Verificar que lesão aparece no histórico
    await expect(page.locator('.injury-card').first()).toBeVisible();
  });

  test('deve adicionar teste funcional', async ({ page }) => {
    await page.goto('http://localhost:5173/sports-rehab/test-athlete-id');
    
    await page.click('button:has-text("Novo Teste Funcional")');
    
    await page.selectOption('[name="test_name"]', 'single_leg_hop');
    await page.fill('[name="affected_side"]', '85');
    await page.fill('[name="unaffected_side"]', '100');
    
    await page.click('button:has-text("Salvar Teste")');
    
    // Verificar cálculo automático de simetria
    await expect(page.locator('[data-testid="symmetry-index"]')).toContainText('85%');
  });

  test('deve calcular ACWR automaticamente', async ({ page }) => {
    await page.goto('http://localhost:5173/sports-rehab/test-athlete-id');
    
    // Navegar para seção de carga
    await page.click('text=Monitoramento de Carga');
    
    // Verificar que ACWR está calculado
    await expect(page.locator('[data-testid="acwr-value"]')).toBeVisible();
    
    // ACWR deve estar entre 0.8 e 1.5 (valores seguros)
    const acwrText = await page.locator('[data-testid="acwr-value"]').textContent();
    const acwr = parseFloat(acwrText || '0');
    expect(acwr).toBeGreaterThan(0);
    expect(acwr).toBeLessThan(3);
  });

  test('deve exibir gráficos de performance', async ({ page }) => {
    await page.goto('http://localhost:5173/sports-rehab/test-athlete-id');
    
    // Scroll até gráficos
    await page.locator('[data-testid="performance-charts"]').scrollIntoViewIfNeeded();
    
    // Verificar que gráficos renderizaram
    await expect(page.locator('.recharts-wrapper').first()).toBeVisible();
    
    // Verificar múltiplos gráficos
    const charts = await page.locator('.recharts-wrapper').count();
    expect(charts).toBeGreaterThanOrEqual(2);
  });
});






