/**
 * Tipos e interfaces para o sistema de condutas estruturadas
 * Campo "P - Plano" categorizado por tipo de intervenção
 */

export type ConductCategory = 
  | 'manual_therapy'      // Terapia Manual
  | 'electrotherapy'      // Eletroterapia
  | 'therapeutic_exercise' // Exercícios Terapêuticos
  | 'stretching'          // Alongamentos
  | 'strengthening'       // Fortalecimento
  | 'mobilization'        // Mobilização
  | 'other';              // Outros

export interface Conduct {
  id: string;
  category: ConductCategory;
  name: string;
  details?: string;      // Detalhes específicos (região, parâmetros, etc.)
  duration?: string;     // Ex: "20min", "3x10rep"
  equipment?: string;    // Ex: "thera band azul", "bola de futebol"
  notes?: string;        // Observações adicionais
}

export interface EvolutionPlan {
  conducts: Conduct[];
  general_notes?: string; // Campo livre para observações gerais
}

/**
 * Metadados para cada categoria de conduta
 */
export interface ConductCategoryMetadata {
  value: ConductCategory;
  label: string;
  emoji: string;
  color: string;
}

/**
 * Helper function para obter metadados de uma categoria
 */
export function getCategoryMetadata(category: ConductCategory): ConductCategoryMetadata {
  const metadata: Record<ConductCategory, ConductCategoryMetadata> = {
    manual_therapy: {
      value: 'manual_therapy',
      label: 'Terapia Manual',
      emoji: '🤲',
      color: 'blue'
    },
    electrotherapy: {
      value: 'electrotherapy',
      label: 'Eletroterapia',
      emoji: '⚡',
      color: 'yellow'
    },
    therapeutic_exercise: {
      value: 'therapeutic_exercise',
      label: 'Exercícios Terapêuticos',
      emoji: '🏃',
      color: 'green'
    },
    stretching: {
      value: 'stretching',
      label: 'Alongamentos',
      emoji: '🧘',
      color: 'purple'
    },
    strengthening: {
      value: 'strengthening',
      label: 'Fortalecimento',
      emoji: '💪',
      color: 'red'
    },
    mobilization: {
      value: 'mobilization',
      label: 'Mobilização',
      emoji: '🔄',
      color: 'indigo'
    },
    other: {
      value: 'other',
      label: 'Outros',
      emoji: '📝',
      color: 'gray'
    }
  };

  return metadata[category];
}

/**
 * Lista de todas as categorias disponíveis
 */
export const CONDUCT_CATEGORIES: ConductCategoryMetadata[] = [
  getCategoryMetadata('manual_therapy'),
  getCategoryMetadata('electrotherapy'),
  getCategoryMetadata('therapeutic_exercise'),
  getCategoryMetadata('stretching'),
  getCategoryMetadata('strengthening'),
  getCategoryMetadata('mobilization'),
  getCategoryMetadata('other'),
];

