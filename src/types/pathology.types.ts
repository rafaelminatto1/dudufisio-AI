/**
 * Tipos para Patologias
 */

// Tipo para patologia (não existe no schema gerado, provavelmente JSONB ou tabela não sincronizada)
export interface Pathology {
  id: string;
  patient_id: string;
  name: string;
  diagnosis_date?: string;
  status?: 'ativa' | 'controlada' | 'resolvida' | 'cronica';
  severity?: 'leve' | 'moderada' | 'grave';
  cid10_code?: string;
  description?: string;
  notes?: string;
  diagnosed_by?: string;
  treatment?: string;
  created_at?: string;
  updated_at?: string;
}

export type PathologyStatus = NonNullable<Pathology['status']>;
export type PathologySeverity = NonNullable<Pathology['severity']>;
