import { expect, test } from '@playwright/test';

type LandingScenario = {
  name: string;
  role: string;
  email: string;
  expectedPath: '/agenda' | '/dashboard';
};

const SCENARIOS: LandingScenario[] = [
  {
    name: 'Administrador',
    role: 'admin',
    email: 'admin@dudufisio.com',
    expectedPath: '/agenda',
  },
  {
    name: 'Fisioterapeuta',
    role: 'therapist',
    email: 'therapist@dudufisio.com',
    expectedPath: '/agenda',
  },
  {
    name: 'Estagiário',
    role: 'estagiario',
    email: 'intern@dudufisio.com',
    expectedPath: '/agenda',
  },
  {
    name: 'Paciente',
    role: 'patient',
    email: 'patient@dudufisio.com',
    expectedPath: '/dashboard',
  },
];

const buildFallbackSession = (scenario: LandingScenario) => {
  const issuedAt = Date.now();

  const user = {
    id: `fallback-${scenario.role}-1`,
    email: scenario.email,
    name: `${scenario.name} (Mock)`,
    role: scenario.role,
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

test.describe('Redirecionamento inicial por perfil', () => {
  for (const scenario of SCENARIOS) {
    test(`Perfil ${scenario.name} deve iniciar em ${scenario.expectedPath}`, async ({ page }) => {
      // Acessa tela inicial para garantir contexto do app
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Injeta sessão mock para o perfil desejado
      const fallbackSession = buildFallbackSession(scenario);
      await page.evaluate(([session]) => {
        localStorage.setItem('fallback_session', JSON.stringify(session));
      }, [fallbackSession]);

      // Recarrega e aguarda redirecionamento conforme o perfil
      await page.reload();

      await page.waitForURL((url) => {
        const pathname = new URL(url).pathname;
        return pathname.startsWith(scenario.expectedPath);
      }, { timeout: 10000 });

      const currentPath = new URL(page.url()).pathname;
      expect(currentPath.startsWith(scenario.expectedPath)).toBeTruthy();

      // Verifica ausência de rota antiga para perfis que deveriam ir à agenda
      if (scenario.expectedPath === '/agenda') {
        expect(currentPath).not.toContain('/dashboard');
      }
    });
  }
});

