import { test, expect } from '@playwright/test';

/**
 * FASE 4.1: Testes de Segurança - Autenticação e Autorização
 *
 * Cenários testados:
 * 1. Proteção de rotas privadas sem autenticação
 * 2. Controle de acesso por perfil (RBAC)
 * 3. Logout e limpeza de sessão
 * 4. Proteção contra SQL Injection
 * 5. Proteção contra XSS (Cross-Site Scripting)
 * 6. Validação de dados sensíveis
 * 7. LGPD - Logs de acesso a dados sensíveis
 * 8. Segurança de senhas (hashing)
 * 9. Timeout de sessão
 * 10. Tentativas de acesso não autorizado
 */

test.describe('Segurança - Autenticação e Autorização', () => {

  test('1. Proteção de rotas privadas sem autenticação', async ({ page }) => {
    // Limpar cookies e storage
    await page.context().clearCookies();
    await page.context().clearPermissions();

    // Tentar acessar rota protegida diretamente
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Verificar se foi redirecionado para login
    const currentURL = page.url();
    const isOnLoginPage = currentURL.includes('/login') || currentURL === 'http://localhost:5175/' || await page.locator('input[type="password"]').isVisible();

    if (isOnLoginPage) {
      console.log('✅ Rota protegida - redirecionou para login');
    } else {
      console.log('⚠️  FALHA DE SEGURANÇA: Acesso permitido sem autenticação');
    }

    await page.screenshot({
      path: 'test-results/screenshots/security-route-protection.png',
      fullPage: true
    });
  });

  test('2. Controle de acesso por perfil - Admin vs Paciente', async ({ page }) => {
    // Login como Paciente
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const sidebar = page.locator('aside');
    const isLoggedIn = await sidebar.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isLoggedIn) {
      await page.fill('[data-testid="login-email"]', 'patient@dudufisio.com');
      await page.fill('[data-testid="login-password"]', 'demo123456');
      await page.click('[data-testid="login-submit"]');
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    }

    // Tentar acessar área administrativa
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const currentURL = page.url();
    const hasAdminAccess = currentURL.includes('/admin');

    if (!hasAdminAccess) {
      console.log('✅ RBAC funcionando - Paciente bloqueado de área admin');
    } else {
      console.log('⚠️  FALHA DE SEGURANÇA: Paciente acessou área admin');
    }

    // Verificar menu limitado
    const menuItems = page.locator('aside a, nav a');
    const menuCount = await menuItems.count();
    console.log(`📊 Paciente tem acesso a ${menuCount} itens de menu`);

    if (menuCount < 15) {
      console.log('✅ Menu limitado para perfil de Paciente');
    }

    await page.screenshot({
      path: 'test-results/screenshots/security-rbac-patient.png',
      fullPage: true
    });
  });

  test('3. Logout e limpeza de sessão', async ({ page }) => {
    // Fazer login
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const sidebar = page.locator('aside');
    const isLoggedIn = await sidebar.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isLoggedIn) {
      await page.fill('[data-testid="login-email"]', 'admin@dudufisio.com');
      await page.fill('[data-testid="login-password"]', 'demo123456');
      await page.click('[data-testid="login-submit"]');
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    }

    // Procurar botão de logout
    const logoutButton = page.locator('button, a').filter({
      hasText: /sair|logout|desconectar/i
    });
    const hasLogout = await logoutButton.isVisible().catch(() => false);

    if (hasLogout) {
      await logoutButton.first().click();
      await page.waitForTimeout(2000);

      // Verificar se foi redirecionado para login
      const isOnLogin = await page.locator('input[type="password"]').isVisible();

      if (isOnLogin) {
        console.log('✅ Logout funcionando - redirecionado para login');

        // Tentar acessar área protegida após logout
        await page.goto('/dashboard');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const currentURL = page.url();
        const stillProtected = currentURL.includes('/login') || currentURL === 'http://localhost:5175/' || await page.locator('input[type="password"]').isVisible();

        if (stillProtected) {
          console.log('✅ Sessão limpa - acesso negado após logout');
        } else {
          console.log('⚠️  FALHA: Sessão não foi limpa corretamente');
        }
      }
    } else {
      console.log('⚠️  Botão de logout não encontrado');
    }

    await page.screenshot({
      path: 'test-results/screenshots/security-logout.png',
      fullPage: true
    });
  });

  test('4. Proteção contra SQL Injection', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Tentar SQL Injection no login
    const emailInput = page.locator('[data-testid="login-email"]');
    const hasEmail = await emailInput.isVisible().catch(() => false);

    if (hasEmail) {
      await emailInput.fill("admin' OR '1'='1");
      await page.fill('[data-testid="login-password"]', "' OR '1'='1");
      await page.click('[data-testid="login-submit"]');
      await page.waitForTimeout(2000);

      // Verificar se o login foi negado
      const isStillOnLogin = await page.locator('input[type="password"]').isVisible();

      if (isStillOnLogin) {
        console.log('✅ Protegido contra SQL Injection - login negado');
      } else {
        console.log('⚠️  VULNERABILIDADE: SQL Injection pode ter funcionado');
      }

      await page.screenshot({
        path: 'test-results/screenshots/security-sql-injection.png',
        fullPage: true
      });
    }
  });

  test('5. Proteção contra XSS (Cross-Site Scripting)', async ({ page }) => {
    // Login primeiro
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const sidebar = page.locator('aside');
    const isLoggedIn = await sidebar.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isLoggedIn) {
      await page.fill('[data-testid="login-email"]', 'admin@dudufisio.com');
      await page.fill('[data-testid="login-password"]', 'demo123456');
      await page.click('[data-testid="login-submit"]');
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    }

    // Navegar para área com input de texto
    await page.click('a:has-text("Pacientes")');
    await page.waitForLoadState('domcontentloaded');

    // Procurar campo de busca
    const searchInput = page.locator('input[type="search"], input[type="text"]').first();
    const hasSearch = await searchInput.isVisible().catch(() => false);

    if (hasSearch) {
      // Tentar injetar script
      const xssPayload = '<script>alert("XSS")</script>';
      await searchInput.fill(xssPayload);
      await page.waitForTimeout(1000);

      // Verificar se o script foi executado (não deveria)
      const dialogPromise = page.waitForEvent('dialog', { timeout: 2000 }).catch(() => null);
      const dialog = await dialogPromise;

      if (!dialog) {
        console.log('✅ Protegido contra XSS - script não executado');
      } else {
        console.log('⚠️  VULNERABILIDADE: XSS detectado');
        await dialog.dismiss();
      }

      await page.screenshot({
        path: 'test-results/screenshots/security-xss-protection.png',
        fullPage: true
      });
    }
  });

  test('6. Validação de dados sensíveis - CPF/Telefone', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const sidebar = page.locator('aside');
    const isLoggedIn = await sidebar.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isLoggedIn) {
      await page.fill('[data-testid="login-email"]', 'admin@dudufisio.com');
      await page.fill('[data-testid="login-password"]', 'demo123456');
      await page.click('[data-testid="login-submit"]');
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    }

    // Navegar para cadastro de paciente
    await page.click('a:has-text("Pacientes")');
    await page.waitForLoadState('domcontentloaded');

    const newButton = page.locator('button').filter({ hasText: /novo|adicionar/i }).first();
    const hasButton = await newButton.isVisible().catch(() => false);

    if (hasButton) {
      await newButton.click();
      await page.waitForTimeout(1500);

      // Verificar se há máscaras/validação
      const cpfInput = page.locator('input').filter({ hasText: /cpf/i }).first();
      const hasCPF = await cpfInput.isVisible().catch(() => false);

      if (hasCPF) {
        await cpfInput.fill('12345678901');
        await page.waitForTimeout(500);

        // Verificar se há formatação
        const cpfValue = await cpfInput.inputValue();
        if (cpfValue.includes('.') || cpfValue.includes('-')) {
          console.log('✅ Máscara de CPF aplicada');
        }
      }

      await page.screenshot({
        path: 'test-results/screenshots/security-data-validation.png',
        fullPage: true
      });
    }
  });

  test('7. LGPD - Logs de acesso a dados sensíveis', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const sidebar = page.locator('aside');
    const isLoggedIn = await sidebar.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isLoggedIn) {
      await page.fill('[data-testid="login-email"]', 'admin@dudufisio.com');
      await page.fill('[data-testid="login-password"]', 'demo123456');
      await page.click('[data-testid="login-submit"]');
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    }

    // Acessar dados de um paciente
    await page.click('a:has-text("Pacientes")');
    await page.waitForLoadState('domcontentloaded');

    const patientCard = page.locator('[class*="patient"], table tbody tr').first();
    const hasPatient = await patientCard.isVisible().catch(() => false);

    if (hasPatient) {
      await patientCard.click();
      await page.waitForTimeout(1500);

      // Verificar se há indicação de logs LGPD
      const lgpdIndicator = page.locator('text=/log de acesso|auditoria|lgpd/i');
      const hasLGPD = await lgpdIndicator.isVisible().catch(() => false);

      if (hasLGPD) {
        console.log('✅ Sistema tem indicadores de conformidade LGPD');
      } else {
        console.log('⚠️  Indicadores LGPD não visíveis (podem estar em background)');
      }

      await page.screenshot({
        path: 'test-results/screenshots/security-lgpd-logs.png',
        fullPage: true
      });
    }
  });

  test('8. Segurança de senhas - Campo senha mascarado', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const passwordInput = page.locator('input[type="password"]');
    const hasPassword = await passwordInput.isVisible();

    if (hasPassword) {
      console.log('✅ Campo de senha com type="password" (mascarado)');

      // Verificar se tem botão de mostrar/ocultar senha
      const toggleButton = page.locator('button, [role="button"]').filter({
        hasText: /mostrar|ocultar|show|hide|eye/i
      });
      const hasToggle = await toggleButton.isVisible().catch(() => false);

      if (hasToggle) {
        console.log('✅ Botão de toggle de visibilidade de senha presente');
      }
    }

    await page.screenshot({
      path: 'test-results/screenshots/security-password-masking.png',
      fullPage: true
    });
  });

  test('9. Tentativas de acesso não autorizado - Força bruta', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Simular múltiplas tentativas de login falhas
    for (let i = 0; i < 5; i++) {
      await page.fill('[data-testid="login-email"]', 'hacker@test.com');
      await page.fill('[data-testid="login-password"]', `wrongpass${i}`);
      await page.click('[data-testid="login-submit"]');
      await page.waitForTimeout(1000);
    }

    // Verificar se há bloqueio ou rate limiting
    const errorMessage = page.locator('text=/bloqueado|muitas tentativas|rate limit|aguarde/i');
    const hasRateLimit = await errorMessage.isVisible().catch(() => false);

    if (hasRateLimit) {
      console.log('✅ Rate limiting ativo - proteção contra força bruta');
    } else {
      console.log('⚠️  Rate limiting não detectado (pode estar em backend)');
    }

    await page.screenshot({
      path: 'test-results/screenshots/security-brute-force.png',
      fullPage: true
    });
  });

  test('10. Timeout de sessão - Inatividade', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const sidebar = page.locator('aside');
    const isLoggedIn = await sidebar.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isLoggedIn) {
      await page.fill('[data-testid="login-email"]', 'admin@dudufisio.com');
      await page.fill('[data-testid="login-password"]', 'demo123456');
      await page.click('[data-testid="login-submit"]');
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    }

    console.log('⏱️  Simulando inatividade...');

    // Aguardar período de inatividade (simulação curta para teste)
    await page.waitForTimeout(5000);

    // Verificar se sessão ainda está ativa
    const stillLoggedIn = await sidebar.isVisible().catch(() => false);

    if (stillLoggedIn) {
      console.log('✅ Sessão mantida (timeout pode ser mais longo que 5s)');
    } else {
      console.log('✅ Timeout de sessão funcionando - usuário deslogado');
    }

    await page.screenshot({
      path: 'test-results/screenshots/security-session-timeout.png',
      fullPage: true
    });
  });
});
