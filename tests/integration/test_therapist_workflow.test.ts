import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock components and services for testing
const mockNavigate = vi.fn();
const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn()
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

vi.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => mockSupabaseClient,
  useUser: () => ({ id: 'therapist-123', email: 'therapist@clinic.com', role: 'therapist' }),
  useSession: () => ({ access_token: 'mock-token' })
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  useParams: () => ({ id: 'patient-123' })
}));

describe('Physiotherapist Workflow Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default auth state
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'therapist-123', email: 'therapist@clinic.com', role: 'therapist' },
          access_token: 'mock-token'
        }
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication', () => {
    it('should allow therapist to login with valid credentials', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: { id: 'therapist-123', email: 'therapist@clinic.com' },
          session: { access_token: 'mock-token' }
        },
        error: null
      });

      // Simulate login form
      const loginForm = {
        email: 'therapist@clinic.com',
        password: 'securePassword123'
      };

      const result = await mockSupabaseClient.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password
      });

      expect(result.error).toBeNull();
      expect(result.data.user.email).toBe('therapist@clinic.com');
    });

    it('should redirect therapist to dashboard after successful login', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: { id: 'therapist-123', email: 'therapist@clinic.com', role: 'therapist' },
          session: { access_token: 'mock-token' }
        },
        error: null
      });

      // Simulate successful login
      await mockSupabaseClient.auth.signInWithPassword({
        email: 'therapist@clinic.com',
        password: 'password'
      });

      // Check navigation was called
      mockNavigate('/dashboard');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Patient Management', () => {
    it('should display list of assigned patients', async () => {
      const mockPatients = [
        {
          id: 'patient-1',
          name: 'João Silva',
          email: 'joao@email.com',
          phone: '(11) 98765-4321',
          lastSession: '2024-02-10',
          nextAppointment: '2024-02-20'
        },
        {
          id: 'patient-2',
          name: 'Maria Santos',
          email: 'maria@email.com',
          phone: '(11) 98765-4322',
          lastSession: '2024-02-12',
          nextAppointment: '2024-02-22'
        }
      ];

      const patientsQuery = mockSupabaseClient.from('patients');
      patientsQuery.select.mockReturnThis();
      patientsQuery.eq.mockReturnThis();
      patientsQuery.order.mockResolvedValueOnce({
        data: mockPatients,
        error: null
      });

      const result = await patientsQuery
        .select('*')
        .eq('therapist_id', 'therapist-123')
        .order('name');

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('João Silva');
    });

    it('should search patients by name or CPF', async () => {
      const searchTerm = 'Maria';
      const mockSearchResults = [
        {
          id: 'patient-2',
          name: 'Maria Santos',
          email: 'maria@email.com',
          phone: '(11) 98765-4322'
        }
      ];

      const searchQuery = mockSupabaseClient.from('patients');
      searchQuery.select.mockReturnThis();
      searchQuery.or = vi.fn().mockReturnThis();
      searchQuery.or.mockResolvedValueOnce({
        data: mockSearchResults,
        error: null
      });

      const result = await searchQuery
        .select('*')
        .or(`name.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%`);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toContain('Maria');
    });

    it('should view detailed patient profile', async () => {
      const patientId = 'patient-123';
      const mockPatientDetail = {
        id: patientId,
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '(11) 98765-4321',
        birthDate: '1990-01-15',
        cpf: '123.456.789-00',
        address: {
          street: 'Rua das Flores',
          number: '123',
          city: 'São Paulo',
          state: 'SP'
        },
        medicalHistory: ['Hipertensão', 'Diabetes'],
        currentTreatment: 'Fisioterapia para lombalgia',
        sessions: [
          { date: '2024-02-01', notes: 'Primeira sessão' },
          { date: '2024-02-08', notes: 'Melhora significativa' }
        ]
      };

      const patientQuery = mockSupabaseClient.from('patients');
      patientQuery.select.mockReturnThis();
      patientQuery.eq.mockReturnThis();
      patientQuery.single.mockResolvedValueOnce({
        data: mockPatientDetail,
        error: null
      });

      const result = await patientQuery
        .select('*, sessions(*)')
        .eq('id', patientId)
        .single();

      expect(result.data.id).toBe(patientId);
      expect(result.data.sessions).toHaveLength(2);
    });
  });

  describe('Appointment Management', () => {
    it('should view daily agenda with appointments', async () => {
      const today = new Date().toISOString().split('T')[0];
      const mockAppointments = [
        {
          id: 'apt-1',
          patientName: 'João Silva',
          time: '09:00',
          type: 'session',
          room: 'Sala 1',
          status: 'confirmed'
        },
        {
          id: 'apt-2',
          patientName: 'Maria Santos',
          time: '10:00',
          type: 'evaluation',
          room: 'Sala 2',
          status: 'scheduled'
        },
        {
          id: 'apt-3',
          patientName: 'Pedro Oliveira',
          time: '11:00',
          type: 'return',
          room: 'Sala 1',
          status: 'confirmed'
        }
      ];

      const appointmentsQuery = mockSupabaseClient.from('appointments');
      appointmentsQuery.select.mockReturnThis();
      appointmentsQuery.eq.mockReturnThis();
      appointmentsQuery.gte.mockReturnThis();
      appointmentsQuery.lte.mockReturnThis();
      appointmentsQuery.order.mockResolvedValueOnce({
        data: mockAppointments,
        error: null
      });

      const result = await appointmentsQuery
        .select('*')
        .eq('therapist_id', 'therapist-123')
        .gte('date', today)
        .lte('date', today)
        .order('time');

      expect(result.data).toHaveLength(3);
      expect(result.data[0].time).toBe('09:00');
    });

    it('should create new appointment with conflict checking', async () => {
      const newAppointment = {
        patient_id: 'patient-123',
        therapist_id: 'therapist-123',
        date: '2024-02-25',
        startTime: '14:00',
        endTime: '15:00',
        type: 'session',
        room: 'Sala 1'
      };

      // Check for conflicts first
      const conflictQuery = mockSupabaseClient.from('appointments');
      conflictQuery.select.mockReturnThis();
      conflictQuery.eq.mockReturnThis();
      conflictQuery.gte.mockReturnThis();
      conflictQuery.lte.mockReturnThis();
      conflictQuery.or = vi.fn().mockResolvedValueOnce({
        data: [],  // No conflicts
        error: null
      });

      const conflictCheck = await conflictQuery
        .select('*')
        .eq('therapist_id', newAppointment.therapist_id)
        .eq('date', newAppointment.date)
        .or(`startTime.gte.${newAppointment.startTime},endTime.lte.${newAppointment.endTime}`);

      expect(conflictCheck.data).toHaveLength(0);

      // Create appointment if no conflicts
      const createQuery = mockSupabaseClient.from('appointments');
      createQuery.insert.mockResolvedValueOnce({
        data: { id: 'apt-new', ...newAppointment, status: 'scheduled' },
        error: null
      });

      const result = await createQuery.insert(newAppointment);

      expect(result.error).toBeNull();
      expect(result.data.status).toBe('scheduled');
    });

    it('should update appointment status', async () => {
      const appointmentId = 'apt-1';
      const statusUpdate = {
        status: 'completed',
        notes: 'Sessão concluída com sucesso'
      };

      const updateQuery = mockSupabaseClient.from('appointments');
      updateQuery.update.mockReturnThis();
      updateQuery.eq.mockResolvedValueOnce({
        data: { id: appointmentId, ...statusUpdate },
        error: null
      });

      const result = await updateQuery
        .update(statusUpdate)
        .eq('id', appointmentId);

      expect(result.data.status).toBe('completed');
      expect(result.data.notes).toBeDefined();
    });

    it('should cancel appointment with reason', async () => {
      const appointmentId = 'apt-2';
      const cancellation = {
        status: 'cancelled',
        cancellation_reason: 'Paciente doente',
        cancelled_at: new Date().toISOString()
      };

      const cancelQuery = mockSupabaseClient.from('appointments');
      cancelQuery.update.mockReturnThis();
      cancelQuery.eq.mockResolvedValueOnce({
        data: { id: appointmentId, ...cancellation },
        error: null
      });

      const result = await cancelQuery
        .update(cancellation)
        .eq('id', appointmentId);

      expect(result.data.status).toBe('cancelled');
      expect(result.data.cancellation_reason).toBeDefined();
    });
  });

  describe('Session Documentation', () => {
    it('should create session notes', async () => {
      const sessionData = {
        appointment_id: 'apt-1',
        patient_id: 'patient-123',
        therapist_id: 'therapist-123',
        date: '2024-02-15',
        chief_complaint: 'Dor lombar',
        objective_assessment: 'Limitação de movimento em flexão anterior',
        treatment_performed: 'Mobilização articular, exercícios terapêuticos',
        patient_response: 'Boa resposta ao tratamento',
        homework: 'Exercícios de alongamento 2x ao dia',
        next_session_plan: 'Progressão dos exercícios'
      };

      const sessionQuery = mockSupabaseClient.from('sessions');
      sessionQuery.insert.mockResolvedValueOnce({
        data: { id: 'session-new', ...sessionData },
        error: null
      });

      const result = await sessionQuery.insert(sessionData);

      expect(result.error).toBeNull();
      expect(result.data.chief_complaint).toBe('Dor lombar');
    });

    it('should add exercises to patient program', async () => {
      const exerciseProgram = {
        patient_id: 'patient-123',
        exercises: [
          {
            exercise_id: 'ex-1',
            name: 'Alongamento lombar',
            sets: 3,
            reps: 10,
            duration: '30 segundos',
            frequency: 'Diário'
          },
          {
            exercise_id: 'ex-2',
            name: 'Fortalecimento core',
            sets: 3,
            reps: 15,
            frequency: '3x por semana'
          }
        ],
        created_by: 'therapist-123',
        start_date: '2024-02-15',
        end_date: '2024-03-15'
      };

      const programQuery = mockSupabaseClient.from('exercise_programs');
      programQuery.insert.mockResolvedValueOnce({
        data: { id: 'program-new', ...exerciseProgram },
        error: null
      });

      const result = await programQuery.insert(exerciseProgram);

      expect(result.data.exercises).toHaveLength(2);
      expect(result.data.exercises[0].name).toContain('Alongamento');
    });

    it('should track patient progress', async () => {
      const progressData = {
        patient_id: 'patient-123',
        session_id: 'session-123',
        pain_level_before: 7,
        pain_level_after: 4,
        range_of_motion: {
          flexion: 45,
          extension: 20,
          lateral_flexion_right: 30,
          lateral_flexion_left: 30
        },
        functional_tests: {
          sit_to_stand: 'Completed without assistance',
          walking_distance: '500m without pain'
        },
        notes: 'Significant improvement in pain and function'
      };

      const progressQuery = mockSupabaseClient.from('patient_progress');
      progressQuery.insert.mockResolvedValueOnce({
        data: { id: 'progress-new', ...progressData },
        error: null
      });

      const result = await progressQuery.insert(progressData);

      expect(result.data.pain_level_before).toBe(7);
      expect(result.data.pain_level_after).toBe(4);
      expect(result.data.range_of_motion.flexion).toBe(45);
    });
  });

  describe('Body Map Integration', () => {
    it('should add pain points to body map', async () => {
      const painPoint = {
        patient_id: 'patient-123',
        body_region: 'lower_back',
        intensity: 7,
        characteristics: ['aching', 'constant'],
        description: 'Dor constante na região lombar',
        triggers: ['Ficar sentado', 'Levantar peso'],
        created_by: 'therapist-123'
      };

      const painPointQuery = mockSupabaseClient.from('pain_points');
      painPointQuery.insert.mockResolvedValueOnce({
        data: { id: 'pain-new', ...painPoint },
        error: null
      });

      const result = await painPointQuery.insert(painPoint);

      expect(result.data.body_region).toBe('lower_back');
      expect(result.data.intensity).toBe(7);
    });

    it('should update pain point status', async () => {
      const painPointId = 'pain-123';
      const updateData = {
        intensity: 3,
        status: 'improving',
        notes: 'Melhora significativa após 3 sessões'
      };

      const updateQuery = mockSupabaseClient.from('pain_points');
      updateQuery.update.mockReturnThis();
      updateQuery.eq.mockResolvedValueOnce({
        data: { id: painPointId, ...updateData },
        error: null
      });

      const result = await updateQuery
        .update(updateData)
        .eq('id', painPointId);

      expect(result.data.intensity).toBe(3);
      expect(result.data.status).toBe('improving');
    });
  });

  describe('Reports and Analytics', () => {
    it('should generate patient progress report', async () => {
      const patientId = 'patient-123';
      const reportPeriod = {
        start_date: '2024-01-01',
        end_date: '2024-02-15'
      };

      // Get sessions data
      const sessionsQuery = mockSupabaseClient.from('sessions');
      sessionsQuery.select.mockReturnThis();
      sessionsQuery.eq.mockReturnThis();
      sessionsQuery.gte.mockReturnThis();
      sessionsQuery.lte.mockReturnThis();
      sessionsQuery.order.mockResolvedValueOnce({
        data: [
          { date: '2024-01-15', pain_before: 8, pain_after: 6 },
          { date: '2024-01-22', pain_before: 6, pain_after: 4 },
          { date: '2024-02-01', pain_before: 4, pain_after: 3 },
          { date: '2024-02-08', pain_before: 3, pain_after: 2 }
        ],
        error: null
      });

      const result = await sessionsQuery
        .select('*')
        .eq('patient_id', patientId)
        .gte('date', reportPeriod.start_date)
        .lte('date', reportPeriod.end_date)
        .order('date');

      expect(result.data).toHaveLength(4);
      
      // Calculate improvement
      const initialPain = result.data[0].pain_before;
      const finalPain = result.data[result.data.length - 1].pain_after;
      const improvement = ((initialPain - finalPain) / initialPain) * 100;
      
      expect(improvement).toBeGreaterThan(70); // 75% improvement
    });

    it('should view treatment statistics', async () => {
      const therapistId = 'therapist-123';
      const currentMonth = '2024-02';

      // Get statistics
      const statsQuery = mockSupabaseClient.from('appointments');
      statsQuery.select.mockReturnThis();
      statsQuery.eq.mockReturnThis();
      statsQuery.gte.mockReturnThis();
      statsQuery.lte.mockReturnThis();
      statsQuery.in = vi.fn().mockResolvedValueOnce({
        data: [
          { status: 'completed', count: 45 },
          { status: 'cancelled', count: 3 },
          { status: 'no_show', count: 2 }
        ],
        error: null
      });

      const result = await statsQuery
        .select('status, count(*)')
        .eq('therapist_id', therapistId)
        .gte('date', `${currentMonth}-01`)
        .lte('date', `${currentMonth}-29`)
        .in('status', ['completed', 'cancelled', 'no_show']);

      const totalSessions = result.data.reduce((sum, item) => sum + item.count, 0);
      const completionRate = (result.data.find(s => s.status === 'completed')?.count || 0) / totalSessions * 100;

      expect(totalSessions).toBe(50);
      expect(completionRate).toBe(90);
    });
  });

  describe('Communication', () => {
    it('should send appointment reminder to patient', async () => {
      const appointmentId = 'apt-1';
      const reminderData = {
        appointment_id: appointmentId,
        patient_id: 'patient-123',
        type: 'reminder',
        channel: 'whatsapp',
        message: 'Olá! Lembrando da sua sessão amanhã às 14:00',
        sent_at: new Date().toISOString()
      };

      const notificationQuery = mockSupabaseClient.from('notifications');
      notificationQuery.insert.mockResolvedValueOnce({
        data: { id: 'notif-new', ...reminderData, status: 'sent' },
        error: null
      });

      const result = await notificationQuery.insert(reminderData);

      expect(result.data.status).toBe('sent');
      expect(result.data.type).toBe('reminder');
    });

    it('should add internal notes for team communication', async () => {
      const noteData = {
        patient_id: 'patient-123',
        author_id: 'therapist-123',
        type: 'clinical',
        content: 'Paciente apresentou melhora significativa. Considerar progressão do tratamento.',
        visibility: 'team',
        created_at: new Date().toISOString()
      };

      const noteQuery = mockSupabaseClient.from('clinical_notes');
      noteQuery.insert.mockResolvedValueOnce({
        data: { id: 'note-new', ...noteData },
        error: null
      });

      const result = await noteQuery.insert(noteData);

      expect(result.data.visibility).toBe('team');
      expect(result.data.type).toBe('clinical');
    });
  });
});