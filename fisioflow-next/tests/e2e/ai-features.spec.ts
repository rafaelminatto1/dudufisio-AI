import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('Ferramentas de IA', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[name="email"]', 'therapist@dudufisio.com')
    await page.fill('input[name="password"]', 'Teste@123')
    await page.click('button:has-text("Entrar")')
    await page.waitForURL(/dashboard/)
  })

  test('Deve carregar página de geração de laudo', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/ai/laudo`)
    
    // Verificar elementos da página
    await expect(page.locator('h2:has-text("Gerar Laudo com IA")')).toBeVisible()
    await expect(page.locator('input#patientName')).toBeVisible()
    await expect(page.locator('textarea#complaint')).toBeVisible()
    await expect(page.locator('textarea#examination')).toBeVisible()
    await expect(page.locator('button:has-text("Gerar Laudo com IA")')).toBeVisible()
    
    console.log('✅ Página de geração de laudo carregada corretamente')
  })

  test('Deve validar formulário de laudo', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/ai/laudo`)
    
    // Tentar enviar formulário vazio
    await page.click('button:has-text("Gerar Laudo com IA")')
    
    // Verificar mensagens de erro
    await expect(page.locator('text=Nome deve ter pelo menos 2 caracteres')).toBeVisible()
    
    console.log('✅ Validação de formulário funcionando')
  })

  test('Deve preencher formulário de laudo', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/ai/laudo`)
    
    // Preencher formulário
    await page.fill('input#patientName', 'João da Silva')
    await page.fill('textarea#complaint', 'Dor lombar há 3 meses, piora ao ficar em pé por muito tempo')
    await page.fill('textarea#examination', 'Dor à palpação em L4-L5, teste de Lasègue negativo, amplitude de movimento reduzida em flexão anterior')
    await page.fill('input#diagnosis', 'Lombalgia mecânica')
    
    // Verificar que os campos foram preenchidos
    await expect(page.locator('input#patientName')).toHaveValue('João da Silva')
    
    console.log('✅ Formulário de laudo preenchido')
  })
})

