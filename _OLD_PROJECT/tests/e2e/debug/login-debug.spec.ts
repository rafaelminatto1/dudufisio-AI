import { test, expect } from '@playwright/test';
import { testUsers } from '../__fixtures__/users';

/**
 * Teste de Debug - Login
 *
 * Este teste ajuda a diagnosticar problemas com o login
 */

test.describe('Debug - Login Flow', () => {
  test('Debug: Verificar estrutura da página de login', async ({ page }) => {
    // Habilitar logs detalhados
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error.message));

    // Navegar para página inicial
    await page.goto('/', { waitUntil: 'networkidle' });

    // Tirar screenshot da página inicial
    await page.screenshot({ path: 'test-results/debug-1-homepage.png', fullPage: true });

    console.log('URL atual:', page.url());
    console.log('Título:', await page.title());

    // Verificar se existem inputs de email e password
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button[type="submit"], button:has-text("Entrar")');

    console.log('Email input count:', await emailInput.count());
    console.log('Password input count:', await passwordInput.count());
    console.log('Submit button count:', await submitButton.count());

    // Verificar atributos dos inputs
    if (await emailInput.first().isVisible()) {
      console.log('Email input visible:', true);
      console.log('Email input name:', await emailInput.first().getAttribute('name'));
      console.log('Email input placeholder:', await emailInput.first().getAttribute('placeholder'));
    }

    if (await passwordInput.first().isVisible()) {
      console.log('Password input visible:', true);
      console.log('Password input name:', await passwordInput.first().getAttribute('name'));
    }

    // Pegar HTML da página
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('Body HTML length:', bodyHTML.length);

    // Procurar por formulário
    const forms = page.locator('form');
    console.log('Forms count:', await forms.count());

    if (await forms.count() > 0) {
      const formHTML = await forms.first().innerHTML();
      console.log('Form HTML:', formHTML.substring(0, 500));
    }
  });

  test('Debug: Tentar fazer login e capturar erros', async ({ page }) => {
    // Habilitar logs
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', error => console.error('ERROR:', error.message));
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log('HTTP ERROR:', response.status(), response.url());
      }
    });

    // Navegar para página inicial
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Aguardar carregamento completo

    console.log('=== Iniciando processo de login ===');

    // Preencher email
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 5000 });
    await emailInput.fill(testUsers.admin.email);
    console.log('Email preenchido:', testUsers.admin.email);

    // Tirar screenshot após preencher email
    await page.screenshot({ path: 'test-results/debug-2-email-filled.png' });

    // Preencher password
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.waitFor({ state: 'visible', timeout: 5000 });
    await passwordInput.fill(testUsers.admin.password);
    console.log('Password preenchido');

    // Tirar screenshot antes de submeter
    await page.screenshot({ path: 'test-results/debug-3-before-submit.png' });

    // Clicar no botão de submit
    const submitButton = page.locator('button[type="submit"], button:has-text("Entrar")').first();
    console.log('Submit button visible:', await submitButton.isVisible());
    await submitButton.click();
    console.log('Submit button clicado');

    // Aguardar e ver o que acontece
    await page.waitForTimeout(3000);

    // Tirar screenshot após submit
    await page.screenshot({ path: 'test-results/debug-4-after-submit.png', fullPage: true });

    console.log('URL após submit:', page.url());
    console.log('Título após submit:', await page.title());

    // Verificar se há mensagens de erro
    const errorMessages = page.locator('[class*="error"], [role="alert"], .text-red-500, .text-red-600');
    const errorCount = await errorMessages.count();
    console.log('Mensagens de erro encontradas:', errorCount);

    if (errorCount > 0) {
      for (let i = 0; i < Math.min(errorCount, 3); i++) {
        const errorText = await errorMessages.nth(i).textContent();
        console.log(`Erro ${i + 1}:`, errorText);
      }
    }

    // Verificar se redirecionou
    const currentURL = page.url();
    if (currentURL.includes('dashboard') || currentURL.includes('inicio')) {
      console.log('✅ Redirecionamento detectado para:', currentURL);
    } else {
      console.log('❌ Sem redirecionamento. URL atual:', currentURL);
    }

    // Procurar por nome do usuário na página
    const userName = page.locator(`text=${testUsers.admin.name}`);
    const userNameCount = await userName.count();
    console.log(`Nome do usuário "${testUsers.admin.name}" encontrado:`, userNameCount, 'vezes');

    // Verificar elementos da página atual
    const h1Elements = page.locator('h1, h2');
    const h1Count = await h1Elements.count();
    console.log('Títulos (h1/h2) na página:', h1Count);

    if (h1Count > 0) {
      for (let i = 0; i < Math.min(h1Count, 3); i++) {
        const title = await h1Elements.nth(i).textContent();
        console.log(`Título ${i + 1}:`, title);
      }
    }
  });

  test('Debug: Verificar autenticação com Supabase', async ({ page }) => {
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('supabase') || text.includes('auth') || text.includes('login')) {
        console.log('AUTH LOG:', text);
      }
    });

    page.on('request', request => {
      const url = request.url();
      if (url.includes('supabase') || url.includes('auth')) {
        console.log('AUTH REQUEST:', request.method(), url);
      }
    });

    page.on('response', response => {
      const url = response.url();
      if (url.includes('supabase') || url.includes('auth')) {
        console.log('AUTH RESPONSE:', response.status(), url);
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Tentar login
    await page.fill('input[type="email"]', testUsers.admin.email);
    await page.fill('input[type="password"]', testUsers.admin.password);
    await page.click('button[type="submit"]');

    // Aguardar resposta
    await page.waitForTimeout(5000);

    console.log('URL final:', page.url());
  });

  test('Debug: Testar com conta de demo', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER:', msg.text()));

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'test-results/debug-5-demo-start.png' });

    // Procurar botão de demo
    const demoButton = page.locator('button:has-text("Demo"), button:has-text("Teste"), text=Contas de demonstração');
    const demoCount = await demoButton.count();
    console.log('Botões de demo encontrados:', demoCount);

    if (demoCount > 0) {
      await demoButton.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/debug-6-demo-clicked.png' });
    }

    // Verificar se credenciais foram preenchidas
    const emailValue = await page.locator('input[type="email"]').first().inputValue();
    const passwordValue = await page.locator('input[type="password"]').first().inputValue();

    console.log('Email após demo:', emailValue);
    console.log('Password após demo:', passwordValue ? '***' : 'vazio');
  });
});
