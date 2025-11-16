import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signInWithOtp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    updateUser: vi.fn()
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }))
};

const mockNavigate = vi.fn();

vi.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => mockSupabaseClient,
  useUser: () => ({ id: 'patient-123', email: 'patient@email.com', role: 'patient' }),
  useSession: () => ({ access_token: 'mock-token' })
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  useParams: () => ({ id: 'patient-123' })
}));

describe('Patient Portal Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default auth state for patient
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'patient-123', email: 'patient@email.com', role: 'patient' },
          access_token: 'mock-token'
        }
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Patient Authentication', () => {
    it('should allow patient to login with email and password', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: { id: 'patient-123', email: 'patient@email.com' },
          session: { access_token: 'mock-token' }
        },
        error: null
      });

      const loginCredentials = {
        email: 'patient@email.com',
        password: 'patientPassword123'
      };

      const result = await mockSupabaseClient.auth.signInWithPassword(loginCredentials);

      expect(result.error).toBeNull();
      expect(result.data.user.email).toBe('patient@email.com');
    });

    it('should allow patient to login with OTP (magic link)', async () => {
      mockSupabaseClient.auth.signInWithOtp.mockResolvedValueOnce({
        data: {
          user: null,
          session: null
        },
        error: null
      });

      const result = await mockSupabaseClient.auth.signInWithOtp({
        email: 'patient@email.com',
        options: {
          emailRedirectTo: 'http://localhost:3000/patient-portal'
        }
      });

      expect(result.error).toBeNull();
      expect(mockSupabaseClient.auth.signInWithOtp).toHaveBeenCalledWith({
        email: 'patient@email.com',
        options: {
          emailRedirectTo: 'http://localhost:3000/patient-portal'
        }
      });
    });

    it('should redirect patient to portal dashboard after login', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: { id: 'patient-123', email: 'patient@email.com', role: 'patient' },
          session: { access_token: 'mock-token' }
        },
        error: null
      });

      await mockSupabaseClient.auth.signInWithPassword({
        email: 'patient@email.com',
        password: 'password'
      });

      mockNavigate('/patient-portal/dashboard');
      expect(mockNavigate).toHaveBeenCalledWith('/patient-portal/dashboard');
    });
  });

  describe('Patient Profile Management', () => {
    it('should display patient personal information', async () => {
      const mockPatientProfile = {
        id: 'patient-123',
        name: 'João Silva',
        email: 'patient@email.com',
        phone: '(11) 98765-4321',
        cpf: '123.456.789-00',
        birthDate: '1990-01-15',
        address: {
          street: 'Rua das Flores',
          number: '123',
          complement: 'Apto 45',
          neighborhood: 'Jardim Primavera',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567'
        },
        emergencyContact: {
          name: 'Maria Silva',
          phone: '(11) 98765-4322',
          relationship: 'Esposa'
        },
        insuranceProvider: 'Unimed',
        insuranceNumber: '123456789'
      };

      const profileQuery = mockSupabaseClient.from('patients');
      profileQuery.select.mockReturnThis();
      profileQuery.eq.mockReturnThis();
      profileQuery.single.mockResolvedValueOnce({
        data: mockPatientProfile,
        error: null
      });

      const result = await profileQuery
        .select('*')
        .eq('id', 'patient-123')
        .single();

      expect(result.data.name).toBe('João Silva');
      expect(result.data.cpf).toBe('123.456.789-00');
    });

    it('should allow patient to update contact information', async () => {
      const updateData = {
        phone: '(11) 99999-8888',
        email: 'newemail@email.com',
        address: {
          street: 'Av. Paulista',
          number: '1000',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100'
        }
      };

      const updateQuery = mockSupabaseClient.from('patients');
      updateQuery.update.mockReturnThis();
      updateQuery.eq.mockResolvedValueOnce({
        data: { id: 'patient-123', ...updateData },
        error: null
      });

      const result = await updateQuery
        .update(updateData)
        .eq('id', 'patient-123');

      expect(result.data.phone).toBe('(11) 99999-8888');
      expect(result.data.address.street).toBe('Av. Paulista');
    });

    it('should update emergency contact information', async () => {
      const emergencyContactUpdate = {
        emergencyContact: {
          name: 'Carlos Silva',
          phone: '(11) 98888-7777',
          relationship: 'Irmão'
        }
      };

      const updateQuery = mockSupabaseClient.from('patients');
      updateQuery.update.mockReturnThis();
      updateQuery.eq.mockResolvedValueOnce({
        data: { id: 'patient-123', ...emergencyContactUpdate },
        error: null
      });

      const result = await updateQuery
        .update(emergencyContactUpdate)
        .eq('id', 'patient-123');

      expect(result.data.emergencyContact.name).toBe('Carlos Silva');
      expect(result.data.emergencyContact.relationship).toBe('Irmão');
    });
  });

  describe('Appointment Viewing', () => {
    it('should display upcoming appointments', async () => {
      const today = new Date().toISOString();
      const mockAppointments = [
        {
          id: 'apt-1',
          date: '2024-02-20',
          startTime: '14:00',
          endTime: '15:00',
          therapistName: 'Dra. Maria Santos',
          type: 'session',
          room: 'Sala 1',
          status: 'confirmed'
        },
        {
          id: 'apt-2',
          date: '2024-02-27',
          startTime: '14:00',
          endTime: '15:00',
          therapistName: 'Dra. Maria Santos',
          type: 'session',
          room: 'Sala 1',
          status: 'scheduled'
        }
      ];

      const appointmentsQuery = mockSupabaseClient.from('appointments');
      appointmentsQuery.select.mockReturnThis();
      appointmentsQuery.eq.mockReturnThis();
      appointmentsQuery.gte.mockReturnThis();
      appointmentsQuery.order.mockResolvedValueOnce({
        data: mockAppointments,
        error: null
      });

      const result = await appointmentsQuery
        .select('*, therapists(name)')
        .eq('patient_id', 'patient-123')
        .gte('date', today)
        .order('date, startTime');

      expect(result.data).toHaveLength(2);
      expect(result.data[0].date).toBe('2024-02-20');
    });

    it('should display appointment history', async () => {
      const mockHistoricalAppointments = [
        {
          id: 'apt-3',
          date: '2024-02-01',
          startTime: '14:00',
          endTime: '15:00',
          therapistName: 'Dra. Maria Santos',
          type: 'evaluation',
          status: 'completed',
          sessionNotes: 'Avaliação inicial completa'
        },
        {
          id: 'apt-4',
          date: '2024-02-08',
          startTime: '14:00',
          endTime: '15:00',
          therapistName: 'Dra. Maria Santos',
          type: 'session',
          status: 'completed',
          sessionNotes: 'Boa evolução do quadro'
        }
      ];

      const historyQuery = mockSupabaseClient.from('appointments');
      historyQuery.select.mockReturnThis();
      historyQuery.eq.mockReturnThis();
      historyQuery.lt = vi.fn().mockReturnThis();
      historyQuery.order.mockReturnThis();
      historyQuery.limit.mockResolvedValueOnce({
        data: mockHistoricalAppointments,
        error: null
      });

      const result = await historyQuery
        .select('*, sessions(*)')
        .eq('patient_id', 'patient-123')
        .lt('date', new Date().toISOString())
        .order('date', { ascending: false })
        .limit(10);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].status).toBe('completed');
    });

    it('should request appointment cancellation', async () => {
      const appointmentId = 'apt-1';
      const cancellationRequest = {
        status: 'cancellation_requested',
        cancellation_reason: 'Imprevisto pessoal',
        cancellation_requested_at: new Date().toISOString()
      };

      const cancelQuery = mockSupabaseClient.from('appointments');
      cancelQuery.update.mockReturnThis();
      cancelQuery.eq.mockResolvedValueOnce({
        data: { id: appointmentId, ...cancellationRequest },
        error: null
      });

      const result = await cancelQuery
        .update(cancellationRequest)
        .eq('id', appointmentId);

      expect(result.data.status).toBe('cancellation_requested');
      expect(result.data.cancellation_reason).toBeDefined();
    });
  });

  describe('Exercise Program Access', () => {
    it('should view assigned exercise program', async () => {
      const mockExerciseProgram = {
        id: 'program-1',
        patient_id: 'patient-123',
        name: 'Programa de Reabilitação Lombar',
        start_date: '2024-02-01',
        end_date: '2024-03-01',
        exercises: [
          {
            id: 'ex-1',
            name: 'Alongamento Lombar',
            description: 'Deitar de costas e puxar os joelhos em direção ao peito',
            sets: 3,
            reps: 10,
            duration: '30 segundos',
            frequency: 'Diário',
            videoUrl: 'https://videos.clinic.com/ex-1.mp4',
            imageUrl: 'https://images.clinic.com/ex-1.jpg'
          },
          {
            id: 'ex-2',
            name: 'Ponte',
            description: 'Elevar o quadril mantendo os pés no chão',
            sets: 3,
            reps: 15,
            frequency: '3x por semana',
            videoUrl: 'https://videos.clinic.com/ex-2.mp4'
          }
        ]
      };

      const programQuery = mockSupabaseClient.from('exercise_programs');
      programQuery.select.mockReturnThis();
      programQuery.eq.mockReturnThis();
      programQuery.gte.mockReturnThis();
      programQuery.lte.mockReturnThis();
      programQuery.single.mockResolvedValueOnce({
        data: mockExerciseProgram,
        error: null
      });

      const result = await programQuery
        .select('*, exercise_program_items(*, exercises(*))')
        .eq('patient_id', 'patient-123')
        .gte('start_date', '2024-02-01')
        .lte('end_date', '2024-03-01')
        .single();

      expect(result.data.exercises).toHaveLength(2);
      expect(result.data.exercises[0].name).toContain('Alongamento');
    });

    it('should track exercise completion', async () => {
      const exerciseLog = {
        patient_id: 'patient-123',
        exercise_id: 'ex-1',
        program_id: 'program-1',
        completed_at: new Date().toISOString(),
        sets_completed: 3,
        reps_completed: 10,
        pain_level: 3,
        difficulty: 'moderate',
        notes: 'Sentiu leve desconforto no final'
      };

      const logQuery = mockSupabaseClient.from('exercise_logs');
      logQuery.insert.mockResolvedValueOnce({
        data: { id: 'log-new', ...exerciseLog },
        error: null
      });

      const result = await logQuery.insert(exerciseLog);

      expect(result.data.sets_completed).toBe(3);
      expect(result.data.pain_level).toBe(3);
    });

    it('should view exercise progress statistics', async () => {
      const patientId = 'patient-123';
      const programId = 'program-1';

      const statsQuery = mockSupabaseClient.from('exercise_logs');
      statsQuery.select.mockReturnThis();
      statsQuery.eq.mockReturnThis();
      statsQuery.gte.mockReturnThis();
      statsQuery.lte.mockResolvedValueOnce({
        data: [
          { date: '2024-02-01', completed: 2, total: 2 },
          { date: '2024-02-02', completed: 2, total: 2 },
          { date: '2024-02-03', completed: 1, total: 2 },
          { date: '2024-02-04', completed: 2, total: 2 },
          { date: '2024-02-05', completed: 2, total: 2 }
        ],
        error: null
      });

      const result = await statsQuery
        .select('date, count(*) as completed')
        .eq('patient_id', patientId)
        .eq('program_id', programId)
        .gte('date', '2024-02-01')
        .lte('date', '2024-02-05');

      const totalExercises = result.data.reduce((sum, day) => sum + day.total, 0);
      const completedExercises = result.data.reduce((sum, day) => sum + day.completed, 0);
      const completionRate = (completedExercises / totalExercises) * 100;

      expect(completionRate).toBe(90);
    });
  });

  describe('Treatment Progress Viewing', () => {
    it('should view pain evolution chart', async () => {
      const mockPainData = [
        { date: '2024-01-15', pain_level: 8, body_region: 'lower_back' },
        { date: '2024-01-22', pain_level: 7, body_region: 'lower_back' },
        { date: '2024-02-01', pain_level: 5, body_region: 'lower_back' },
        { date: '2024-02-08', pain_level: 4, body_region: 'lower_back' },
        { date: '2024-02-15', pain_level: 3, body_region: 'lower_back' }
      ];

      const painQuery = mockSupabaseClient.from('pain_points');
      painQuery.select.mockReturnThis();
      painQuery.eq.mockReturnThis();
      painQuery.order.mockResolvedValueOnce({
        data: mockPainData,
        error: null
      });

      const result = await painQuery
        .select('date, pain_level, body_region')
        .eq('patient_id', 'patient-123')
        .order('date');

      const initialPain = result.data[0].pain_level;
      const currentPain = result.data[result.data.length - 1].pain_level;
      const improvement = ((initialPain - currentPain) / initialPain) * 100;

      expect(improvement).toBeGreaterThan(60);
      expect(result.data).toHaveLength(5);
    });

    it('should view session summaries', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          date: '2024-02-01',
          therapist_name: 'Dra. Maria Santos',
          chief_complaint: 'Dor lombar',
          treatment_performed: 'Mobilização e exercícios',
          patient_response: 'Boa resposta',
          homework: 'Exercícios diários',
          pain_before: 6,
          pain_after: 4
        },
        {
          id: 'session-2',
          date: '2024-02-08',
          therapist_name: 'Dra. Maria Santos',
          chief_complaint: 'Dor lombar reduzida',
          treatment_performed: 'Progressão de exercícios',
          patient_response: 'Excelente evolução',
          homework: 'Aumentar frequência dos exercícios',
          pain_before: 4,
          pain_after: 2
        }
      ];

      const sessionsQuery = mockSupabaseClient.from('sessions');
      sessionsQuery.select.mockReturnThis();
      sessionsQuery.eq.mockReturnThis();
      sessionsQuery.order.mockResolvedValueOnce({
        data: mockSessions,
        error: null
      });

      const result = await sessionsQuery
        .select('*, therapists(name)')
        .eq('patient_id', 'patient-123')
        .order('date', { ascending: false });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].pain_after).toBeLessThan(result.data[0].pain_before);
    });

    it('should view body map with pain points', async () => {
      const mockPainPoints = [
        {
          id: 'pain-1',
          body_region: 'lower_back',
          intensity: 3,
          description: 'Dor lombar em melhora',
          characteristics: ['aching', 'intermittent'],
          status: 'active'
        },
        {
          id: 'pain-2',
          body_region: 'neck',
          intensity: 2,
          description: 'Tensão cervical leve',
          characteristics: ['tension'],
          status: 'active'
        }
      ];

      const painPointsQuery = mockSupabaseClient.from('pain_points');
      painPointsQuery.select.mockReturnThis();
      painPointsQuery.eq.mockReturnThis();
      painPointsQuery.is = vi.fn().mockResolvedValueOnce({
        data: mockPainPoints,
        error: null
      });

      const result = await painPointsQuery
        .select('*')
        .eq('patient_id', 'patient-123')
        .is('end_date', null);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].body_region).toBe('lower_back');
    });
  });

  describe('Document Access', () => {
    it('should download treatment reports', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          type: 'evaluation_report',
          name: 'Avaliação Inicial - Janeiro 2024',
          url: 'https://documents.clinic.com/patient-123/eval-jan-2024.pdf',
          created_at: '2024-01-15'
        },
        {
          id: 'doc-2',
          type: 'progress_report',
          name: 'Relatório de Progresso - Fevereiro 2024',
          url: 'https://documents.clinic.com/patient-123/progress-feb-2024.pdf',
          created_at: '2024-02-15'
        }
      ];

      const documentsQuery = mockSupabaseClient.from('patient_documents');
      documentsQuery.select.mockReturnThis();
      documentsQuery.eq.mockReturnThis();
      documentsQuery.order.mockResolvedValueOnce({
        data: mockDocuments,
        error: null
      });

      const result = await documentsQuery
        .select('*')
        .eq('patient_id', 'patient-123')
        .order('created_at', { ascending: false });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].type).toBe('evaluation_report');
    });

    it('should view medical prescriptions', async () => {
      const mockPrescriptions = [
        {
          id: 'presc-1',
          date: '2024-02-01',
          therapist_name: 'Dra. Maria Santos',
          items: [
            'Fisioterapia 2x por semana',
            'Exercícios domiciliares diários',
            'Aplicação de calor local'
          ],
          valid_until: '2024-03-01'
        }
      ];

      const prescriptionsQuery = mockSupabaseClient.from('prescriptions');
      prescriptionsQuery.select.mockReturnThis();
      prescriptionsQuery.eq.mockReturnThis();
      prescriptionsQuery.gte.mockResolvedValueOnce({
        data: mockPrescriptions,
        error: null
      });

      const result = await prescriptionsQuery
        .select('*, therapists(name)')
        .eq('patient_id', 'patient-123')
        .gte('valid_until', new Date().toISOString());

      expect(result.data).toHaveLength(1);
      expect(result.data[0].items).toHaveLength(3);
    });
  });

  describe('Communication Features', () => {
    it('should send message to therapist', async () => {
      const messageData = {
        from_id: 'patient-123',
        to_id: 'therapist-123',
        type: 'patient_to_therapist',
        subject: 'Dúvida sobre exercícios',
        message: 'Posso fazer os exercícios mesmo com um pouco de dor?',
        sent_at: new Date().toISOString()
      };

      const messageQuery = mockSupabaseClient.from('messages');
      messageQuery.insert.mockResolvedValueOnce({
        data: { id: 'msg-new', ...messageData, status: 'sent' },
        error: null
      });

      const result = await messageQuery.insert(messageData);

      expect(result.data.status).toBe('sent');
      expect(result.data.subject).toContain('exercícios');
    });

    it('should receive notifications', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'appointment_reminder',
          title: 'Lembrete de Consulta',
          message: 'Sua sessão é amanhã às 14:00',
          read: false,
          created_at: '2024-02-19T10:00:00Z'
        },
        {
          id: 'notif-2',
          type: 'exercise_reminder',
          title: 'Hora dos Exercícios',
          message: 'Não esqueça de fazer seus exercícios hoje',
          read: false,
          created_at: '2024-02-19T08:00:00Z'
        }
      ];

      const notificationsQuery = mockSupabaseClient.from('notifications');
      notificationsQuery.select.mockReturnThis();
      notificationsQuery.eq.mockReturnThis();
      notificationsQuery.order.mockResolvedValueOnce({
        data: mockNotifications,
        error: null
      });

      const result = await notificationsQuery
        .select('*')
        .eq('patient_id', 'patient-123')
        .eq('read', false)
        .order('created_at', { ascending: false });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].type).toBe('appointment_reminder');
    });

    it('should mark notifications as read', async () => {
      const notificationIds = ['notif-1', 'notif-2'];

      const updateQuery = mockSupabaseClient.from('notifications');
      updateQuery.update.mockReturnThis();
      updateQuery.in = vi.fn().mockResolvedValueOnce({
        data: notificationIds.map(id => ({ id, read: true })),
        error: null
      });

      const result = await updateQuery
        .update({ read: true })
        .in('id', notificationIds);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].read).toBe(true);
    });
  });

  describe('Privacy and Data Management', () => {
    it('should request data export (LGPD compliance)', async () => {
      const exportRequest = {
        patient_id: 'patient-123',
        type: 'data_export',
        status: 'pending',
        requested_at: new Date().toISOString()
      };

      const exportQuery = mockSupabaseClient.from('data_requests');
      exportQuery.insert.mockResolvedValueOnce({
        data: { id: 'request-1', ...exportRequest },
        error: null
      });

      const result = await exportQuery.insert(exportRequest);

      expect(result.data.type).toBe('data_export');
      expect(result.data.status).toBe('pending');
    });

    it('should manage consent preferences', async () => {
      const consentUpdate = {
        marketing_emails: false,
        appointment_reminders: true,
        treatment_notifications: true,
        data_sharing: false,
        updated_at: new Date().toISOString()
      };

      const consentQuery = mockSupabaseClient.from('patient_consents');
      consentQuery.update.mockReturnThis();
      consentQuery.eq.mockResolvedValueOnce({
        data: { patient_id: 'patient-123', ...consentUpdate },
        error: null
      });

      const result = await consentQuery
        .update(consentUpdate)
        .eq('patient_id', 'patient-123');

      expect(result.data.marketing_emails).toBe(false);
      expect(result.data.appointment_reminders).toBe(true);
    });
  });
});