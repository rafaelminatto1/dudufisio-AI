import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E
 * Testa as funcionalidades avançadas do módulo de evolução
 */
export default defineConfig({
  testDir: './tests',
  
  // Timeout para cada teste
  timeout: 30 * 1000,
  
  // Configurações globais
  fullyParallel: false, // Executar testes em sequência
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Um worker por vez para evitar conflitos
  
  // Reporter
  reporter: [
    ['html', { outputFolder: 'testsprite_tests/reports/html' }],
    ['json', { outputFile: 'testsprite_tests/reports/results.json' }],
    ['list']
  ],
  
  // Configurações compartilhadas para todos projetos
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Timeout para ações
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // Projetos de teste (diferentes browsers)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Descomente para testar em outros browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    
    // Testes mobile
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // Web server local (se não estiver rodando)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
