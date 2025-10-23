import { test, expect } from '@playwright/test';

test.describe('Tela de Login', () => {
  test('deve exibir a tela de login ao acessar a aplicação', async ({ page }) => {
    // Navegar para a página inicial
    await page.goto('http://localhost:5176');
    
    // Aguardar carregamento completo
    await page.waitForLoadState('networkidle');
    
    // Verificar se a tela de login está visível
    // Procurar por elementos típicos da tela de login
    const loginElements = [
      'text=Bem-vindo',
      'text=Login',
      'text=Entrar',
      'input[type="email"]',
      'input[type="password"]',
      'button[type="submit"]',
    ];
    
    let loginScreenVisible = false;
    for (const selector of loginElements) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        loginScreenVisible = true;
        console.log(`✅ Elemento de login encontrado: ${selector}`);
        break;
      } catch (e) {
        console.log(`⏭️ Elemento não encontrado: ${selector}`);
      }
    }
    
    expect(loginScreenVisible).toBeTruthy();
    
    // Tirar screenshot para debug
    await page.screenshot({ path: 'tests/screenshots/login-screen.png', fullPage: true });
    
    console.log('✅ Tela de login está visível');
  });

  test('não deve estar logado automaticamente', async ({ page }) => {
    // Navegar para a página inicial
    await page.goto('http://localhost:5176');
    
    // Aguardar carregamento
    await page.waitForLoadState('networkidle');
    
    // Verificar que NÃO está no dashboard (elementos do dashboard não devem estar visíveis)
    const dashboardElements = [
      'text=Dashboard',
      'text=Pacientes',
      'text=Agenda',
      'text=Financeiro',
    ];
    
    for (const selector of dashboardElements) {
      const elementExists = await page.locator(selector).count() > 0;
      if (elementExists) {
        console.log(`❌ FALHOU: Elemento do dashboard encontrado: ${selector}`);
        console.log('⚠️ Sistema está fazendo login automático!');
        
        // Tirar screenshot para debug
        await page.screenshot({ path: 'tests/screenshots/auto-login-bug.png', fullPage: true });
        
        expect(elementExists).toBeFalsy();
      } else {
        console.log(`✅ Elemento do dashboard não encontrado: ${selector}`);
      }
    }
    
    console.log('✅ Sistema não está fazendo login automático');
  });

  test('deve permitir login com credenciais demo', async ({ page }) => {
    // Navegar para a página inicial
    await page.goto('http://localhost:5176');
    
    // Aguardar carregamento
    await page.waitForLoadState('networkidle');
    
    // Procurar pelo botão de contas demo
    try {
      const demoButton = page.locator('text=Contas de Demonstração');
      await demoButton.waitFor({ timeout: 5000 });
      await demoButton.click();
      
      console.log('✅ Botão de contas demo encontrado e clicado');
      
      // Procurar pelo card de administrador
      const adminCard = page.locator('text=Administrador').first();
      await adminCard.waitFor({ timeout: 5000 });
      await adminCard.click();
      
      console.log('✅ Card de administrador clicado');
      
      // Aguardar redirecionamento para o dashboard
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      
      console.log('✅ Redirecionado para o dashboard após login');
      
      // Verificar se está no dashboard
      await expect(page.locator('text=Dashboard')).toBeVisible();
      
      // Tirar screenshot
      await page.screenshot({ path: 'tests/screenshots/after-login.png', fullPage: true });
      
    } catch (e) {
      console.log(`❌ Erro ao tentar fazer login: ${e}`);
      await page.screenshot({ path: 'tests/screenshots/login-error.png', fullPage: true });
      throw e;
    }
  });
});

