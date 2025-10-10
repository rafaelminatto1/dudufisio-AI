/**
 * Testes E2E - Family Portal Module
 */

import { test, expect } from '@playwright/test';

test.describe('Family Portal Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('[name="email"]', 'fisio@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('deve adicionar membro da família', async ({ page }) => {
    await page.goto('http://localhost:5173/family-portal/test-patient-id');
    
    await page.click('button:has-text("Adicionar Membro")');
    
    // Preencher formulário
    await page.fill('[name="name"]', 'Maria Silva');
    await page.fill('[name="email"]', 'maria@example.com');
    await page.fill('[name="phone"]', '(11) 98765-4321');
    await page.selectOption('[name="relationship"]', 'spouse');
    
    // Marcar permissões
    await page.check('[name="permission_view_progress"]');
    await page.check('[name="permission_send_messages"]');
    
    await page.click('button:has-text("Adicionar")');
    
    // Verificar sucesso
    await expect(page.locator('.Toastify__toast--success')).toBeVisible();
    await expect(page.locator('.family-member-card').first()).toBeVisible();
  });

  test('deve configurar permissões de membro', async ({ page }) => {
    await page.goto('http://localhost:5173/family-portal/test-patient-id');
    
    // Clicar em editar permissões
    await page.click('.family-member-card:first-child button[aria-label="Editar Permissões"]');
    
    // Verificar modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Alterar permissões
    await page.check('[name="permission_view_schedule"]');
    await page.uncheck('[name="permission_send_messages"]');
    
    await page.click('button:has-text("Salvar Permissões")');
    
    // Verificar atualização
    await expect(page.locator('.Toastify__toast--success')).toBeVisible();
  });

  test('deve enviar mensagem para terapeuta', async ({ page }) => {
    await page.goto('http://localhost:5173/family-portal/test-patient-id');
    
    // Navegar para mensagens
    await page.click('text=Mensagens');
    
    // Nova mensagem
    await page.click('button:has-text("Nova Mensagem")');
    
    await page.fill('[name="subject"]', 'Dúvida sobre tratamento');
    await page.fill('[name="message"]', 'Gostaria de saber sobre a evolução do tratamento.');
    
    await page.click('button:has-text("Enviar")');
    
    // Verificar mensagem enviada
    await expect(page.locator('.Toastify__toast--success')).toBeVisible();
    await expect(page.locator('.message-card').first()).toContainText('Dúvida sobre tratamento');
  });

  test('deve exibir logs de acesso (LGPD)', async ({ page }) => {
    await page.goto('http://localhost:5173/family-portal/test-patient-id');
    
    // Navegar para logs
    await page.click('text=Logs de Acesso');
    
    // Verificar que logs aparecem
    await expect(page.locator('[data-testid="access-log"]').first()).toBeVisible();
    
    // Verificar informações do log
    await expect(page.locator('[data-testid="access-log"]').first()).toContainText('IP:');
    await expect(page.locator('[data-testid="access-log"]').first()).toContainText('Data:');
    await expect(page.locator('[data-testid="access-log"]').first()).toContainText('Ação:');
  });

  test('deve revogar acesso de membro', async ({ page }) => {
    await page.goto('http://localhost:5173/family-portal/test-patient-id');
    
    const initialCount = await page.locator('.family-member-card').count();
    
    // Clicar em revogar
    await page.click('.family-member-card:first-child button[aria-label="Revogar Acesso"]');
    
    // Confirmar
    await expect(page.locator('[role="alertdialog"]')).toBeVisible();
    await page.click('button:has-text("Confirmar")');
    
    // Verificar que membro foi desativado
    await expect(page.locator('.Toastify__toast--success')).toBeVisible();
  });
});








