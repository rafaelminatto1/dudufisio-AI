import { test, expect } from '@playwright/test'

// Configurações de teste
const BASE_URL = 'http://localhost:3000'
const TEST_USER = {
  email: 'cursor@moocafisio.com.br',
  password: '256256' // Credenciais corretas para testes
}

test.describe('FisioFlow Next.js - Teste Completo', () => {
  
  test.describe.configure({ mode: 'serial' })

  test('1. Deve carregar a página inicial e redirecionar para login', async ({ page }) => {
    // Capturar erros de console
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto(BASE_URL)
    
    // Deve redirecionar para /dashboard ou /login
    await page.waitForURL(/\/(login|dashboard)/)
    
    console.log('✅ Página inicial carregada')
    console.log(`📍 URL atual: ${page.url()}`)
    
    if (consoleErrors.length > 0) {
      console.log('⚠️  Erros no console:', consoleErrors)
    }
  })

  test('2. Deve exibir a página de login corretamente', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto(`${BASE_URL}/login`)
    
    // Verificar elementos da página
    await expect(page.locator('input#email')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('input#password')).toBeVisible()
    await expect(page.locator('button:has-text("Entrar")')).toBeVisible()
    
    console.log('✅ Página de login carregada corretamente')
    
    // Screenshot
    await page.screenshot({ path: 'tests/screenshots/01-login-page.png', fullPage: true })
    
    if (consoleErrors.length > 0) {
      console.log('⚠️  Erros no console:', consoleErrors)
    }
  })

  test('3. Deve testar recuperação de senha', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    
    // Clicar em "Esqueceu sua senha?"
    await page.click('a:has-text("Esqueceu sua senha?")')
    
    await expect(page).toHaveURL(/recuperar-senha/)
    await expect(page.locator('text=Recuperar Senha')).toBeVisible()
    await expect(page.locator('input#email')).toBeVisible()
    
    console.log('✅ Página de recuperação de senha carregada')
    await page.screenshot({ path: 'tests/screenshots/02-recuperar-senha.png', fullPage: true })
  })

  test('4. Deve fazer login com credenciais válidas', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto(`${BASE_URL}/login`)
    
    // Preencher formulário
    await page.fill('input#email', TEST_USER.email)
    await page.fill('input#password', TEST_USER.password)
    
    // Clicar em entrar
    await page.click('button:has-text("Entrar")')
    
    // Aguardar redirecionamento para dashboard
    await page.waitForURL(/dashboard/, { timeout: 15000 })
    
    console.log('✅ Login realizado com sucesso')
    console.log(`📍 Redirecionado para: ${page.url()}`)
    
    if (consoleErrors.length > 0) {
      console.log('⚠️  Erros no console após login:', consoleErrors)
    }
  })

  test('5. Deve exibir dashboard principal', async ({ page, context }) => {
    // Fazer login primeiro
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input#email', TEST_USER.email)
    await page.fill('input#password', TEST_USER.password)
    await page.click('button:has-text("Entrar")')
    await page.waitForURL(/dashboard/)
    
    // Verificar elementos do dashboard
    await expect(page.locator('text=Dashboard')).toBeVisible()
    await expect(page.locator('text=Bem-vindo')).toBeVisible()
    
    // Verificar cards de métricas
    await expect(page.locator('text=Pacientes Ativos')).toBeVisible()
    await expect(page.locator('text=Consultas Hoje')).toBeVisible()
    
    // Verificar sidebar
    await expect(page.locator('text=Pacientes')).toBeVisible()
    await expect(page.locator('text=Agenda')).toBeVisible()
    await expect(page.locator('text=Tratamentos')).toBeVisible()
    await expect(page.locator('text=Financeiro')).toBeVisible()
    
    console.log('✅ Dashboard principal carregado corretamente')
    await page.screenshot({ path: 'tests/screenshots/03-dashboard.png', fullPage: true })
  })

  test('6. Deve navegar para módulo de Pacientes', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input#email', TEST_USER.email)
    await page.fill('input#password', TEST_USER.password)
    await page.click('button:has-text("Entrar")')
    await page.waitForURL(/dashboard/)
    
    // Navegar para pacientes
    await page.click('a:has-text("Pacientes")')
    await expect(page).toHaveURL(/pacientes/)
    
    // Verificar elementos da página
    await expect(page.locator('h1:has-text("Pacientes")')).toBeVisible()
    await expect(page.locator('button:has-text("Novo Paciente")')).toBeVisible()
    
    console.log('✅ Módulo de Pacientes carregado')
    await page.screenshot({ path: 'tests/screenshots/04-pacientes.png', fullPage: true })
  })

  test('7. Deve navegar para módulo de Agenda', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input#email', TEST_USER.email)
    await page.fill('input#password', TEST_USER.password)
    await page.click('button:has-text("Entrar")')
    await page.waitForURL(/dashboard/)
    
    // Navegar para agenda
    await page.click('a:has-text("Agenda")')
    await expect(page).toHaveURL(/agenda/)
    
    // Verificar elementos
    await expect(page.locator('h1:has-text("Agenda")')).toBeVisible()
    
    console.log('✅ Módulo de Agenda carregado')
    await page.screenshot({ path: 'tests/screenshots/05-agenda.png', fullPage: true })
  })

  test('8. Deve navegar para módulo de Tratamentos', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input#email', TEST_USER.email)
    await page.fill('input#password', TEST_USER.password)
    await page.click('button:has-text("Entrar")')
    await page.waitForURL(/dashboard/)
    
    // Navegar para tratamentos
    await page.click('a:has-text("Tratamentos")')
    await expect(page).toHaveURL(/tratamentos/)
    
    await expect(page.locator('h1:has-text("Tratamentos")')).toBeVisible()
    
    console.log('✅ Módulo de Tratamentos carregado')
    await page.screenshot({ path: 'tests/screenshots/06-tratamentos.png', fullPage: true })
  })

  test('9. Deve navegar para módulo Financeiro', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input#email', TEST_USER.email)
    await page.fill('input#password', TEST_USER.password)
    await page.click('button:has-text("Entrar")')
    await page.waitForURL(/dashboard/)
    
    // Navegar para financeiro
    await page.click('a:has-text("Financeiro")')
    await expect(page).toHaveURL(/financeiro/)
    
    await expect(page.locator('h1:has-text("Financeiro")')).toBeVisible()
    await expect(page.locator('text=Receita Total')).toBeVisible()
    
    console.log('✅ Módulo Financeiro carregado')
    await page.screenshot({ path: 'tests/screenshots/07-financeiro.png', fullPage: true })
  })

  test('10. Deve verificar responsividade mobile', async ({ page }) => {
    // Configurar viewport mobile
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Login
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input#email', TEST_USER.email)
    await page.fill('input#password', TEST_USER.password)
    await page.click('button:has-text("Entrar")')
    await page.waitForURL(/dashboard/)
    
    // Verificar que o conteúdo está visível
    await expect(page.locator('text=Dashboard')).toBeVisible()
    
    console.log('✅ Layout mobile funcional')
    await page.screenshot({ path: 'tests/screenshots/08-mobile-dashboard.png', fullPage: true })
  })
})

