/**
 * Configuração do Playwright para Testes E2E
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  
  // Timeout - Aumentado para 60s para testes mais complexos
  timeout: 60000,
  
  // Timeout para cada expect
  expect: {
    timeout: 10000,
  },
  
  // Executar testes em paralelo
  fullyParallel: true,
  
  // Não falhar build em CI se alguns testes falharem
  forbidOnly: !!process.env.CI,
  
  // Retry em CI e local - Melhorado para lidar com flaky tests
  retries: process.env.CI ? 2 : 1,
  
  // Workers
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: 'html',
  
  // Configurações compartilhadas
  use: {
    // Base URL - Será sobrescrita pelo webServer
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',

    // Timeout para ações (click, fill, etc)
    actionTimeout: 15000,
    
    // Timeout para navegação
    navigationTimeout: 30000,

    // Trace
    trace: 'on-first-retry',

    // Screenshot
    screenshot: 'only-on-failure',

    // Video
    video: 'retain-on-failure',
  },

  // Projetos (navegadores)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Web server - Detecta automaticamente a porta ativa
  // O Playwright tentará encontrar um servidor rodando em 5173, 5176 ou 5177
  webServer: {
    command: 'npm run dev:skip-check',
    url: process.env.PLAYWRIGHT_SERVER_URL || 'http://localhost:5173',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI, // Reutiliza servidor se já estiver rodando
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
