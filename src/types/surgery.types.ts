/**
 * Tipos para Cirurgias
 */

export interface Surgery {
  id: string;
  patient_id: string;
  name: string;
  surgery_date?: string | null;
  hospital?: string | null;
  surgeon?: string | null;
  surgeon_name?: string | null;  // Alias para surgeon
  surgery_name?: string | null;  // Alias para name
  current_phase?: string | null; // Fase da recuperação
  description?: string | null;
  complications?: string | null;
  recovery_notes?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}
