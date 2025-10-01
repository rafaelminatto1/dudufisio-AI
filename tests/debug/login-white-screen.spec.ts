import { test, expect } from '@playwright/test';

/**
 * 🐛 Teste de Diagnóstico - Tela Branca no Login
 */

test.describe('Diagnóstico de Tela Branca', () => {
  test('diagnosticar problema de login', async ({ page }) => {
    // Captura erros do console
    const errors: string[] = [];
    const warnings: string[] = [];
    const logs: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      
      if (type === 'error') {
        errors.push(text);
        console.error('❌ Console Error:', text);
      } else if (type === 'warning') {
        warnings.push(text);
        console.warn('⚠️  Console Warning:', text);
      } else if (type === 'log') {
        logs.push(text);
        console.log('📝 Console Log:', text);
      }
    });

    // Captura erros de página
    page.on('pageerror', error => {
      console.error('💥 Page Error:', error.message);
      errors.push(error.message);
    });

    // Captura requisições falhadas
    page.on('requestfailed', request => {
      console.error('🔴 Request Failed:', request.url(), request.failure()?.errorText);
    });

    console.log('🔍 Navegando para a aplicação...');
    await page.goto('http://localhost:5175');
    await page.waitForTimeout(2000);

    // Tira screenshot do estado inicial
    await page.screenshot({ path: 'debug-initial.png', fullPage: true });
    console.log('📸 Screenshot inicial salvo: debug-initial.png');

    // Verifica se há formulário de login
    const loginForm = await page.locator('form').count();
    console.log(`📋 Formulários encontrados: ${loginForm}`);

    // Verifica elementos na página
    const bodyText = await page.locator('body').textContent();
    console.log('📄 Conteúdo da página:', bodyText?.substring(0, 200));

    // Tenta fazer login
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Formulário de login encontrado');
      
      await emailInput.fill('admin@test.com');
      await passwordInput.fill('password');
      
      console.log('🔑 Credenciais preenchidas');
      
      // Tira screenshot antes do submit
      await page.screenshot({ path: 'debug-before-login.png', fullPage: true });
      console.log('📸 Screenshot antes do login salvo');

      await submitButton.click();
      console.log('🖱️  Botão de login clicado');

      // Aguarda navegação ou erro
      await page.waitForTimeout(3000);

      // Tira screenshot depois do login
      await page.screenshot({ path: 'debug-after-login.png', fullPage: true });
      console.log('📸 Screenshot após login salvo');

      // Verifica URL atual
      const currentUrl = page.url();
      console.log('🔗 URL atual:', currentUrl);

      // Verifica conteúdo após login
      const afterLoginText = await page.locator('body').textContent();
      console.log('📄 Conteúdo após login:', afterLoginText?.substring(0, 200));

      // Verifica se ficou em branco
      const isWhiteScreen = afterLoginText?.trim().length === 0 || 
                           afterLoginText === null ||
                           afterLoginText.trim() === 'Carregando...';
      
      if (isWhiteScreen) {
        console.error('⚠️  TELA BRANCA DETECTADA!');
      }

    } else {
      console.error('❌ Formulário de login não encontrado');
    }

    // Relatório final
    console.log('\n📊 RELATÓRIO DE DIAGNÓSTICO:');
    console.log('================================');
    console.log(`Erros de Console: ${errors.length}`);
    console.log(`Avisos: ${warnings.length}`);
    console.log(`Logs: ${logs.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ ERROS ENCONTRADOS:');
      errors.forEach(err => console.log(`  - ${err}`));
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  AVISOS:');
      warnings.forEach(warn => console.log(`  - ${warn}`));
    }
  });

  test('verificar estado de contextos e providers', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForTimeout(2000);

    // Verifica providers React
    const hasReactErrors = await page.evaluate(() => {
      const errors: string[] = [];
      
      // Verifica se React está presente
      if (!(window as any).React && !(document.querySelector('[data-reactroot]'))) {
        errors.push('React pode não estar carregado corretamente');
      }

      return errors;
    });

    console.log('🔍 Verificação de React:', hasReactErrors);

    // Tenta fazer login e verifica state
    const emailInput = page.locator('input[type="email"]').first();
    
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('admin@test.com');
      await page.locator('input[type="password"]').first().fill('password');
      await page.locator('button[type="submit"]').first().click();

      await page.waitForTimeout(3000);

      // Verifica localStorage
      const localStorage = await page.evaluate(() => {
        return JSON.stringify(window.localStorage);
      });
      console.log('💾 LocalStorage:', localStorage);

      // Verifica sessionStorage
      const sessionStorage = await page.evaluate(() => {
        return JSON.stringify(window.sessionStorage);
      });
      console.log('💾 SessionStorage:', sessionStorage);

      // Verifica se há dados de autenticação
      const authData = await page.evaluate(() => {
        const supabaseAuth = localStorage.getItem('sb-auth-token');
        const user = localStorage.getItem('user');
        return { supabaseAuth: !!supabaseAuth, user: !!user };
      });
      console.log('🔐 Dados de Auth:', authData);
    }
  });

  test('verificar service worker interferência', async ({ page, context }) => {
    // Desabilita service worker
    await context.addInitScript(() => {
      delete (navigator as any).serviceWorker;
    });

    await page.goto('http://localhost:5175');
    await page.waitForTimeout(2000);

    console.log('🔧 Teste sem Service Worker');

    const emailInput = page.locator('input[type="email"]').first();
    
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('admin@test.com');
      await page.locator('input[type="password"]').first().fill('password');
      await page.locator('button[type="submit"]').first().click();

      await page.waitForTimeout(3000);

      const afterLoginText = await page.locator('body').textContent();
      const isWhiteScreen = !afterLoginText || afterLoginText.trim().length < 10;

      if (!isWhiteScreen) {
        console.log('✅ Funciona SEM Service Worker - SW pode ser o problema');
      } else {
        console.log('❌ Ainda tela branca SEM Service Worker - problema é outro');
      }
    }
  });
});
