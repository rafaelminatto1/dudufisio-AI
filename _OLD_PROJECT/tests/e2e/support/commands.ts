// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to handle login
Cypress.Commands.add('login', (email?: string, password?: string) => {
  const userEmail = email || Cypress.env('TEST_USER_EMAIL')
  const userPassword = password || Cypress.env('TEST_USER_PASSWORD')

  cy.session(
    [userEmail, userPassword],
    () => {
      cy.visit('/login')
      cy.get('[data-cy=email-input]').type(userEmail)
      cy.get('[data-cy=password-input]').type(userPassword)
      cy.get('[data-cy=login-button]').click()

      // Wait for redirect after successful login
      cy.url().should('not.include', '/login')
      cy.get('[data-cy=user-menu]').should('be.visible')
    },
    {
      validate() {
        // Validate that user is still logged in
        cy.visit('/')
        cy.get('[data-cy=user-menu]').should('be.visible')
      },
    }
  )
})

// Custom command to handle logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-cy=user-menu]').click()
  cy.get('[data-cy=logout-button]').click()
  cy.url().should('include', '/login')
})

// Custom command to navigate to specific pages
Cypress.Commands.add('navigateTo', (page: string) => {
  const routes: Record<string, string> = {
    dashboard: '/',
    patients: '/patients',
    appointments: '/agenda',
    financial: '/financial',
    settings: '/settings',
    'patient-portal': '/patient-portal',
    'partner-portal': '/partner-portal',
  }

  const route = routes[page]
  if (!route) {
    throw new Error(`Unknown page: ${page}`)
  }

  cy.visit(route)
  cy.waitForLoading()
})

// Custom command to wait for loading states
Cypress.Commands.add('waitForLoading', () => {
  // Wait for any loading indicators to disappear
  cy.get('[data-cy=loading-spinner]').should('not.exist')
  cy.get('[data-cy=skeleton-loader]').should('not.exist')

  // Wait for main content to be visible
  cy.get('main').should('be.visible')
})

// Custom command for accessibility testing
Cypress.Commands.add('checkA11y', () => {
  cy.injectAxe()
  cy.checkA11y()
})

// Custom command to seed test data
Cypress.Commands.add('seedData', (fixture: string) => {
  cy.task('clearDatabase')
  cy.fixture(fixture).then((data) => {
    cy.task('seedDatabase', data)
  })
})

// Custom command to clear test data
Cypress.Commands.add('clearData', () => {
  cy.task('clearDatabase')
})

// Custom command to mock API responses
Cypress.Commands.add('mockAPI', (endpoint: string, response: any) => {
  cy.intercept('GET', `**/${endpoint}**`, response).as(`mock-${endpoint}`)
})

// Custom command for visual regression testing
Cypress.Commands.add('visualSnapshot', (name: string) => {
  cy.percySnapshot(name)
})

// Helper commands for common UI interactions

// Command to fill patient form
Cypress.Commands.add('fillPatientForm', (patient: any) => {
  cy.get('[data-cy=patient-name]').type(patient.name)
  cy.get('[data-cy=patient-email]').type(patient.email)
  cy.get('[data-cy=patient-phone]').type(patient.phone)
  cy.get('[data-cy=patient-birthdate]').type(patient.birthDate)
  cy.get('[data-cy=patient-cpf]').type(patient.cpf)

  if (patient.address) {
    cy.get('[data-cy=patient-address]').type(patient.address.street)
    cy.get('[data-cy=patient-city]').type(patient.address.city)
    cy.get('[data-cy=patient-state]').select(patient.address.state)
    cy.get('[data-cy=patient-zipcode]').type(patient.address.zipCode)
  }
})

// Command to create appointment
Cypress.Commands.add('createAppointment', (appointment: any) => {
  cy.get('[data-cy=new-appointment-button]').click()
  cy.get('[data-cy=appointment-patient]').select(appointment.patientId)
  cy.get('[data-cy=appointment-date]').type(appointment.date)
  cy.get('[data-cy=appointment-time]').type(appointment.time)
  cy.get('[data-cy=appointment-duration]').type(appointment.duration.toString())

  if (appointment.notes) {
    cy.get('[data-cy=appointment-notes]').type(appointment.notes)
  }

  cy.get('[data-cy=save-appointment-button]').click()
})

// Command to handle modals
Cypress.Commands.add('closeModal', () => {
  cy.get('[data-cy=modal-close]').click()
  cy.get('[data-cy=modal]').should('not.exist')
})

// Command to handle form validation
Cypress.Commands.add('expectValidationError', (field: string, message: string) => {
  cy.get(`[data-cy=${field}-error]`).should('be.visible').and('contain', message)
})

// Command to handle notifications/toasts
Cypress.Commands.add('expectNotification', (type: 'success' | 'error' | 'warning' | 'info', message?: string) => {
  cy.get(`[data-cy=notification-${type}]`).should('be.visible')

  if (message) {
    cy.get(`[data-cy=notification-${type}]`).should('contain', message)
  }

  // Wait for notification to disappear
  cy.get(`[data-cy=notification-${type}]`, { timeout: 10000 }).should('not.exist')
})

// Command to handle data tables
Cypress.Commands.add('searchInTable', (searchTerm: string) => {
  cy.get('[data-cy=table-search]').type(searchTerm)
  cy.get('[data-cy=table-row]').should('contain', searchTerm)
})

Cypress.Commands.add('sortTable', (column: string, direction: 'asc' | 'desc' = 'asc') => {
  cy.get(`[data-cy=table-header-${column}]`).click()

  if (direction === 'desc') {
    cy.get(`[data-cy=table-header-${column}]`).click()
  }
})

// Command to handle file uploads
Cypress.Commands.add('uploadFile', (selector: string, fileName: string, fileType: string = 'image/png') => {
  cy.fixture(fileName, 'base64').then(fileContent => {
    cy.get(selector).attachFile({
      fileContent,
      fileName,
      mimeType: fileType,
      encoding: 'base64',
    })
  })
})

// Command to wait for specific network requests
Cypress.Commands.add('waitForRequest', (alias: string, timeout: number = 10000) => {
  cy.wait(`@${alias}`, { timeout })
})

// Command to check responsive design
Cypress.Commands.add('checkResponsive', () => {
  const viewports = [
    { device: 'mobile', width: 375, height: 667 },
    { device: 'tablet', width: 768, height: 1024 },
    { device: 'desktop', width: 1280, height: 720 },
  ]

  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height)
    cy.get('body').should('be.visible')

    // Check that critical elements are visible
    cy.get('[data-cy=main-navigation]').should('be.visible')
    cy.get('main').should('be.visible')
  })
})

// Command to test keyboard navigation
Cypress.Commands.add('testKeyboardNavigation', () => {
  cy.get('body').tab()
  cy.focused().should('have.attr', 'data-cy')

  // Test escape key functionality
  cy.get('body').type('{esc}')
})

// Command to simulate network conditions
Cypress.Commands.add('simulateSlowNetwork', () => {
  cy.intercept('**', (req) => {
    req.reply((res) => {
      // Add 2 second delay to simulate slow network
      return new Promise((resolve) => {
        setTimeout(() => resolve(res), 2000)
      })
    })
  })
})

// Extend Cypress chainable interface
declare global {
  namespace Cypress {
    interface Chainable {
      fillPatientForm(patient: any): Chainable<void>
      createAppointment(appointment: any): Chainable<void>
      closeModal(): Chainable<void>
      expectValidationError(field: string, message: string): Chainable<void>
      expectNotification(type: 'success' | 'error' | 'warning' | 'info', message?: string): Chainable<void>
      searchInTable(searchTerm: string): Chainable<void>
      sortTable(column: string, direction?: 'asc' | 'desc'): Chainable<void>
      uploadFile(selector: string, fileName: string, fileType?: string): Chainable<void>
      waitForRequest(alias: string, timeout?: number): Chainable<void>
      checkResponsive(): Chainable<void>
      testKeyboardNavigation(): Chainable<void>
      simulateSlowNetwork(): Chainable<void>
    }
  }
}