import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('Navegação Completa do Sistema', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[name="email"]', 'therapist@dudufisio.com')
    await page.fill('input[name="password"]', 'Teste@123')
    await page.click('button:has-text("Entrar")')
    await page.waitForURL(/dashboard/)
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
      
      // Verificar que a página carregou
      await expect(page.locator('h2, h3')).toBeVisible()
      
      console.log(`✅ ${route.title} - OK`)
    })
  }

  test('Sidebar deve ter todos os links', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    
    // Verificar alguns links importantes da sidebar
    const sidebarLinks = [
      'Dashboard',
      'Pacientes',
      'Agenda',
      'Gerar Laudo IA',
      'Analytics Clínico',
      'Gestão de Usuários',
      'Configurações',
    ]
    
    for (const linkText of sidebarLinks) {
      await expect(page.locator(`aside >> text=${linkText}`)).toBeVisible()
    }
    
    console.log('✅ Todos os links da sidebar estão presentes')
  })

  test('Deve fazer logout', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    
    // Clicar no avatar/menu do usuário
    await page.click('button:has(img[alt*="avatar"], svg)')
    
    // Clicar em logout
    await page.click('button:has-text("Log out"), text=Log out')
    
    // Verificar redirecionamento para login
    await page.waitForURL(/login/)
    await expect(page.locator('h2:has-text("FisioFlow")')).toBeVisible()
    
    console.log('✅ Logout funcionando')
  })
})

