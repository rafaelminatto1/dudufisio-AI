/**
 * Test Fixtures - Dados de teste reutilizáveis
 * Fornece objetos de teste padronizados para uso em testes unitários
 */

import { Patient, Appointment, User, PatientStatus, AppointmentStatus } from '@/types';
import { Role } from '@/types/enums';

/**
 * Cria um paciente de teste com valores padrão
 */
export const createTestPatient = (overrides?: Partial<Patient>): Patient => {
  const basePatient: Patient = {
    id: 'test-patient-1',
    name: 'João Silva',
    cpf: '12345678900',
    birthDate: '1980-01-01',
    phone: '11999999999',
    email: 'joao.silva@example.com',
    emergencyContact: {
      name: 'Maria Silva',
      phone: '11988888888'
    },
    address: {
      street: 'Rua Teste, 123',
      city: 'São Paulo',
      state: 'SP',
      zip: '01234-567'
    },
    status: PatientStatus.Active,
    lastVisit: new Date().toISOString(),
    registrationDate: new Date().toISOString(),
    avatarUrl: 'https://example.com/avatar.jpg',
    consentGiven: true,
    whatsappConsent: 'opt-in' as const,
  };

  return { ...basePatient, ...overrides };
};

/**
 * Cria múltiplos pacientes de teste
 */
export const createTestPatients = (count: number): Patient[] => {
  return Array.from({ length: count }, (_, i) => 
    createTestPatient({
      id: `test-patient-${i + 1}`,
      name: `Paciente ${i + 1}`,
      cpf: `1234567890${i}`,
      email: `paciente${i + 1}@example.com`,
    })
  );
};

/**
 * Cria um agendamento de teste com valores padrão
 */
export const createTestAppointment = (overrides?: Partial<Appointment>): Appointment => {
  const baseAppointment: Appointment = {
    id: 'test-appointment-1',
    patientId: 'test-patient-1',
    patientName: 'João Silva',
    patientAvatarUrl: 'https://example.com/avatar.jpg',
    therapistId: 'test-therapist-1',
    therapistName: 'Dr. Carlos',
    therapistColor: '#4CAF50',
    startTime: new Date(2025, 0, 15, 14, 0),
    endTime: new Date(2025, 0, 15, 15, 0),
    type: 'Fisioterapia',
    status: AppointmentStatus.Scheduled,
    value: 150,
    isPaid: false,
    notes: '',
    location: 'Sala 1',
  };

  return { ...baseAppointment, ...overrides };
};

/**
 * Cria múltiplos agendamentos de teste
 */
export const createTestAppointments = (count: number): Appointment[] => {
  return Array.from({ length: count }, (_, i) => 
    createTestAppointment({
      id: `test-appointment-${i + 1}`,
      startTime: new Date(2025, 0, 15 + i, 14, 0),
      endTime: new Date(2025, 0, 15 + i, 15, 0),
    })
  );
};

/**
 * Cria um usuário de teste com valores padrão
 */
export const createTestUser = (role: Role = Role.Therapist): User => {
  const users: Record<Role, User> = {
    [Role.Admin]: {
      id: 'test-admin-1',
      name: 'Admin Teste',
      email: 'admin@test.com',
      role: Role.Admin,
      avatarUrl: '',
      phone: '11999999999',
      isActive: true,
    },
    [Role.Therapist]: {
      id: 'test-therapist-1',
      name: 'Dr. Fisioterapeuta',
      email: 'therapist@test.com',
      role: Role.Therapist,
      avatarUrl: '',
      phone: '11988888888',
      isActive: true,
    },
    [Role.Patient]: {
      id: 'test-patient-user-1',
      name: 'Paciente Teste',
      email: 'patient@test.com',
      role: Role.Patient,
      avatarUrl: '',
      phone: '11977777777',
      isActive: true,
    },
    [Role.EducadorFisico]: {
      id: 'test-educator-1',
      name: 'Educador Teste',
      email: 'educator@test.com',
      role: Role.EducadorFisico,
      avatarUrl: '',
      phone: '11966666666',
      isActive: true,
    },
  };

  return users[role];
};

/**
 * Cria dados de transação financeira de teste
 */
export const createTestTransaction = (overrides?: any) => {
  return {
    id: 'test-transaction-1',
    type: 'Receita',
    date: new Date(),
    description: 'Consulta de Fisioterapia',
    amount: 150,
    category: 'Fisioterapia',
    patientName: 'João Silva',
    ...overrides,
  };
};

/**
 * Cria dados de exercício de teste
 */
export const createTestExercise = (overrides?: any) => {
  return {
    id: 'test-exercise-1',
    name: 'Alongamento Cervical',
    description: 'Exercício para alongamento da região cervical',
    category: 'Cervical',
    muscle_groups: ['trapézio', 'esternocleidomastóideo'],
    equipment: [],
    difficulty_level: 'beginner' as const,
    duration_minutes: 5,
    repetitions: 10,
    sets: 3,
    instructions: ['Sente-se em uma cadeira', 'Incline a cabeça para o lado'],
    precautions: ['Não force o movimento'],
    benefits: ['Melhora a flexibilidade', 'Reduz tensão muscular'],
    video_url: '',
    image_urls: [],
    tags: ['cervical', 'alongamento'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
};

/**
 * Limpa localStorage e sessionStorage para testes isolados
 */
export const clearStorage = () => {
  localStorage.clear();
  sessionStorage.clear();
};

/**
 * Mocks de Date para testes temporais consistentes
 */
export const mockDate = (dateString: string) => {
  const mockDate = new Date(dateString);
  vi.setSystemTime(mockDate);
  return mockDate;
};

/**
 * Restaura Date real após testes
 */
export const restoreDate = () => {
  vi.useRealTimers();
};

/**
 * Helper para esperar delays em testes
 */
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Verifica se um objeto tem todas as propriedades esperadas
 */
export const expectToHaveProperties = (obj: any, properties: string[]) => {
  properties.forEach(prop => {
    expect(obj).toHaveProperty(prop);
  });
};

