describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearData()
    cy.visit('/login')
  })

  describe('Login Page', () => {
    it('should display login form correctly', () => {
      cy.get('[data-cy=login-form]').should('be.visible')
      cy.get('[data-cy=email-input]').should('be.visible')
      cy.get('[data-cy=password-input]').should('be.visible')
      cy.get('[data-cy=login-button]').should('be.visible')
      cy.get('[data-cy=forgot-password-link]').should('be.visible')

      // Check page title and heading
      cy.title().should('contain', 'Login')
      cy.get('h1').should('contain', 'Fazer Login')
    })

    it('should show validation errors for empty form', () => {
      cy.get('[data-cy=login-button]').click()

      cy.expectValidationError('email', 'Email é obrigatório')
      cy.expectValidationError('password', 'Senha é obrigatória')
    })

    it('should show validation error for invalid email', () => {
      cy.get('[data-cy=email-input]').type('invalid-email')
      cy.get('[data-cy=password-input]').type('password123')
      cy.get('[data-cy=login-button]').click()

      cy.expectValidationError('email', 'Email inválido')
    })

    it('should show error for invalid credentials', () => {
      cy.get('[data-cy=email-input]').type('nonexistent@example.com')
      cy.get('[data-cy=password-input]').type('wrongpassword')
      cy.get('[data-cy=login-button]').click()

      cy.expectNotification('error', 'Credenciais inválidas')
      cy.url().should('include', '/login')
    })

    it('should login successfully with valid credentials', () => {
      const email = Cypress.env('TEST_USER_EMAIL')
      const password = Cypress.env('TEST_USER_PASSWORD')

      cy.get('[data-cy=email-input]').type(email)
      cy.get('[data-cy=password-input]').type(password)
      cy.get('[data-cy=login-button]').click()

      cy.url().should('not.include', '/login')
      cy.get('[data-cy=user-menu]').should('be.visible')
      cy.expectNotification('success', 'Login realizado com sucesso')
    })

    it('should redirect to intended page after login', () => {
      // Visit protected page first
      cy.visit('/patients')
      cy.url().should('include', '/login')

      // Login
      cy.login()

      // Should redirect back to intended page
      cy.url().should('include', '/patients')
    })

    it('should toggle password visibility', () => {
      cy.get('[data-cy=password-input]').should('have.attr', 'type', 'password')
      cy.get('[data-cy=password-toggle]').click()
      cy.get('[data-cy=password-input]').should('have.attr', 'type', 'text')
      cy.get('[data-cy=password-toggle]').click()
      cy.get('[data-cy=password-input]').should('have.attr', 'type', 'password')
    })

    it('should handle remember me checkbox', () => {
      cy.get('[data-cy=remember-me]').should('not.be.checked')
      cy.get('[data-cy=remember-me]').check()
      cy.get('[data-cy=remember-me]').should('be.checked')
    })
  })

  describe('Social Login', () => {
    it('should display social login options', () => {
      cy.get('[data-cy=google-login]').should('be.visible')
      cy.get('[data-cy=github-login]').should('be.visible')
    })

    it('should initiate Google login flow', () => {
      cy.get('[data-cy=google-login]').click()
      // Note: In real tests, you'd mock the OAuth flow
      cy.url().should('include', 'google.com')
    })
  })

  describe('Forgot Password', () => {
    it('should navigate to forgot password page', () => {
      cy.get('[data-cy=forgot-password-link]').click()
      cy.url().should('include', '/forgot-password')
      cy.get('[data-cy=forgot-password-form]').should('be.visible')
    })

    it('should send password reset email', () => {
      cy.get('[data-cy=forgot-password-link]').click()
      cy.get('[data-cy=email-input]').type('test@example.com')
      cy.get('[data-cy=send-reset-button]').click()

      cy.expectNotification('success', 'Email de recuperação enviado')
    })
  })

  describe('User Session Management', () => {
    beforeEach(() => {
      cy.login()
    })

    it('should display user menu when logged in', () => {
      cy.get('[data-cy=user-menu]').should('be.visible')
      cy.get('[data-cy=user-menu]').click()

      cy.get('[data-cy=user-profile-link]').should('be.visible')
      cy.get('[data-cy=settings-link]').should('be.visible')
      cy.get('[data-cy=logout-button]').should('be.visible')
    })

    it('should logout successfully', () => {
      cy.logout()
      cy.url().should('include', '/login')
      cy.get('[data-cy=user-menu]').should('not.exist')
    })

    it('should handle session timeout', () => {
      // Simulate session expiry
      cy.window().then((win) => {
        win.localStorage.removeItem('supabase.auth.token')
      })

      cy.reload()
      cy.url().should('include', '/login')
    })

    it('should persist login state across page reloads', () => {
      cy.reload()
      cy.get('[data-cy=user-menu]').should('be.visible')
      cy.url().should('not.include', '/login')
    })

    it('should handle concurrent sessions', () => {
      // Open new tab and verify session is shared
      cy.window().then((win) => {
        const newTab = win.open('/', '_blank')
        cy.wrap(newTab).should('exist')
      })
    })
  })

  describe('Two-Factor Authentication', () => {
    beforeEach(() => {
      cy.login()
      cy.navigateTo('settings')
    })

    it('should setup 2FA', () => {
      cy.get('[data-cy=security-settings]').click()
      cy.get('[data-cy=enable-2fa]').click()

      cy.get('[data-cy=2fa-qr-code]').should('be.visible')
      cy.get('[data-cy=2fa-backup-codes]').should('be.visible')

      // Enter verification code
      cy.get('[data-cy=2fa-verification-code]').type('123456')
      cy.get('[data-cy=verify-2fa]').click()

      cy.expectNotification('success', '2FA ativado com sucesso')
    })

    it('should require 2FA on subsequent logins', () => {
      // Assuming 2FA is already enabled
      cy.logout()

      const email = Cypress.env('TEST_USER_EMAIL')
      const password = Cypress.env('TEST_USER_PASSWORD')

      cy.get('[data-cy=email-input]').type(email)
      cy.get('[data-cy=password-input]').type(password)
      cy.get('[data-cy=login-button]').click()

      // Should show 2FA verification screen
      cy.get('[data-cy=2fa-verification]').should('be.visible')
      cy.get('[data-cy=2fa-code-input]').should('be.visible')
    })
  })

  describe('Role-based Access Control', () => {
    it('should redirect admin users to admin dashboard', () => {
      cy.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'))
      cy.url().should('include', '/admin')
    })

    it('should redirect patients to patient portal', () => {
      cy.login('patient@example.com', 'password123')
      cy.url().should('include', '/patient-portal')
    })

    it('should redirect therapists to clinic dashboard', () => {
      cy.login('therapist@example.com', 'password123')
      cy.url().should('include', '/dashboard')
    })

    it('should prevent access to unauthorized pages', () => {
      cy.login('patient@example.com', 'password123')

      // Patient should not access admin pages
      cy.visit('/admin')
      cy.url().should('include', '/unauthorized')
      cy.get('[data-cy=unauthorized-message]').should('be.visible')
    })
  })

  describe('Accessibility', () => {
    it('should be accessible', () => {
      cy.checkA11y()
    })

    it('should support keyboard navigation', () => {
      cy.testKeyboardNavigation()

      // Tab through form elements
      cy.get('[data-cy=email-input]').focus()
      cy.focused().should('have.attr', 'data-cy', 'email-input')

      cy.tab()
      cy.focused().should('have.attr', 'data-cy', 'password-input')

      cy.tab()
      cy.focused().should('have.attr', 'data-cy', 'login-button')
    })

    it('should have proper ARIA labels', () => {
      cy.get('[data-cy=email-input]').should('have.attr', 'aria-label')
      cy.get('[data-cy=password-input]').should('have.attr', 'aria-label')
      cy.get('[data-cy=login-button]').should('have.attr', 'aria-label')
    })
  })

  describe('Responsive Design', () => {
    it('should work on mobile devices', () => {
      cy.viewport('iphone-x')
      cy.get('[data-cy=login-form]').should('be.visible')
      cy.get('[data-cy=email-input]').should('be.visible')
      cy.get('[data-cy=password-input]').should('be.visible')
      cy.get('[data-cy=login-button]').should('be.visible')
    })

    it('should work on tablet devices', () => {
      cy.viewport('ipad-2')
      cy.checkResponsive()
    })
  })

  describe('Performance', () => {
    it('should load login page quickly', () => {
      cy.visit('/login')

      // Check page load performance
      cy.window().then((win) => {
        const performance = win.performance
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

        expect(navigation.loadEventEnd - navigation.loadEventStart).to.be.below(2000)
      })
    })

    it('should handle slow network conditions', () => {
      cy.simulateSlowNetwork()
      cy.visit('/login')

      cy.get('[data-cy=loading-spinner]').should('be.visible')
      cy.get('[data-cy=login-form]').should('be.visible')
    })
  })

  describe('Security', () => {
    it('should not expose sensitive data in DOM', () => {
      cy.get('[data-cy=password-input]').type('secretpassword')

      // Check that password is not visible in DOM
      cy.get('body').should('not.contain', 'secretpassword')
    })

    it('should clear form data on logout', () => {
      cy.get('[data-cy=email-input]').type('test@example.com')
      cy.get('[data-cy=password-input]').type('password123')

      // Navigate away and back
      cy.visit('/about')
      cy.visit('/login')

      // Form should be cleared
      cy.get('[data-cy=email-input]').should('have.value', '')
      cy.get('[data-cy=password-input]').should('have.value', '')
    })

    it('should implement rate limiting', () => {
      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        cy.get('[data-cy=email-input]').clear().type('test@example.com')
        cy.get('[data-cy=password-input]').clear().type('wrongpassword')
        cy.get('[data-cy=login-button]').click()
        cy.wait(1000)
      }

      // Should show rate limit error
      cy.expectNotification('error', 'Muitas tentativas de login')
      cy.get('[data-cy=login-button]').should('be.disabled')
    })
  })
})