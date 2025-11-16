import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'tests/e2e/support/e2e.ts',
    specPattern: 'tests/e2e/specs/**/*.cy.{js,jsx,ts,tsx}',
    fixturesFolder: 'tests/e2e/fixtures',
    downloadsFolder: 'tests/e2e/downloads',
    screenshotsFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    env: {
      // Test environment configuration
      SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_ANON_KEY: 'test-key',
      TEST_USER_EMAIL: 'test@dudufisio.com',
      TEST_USER_PASSWORD: 'test123456',
      ADMIN_EMAIL: 'admin@dudufisio.com',
      ADMIN_PASSWORD: 'admin123456',
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
        clearDatabase() {
          // Clear test database
          return null
        },
        seedDatabase() {
          // Seed test database with fixtures
          return null
        },
      })

      // Code coverage
      require('@cypress/code-coverage/task')(on, config)

      return config
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    supportFile: 'tests/e2e/support/component.ts',
    specPattern: 'tests/e2e/component/**/*.cy.{js,jsx,ts,tsx}',
    indexHtmlFile: 'tests/e2e/support/component-index.html',
  },
})