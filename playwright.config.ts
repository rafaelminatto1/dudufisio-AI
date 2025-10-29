/**
 * Configuração do Playwright para Testes E2E
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  
  // Timeout
  timeout: 30000,
  
  // Executar testes em paralelo
  fullyParallel: true,
  
  // Não falhar build em CI se alguns testes falharem
  forbidOnly: !!process.env.CI,
  
  // Retry em CI
  retries: process.env.CI ? 2 : 0,
  
  // Workers
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: 'html',
  
  // Configurações compartilhadas
  use: {
    // Base URL
    baseURL: 'http://localhost:5173',
    
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

  // Web server
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
