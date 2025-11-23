/**
 * Central export para todos os tipos do projeto
 */

// Database types (Supabase gerado)
export type { Database, Json } from './database.types';

// Patient types (Extended)
export type {
  PatientBase,
  PatientExtended,
  PatientInsert,
  PatientUpdate,
  PatientListItem,
  PatientDetails,
  PatientStatus,
  PatientAddress,
  EmergencyContact,
} from './patient.types';

export { isPatientExtended, toPatientExtended } from './patient.types';

// Pathology types
export type { Pathology, PathologyStatus, PathologySeverity } from './pathology.types';

// Surgery types
export type { Surgery } from './surgery.types';

// Goal types
export type { Goal, GoalStatus } from './goal.types';

// Treatment types
export type { Treatment, TreatmentStatus, SOAPNotes } from './treatment.types';

// Extended database types (Gamification, Communications, etc)
export type { DatabaseExtended } from './database.types.extended';
