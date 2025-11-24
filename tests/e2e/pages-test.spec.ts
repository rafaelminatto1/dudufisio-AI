import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('FisioFlow - Verificação de Páginas', () => {
  
  test('1. Página inicial deve redirecionar', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
        console.log('❌ Erro no console:', msg.text())
      }
    })

    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    
    const url = page.url()
    console.log(`✅ Página inicial carregada. URL: ${url}`)
    
    expect(url).toMatch(/\/(login|dashboard)/)
    
    if (consoleErrors.length > 0) {
      console.log(`⚠️  Total de ${consoleErrors.length} erros no console`)
    } else {
      console.log('✅ Nenhum erro no console')
    }
    
    await page.screenshot({ path: 'tests/screenshots/00-home.png', fullPage: true })
  })

  test('2. Página de login deve carregar corretamente', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
        console.log('❌ Erro no console:', msg.text())
      }
    })

    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle')
    
    // Verificar elementos
    const hasEmailInput = await page.locator('input#email').count() > 0
    const hasPasswordInput = await page.locator('input#password').count() > 0
    const hasButton = await page.locator('button:has-text("Entrar")').count() > 0
    
    console.log(`✅ Página de login carregada`)
    console.log(`   - Campo de email: ${hasEmailInput ? '✅' : '❌'}`)
    console.log(`   - Campo de senha: ${hasPasswordInput ? '✅' : '❌'}`)
    console.log(`   - Botão de entrar: ${hasButton ? '✅' : '❌'}`)
    
    expect(hasEmailInput).toBe(true)
    expect(hasPasswordInput).toBe(true)
    expect(hasButton).toBe(true)
    
    if (consoleErrors.length > 0) {
      console.log(`⚠️  Total de ${consoleErrors.length} erros no console`)
    } else {
      console.log('✅ Nenhum erro no console')
    }
    
    await page.screenshot({ path: 'tests/screenshots/01-login.png', fullPage: true })
  })

  test('3. Página de recuperação de senha', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
        console.log('❌ Erro no console:', msg.text())
      }
    })

    await page.goto(`${BASE_URL}/recuperar-senha`)
    await page.waitForLoadState('networkidle')
    
    const hasForm = await page.locator('form').count() > 0
    const hasEmailInput = await page.locator('input#email').count() > 0
    
    console.log(`✅ Página de recuperação de senha carregada`)
    console.log(`   - Formulário: ${hasForm ? '✅' : '❌'}`)
    console.log(`   - Campo de email: ${hasEmailInput ? '✅' : '❌'}`)
    
    expect(hasForm).toBe(true)
    expect(hasEmailInput).toBe(true)
    
    if (consoleErrors.length > 0) {
      console.log(`⚠️  Total de ${consoleErrors.length} erros no console`)
    } else {
      console.log('✅ Nenhum erro no console')
    }
    
    await page.screenshot({ path: 'tests/screenshots/02-recuperar-senha.png', fullPage: true })
  })

  test('4. Teste de responsividade - Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle')
    
    const hasEmailInput = await page.locator('input#email').count() > 0
    
    console.log(`✅ Teste mobile concluído`)
    console.log(`   - Layout mobile funcional: ${hasEmailInput ? '✅' : '❌'}`)
    
    expect(hasEmailInput).toBe(true)
    
    await page.screenshot({ path: 'tests/screenshots/03-mobile.png', fullPage: true })
  })

  test('5. Teste de responsividade - Tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle')
    
    const hasForm = await page.locator('form').count() > 0
    
    console.log(`✅ Teste tablet concluído`)
    console.log(`   - Layout tablet funcional: ${hasForm ? '✅' : '❌'}`)
    
    expect(hasForm).toBe(true)
    
    await page.screenshot({ path: 'tests/screenshots/04-tablet.png', fullPage: true })
  })
})

