/**
 * Tipos TypeScript Globais
 * MoocaFisio - App para Pacientes
 */

// Re-exportar tipos dos services para facilitar imports
export type {
  PatientData,
  LoginResponse,
} from './services/patientAuthService';

export type {
  Exercise,
  ExerciseVideo,
  ExercisesResponse,
  CompleteExerciseData,
  ExerciseCompletion,
} from './services/patientExerciseService';

export type {
  PatientStats,
  ProgressDataPoint,
  NextSession,
  StatsResponse,
} from './services/patientStatsService';

