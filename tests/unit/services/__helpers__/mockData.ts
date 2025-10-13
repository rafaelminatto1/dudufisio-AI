/**
 * Mock Data Helpers
 * Fornece dados mockados específicos para testes
 */

import { Patient, Appointment, PatientStatus, AppointmentStatus } from '@/types';

/**
 * Lista de pacientes mockados para testes
 */
export const mockPatientsList: Patient[] = [
  {
    id: 'patient-1',
    name: 'Ana Maria Santos',
    cpf: '11122233344',
    birthDate: '1985-05-15',
    phone: '11987654321',
    email: 'ana.santos@example.com',
    emergencyContact: { name: 'José Santos', phone: '11987654320' },
    address: { street: 'Av. Paulista, 1000', city: 'São Paulo', state: 'SP', zip: '01310-100' },
    status: PatientStatus.Active,
    lastVisit: '2025-01-10T14:00:00.000Z',
    registrationDate: '2024-01-05T10:00:00.000Z',
    avatarUrl: '',
    consentGiven: true,
    whatsappConsent: 'opt-in',
  },
  {
    id: 'patient-2',
    name: 'Carlos Eduardo Lima',
    cpf: '22233344455',
    birthDate: '1990-08-20',
    phone: '11976543210',
    email: 'carlos.lima@example.com',
    emergencyContact: { name: 'Maria Lima', phone: '11976543209' },
    address: { street: 'Rua Augusta, 500', city: 'São Paulo', state: 'SP', zip: '01304-000' },
    status: PatientStatus.Active,
    lastVisit: '2025-01-08T10:00:00.000Z',
    registrationDate: '2024-03-15T09:00:00.000Z',
    avatarUrl: '',
    consentGiven: true,
    whatsappConsent: 'opt-out',
  },
  {
    id: 'patient-3',
    name: 'Beatriz Oliveira',
    cpf: '33344455566',
    birthDate: '1978-12-03',
    phone: '11965432109',
    email: 'beatriz.oliveira@example.com',
    emergencyContact: { name: 'Pedro Oliveira', phone: '11965432108' },
    address: { street: 'Rua Consolação, 2000', city: 'São Paulo', state: 'SP', zip: '01301-000' },
    status: PatientStatus.Inactive,
    lastVisit: '2024-12-20T16:00:00.000Z',
    registrationDate: '2024-02-10T11:00:00.000Z',
    avatarUrl: '',
    consentGiven: true,
    whatsappConsent: 'pending',
  },
];

/**
 * Lista de agendamentos mockados para testes
 */
export const mockAppointmentsList: Appointment[] = [
  {
    id: 'appointment-1',
    patientId: 'patient-1',
    patientName: 'Ana Maria Santos',
    patientAvatarUrl: '',
    therapistId: 'therapist-1',
    therapistName: 'Dr. Carlos Mendes',
    therapistColor: '#4CAF50',
    startTime: new Date('2025-01-15T14:00:00'),
    endTime: new Date('2025-01-15T15:00:00'),
    type: 'Fisioterapia',
    status: AppointmentStatus.Scheduled,
    value: 150,
    isPaid: false,
    notes: 'Primeira sessão',
    location: 'Sala 1',
  },
  {
    id: 'appointment-2',
    patientId: 'patient-2',
    patientName: 'Carlos Eduardo Lima',
    patientAvatarUrl: '',
    therapistId: 'therapist-1',
    therapistName: 'Dr. Carlos Mendes',
    therapistColor: '#4CAF50',
    startTime: new Date('2025-01-15T10:00:00'),
    endTime: new Date('2025-01-15T11:00:00'),
    type: 'Fisioterapia',
    status: AppointmentStatus.Completed,
    value: 150,
    isPaid: true,
    notes: 'Sessão de acompanhamento',
    location: 'Sala 2',
  },
  {
    id: 'appointment-3',
    patientId: 'patient-1',
    patientName: 'Ana Maria Santos',
    patientAvatarUrl: '',
    therapistId: 'therapist-2',
    therapistName: 'Dra. Fernanda Silva',
    therapistColor: '#2196F3',
    startTime: new Date('2025-01-16T09:00:00'),
    endTime: new Date('2025-01-16T10:00:00'),
    type: 'RPG',
    status: AppointmentStatus.Scheduled,
    value: 180,
    isPaid: false,
    notes: '',
    location: 'Sala 3',
  },
];

/**
 * Mock de DB que simula operações de banco de dados
 */
export class MockDatabase {
  private patients: Patient[] = [...mockPatientsList];
  private appointments: Appointment[] = [...mockAppointmentsList];

  // Patients
  getPatients = () => [...this.patients];
  
  getPatientById = (id: string) => this.patients.find(p => p.id === id);
  
  addPatient = (patient: Patient) => {
    this.patients.push(patient);
    return patient;
  };
  
  updatePatient = (id: string, updates: Partial<Patient>) => {
    const index = this.patients.findIndex(p => p.id === id);
    if (index >= 0) {
      this.patients[index] = { ...this.patients[index], ...updates };
      return this.patients[index];
    }
    return undefined;
  };
  
  deletePatient = (id: string) => {
    this.patients = this.patients.filter(p => p.id !== id);
  };

  // Appointments
  getAppointments = () => [...this.appointments];
  
  getAppointmentById = (id: string) => this.appointments.find(a => a.id === id);
  
  addAppointment = (appointment: Appointment) => {
    this.appointments.push(appointment);
    return appointment;
  };
  
  updateAppointment = (id: string, updates: Partial<Appointment>) => {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index >= 0) {
      this.appointments[index] = { ...this.appointments[index], ...updates };
      return this.appointments[index];
    }
    return undefined;
  };
  
  deleteAppointment = (id: string) => {
    this.appointments = this.appointments.filter(a => a.id !== id);
  };

  // Reset para estado inicial
  reset = () => {
    this.patients = [...mockPatientsList];
    this.appointments = [...mockAppointmentsList];
  };
}

/**
 * Instância singleton do mock database
 */
export const mockDb = new MockDatabase();

