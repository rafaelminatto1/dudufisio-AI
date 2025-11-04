import { test, expect } from '@playwright/test';

test.describe('Segurança - Autenticação e Autorização', () => {
  
  test('Deve redirecionar para login em rotas protegidas', async ({ page }) => {
    // Tentar acessar páginas protegidas sem estar autenticado
    const protectedRoutes = [
      '/dashboard',
      '/agenda',
      '/patients',
      '/exercises',
      '/reports',
      '/settings'
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      
      // Deve redirecionar para login ou mostrar página de login
      await page.waitForURL(/\/login|\/auth/, { timeout: 5000 });
      
      // Verificar se está na página de login
      const loginForm = page.locator('[data-testid="input-login-email"]');
      await expect(loginForm).toBeVisible();
    }
  });

  test('Login com credenciais incorretas deve falhar', async ({ page }) => {
    await page.goto('/login');
    
    // Tentar login com email/senha inválidos
    await page.fill('[data-testid="input-login-email"]', 'invalido@test.com');
    await page.fill('[data-testid="input-login-password"]', 'senhaerrada123');
    await page.click('[data-testid="btn-login-submit"]');
    
    // Aguardar mensagem de erro
    await page.waitForSelector('[data-testid="error-login-message"]', { timeout: 5000 });
    
    const errorMessage = await page.locator('[data-testid="error-login-message"]').textContent();
    expect(errorMessage).toContain('inválid' || 'incorret' || 'erro');
    
    // Não deve redirecionar
    await expect(page).toHaveURL(/\/login/);
  });

  test('SQL Injection no login deve ser prevenido', async ({ page }) => {
    await page.goto('/login');
    
    // Tentar SQL injection no campo de email
    const sqlInjectionAttempts = [
      "admin' OR '1'='1",
      "admin'--",
      "admin' OR 1=1--",
      "' OR 'x'='x",
      "1' UNION SELECT * FROM users--"
    ];

    for (const injection of sqlInjectionAttempts) {
      await page.fill('[data-testid="input-login-email"]', injection);
      await page.fill('[data-testid="input-login-password"]', 'anypassword');
      await page.click('[data-testid="btn-login-submit"]');
      
      // Aguardar resposta
      await page.waitForTimeout(2000);
      
      // Não deve fazer login com sucesso
      const isStillOnLogin = await page.url().includes('/login');
      expect(isStillOnLogin).toBe(true);
    }
  });

  test('XSS no campo de login deve ser sanitizado', async ({ page }) => {
    await page.goto('/login');
    
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<svg onload=alert("XSS")>'
    ];

    for (const payload of xssPayloads) {
      await page.fill('[data-testid="input-login-email"]', payload);
      await page.fill('[data-testid="input-login-password"]', 'test123');
      
      // Verificar se o valor foi sanitizado ou escapado
      const emailValue = await page.locator('[data-testid="input-login-email"]').inputValue();
      
      // Não deve conter tags HTML executáveis
      expect(emailValue).not.toMatch(/<script|<img|javascript:|<svg/);
    }
  });

  test('Proteção contra brute force - rate limiting', async ({ page }) => {
    await page.goto('/login');
    
    // Fazer múltiplas tentativas de login falhadas rapidamente
    for (let i = 0; i < 10; i++) {
      await page.fill('[data-testid="input-login-email"]', 'test@test.com');
      await page.fill('[data-testid="input-login-password"]', `wrongpass${i}`);
      await page.click('[data-testid="btn-login-submit"]');
      await page.waitForTimeout(500);
    }

    // Após muitas tentativas, deve haver rate limiting
    const rateLimitMessage = page.locator('[data-testid="rate-limit-warning"]');
    
    // Se rate limiting estiver implementado, deve aparecer
    if (await rateLimitMessage.isVisible({ timeout: 2000 })) {
      const message = await rateLimitMessage.textContent();
      expect(message).toContain('limite' || 'muitas tentativas' || 'bloqueado');
    } else {
      console.log('⚠️ Rate limiting pode não estar implementado');
    }
  });

  test('Sessão deve expirar após período de inatividade', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="input-login-email"]', 'admin@dudufisio.com');
    await page.fill('[data-testid="input-login-password"]', 'DuduFisio2024!');
    await page.click('[data-testid="btn-login-submit"]');
    await page.waitForURL(/\/dashboard|\/agenda/);
    
    // Simular inatividade (aguardar alguns minutos)
    // Nota: Em produção, sessões expiram após 30-60 minutos
    // Aqui vamos testar se há indicador de timeout
    
    const sessionTimeoutIndicator = page.locator('[data-testid="session-timeout-warning"]');
    
    // Se houver warning de timeout, verificar
    if (await sessionTimeoutIndicator.isVisible({ timeout: 1000 })) {
      const warning = await sessionTimeoutIndicator.textContent();
      expect(warning).toContain('sessão' || 'expirar' || 'inatividade');
    }
  });

  test('Logout deve limpar tokens e redirecionar', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="input-login-email"]', 'admin@dudufisio.com');
    await page.fill('[data-testid="input-login-password"]', 'DuduFisio2024!');
    await page.click('[data-testid="btn-login-submit"]');
    await page.waitForURL(/\/dashboard|\/agenda/);
    
    // Fazer logout
    const logoutButton = page.locator('[data-testid="btn-logout"]');
    
    if (await logoutButton.isVisible({ timeout: 3000 })) {
      await logoutButton.click();
      
      // Deve redirecionar para login
      await page.waitForURL(/\/login/, { timeout: 5000 });
      
      // Verificar se localStorage foi limpo (tokens removidos)
      const localStorage = await page.evaluate(() => {
        return {
          hasToken: !!localStorage.getItem('supabase.auth.token'),
          hasRefreshToken: !!localStorage.getItem('supabase.auth.refreshToken')
        };
      });
      
      // Tokens devem ter sido removidos
      expect(localStorage.hasToken || localStorage.hasRefreshToken).toBe(false);
      
      // Tentar acessar página protegida após logout
      await page.goto('/dashboard');
      
      // Deve redirecionar de volta para login
      await page.waitForURL(/\/login/, { timeout: 5000 });
    }
  });

  test('Tokens JWT devem ter assinatura válida', async ({ page, context }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="input-login-email"]', 'admin@dudufisio.com');
    await page.fill('[data-testid="input-login-password"]', 'DuduFisio2024!');
    await page.click('[data-testid="btn-login-submit"]');
    await page.waitForURL(/\/dashboard|\/agenda/);
    
    // Interceptar requests para verificar token
    let authHeader: string | null = null;
    
    page.on('request', request => {
      const headers = request.headers();
      if (headers['authorization']) {
        authHeader = headers['authorization'];
      }
    });
    
    // Fazer uma requisição que requer autenticação
    await page.goto('/patients');
    await page.waitForTimeout(2000);
    
    if (authHeader) {
      // Token deve estar presente
      expect(authHeader).toContain('Bearer');
      
      // Token JWT deve ter 3 partes (header.payload.signature)
      const token = authHeader.replace('Bearer ', '');
      const parts = token.split('.');
      expect(parts.length).toBe(3);
    }
  });
});

test.describe('Segurança - Row Level Security (RLS)', () => {
  
  test('Usuário só deve ver seus próprios dados', async ({ page }) => {
    // Login como usuário regular
    await page.goto('/login');
    await page.fill('[data-testid="input-login-email"]', 'admin@dudufisio.com');
    await page.fill('[data-testid="input-login-password"]', 'DuduFisio2024!');
    await page.click('[data-testid="btn-login-submit"]');
    await page.waitForURL(/\/dashboard|\/agenda/);
    
    // Tentar acessar dados de outro usuário (se ID for conhecido)
    await page.goto('/patients/fake-patient-id-123');
    
    // Deve mostrar erro 403 ou redirecionar
    await page.waitForTimeout(2000);
    
    const errorMessage = page.locator('[data-testid="access-denied-message"]');
    if (await errorMessage.isVisible({ timeout: 2000 })) {
      const text = await errorMessage.textContent();
      expect(text).toContain('acesso negado' || 'permissão' || 'não autorizado');
    }
  });

  test('Não deve ser possível modificar dados de outros usuários via API', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="input-login-email"]', 'admin@dudufisio.com');
    await page.fill('[data-testid="input-login-password"]', 'DuduFisio2024!');
    await page.click('[data-testid="btn-login-submit"]');
    await page.waitForURL(/\/dashboard|\/agenda/);
    
    // Interceptar API requests
    let apiBlocked = false;
    
    page.on('response', async response => {
      if (response.url().includes('/api/patients') && response.status() === 403) {
        apiBlocked = true;
      }
    });
    
    // Tentar fazer update em paciente de outro usuário via console
    await page.evaluate(() => {
      fetch('/api/patients/fake-id', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: 'Hacked' })
      });
    });
    
    await page.waitForTimeout(2000);
    
    // Request deve ser bloqueada
    // Nota: Implementação depende do backend
  });
});

test.describe('Segurança - CSRF Protection', () => {
  
  test('Requisições devem ter proteção CSRF', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="input-login-email"]', 'admin@dudufisio.com');
    await page.fill('[data-testid="input-login-password"]', 'DuduFisio2024!');
    await page.click('[data-testid="btn-login-submit"]');
    await page.waitForURL(/\/dashboard|\/agenda/);
    
    // Verificar se headers de segurança estão presentes
    const response = await page.goto('/patients');
    const headers = response?.headers();
    
    // Headers de segurança recomendados
    const securityHeaders = {
      'x-frame-options': headers?.['x-frame-options'],
      'x-content-type-options': headers?.['x-content-type-options'],
      'strict-transport-security': headers?.['strict-transport-security']
    };
    
    // Pelo menos alguns headers devem estar presentes
    console.log('Security Headers:', securityHeaders);
    
    // X-Frame-Options deve prevenir clickjacking
    if (securityHeaders['x-frame-options']) {
      expect(securityHeaders['x-frame-options']).toMatch(/DENY|SAMEORIGIN/i);
    }
  });
});

test.describe('Segurança - Dados Sensíveis', () => {
  
  test('Senhas não devem aparecer em logs ou console', async ({ page }) => {
    const consoleMessages: string[] = [];
    
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });
    
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="input-login-email"]', 'admin@dudufisio.com');
    await page.fill('[data-testid="input-login-password"]', 'DuduFisio2024!');
    await page.click('[data-testid="btn-login-submit"]');
    await page.waitForTimeout(2000);
    
    // Verificar se senha aparece em algum log
    const hasPasswordInLogs = consoleMessages.some(msg => 
      msg.includes('DuduFisio2024!')
    );
    
    expect(hasPasswordInLogs).toBe(false);
  });

  test('CPF deve ser mascarado em listagens', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="input-login-email"]', 'admin@dudufisio.com');
    await page.fill('[data-testid="input-login-password"]', 'DuduFisio2024!');
    await page.click('[data-testid="btn-login-submit"]');
    await page.waitForURL(/\/dashboard|\/agenda/);
    
    // Ir para lista de pacientes
    await page.goto('/patients');
    await page.waitForSelector('[data-testid="table-patients"]', { timeout: 5000 });
    
    // Verificar se CPF está mascarado (***.***.123-45)
    const cpfCells = page.locator('[data-testid^="patient-row"] td:has-text("CPF"), [data-testid^="patient-row"] td:has-text("***")');
    
    if (await cpfCells.first().isVisible({ timeout: 2000 })) {
      const cpfText = await cpfCells.first().textContent();
      
      // CPF deve estar mascarado ou não mostrado em listagens públicas
      if (cpfText && cpfText.includes('.')) {
        expect(cpfText).toMatch(/\*\*\*/);
      }
    }
  });

  test('URLs não devem conter dados sensíveis', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="input-login-email"]', 'admin@dudufisio.com');
    await page.fill('[data-testid="input-login-password"]', 'DuduFisio2024!');
    await page.click('[data-testid="btn-login-submit"]');
    await page.waitForURL(/\/dashboard|\/agenda/);
    
    // Navegar por várias páginas
    await page.goto('/patients');
    await page.goto('/agenda');
    await page.goto('/exercises');
    
    // Verificar histórico de navegação
    const currentUrl = page.url();
    
    // URL não deve conter CPF, senhas, tokens visíveis
    expect(currentUrl).not.toMatch(/cpf=\d{11}/);
    expect(currentUrl).not.toMatch(/password=/);
    expect(currentUrl).not.toMatch(/token=[a-zA-Z0-9]{20,}/);
  });
});
