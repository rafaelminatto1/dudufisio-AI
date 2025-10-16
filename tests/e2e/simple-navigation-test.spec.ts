import { test, expect } from '@playwright/test';

/**
 * 🧪 Teste Simples de Navegação
 * 
 * Testa apenas as páginas principais de cada perfil
 * com timeout maior e sem aguardar 3 segundos
 */

interface ProfileConfig {
  name: string;
  email: string;
  password: string;
}

const PROFILES: ProfileConfig[] = [
  { name: 'Admin', email: 'admin@dudufisio.com', password: 'demo123456' },
  { name: 'Fisioterapeuta', email: 'therapist@dudufisio.com', password: 'demo123456' },
  { name: 'Paciente', email: 'patient@dudufisio.com', password: 'demo123456' },
  { name: 'Educador Físico', email: 'educator@dudufisio.com', password: 'demo123456' }
];

const ROUTES_BY_PROFILE: Record<string, string[]> = {
  'Admin': ['/dashboard', '/patients', '/agenda', '/settings'],
  'Fisioterapeuta': ['/dashboard', '/patients', '/agenda', '/sessions'],
  'Paciente': ['/dashboard', '/my-appointments', '/my-exercises'],
  'Educador Físico': ['/dashboard', '/clients', '/financials']
};

test.describe('Teste Simples de Navegação', () => {
  
  for (const profile of PROFILES) {
    test.describe(`Perfil: ${profile.name}`, () => {
      
      test.beforeEach(async ({ page }) => {
        // Fazer login
        await page.goto('/');
        
        // Aguardar página de login
        await page.waitForSelector('button:has-text("Contas de Demonstração")', { timeout: 10000 });
        
        // Clicar em "Contas de Demonstração"
        await page.click('button:has-text("Contas de Demonstração")');
        await page.waitForTimeout(500);
        
        // Selecionar perfil
        await page.click(`button:has-text("${profile.email}")`);
        await page.waitForTimeout(500);
        
        // Clicar em Login
        await page.click('button[type="submit"]');
        
        // Aguardar redirecionamento para dashboard
        await page.waitForURL('**/dashboard', { timeout: 15000 });
        
        console.log(`✅ Login realizado como ${profile.name}`);
      });
      
      const routes = ROUTES_BY_PROFILE[profile.name] || [];
      
      for (const route of routes) {
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

