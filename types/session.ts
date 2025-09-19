import { z } from 'zod';

// Base Session interface
export interface Session {
  id: string;
  appointment_id: string; // Unique foreign key to appointment

  // Session data
  procedures_performed?: string | null;
  pain_level_before?: number | null; // 0-10 scale
  pain_level_after?: number | null; // 0-10 scale
  progress_notes?: string | null;
  next_session_notes?: string | null;
  exercises_prescribed?: string | null;

  // System fields
  created_at: string;
  updated_at: string;
}

// Request types
export interface CreateSessionRequest {
  procedures_performed?: string;
  pain_level_before?: number;
  pain_level_after?: number;
  progress_notes?: string;
  next_session_notes?: string;
  exercises_prescribed?: string;
}

export interface UpdateSessionRequest {
  procedures_performed?: string;
  pain_level_before?: number;
  pain_level_after?: number;
  progress_notes?: string;
  next_session_notes?: string;
  exercises_prescribed?: string;
}

// Extended session with related data
export interface SessionDetails extends Session {
  appointment: {
    id: string;
    patient_id: string;
    appointment_date: string;
    start_time: string;
    appointment_type: string;
    patient: {
      id: string;
      full_name: string;
      cpf: string;
    };
    therapist: {
      id: string;
      email: string;
    };
  };
  pain_points?: Array<{
    id: string;
    body_region: string;
    pain_intensity: number;
    coordinates_x: number;
    coordinates_y: number;
  }>;
}

// Session progress tracking
export interface SessionProgress {
  session_id: string;
  pain_improvement: number; // Difference between before and after
  progress_level: 'excellent' | 'good' | 'fair' | 'poor';
  goals_achieved: string[];
  challenges_noted: string[];
}

// Session statistics
export interface SessionStats {
  total_sessions: number;
  average_pain_before: number;
  average_pain_after: number;
  average_improvement: number;
  most_common_procedures: Array<{
    procedure: string;
    count: number;
  }>;
  progress_trend: 'improving' | 'stable' | 'declining';
}

// Validation schemas
export const createSessionSchema = z.object({
  procedures_performed: z
    .string()
    .max(2000, 'Procedimentos devem ter no máximo 2000 caracteres')
    .optional(),

  pain_level_before: z
    .number()
    .min(0, 'Nível de dor deve estar entre 0 e 10')
    .max(10, 'Nível de dor deve estar entre 0 e 10')
    .int('Nível de dor deve ser um número inteiro')
    .optional(),

  pain_level_after: z
    .number()
    .min(0, 'Nível de dor deve estar entre 0 e 10')
    .max(10, 'Nível de dor deve estar entre 0 e 10')
    .int('Nível de dor deve ser um número inteiro')
    .optional(),

  progress_notes: z
    .string()
    .max(2000, 'Notas de progresso devem ter no máximo 2000 caracteres')
    .optional(),

  next_session_notes: z
    .string()
    .max(1000, 'Notas para próxima sessão devem ter no máximo 1000 caracteres')
    .optional(),

  exercises_prescribed: z
    .string()
    .max(2000, 'Exercícios prescritos devem ter no máximo 2000 caracteres')
    .optional()
});

export const updateSessionSchema = createSessionSchema;

// Helper functions
export function calculatePainImprovement(painBefore?: number | null, painAfter?: number | null): number {
  if (painBefore === null || painBefore === undefined || painAfter === null || painAfter === undefined) {
    return 0;
  }
  return painBefore - painAfter;
}

export function getProgressLevel(improvement: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (improvement >= 3) return 'excellent';
  if (improvement >= 2) return 'good';
  if (improvement >= 1) return 'fair';
  return 'poor';
}

export function getProgressLevelLabel(level: 'excellent' | 'good' | 'fair' | 'poor'): string {
  const labels = {
    excellent: 'Excelente',
    good: 'Bom',
    fair: 'Regular',
    poor: 'Ruim'
  };
  return labels[level];
}

export function getProgressLevelColor(level: 'excellent' | 'good' | 'fair' | 'poor'): string {
  const colors = {
    excellent: 'green',
    good: 'blue',
    fair: 'yellow',
    poor: 'red'
  };
  return colors[level];
}

export function getPainLevelLabel(painLevel: number): string {
  if (painLevel === 0) return 'Sem dor';
  if (painLevel <= 2) return 'Dor leve';
  if (painLevel <= 5) return 'Dor moderada';
  if (painLevel <= 8) return 'Dor intensa';
  return 'Dor muito intensa';
}

export function formatSessionDate(createdAt: string): string {
  const date = new Date(createdAt);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatSessionDateTime(createdAt: string): string {
  const date = new Date(createdAt);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Session validation helpers
export function isSessionComplete(session: Session): boolean {
  return !!(
    session.procedures_performed ||
    session.progress_notes ||
    (session.pain_level_before !== null && session.pain_level_after !== null)
  );
}

export function hasRequiredSessionData(session: CreateSessionRequest): boolean {
  return !!(
    session.procedures_performed ||
    session.progress_notes ||
    session.pain_level_before !== undefined ||
    session.pain_level_after !== undefined
  );
}

// Common session procedures (for autocomplete/suggestions)
export const COMMON_PROCEDURES = [
  'Mobilização articular',
  'Massagem terapêutica',
  'Exercícios de fortalecimento',
  'Exercícios de alongamento',
  'Eletroterapia',
  'Crioterapia',
  'Termoterapia',
  'Exercícios de propriocepção',
  'Treinamento de marcha',
  'Exercícios respiratórios',
  'Mobilização neural',
  'Técnicas de relaxamento',
  'Drenagem linfática',
  'Exercícios funcionais',
  'Treino de equilíbrio'
] as const;

export type CommonProcedure = typeof COMMON_PROCEDURES[number];

// Session goals and outcomes
export const SESSION_GOALS = [
  'Redução da dor',
  'Melhora da amplitude de movimento',
  'Aumento da força muscular',
  'Melhora da função',
  'Redução da inflamação',
  'Melhora do equilíbrio',
  'Aumento da resistência',
  'Correção postural',
  'Educação do paciente',
  'Prevenção de recidivas'
] as const;

export type SessionGoal = typeof SESSION_GOALS[number];

// Session frequency and duration tracking
export interface SessionFrequency {
  patient_id: string;
  sessions_per_week: number;
  average_session_duration: number;
  total_sessions_completed: number;
  adherence_percentage: number;
  last_session_date: string;
  next_recommended_session: string;
}