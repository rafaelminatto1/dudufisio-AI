describe('Patient Management', () => {
  beforeEach(() => {
    cy.clearData()
    cy.seedData('patients')
    cy.login()
    cy.navigateTo('patients')
  })

  describe('Patient List', () => {
    it('should display patients list correctly', () => {
      cy.get('[data-cy=patients-table]').should('be.visible')
      cy.get('[data-cy=table-row]').should('have.length.greaterThan', 0)

      // Check table headers
      cy.get('[data-cy=table-header-name]').should('contain', 'Nome')
      cy.get('[data-cy=table-header-email]').should('contain', 'Email')
      cy.get('[data-cy=table-header-phone]').should('contain', 'Telefone')
      cy.get('[data-cy=table-header-status]').should('contain', 'Status')
      cy.get('[data-cy=table-header-actions]').should('contain', 'Ações')
    })

    it('should search patients by name', () => {
      cy.searchInTable('João Silva')
      cy.get('[data-cy=table-row]').should('contain', 'João Silva')
      cy.get('[data-cy=table-row]').should('have.length', 1)
    })

    it('should search patients by email', () => {
      cy.searchInTable('joao@example.com')
      cy.get('[data-cy=table-row]').should('contain', 'joao@example.com')
    })

    it('should filter patients by status', () => {
      cy.get('[data-cy=status-filter]').select('Ativo')
      cy.get('[data-cy=table-row]').each(($row) => {
        cy.wrap($row).should('contain', 'Ativo')
      })
    })

    it('should sort patients by name', () => {
      cy.sortTable('name', 'asc')

      // Verify ascending order
      cy.get('[data-cy=table-row]').then($rows => {
        const names = Array.from($rows).map(row =>
          row.querySelector('[data-cy=patient-name]')?.textContent
        )
        const sortedNames = [...names].sort()
        expect(names).to.deep.equal(sortedNames)
      })
    })

    it('should paginate patients list', () => {
      // Assuming we have more than 10 patients
      cy.get('[data-cy=pagination]').should('be.visible')
      cy.get('[data-cy=next-page]').click()
      cy.get('[data-cy=page-info]').should('contain', 'Página 2')
    })

    it('should export patients list', () => {
      cy.get('[data-cy=export-button]').click()
      cy.get('[data-cy=export-format]').select('Excel')
      cy.get('[data-cy=confirm-export]').click()

      cy.expectNotification('success', 'Relatório exportado com sucesso')
    })
  })

  describe('Create Patient', () => {
    beforeEach(() => {
      cy.get('[data-cy=new-patient-button]').click()
    })

    it('should open new patient modal', () => {
      cy.get('[data-cy=patient-modal]').should('be.visible')
      cy.get('[data-cy=modal-title]').should('contain', 'Novo Paciente')
    })

    it('should validate required fields', () => {
      cy.get('[data-cy=save-patient-button]').click()

      cy.expectValidationError('name', 'Nome é obrigatório')
      cy.expectValidationError('email', 'Email é obrigatório')
      cy.expectValidationError('phone', 'Telefone é obrigatório')
      cy.expectValidationError('birthDate', 'Data de nascimento é obrigatória')
    })

    it('should validate email format', () => {
      cy.get('[data-cy=patient-email]').type('invalid-email')
      cy.get('[data-cy=save-patient-button]').click()

      cy.expectValidationError('email', 'Email inválido')
    })

    it('should validate CPF format', () => {
      cy.get('[data-cy=patient-cpf]').type('12345678900')
      cy.get('[data-cy=save-patient-button]').click()

      cy.expectValidationError('cpf', 'CPF inválido')
    })

    it('should validate phone format', () => {
      cy.get('[data-cy=patient-phone]').type('123456')
      cy.get('[data-cy=save-patient-button]').click()

      cy.expectValidationError('phone', 'Telefone inválido')
    })

    it('should create patient successfully', () => {
      const patient = {
        name: 'Maria Santos',
        email: 'maria@example.com',
        phone: '(11) 99999-9999',
        birthDate: '1990-05-15',
        cpf: '123.456.789-01',
        address: {
          street: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567'
        }
      }

      cy.fillPatientForm(patient)
      cy.get('[data-cy=save-patient-button]').click()

      cy.expectNotification('success', 'Paciente criado com sucesso')
      cy.get('[data-cy=patient-modal]').should('not.exist')
      cy.get('[data-cy=patients-table]').should('contain', patient.name)
    })

    it('should handle duplicate email validation', () => {
      const patient = {
        name: 'Test User',
        email: 'existing@example.com', // Email already exists in fixtures
        phone: '(11) 99999-9999',
        birthDate: '1990-05-15',
        cpf: '123.456.789-01'
      }

      cy.fillPatientForm(patient)
      cy.get('[data-cy=save-patient-button]').click()

      cy.expectValidationError('email', 'Email já está em uso')
    })

    it('should upload patient photo', () => {
      cy.get('[data-cy=patient-photo-upload]').should('be.visible')
      cy.uploadFile('[data-cy=patient-photo-upload]', 'patient-photo.jpg')

      cy.get('[data-cy=photo-preview]').should('be.visible')
      cy.get('[data-cy=photo-preview]').should('have.attr', 'src')
    })

    it('should add emergency contact', () => {
      cy.get('[data-cy=add-emergency-contact]').click()

      cy.get('[data-cy=emergency-contact-name]').type('João Santos')
      cy.get('[data-cy=emergency-contact-phone]').type('(11) 88888-8888')
      cy.get('[data-cy=emergency-contact-relationship]').select('Pai')

      cy.get('[data-cy=emergency-contacts-list]').should('contain', 'João Santos')
    })
  })

  describe('Edit Patient', () => {
    beforeEach(() => {
      cy.get('[data-cy=table-row]').first().find('[data-cy=edit-patient]').click()
    })

    it('should open edit patient modal with existing data', () => {
      cy.get('[data-cy=patient-modal]').should('be.visible')
      cy.get('[data-cy=modal-title]').should('contain', 'Editar Paciente')

      // Check that form is populated with existing data
      cy.get('[data-cy=patient-name]').should('not.have.value', '')
      cy.get('[data-cy=patient-email]').should('not.have.value', '')
    })

    it('should update patient successfully', () => {
      cy.get('[data-cy=patient-name]').clear().type('Updated Name')
      cy.get('[data-cy=save-patient-button]').click()

      cy.expectNotification('success', 'Paciente atualizado com sucesso')
      cy.get('[data-cy=patients-table]').should('contain', 'Updated Name')
    })

    it('should handle optimistic updates', () => {
      // Mock slow network
      cy.intercept('PUT', '**/api/patients/**', { delay: 2000 }).as('updatePatient')

      cy.get('[data-cy=patient-name]').clear().type('Optimistic Update')
      cy.get('[data-cy=save-patient-button]').click()

      // Should show updated name immediately
      cy.get('[data-cy=patients-table]').should('contain', 'Optimistic Update')

      cy.wait('@updatePatient')
    })
  })

  describe('Patient Details', () => {
    beforeEach(() => {
      cy.get('[data-cy=table-row]').first().find('[data-cy=view-patient]').click()
    })

    it('should display patient details page', () => {
      cy.url().should('include', '/patients/')
      cy.get('[data-cy=patient-details]').should('be.visible')

      // Check patient information sections
      cy.get('[data-cy=patient-info]').should('be.visible')
      cy.get('[data-cy=patient-appointments]').should('be.visible')
      cy.get('[data-cy=patient-medical-history]').should('be.visible')
      cy.get('[data-cy=patient-documents]').should('be.visible')
    })

    it('should display patient appointments', () => {
      cy.get('[data-cy=appointments-tab]').click()
      cy.get('[data-cy=appointments-list]').should('be.visible')

      // Check appointment cards
      cy.get('[data-cy=appointment-card]').should('have.length.greaterThan', 0)
      cy.get('[data-cy=appointment-card]').first().should('contain', 'Fisioterapia')
    })

    it('should create new appointment for patient', () => {
      cy.get('[data-cy=new-appointment-button]').click()

      const appointment = {
        date: '2024-02-15',
        time: '14:00',
        duration: 60,
        notes: 'Sessão de fisioterapia'
      }

      cy.get('[data-cy=appointment-date]').type(appointment.date)
      cy.get('[data-cy=appointment-time]').type(appointment.time)
      cy.get('[data-cy=appointment-duration]').type(appointment.duration.toString())
      cy.get('[data-cy=appointment-notes]').type(appointment.notes)

      cy.get('[data-cy=save-appointment-button]').click()

      cy.expectNotification('success', 'Consulta agendada com sucesso')
    })

    it('should display medical history', () => {
      cy.get('[data-cy=medical-history-tab]').click()
      cy.get('[data-cy=medical-history]').should('be.visible')

      // Check medical history sections
      cy.get('[data-cy=diagnoses]').should('be.visible')
      cy.get('[data-cy=treatments]').should('be.visible')
      cy.get('[data-cy=medications]').should('be.visible')
      cy.get('[data-cy=allergies]').should('be.visible')
    })

    it('should add medical note', () => {
      cy.get('[data-cy=medical-history-tab]').click()
      cy.get('[data-cy=add-medical-note]').click()

      cy.get('[data-cy=note-type]').select('Diagnóstico')
      cy.get('[data-cy=note-content]').type('Lombalgia crônica')
      cy.get('[data-cy=note-date]').type('2024-01-15')

      cy.get('[data-cy=save-note-button]').click()

      cy.expectNotification('success', 'Nota médica adicionada')
      cy.get('[data-cy=medical-notes]').should('contain', 'Lombalgia crônica')
    })

    it('should upload patient documents', () => {
      cy.get('[data-cy=documents-tab]').click()
      cy.get('[data-cy=upload-document]').click()

      cy.get('[data-cy=document-type]').select('Exame')
      cy.get('[data-cy=document-name]').type('Raio-X da coluna')
      cy.uploadFile('[data-cy=document-file]', 'medical-document.pdf', 'application/pdf')

      cy.get('[data-cy=save-document-button]').click()

      cy.expectNotification('success', 'Documento enviado com sucesso')
      cy.get('[data-cy=documents-list]').should('contain', 'Raio-X da coluna')
    })

    it('should generate patient report', () => {
      cy.get('[data-cy=generate-report]').click()
      cy.get('[data-cy=report-type]').select('Relatório Completo')
      cy.get('[data-cy=report-period]').select('Últimos 6 meses')

      cy.get('[data-cy=generate-button]').click()

      cy.expectNotification('success', 'Relatório gerado com sucesso')
    })
  })

  describe('Delete Patient', () => {
    it('should delete patient with confirmation', () => {
      cy.get('[data-cy=table-row]').first().find('[data-cy=delete-patient]').click()

      cy.get('[data-cy=confirmation-modal]').should('be.visible')
      cy.get('[data-cy=confirm-delete]').click()

      cy.expectNotification('success', 'Paciente excluído com sucesso')
      // Patient should be removed from table
      cy.get('[data-cy=table-row]').should('have.length.lessThan', 10)
    })

    it('should cancel delete operation', () => {
      const initialRowCount = cy.get('[data-cy=table-row]').its('length')

      cy.get('[data-cy=table-row]').first().find('[data-cy=delete-patient]').click()
      cy.get('[data-cy=cancel-delete]').click()

      cy.get('[data-cy=confirmation-modal]').should('not.exist')
      cy.get('[data-cy=table-row]').should('have.length', initialRowCount)
    })

    it('should prevent deletion of patient with active appointments', () => {
      // Select patient with active appointments
      cy.get('[data-cy=table-row]')
        .contains('Paciente com consultas ativas')
        .parent()
        .find('[data-cy=delete-patient]')
        .click()

      cy.get('[data-cy=confirm-delete]').click()

      cy.expectNotification('error', 'Não é possível excluir paciente com consultas ativas')
      cy.get('[data-cy=confirmation-modal]').should('not.exist')
    })
  })

  describe('Patient Import/Export', () => {
    it('should import patients from CSV', () => {
      cy.get('[data-cy=import-button]').click()
      cy.get('[data-cy=import-modal]').should('be.visible')

      cy.uploadFile('[data-cy=import-file]', 'patients-import.csv', 'text/csv')
      cy.get('[data-cy=import-preview]').should('be.visible')

      cy.get('[data-cy=confirm-import]').click()

      cy.expectNotification('success', '5 pacientes importados com sucesso')
    })

    it('should validate import file format', () => {
      cy.get('[data-cy=import-button]').click()
      cy.uploadFile('[data-cy=import-file]', 'invalid-file.txt', 'text/plain')

      cy.expectValidationError('file', 'Formato de arquivo inválido')
    })

    it('should handle import errors gracefully', () => {
      cy.get('[data-cy=import-button]').click()
      cy.uploadFile('[data-cy=import-file]', 'patients-with-errors.csv', 'text/csv')

      cy.get('[data-cy=import-errors]').should('be.visible')
      cy.get('[data-cy=error-row]').should('contain', 'Email inválido na linha 3')
    })
  })

  describe('Patient Communication', () => {
    beforeEach(() => {
      cy.get('[data-cy=table-row]').first().find('[data-cy=view-patient]').click()
    })

    it('should send email to patient', () => {
      cy.get('[data-cy=send-email]').click()

      cy.get('[data-cy=email-template]').select('Lembrete de consulta')
      cy.get('[data-cy=email-subject]').should('have.value', 'Lembrete: Sua consulta está agendada')
      cy.get('[data-cy=email-content]').should('not.be.empty')

      cy.get('[data-cy=send-email-button]').click()

      cy.expectNotification('success', 'Email enviado com sucesso')
    })

    it('should send SMS to patient', () => {
      cy.get('[data-cy=send-sms]').click()

      cy.get('[data-cy=sms-template]').select('Confirmação de consulta')
      cy.get('[data-cy=sms-content]').should('not.be.empty')

      cy.get('[data-cy=send-sms-button]').click()

      cy.expectNotification('success', 'SMS enviado com sucesso')
    })

    it('should schedule automatic reminders', () => {
      cy.get('[data-cy=reminder-settings]').click()

      cy.get('[data-cy=email-reminder]').check()
      cy.get('[data-cy=email-reminder-time]').select('24 horas antes')

      cy.get('[data-cy=sms-reminder]').check()
      cy.get('[data-cy=sms-reminder-time]').select('2 horas antes')

      cy.get('[data-cy=save-reminder-settings]').click()

      cy.expectNotification('success', 'Configurações de lembrete salvas')
    })
  })

  describe('Performance and Accessibility', () => {
    it('should load patients quickly', () => {
      cy.window().then((win) => {
        const performance = win.performance
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

        expect(navigation.loadEventEnd - navigation.loadEventStart).to.be.below(3000)
      })
    })

    it('should be accessible', () => {
      cy.checkA11y()
    })

    it('should work on mobile devices', () => {
      cy.viewport('iphone-x')
      cy.get('[data-cy=patients-table]').should('be.visible')
      cy.get('[data-cy=new-patient-button]').should('be.visible')
    })

    it('should handle large datasets efficiently', () => {
      // Mock large dataset
      cy.intercept('GET', '**/api/patients**', { fixture: 'large-patients-dataset.json' })
      cy.reload()

      cy.get('[data-cy=patients-table]').should('be.visible')
      cy.get('[data-cy=virtual-scroll]').should('exist')
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      cy.intercept('GET', '**/api/patients**', { forceNetworkError: true })
      cy.reload()

      cy.get('[data-cy=error-message]').should('be.visible')
      cy.get('[data-cy=retry-button]').should('be.visible')
    })

    it('should retry failed requests', () => {
      cy.intercept('GET', '**/api/patients**', { forceNetworkError: true }).as('failedRequest')
      cy.reload()

      cy.get('[data-cy=retry-button]').click()
      cy.wait('@failedRequest')

      cy.expectNotification('error', 'Erro ao carregar pacientes')
    })

    it('should handle server errors', () => {
      cy.intercept('GET', '**/api/patients**', { statusCode: 500 })
      cy.reload()

      cy.get('[data-cy=error-message]').should('contain', 'Erro interno do servidor')
    })
  })
})