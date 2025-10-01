import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes de performance
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/performance',
  
  /* Timeout para testes de performance */
  timeout: 60 * 1000,
  
  /* Configuração de expect */
  expect: {
    timeout: 10000
  },
  
  /* Executar testes em paralelo */
  fullyParallel: false,
  
  /* Falhar build se houver apenas skip */
  forbidOnly: !!process.env.CI,
  
  /* Retry em CI */
  retries: process.env.CI ? 2 : 0,
  
  /* Workers */
  workers: process.env.CI ? 1 : 2,
  
  /* Reporter */
  reporter: [
    ['html', { outputFolder: 'playwright-report/performance' }],
    ['json', { outputFile: 'playwright-report/performance/results.json' }],
    ['list']
  ],
  
  /* Configuração compartilhada */
  use: {
    /* URL base */
    baseURL: 'http://localhost:5175',
    
    /* Trace */
    trace: 'on-first-retry',
    
    /* Screenshot */
    screenshot: 'only-on-failure',
    
    /* Video */
    video: 'retain-on-failure',
    
    /* Timeout para ações */
    actionTimeout: 10000,
    
    /* Timeout para navegação */
    navigationTimeout: 30000,
  },

  /* Projetos de teste */
  projects: [
    {
      name: 'chromium-performance',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--enable-features=NetworkService,NetworkServiceInProcess',
            '--disable-features=IsolateOrigins,site-per-process'
          ]
        }
      },
    },

    {
      name: 'firefox-performance',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'mobile-performance',
      use: {
        ...devices['Pixel 5'],
        // Simula conexão 3G
        contextOptions: {
          ...devices['Pixel 5'].contextOptions,
        }
      },
    },

    {
      name: 'slow-network',
      use: {
        ...devices['Desktop Chrome'],
        // Simula conexão lenta
        launchOptions: {
          slowMo: 100
        }
      },
    },
  ],

  /* Web Server */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5175',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
