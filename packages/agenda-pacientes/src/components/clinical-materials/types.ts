/**
 * Types for Clinical Materials Library
 * MoocaFisio - Sistema de Gestão de Clínicas de Fisioterapia
 */

// Categorias de materiais clínicos
export type MaterialCategory =
  | 'assessment_forms'      // Fichas de Avaliação
  | 'validated_scales'      // Escalas Validadas
  | 'anamnesis'            // Anamnese
  | 'pain_maps'            // Mapas de Dor
  | 'follow_up'            // Follow-up
  | 'treatment_plan'       // Plano de Tratamento
  | 'patient_education';   // Educação do Paciente

// Especialidades
export type Specialty =
  | 'traumato_orthopedic'  // Traumato-Ortopédica
  | 'neurofunctional'      // Neurofuncional
  | 'respiratory'          // Respiratória
  | 'womens_health'        // Saúde da Mulher
  | 'sports'               // Esportiva
  | 'pediatric'            // Pediátrica
  | 'geriatric'            // Geriátrica
  | 'dermatofunctional'    // Dermatofuncional
  | 'general';             // Geral

// Tipos de arquivo
export type FileType = 'pdf' | 'docx' | 'xlsx';

// Interface principal do material clínico
export interface ClinicalMaterial {
  id: string;
  name: string;
  description: string;
  category: MaterialCategory;
  specialty: Specialty[];
  file_url: string;
  file_type: FileType;
  thumbnail_url?: string;
  is_fillable: boolean;
  tags: string[];
  download_count: number;
  is_favorite?: boolean;
  created_at: string;
  updated_at: string;
}

// Filtros para busca de materiais
export interface MaterialFilters {
  category?: MaterialCategory;
  specialty?: Specialty;
  search?: string;
  favorites_only?: boolean;
}

// Labels legíveis para categorias
export const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  assessment_forms: 'Fichas de Avaliação',
  validated_scales: 'Escalas Validadas',
  anamnesis: 'Anamnese',
  pain_maps: 'Mapas de Dor',
  follow_up: 'Follow-up',
  treatment_plan: 'Plano de Tratamento',
  patient_education: 'Educação do Paciente',
};

// Ícones para categorias
export const CATEGORY_ICONS: Record<MaterialCategory, string> = {
  assessment_forms: '📋',
  validated_scales: '📊',
  anamnesis: '📝',
  pain_maps: '🗺️',
  follow_up: '📈',
  treatment_plan: '🎯',
  patient_education: '📖',
};

// Labels legíveis para especialidades
export const SPECIALTY_LABELS: Record<Specialty, string> = {
  traumato_orthopedic: 'Traumato-Ortopédica',
  neurofunctional: 'Neurofuncional',
  respiratory: 'Respiratória',
  womens_health: 'Saúde da Mulher',
  sports: 'Esportiva',
  pediatric: 'Pediátrica',
  geriatric: 'Geriátrica',
  dermatofunctional: 'Dermatofuncional',
  general: 'Geral',
};

// Interface para resposta da API de materiais
export interface MaterialsResponse {
  data: ClinicalMaterial[];
  count: number;
}

// Interface para favoritos
export interface MaterialFavorite {
  id: string;
  user_id: string;
  material_id: string;
  created_at: string;
}

