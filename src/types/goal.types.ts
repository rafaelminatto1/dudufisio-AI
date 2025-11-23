/**
 * Tipos para Metas/Objetivos
 */

export interface Goal {
  id: string;
  patient_id: string;
  title: string;
  description?: string | null;
  target_date?: string | null;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'em_progresso' | 'alcancado';
  progress?: number | null; // 0-100
  progress_percentage?: number | null; // Alias para progress
  target_value?: number | null;
  current_value?: number | null;
  unit?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  completed_at?: string | null;
}

export type GoalStatus = NonNullable<Goal['status']>;
