/**
 * Tipos para Tratamentos/Sessões
 */

export interface Treatment {
  id: string;
  patient_id: string;
  therapist_id?: string;
  title?: string;
  description?: string;
  session_date?: string;
  duration_minutes?: number;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

  // SOAP Notes
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;

  // Técnicas e recursos
  techniques?: string[];
  resources?: string[];

  // Evolução
  evolution?: string;
  notes?: string;

  // Metadados
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export type TreatmentStatus = NonNullable<Treatment['status']>;

export interface SOAPNotes {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}
