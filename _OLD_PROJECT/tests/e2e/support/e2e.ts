// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Import Cypress code coverage
import '@cypress/code-coverage/support'

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing tests on uncaught exceptions
  // that are expected in our application
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }

  if (err.message.includes('Non-Error promise rejection captured')) {
    return false
  }

  // Return true to fail the test
  return true
})

// Setup hooks
beforeEach(() => {
  // Clear local storage and session storage
  cy.clearLocalStorage()
  cy.clearCookies()

  // Wait for the app to be ready
  cy.intercept('GET', '/api/health', { statusCode: 200, body: { status: 'ok' } })
})

afterEach(() => {
  // Cleanup after each test
  cy.clearLocalStorage()
  cy.clearCookies()
})

// Custom Cypress configuration
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to log in a user
       */
      login(email?: string, password?: string): Chainable<void>

      /**
       * Custom command to log out current user
       */
      logout(): Chainable<void>

      /**
       * Custom command to navigate to a specific page
       */
      navigateTo(page: string): Chainable<void>

      /**
       * Custom command to wait for loading to complete
       */
      waitForLoading(): Chainable<void>

      /**
       * Custom command to check accessibility
       */
      checkA11y(): Chainable<void>

      /**
       * Custom command to seed test data
       */
      seedData(fixture: string): Chainable<void>

      /**
       * Custom command to clear test data
       */
      clearData(): Chainable<void>

      /**
       * Custom command to mock API responses
       */
      mockAPI(endpoint: string, response: any): Chainable<void>

      /**
       * Custom command to take visual regression screenshot
       */
      visualSnapshot(name: string): Chainable<void>
    }
  }
}