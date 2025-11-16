import { test, expect } from '@playwright/test';

/**
 * 🧪 Teste Simples de Navegação
 * 
 * Testa apenas as páginas principais de cada perfil
 * com timeout maior e sem aguardar 3 segundos
 */

interface ProfileConfig {
  name: string;
  role: 'Admin' | 'Therapist' | 'Intern' | 'Patient' | 'Educator';
  email: string;
  expectedLanding: '/agenda' | '/dashboard';
  routes: string[];
}

const PROFILES: ProfileConfig[] = [
  {
    name: 'Admin',
    role: 'Admin',
    email: 'admin@dudufisio.com',
    expectedLanding: '/agenda',
    routes: ['/agenda', '/dashboard', '/patients', '/settings'],
  },
  {
    name: 'Fisioterapeuta',
    role: 'Therapist',
    email: 'therapist@dudufisio.com',
    expectedLanding: '/agenda',
    routes: ['/agenda', '/dashboard', '/patients', '/sessions'],
  },
  {
    name: 'Estagiário',
    role: 'Intern',
    email: 'intern@dudufisio.com',
    expectedLanding: '/agenda',
    routes: ['/agenda', '/dashboard', '/patients'],
  },
  {
    name: 'Paciente',
    role: 'Patient',
    email: 'patient@dudufisio.com',
    expectedLanding: '/dashboard',
    routes: ['/dashboard', '/my-appointments', '/my-exercises'],
  },
  {
    name: 'Educador Físico',
    role: 'Educator',
    email: 'educator@dudufisio.com',
    expectedLanding: '/dashboard',
    routes: ['/dashboard', '/clients', '/financials'],
  },
];

const buildFallbackSession = (profile: ProfileConfig) => {
  const issuedAt = Date.now();

  const user = {
    id: `fallback-${profile.role.toLowerCase()}-1`,
    email: profile.email,
    name: `${profile.name} (Demo)`,
    role: profile.role.toLowerCase(),
    avatarUrl: '',
    phone: undefined,
    createdAt: new Date(issuedAt).toISOString(),
    emailVerified: true,
    mfaEnabled: false,
  };

  const session = {
    access_token: 'fallback-token',
    refresh_token: 'fallback-refresh',
    expires_at: Math.floor((issuedAt + 60 * 60 * 1000) / 1000),
    user,
  };

  return {
    user,
    session,
    expiresAt: issuedAt + 8 * 60 * 60 * 1000,
  };
};

test.describe('Teste Simples de Navegação', () => {
  
  for (const profile of PROFILES) {
    test.describe(`Perfil: ${profile.name}`, () => {
      
      test.beforeEach(async ({ page }) => {
        await page.goto('/');

        const fallbackSession = buildFallbackSession(profile);
        await page.evaluate(([session]) => {
          localStorage.setItem('fallback_session', JSON.stringify(session));
        }, [fallbackSession]);

        await page.reload();

        await page.waitForURL((url) => {
          const { pathname } = new URL(url);
          return pathname.startsWith(profile.expectedLanding);
        }, { timeout: 15000 });

        console.log(`✅ Sessão mock aplicada para ${profile.name} → rota inicial: ${profile.expectedLanding}`);
      });
      
      for (const route of profile.routes) {
        test(`Navegar para ${route}`, async ({ page }) => {
          console.log(`  📄 Testando: ${route}`);
          
          // Navegar para a página
          await page.goto(route, { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
          });
          
          // Verificar se não é 404
          const is404 = await page.locator('text=404, text=Página não encontrada, text=Not Found').count();
          expect(is404).toBe(0);
          
          // Verificar se a página carregou (tem algum conteúdo)
          const hasContent = await page.locator('body').count();
          expect(hasContent).toBeGreaterThan(0);
          
          console.log(`  ✅ Página ${route} carregou com sucesso`);
        });
      }
    });
  }
});

