import { z } from 'zod';
import type { PatientSummary } from './patient';

// Enums for Appointment
export const AppointmentStatus = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
} as const;

export type AppointmentStatusType = typeof AppointmentStatus[keyof typeof AppointmentStatus];

export const AppointmentType = {
  AVALIACAO: 'avaliacao',
  RETORNO: 'retorno',
  SESSAO: 'sessao',
  REAVALIACAO: 'reavaliacao'
} as const;

export type AppointmentTypeType = typeof AppointmentType[keyof typeof AppointmentType];

// Therapist summary interface
export interface TherapistSummary {
  id: string;
  email: string;
}

// Base Appointment interface
export interface Appointment {
  id: string;
  patient_id: string;
  therapist_id: string;

  // Scheduling
  appointment_date: string; // ISO date string (YYYY-MM-DD)
  start_time: string; // Time string (HH:MM)
  duration_minutes: number;

  // Status & Type
  status: AppointmentStatusType;
  appointment_type: AppointmentTypeType;
  cancellation_reason?: string | null;

  // Related data
  patient: PatientSummary;
  therapist: TherapistSummary;

  // System fields
  created_at: string;
  updated_at?: string;
  created_by: string;
}

// Request/Response types
export interface CreateAppointmentRequest {
  patient_id: string;
  therapist_id: string;
  appointment_date: string;
  start_time: string;
  duration_minutes?: number;
  appointment_type: AppointmentTypeType;
}

export interface UpdateAppointmentRequest {
  appointment_date?: string;
  start_time?: string;
  duration_minutes?: number;
  status?: AppointmentStatusType;
  cancellation_reason?: string;
}

export interface AppointmentDetails extends Appointment {
  session?: Session | null;
}

// Session interface (basic version for appointment details)
export interface Session {
  id: string;
  appointment_id: string;
  procedures_performed?: string | null;
  pain_level_before?: number | null;
  pain_level_after?: number | null;
  progress_notes?: string | null;
  next_session_notes?: string | null;
  exercises_prescribed?: string | null;
  created_at: string;
}

// Conflict checking
export interface ConflictCheckRequest {
  therapist_id: string;
  appointment_date: string;
  start_time: string;
  duration_minutes: number;
  exclude_appointment_id?: string;
}

export interface ConflictInfo {
  appointment_id: string;
  patient_name: string;
  start_time: string;
  end_time: string;
}

export interface ConflictCheckResponse {
  has_conflicts: boolean;
  conflicts: ConflictInfo[];
}

// View configuration for calendar
export interface ViewConfig {
  start_date: string;
  end_date: string;
  therapists: TherapistSummary[];
}

// Calendar view types
export type CalendarView = 'daily' | 'weekly' | 'monthly';

// Validation schemas
export const createAppointmentSchema = z.object({
  patient_id: z.string().uuid('ID do paciente deve ser um UUID válido'),
  therapist_id: z.string().uuid('ID do fisioterapeuta deve ser um UUID válido'),

  appointment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .refine(date => new Date(date) >= new Date(new Date().toDateString()),
      'Não é possível agendar para o passado'),

  start_time: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM'),

  duration_minutes: z
    .number()
    .min(15, 'Duração mínima é 15 minutos')
    .max(240, 'Duração máxima é 240 minutos')
    .default(60),

  appointment_type: z.enum(['avaliacao', 'retorno', 'sessao', 'reavaliacao'])
});

export const updateAppointmentSchema = z.object({
  appointment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .optional(),

  start_time: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM')
    .optional(),

  duration_minutes: z
    .number()
    .min(15, 'Duração mínima é 15 minutos')
    .max(240, 'Duração máxima é 240 minutos')
    .optional(),

  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),

  cancellation_reason: z.string().max(500, 'Motivo deve ter no máximo 500 caracteres').optional()
});

export const conflictCheckSchema = z.object({
  therapist_id: z.string().uuid('ID do fisioterapeuta deve ser um UUID válido'),
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  start_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário deve estar no formato HH:MM'),
  duration_minutes: z.number().min(1, 'Duração deve ser positiva'),
  exclude_appointment_id: z.string().uuid().optional()
});

// Helper functions
export function getAppointmentEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);

  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
}

export function formatAppointmentDateTime(date: string, time: string): string {
  const appointmentDate = new Date(date);
  const [hours, minutes] = time.split(':');
  appointmentDate.setHours(parseInt(hours), parseInt(minutes));

  return appointmentDate.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getAppointmentTypeLabel(type: AppointmentTypeType): string {
  const labels = {
    avaliacao: 'Avaliação',
    retorno: 'Retorno',
    sessao: 'Sessão',
    reavaliacao: 'Reavaliação'
  };
  return labels[type];
}

export function getAppointmentStatusLabel(status: AppointmentStatusType): string {
  const labels = {
    scheduled: 'Agendado',
    completed: 'Realizado',
    cancelled: 'Cancelado',
    no_show: 'Faltou'
  };
  return labels[status];
}

export function getAppointmentStatusColor(status: AppointmentStatusType): string {
  const colors = {
    scheduled: 'blue',
    completed: 'green',
    cancelled: 'red',
    no_show: 'orange'
  };
  return colors[status];
}

// Business logic helpers
export function isAppointmentEditable(appointment: Appointment): boolean {
  return appointment.status === 'scheduled' &&
         new Date(`${appointment.appointment_date}T${appointment.start_time}`) > new Date();
}

export function canCancelAppointment(appointment: Appointment): boolean {
  return appointment.status === 'scheduled';
}

export function canMarkAsCompleted(appointment: Appointment): boolean {
  return appointment.status === 'scheduled' &&
         new Date(`${appointment.appointment_date}T${appointment.start_time}`) <= new Date();
}