import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('Navegação Completa do Sistema', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' })
    
    // Aguardar campos de formulário carregarem
    await page.waitForSelector('input#email', { timeout: 10000 })
    await page.waitForSelector('input#password', { timeout: 10000 })
    
    // Preencher formulário
    await page.fill('input#email', 'cursor@moocafisio.com.br')
    await page.fill('input#password', '256256')
    
    // Aguardar o botão estar habilitado e clicar
    const submitButton = page.locator('button:has-text("Entrar"), button[type="submit"]')
    await submitButton.waitFor({ state: 'visible', timeout: 5000 })
    
    // Fazer login e aguardar navegação
    await Promise.all([
      page.waitForURL(/\/dashboard/, { timeout: 20000 }),
      submitButton.click()
    ])
    
    // Aguardar elementos específicos do dashboard carregarem
    // O dashboard redireciona para /dashboard/agenda que tem o título "Agenda"
    await page.waitForSelector('h1:has-text("Agenda"), h1:has-text("Dashboard")', { timeout: 10000 })
    await page.waitForLoadState('networkidle')
  })

  const routes = [
    // Principal
    { path: '/dashboard', title: 'Dashboard' },
    { path: '/dashboard/admin', title: 'Admin Dashboard' },
    { path: '/dashboard/notifications', title: 'Notificações' },
    
    // Clínico
    { path: '/dashboard/pacientes', title: 'Pacientes' },
    { path: '/dashboard/agenda', title: 'Agenda' },
    { path: '/dashboard/appointments', title: 'Agendamentos' },
    
    // IA
    { path: '/dashboard/ai/laudo', title: 'Gerar Laudo com IA' },
    { path: '/dashboard/ai/evolucao', title: 'Gerar Evolução' },
    { path: '/dashboard/ai/hep', title: 'Gerador de HEP' },
    
    // Relatórios
    { path: '/dashboard/reports', title: 'Relatórios' },
    { path: '/dashboard/analytics', title: 'Analytics' },
    
    // Gestão
    { path: '/dashboard/users', title: 'Gestão de Usuários' },
    { path: '/dashboard/inventory', title: 'Inventário' },
    
    // Sistema
    { path: '/dashboard/settings', title: 'Configurações' },
  ]

  for (const route of routes) {
    test(`Deve navegar para ${route.title}`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route.path}`)
      await page.waitForLoadState('networkidle')
      
      // Verificar URL
      expect(page.url()).toContain(route.path)
      
      // Verificar que a página carregou - usar seletor mais específico
      // Aguardar qualquer heading visível (mas usar first() para evitar strict mode violation)
      const heading = page.locator('h1, h2, h3').first()
      await expect(heading).toBeVisible({ timeout: 5000 })
      
      console.log(`✅ ${route.title} - OK`)
    })
  }

  test('Sidebar deve ter todos os links', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    
    // Verificar alguns links importantes da sidebar (baseado nos links reais)
    const sidebarLinks = [
      'Dashboard',
      'Pacientes',
      'Agenda',
      'Tratamentos',
      'Configurações',
    ]
    
    for (const linkText of sidebarLinks) {
      await expect(page.locator(`aside >> text=${linkText}`)).toBeVisible()
    }
    
    console.log('✅ Todos os links da sidebar estão presentes')
  })

  test('Deve fazer logout', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForLoadState('networkidle')
    
    // Clicar no avatar/menu do usuário no header
    // O botão contém um Avatar com fallback (iniciais)
    const avatarButton = page.locator('header button:has(span), header [role="button"]:has(span)').last()
    await avatarButton.waitFor({ state: 'visible', timeout: 10000 })
    await avatarButton.click()
    
    // Aguardar menu dropdown abrir e aparecer o item "Sair"
    await page.waitForSelector('[role="menuitem"]:has-text("Sair")', { timeout: 5000 })
    
    // Clicar no item "Sair" do menu dropdown
    const logoutMenuItem = page.locator('[role="menuitem"]:has-text("Sair")').first()
    await logoutMenuItem.click()
    
    // Verificar redirecionamento para login
    await page.waitForURL(/login/, { timeout: 10000 })
    await expect(page.locator('h1:has-text("FisioFlow"), h2:has-text("FisioFlow")')).toBeVisible({ timeout: 5000 })
    
    console.log('✅ Logout funcionando')
  })
})

