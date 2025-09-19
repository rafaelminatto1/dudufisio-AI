import { supabase } from '../../lib/supabase';
import authService from '../../services/auth/authService';
import patientService from '../../services/supabase/patientService';
import appointmentService from '../../services/supabase/appointmentService';
import sessionService from '../../services/supabase/sessionService';
import realtimeService from '../../services/supabase/realtimeService';

/**
 * Testes de integração com Supabase
 * 
 * IMPORTANTE: Configure as variáveis de ambiente antes de executar:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 * 
 * Execute com: npm test tests/supabase/integration.test.ts
 */

describe('Supabase Integration Tests', () => {
  let testUserId: string | null = null;
  let testPatientId: string | null = null;
  let testAppointmentId: string | null = null;

  // Test credentials
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  beforeAll(async () => {
    // Verify Supabase connection
    const { data, error } = await supabase.from('users').select('count').single();
    if (error) {
      console.error('Failed to connect to Supabase:', error);
      throw new Error('Supabase connection failed');
    }
  });

  afterAll(async () => {
    // Cleanup test data
    if (testAppointmentId) {
      await supabase.from('appointments').delete().eq('id', testAppointmentId);
    }
    if (testPatientId) {
      await supabase.from('patients').delete().eq('id', testPatientId);
    }
    if (testUserId) {
      await supabase.from('users').delete().eq('id', testUserId);
      await supabase.auth.admin.deleteUser(testUserId);
    }
    
    // Unsubscribe from all real-time channels
    realtimeService.unsubscribeAll();
  });

  describe('Authentication', () => {
    test('Should create a new user account', async () => {
      const result = await authService.signUp({
        email: testEmail,
        password: testPassword,
        fullName: 'Test User',
        role: 'therapist',
        phone: '+55 11 98765-4321',
      });

      expect(result.user).toBeDefined();
      expect(result.profile).toBeDefined();
      expect(result.profile?.email).toBe(testEmail);
      expect(result.profile?.role).toBe('therapist');

      testUserId = result.user?.id || null;
    });

    test('Should sign in with credentials', async () => {
      const result = await authService.signIn({
        email: testEmail,
        password: testPassword,
      });

      expect(result.user).toBeDefined();
      expect(result.session).toBeDefined();
      expect(result.profile).toBeDefined();
    });

    test('Should get current user', async () => {
      const user = await authService.getCurrentUser();
      expect(user).toBeDefined();
      expect(user?.email).toBe(testEmail);
    });

    test('Should update user profile', async () => {
      if (!testUserId) {
        throw new Error('Test user not created');
      }

      const updatedProfile = await authService.updateProfile(testUserId, {
        fullName: 'Updated Test User',
        specialization: 'Orthopedics',
      });

      expect(updatedProfile.fullName).toBe('Updated Test User');
      expect(updatedProfile.specialization).toBe('Orthopedics');
    });
  });

  describe('Patient Management', () => {
    test('Should create a new patient', async () => {
      const patientData = {
        full_name: 'Test Patient',
        email: `patient${Date.now()}@example.com`,
        phone: '+55 11 91234-5678',
        cpf: `${Date.now()}`.slice(-11),
        birth_date: '1990-01-01',
        gender: 'female' as const,
        address_city: 'São Paulo',
        address_state: 'SP',
      };

      const patient = await patientService.createPatient(patientData);
      
      expect(patient).toBeDefined();
      expect(patient.full_name).toBe(patientData.full_name);
      expect(patient.email).toBe(patientData.email);
      
      testPatientId = patient.id;
    });

    test('Should get patient by ID', async () => {
      if (!testPatientId) {
        throw new Error('Test patient not created');
      }

      const patient = await patientService.getPatientById(testPatientId);
      
      expect(patient).toBeDefined();
      expect(patient.id).toBe(testPatientId);
      expect(patient.full_name).toBe('Test Patient');
    });

    test('Should update patient', async () => {
      if (!testPatientId) {
        throw new Error('Test patient not created');
      }

      const updated = await patientService.updatePatient(testPatientId, {
        occupation: 'Software Engineer',
        observations: 'Test observation',
      });

      expect(updated.occupation).toBe('Software Engineer');
      expect(updated.observations).toBe('Test observation');
    });

    test('Should search patients', async () => {
      const results = await patientService.searchPatients('Test');
      
      expect(Array.isArray(results)).toBe(true);
      if (testPatientId) {
        const found = results.find(p => p.id === testPatientId);
        expect(found).toBeDefined();
      }
    });

    test('Should get patient statistics', async () => {
      if (!testPatientId) {
        throw new Error('Test patient not created');
      }

      const stats = await patientService.getPatientStatistics(testPatientId);
      
      expect(stats).toBeDefined();
      expect(typeof stats.totalAppointments).toBe('number');
      expect(typeof stats.completedSessions).toBe('number');
      expect(typeof stats.activePainPoints).toBe('number');
      expect(typeof stats.financialBalance).toBe('number');
    });
  });

  describe('Appointment Management', () => {
    test('Should create an appointment', async () => {
      if (!testPatientId || !testUserId) {
        throw new Error('Test patient or user not created');
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const appointmentData = {
        patient_id: testPatientId,
        therapist_id: testUserId,
        appointment_date: tomorrow.toISOString().split('T')[0],
        start_time: '14:00:00',
        end_time: '15:00:00',
        appointment_type: 'session' as const,
        status: 'scheduled' as const,
        chief_complaint: 'Test complaint',
      };

      const appointment = await appointmentService.createAppointment(appointmentData);
      
      expect(appointment).toBeDefined();
      expect(appointment.patient_id).toBe(testPatientId);
      expect(appointment.therapist_id).toBe(testUserId);
      
      testAppointmentId = appointment.id;
    });

    test('Should check for appointment conflicts', async () => {
      if (!testUserId) {
        throw new Error('Test user not created');
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const conflicts = await appointmentService.checkAppointmentConflict(
        testUserId,
        tomorrow.toISOString().split('T')[0],
        '14:30:00',
        '15:30:00'
      );

      // Should detect conflict with the appointment created above
      if (testAppointmentId) {
        expect(conflicts.length).toBeGreaterThan(0);
      }
    });

    test('Should get available time slots', async () => {
      if (!testUserId) {
        throw new Error('Test user not created');
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const slots = await appointmentService.getAvailableTimeSlots(
        testUserId,
        tomorrow.toISOString().split('T')[0]
      );

      expect(Array.isArray(slots)).toBe(true);
      expect(slots.length).toBeGreaterThan(0);
      
      // Check that 14:00 slot is not available (created above)
      if (testAppointmentId) {
        const slot14 = slots.find(s => s.time === '14:00:00');
        expect(slot14?.available).toBe(false);
      }
    });

    test('Should update appointment status', async () => {
      if (!testAppointmentId) {
        throw new Error('Test appointment not created');
      }

      const updated = await appointmentService.updateAppointment(testAppointmentId, {
        status: 'confirmed',
        notes: 'Patient confirmed attendance',
      });

      expect(updated.status).toBe('confirmed');
      expect(updated.notes).toBe('Patient confirmed attendance');
    });

    test('Should get appointment statistics', async () => {
      const stats = await appointmentService.getAppointmentStatistics();
      
      expect(stats).toBeDefined();
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.scheduled).toBe('number');
      expect(typeof stats.completed).toBe('number');
      expect(stats.byType).toBeDefined();
    });
  });

  describe('Session Management', () => {
    test('Should create a session for appointment', async () => {
      if (!testAppointmentId) {
        throw new Error('Test appointment not created');
      }

      const sessionData = {
        appointment_id: testAppointmentId,
        pain_level_before: 7,
        pain_level_after: 4,
        procedures_performed: 'Manual therapy, exercises',
        objective_assessment: 'Good progress',
        treatment_performed: 'Manual therapy session',
        patient_response: 'Positive response',
        progress_notes: 'Patient showing improvement',
        next_session_notes: 'Continue with current plan',
      };

      const session = await sessionService.createSession(sessionData);
      
      expect(session).toBeDefined();
      expect(session.appointment_id).toBe(testAppointmentId);
      expect(session.pain_level_before).toBe(7);
      expect(session.pain_level_after).toBe(4);
    });

    test('Should get patient evolution data', async () => {
      if (!testPatientId) {
        throw new Error('Test patient not created');
      }

      const evolution = await sessionService.getPatientEvolutionData(testPatientId);
      
      expect(Array.isArray(evolution)).toBe(true);
    });

    test('Should get patient session statistics', async () => {
      if (!testPatientId) {
        throw new Error('Test patient not created');
      }

      const stats = await sessionService.getPatientSessionStatistics(testPatientId);
      
      expect(stats).toBeDefined();
      expect(typeof stats.totalSessions).toBe('number');
      expect(typeof stats.averagePainReduction).toBe('number');
      expect(stats.progressTrend).toMatch(/improving|stable|worsening/);
    });
  });

  describe('Real-time Subscriptions', () => {
    test('Should subscribe to patient updates', (done) => {
      if (!testPatientId) {
        throw new Error('Test patient not created');
      }

      const subscription = realtimeService.subscribeToRecord(
        'patients',
        testPatientId,
        (payload) => {
          expect(payload).toBeDefined();
          expect(payload.eventType).toMatch(/INSERT|UPDATE|DELETE/);
          subscription.unsubscribe();
          done();
        }
      );

      // Trigger an update
      patientService.updatePatient(testPatientId, {
        observations: 'Real-time test update',
      });
    }, 10000);

    test('Should subscribe to multiple tables', (done) => {
      let eventCount = 0;
      const subscription = realtimeService.subscribeToMultipleTables(
        ['patients', 'appointments'],
        (table, payload) => {
          expect(table).toMatch(/patients|appointments/);
          expect(payload).toBeDefined();
          eventCount++;
          
          if (eventCount >= 2) {
            subscription.unsubscribe();
            done();
          }
        }
      );

      // Trigger updates
      if (testPatientId) {
        patientService.updatePatient(testPatientId, {
          observations: 'Multi-table test 1',
        });
      }
      
      if (testAppointmentId) {
        appointmentService.updateAppointment(testAppointmentId, {
          notes: 'Multi-table test 2',
        });
      }
    }, 10000);

    test('Should handle broadcast messages', (done) => {
      const channelName = 'test_channel';
      const eventName = 'test_event';
      const testPayload = { message: 'Hello, real-time!' };

      const subscription = realtimeService.subscribeToBroadcast(
        channelName,
        eventName,
        (payload) => {
          expect(payload).toEqual(testPayload);
          subscription.unsubscribe();
          done();
        }
      );

      // Send broadcast after subscription is ready
      setTimeout(() => {
        realtimeService.sendBroadcast(channelName, eventName, testPayload);
      }, 1000);
    }, 10000);
  });

  describe('Error Handling', () => {
    test('Should handle duplicate patient CPF', async () => {
      if (!testPatientId) {
        throw new Error('Test patient not created');
      }

      // Get existing patient's CPF
      const existingPatient = await patientService.getPatientById(testPatientId);
      
      await expect(
        patientService.createPatient({
          full_name: 'Duplicate Patient',
          email: 'duplicate@example.com',
          phone: '+55 11 99999-9999',
          cpf: existingPatient.cpf,
          birth_date: '1995-01-01',
          gender: 'male',
        })
      ).rejects.toThrow('CPF já cadastrado');
    });

    test('Should handle appointment conflicts', async () => {
      if (!testAppointmentId || !testPatientId || !testUserId) {
        throw new Error('Test data not created');
      }

      const existingAppointment = await appointmentService.getAppointmentById(testAppointmentId);
      
      await expect(
        appointmentService.createAppointment({
          patient_id: testPatientId,
          therapist_id: testUserId,
          appointment_date: existingAppointment.appointment_date,
          start_time: existingAppointment.start_time,
          end_time: existingAppointment.end_time,
          appointment_type: 'session',
        })
      ).rejects.toThrow('Horário já ocupado');
    });

    test('Should handle invalid authentication', async () => {
      await expect(
        authService.signIn({
          email: 'invalid@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    test('Should handle bulk operations efficiently', async () => {
      const startTime = Date.now();
      
      // Search patients (should use index)
      await patientService.searchPatients('Test');
      
      // Get appointments with filters (should use composite index)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      await appointmentService.getAppointments({
        startDate: tomorrow.toISOString().split('T')[0],
        endDate: tomorrow.toISOString().split('T')[0],
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Operations should complete within 2 seconds
      expect(duration).toBeLessThan(2000);
    });
  });
});

// Run tests if this file is executed directly
if (require.main === module) {
  console.log('Running Supabase integration tests...');
  console.log('Make sure Supabase is configured and running.');
}
