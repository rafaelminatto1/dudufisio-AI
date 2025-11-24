// Exemplo de teste E2E para autenticação
// Para executar: npx playwright test

import { test, expect } from '@playwright/test'

test.describe('Autenticação', () => {
  test('deve exibir a página de login', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    
    await expect(page.locator('input#email')).toBeVisible()
    await expect(page.locator('input#password')).toBeVisible()
  })

  test('deve redirecionar para dashboard após login bem-sucedido', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    
    // Preencher formulário (usar credenciais de teste)
    await page.fill('input#email', 'cursor@moocafisio.com.br')
    await page.fill('input#password', '256256')
    
    // Clicar no botão de login
    await page.click('button:has-text("Entrar")')
    
    // Verificar redirecionamento
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 })
  })

  test('deve proteger rotas privadas', async ({ page }) => {
    // Tentar acessar dashboard sem autenticação
    await page.goto('/dashboard')
    
    // Deve redirecionar para login
    await expect(page).toHaveURL('/login')
  })
})

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Fazer login antes de cada teste
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.fill('input#email', 'cursor@moocafisio.com.br')
    await page.fill('input#password', '256256')
    await page.click('button:has-text("Entrar")')
    await page.waitForURL(/dashboard/, { timeout: 15000 })
  })

  test('deve exibir dashboard principal', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard')
    
    // Verificar cards de métricas
    await expect(page.locator('text=Pacientes Ativos')).toBeVisible()
    await expect(page.locator('text=Consultas Hoje')).toBeVisible()
  })

  test('deve navegar entre módulos', async ({ page }) => {
    // Clicar no menu de pacientes
    await page.click('a:has-text("Pacientes")')
    await expect(page).toHaveURL('/dashboard/pacientes')
    
    // Clicar no menu de agenda
    await page.click('a:has-text("Agenda")')
    await expect(page).toHaveURL('/dashboard/agenda')
  })
})

test.describe('Módulo de Pacientes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.fill('input#email', 'cursor@moocafisio.com.br')
    await page.fill('input#password', '256256')
    await page.click('button:has-text("Entrar")')
    await page.waitForURL(/dashboard/, { timeout: 15000 })
    await page.goto('/dashboard/pacientes')
  })

  test('deve exibir lista de pacientes', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Pacientes')
    await expect(page.locator('button:has-text("Novo Paciente")')).toBeVisible()
  })

  test('deve abrir formulário de novo paciente', async ({ page }) => {
    await page.click('button:has-text("Novo Paciente")')
    await expect(page).toHaveURL('/dashboard/pacientes/novo')
    
    await expect(page.locator('input[name="nome"]')).toBeVisible()
    await expect(page.locator('input#email')).toBeVisible()
  })
})

