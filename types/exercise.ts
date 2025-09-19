import { z } from 'zod';

// Exercise categories
export const ExerciseCategory = {
  MOBILIZACAO_NEURAL: 'mobilizacao_neural',
  CERVICAL: 'cervical',
  MEMBROS_SUPERIORES: 'membros_superiores',
  TRONCO_CORE: 'tronco_core',
  MEMBROS_INFERIORES: 'membros_inferiores',
  FORTALECIMENTO: 'fortalecimento',
  ALONGAMENTO: 'alongamento',
  PROPRIOCEPCAO: 'propriocepcao',
  CARDIORRESPIRATORIO: 'cardiorrespiratorio'
} as const;

export type ExerciseCategoryType = typeof ExerciseCategory[keyof typeof ExerciseCategory];

// Difficulty levels
export const DifficultyLevel = {
  VERY_EASY: 1,
  EASY: 2,
  MODERATE: 3,
  HARD: 4,
  VERY_HARD: 5
} as const;

export type DifficultyLevelType = typeof DifficultyLevel[keyof typeof DifficultyLevel];

// Equipment types
export const EquipmentType = {
  NONE: 'none',
  MAT: 'mat',
  BALL: 'ball',
  BAND: 'band',
  WEIGHTS: 'weights',
  BOSU: 'bosu',
  THERABAND: 'theraband',
  FOAM_ROLLER: 'foam_roller',
  BALANCE_BOARD: 'balance_board',
  PROPRIOCEPTIVE_DISC: 'proprioceptive_disc'
} as const;

export type EquipmentTypeType = typeof EquipmentType[keyof typeof EquipmentType];

// Base Exercise interface
export interface Exercise {
  id: string;

  // Basic info
  name: string;
  description: string;
  category: ExerciseCategoryType;
  difficulty_level: DifficultyLevelType;

  // Media
  video_url?: string | null;
  image_urls?: string[] | null;

  // Instructions
  instructions: string;
  contraindications?: string | null;
  equipment_needed?: EquipmentTypeType[] | null;

  // Default parameters
  default_sets: number;
  default_repetitions?: number | null;
  default_duration_seconds?: number | null;
  default_rest_seconds: number;

  // Metadata
  tags?: string[] | null;
  target_muscles?: string[] | null;
  benefits?: string[] | null;

  // System fields
  created_at: string;
  updated_at: string;
  created_by: string;
  active: boolean;
  usage_count: number;
  average_rating: number;
}

// Request types
export interface CreateExerciseRequest {
  name: string;
  description: string;
  category: ExerciseCategoryType;
  difficulty_level: DifficultyLevelType;
  instructions: string;
  contraindications?: string;
  equipment_needed?: EquipmentTypeType[];
  default_sets: number;
  default_repetitions?: number;
  default_duration_seconds?: number;
  default_rest_seconds?: number;
  tags?: string[];
  target_muscles?: string[];
  benefits?: string[];
}

export interface UpdateExerciseRequest {
  name?: string;
  description?: string;
  category?: ExerciseCategoryType;
  difficulty_level?: DifficultyLevelType;
  instructions?: string;
  contraindications?: string;
  equipment_needed?: EquipmentTypeType[];
  default_sets?: number;
  default_repetitions?: number;
  default_duration_seconds?: number;
  default_rest_seconds?: number;
  tags?: string[];
  target_muscles?: string[];
  benefits?: string[];
  active?: boolean;
}

// Exercise with usage statistics
export interface ExerciseWithStats extends Exercise {
  prescription_count: number;
  completion_rate: number;
  average_difficulty_rating: number;
  last_prescribed: string | null;
}

// Exercise prescription related types
export interface ExercisePrescription {
  id: string;
  patient_id: string;
  therapist_id: string;

  // Prescription details
  start_date: string;
  end_date?: string | null;
  frequency_per_week: number;
  general_notes?: string | null;

  // Status
  status: 'active' | 'completed' | 'cancelled';

  // System fields
  created_at: string;
  updated_at: string;
}

export interface ExercisePrescriptionItem {
  id: string;
  prescription_id: string;
  exercise_id: string;

  // Custom parameters
  sets: number;
  repetitions?: number | null;
  duration_seconds?: number | null;
  rest_seconds: number;
  specific_notes?: string | null;

  // Ordering
  order_index: number;

  // Related data
  exercise: Exercise;
}

export interface ExerciseLog {
  id: string;
  prescription_item_id: string;

  // Execution data
  date_performed: string;
  sets_completed: number;
  repetitions_completed?: number | null;
  duration_completed_seconds?: number | null;
  difficulty_rating?: number | null; // 1-5 scale
  pain_during_exercise?: number | null; // 0-10 scale
  notes?: string | null;

  // System fields
  created_at: string;
}

// Patient's exercise view
export interface PatientExerciseView {
  prescription: ExercisePrescription;
  exercises: Array<{
    item: ExercisePrescriptionItem;
    latest_log?: ExerciseLog | null;
    completion_percentage: number;
    next_session_date: string;
  }>;
  overall_progress: {
    total_exercises: number;
    completed_today: number;
    weekly_completion_rate: number;
    streak_days: number;
  };
}

// Search and filter types
export interface ExerciseFilters {
  category?: ExerciseCategoryType;
  difficulty_level?: DifficultyLevelType;
  equipment_needed?: EquipmentTypeType[];
  tags?: string[];
  target_muscles?: string[];
  search?: string;
  only_active?: boolean;
  sort_by?: 'name' | 'difficulty' | 'usage_count' | 'rating' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// Validation schemas
export const createExerciseSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),

  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres'),

  category: z.enum([
    'mobilizacao_neural', 'cervical', 'membros_superiores', 'tronco_core',
    'membros_inferiores', 'fortalecimento', 'alongamento', 'propriocepcao', 'cardiorrespiratorio'
  ], { errorMap: () => ({ message: 'Categoria inválida' }) }),

  difficulty_level: z
    .number()
    .min(1, 'Nível de dificuldade deve estar entre 1 e 5')
    .max(5, 'Nível de dificuldade deve estar entre 1 e 5')
    .int('Nível de dificuldade deve ser um número inteiro'),

  instructions: z
    .string()
    .min(20, 'Instruções devem ter pelo menos 20 caracteres')
    .max(2000, 'Instruções devem ter no máximo 2000 caracteres'),

  contraindications: z
    .string()
    .max(1000, 'Contraindicações devem ter no máximo 1000 caracteres')
    .optional(),

  equipment_needed: z
    .array(z.enum(['none', 'mat', 'ball', 'band', 'weights', 'bosu', 'theraband', 'foam_roller', 'balance_board', 'proprioceptive_disc']))
    .optional(),

  default_sets: z
    .number()
    .min(1, 'Séries devem ser pelo menos 1')
    .max(10, 'Séries devem ser no máximo 10')
    .int('Séries devem ser um número inteiro'),

  default_repetitions: z
    .number()
    .min(1, 'Repetições devem ser pelo menos 1')
    .max(100, 'Repetições devem ser no máximo 100')
    .int('Repetições devem ser um número inteiro')
    .optional(),

  default_duration_seconds: z
    .number()
    .min(5, 'Duração deve ser pelo menos 5 segundos')
    .max(3600, 'Duração deve ser no máximo 1 hora')
    .int('Duração deve ser um número inteiro')
    .optional(),

  default_rest_seconds: z
    .number()
    .min(0, 'Descanso não pode ser negativo')
    .max(300, 'Descanso deve ser no máximo 5 minutos')
    .int('Descanso deve ser um número inteiro')
    .default(30),

  tags: z.array(z.string().max(50, 'Tag deve ter no máximo 50 caracteres')).optional(),
  target_muscles: z.array(z.string().max(100, 'Músculo alvo deve ter no máximo 100 caracteres')).optional(),
  benefits: z.array(z.string().max(200, 'Benefício deve ter no máximo 200 caracteres')).optional()
});

export const updateExerciseSchema = createExerciseSchema.partial().extend({
  active: z.boolean().optional()
});

export const exercisePrescriptionSchema = z.object({
  patient_id: z.string().uuid('ID do paciente deve ser um UUID válido'),
  frequency_per_week: z
    .number()
    .min(1, 'Frequência deve ser pelo menos 1 vez por semana')
    .max(7, 'Frequência deve ser no máximo 7 vezes por semana')
    .int('Frequência deve ser um número inteiro'),
  general_notes: z
    .string()
    .max(1000, 'Notas gerais devem ter no máximo 1000 caracteres')
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .optional()
});

export const exerciseLogSchema = z.object({
  sets_completed: z
    .number()
    .min(0, 'Séries completadas não pode ser negativo')
    .int('Séries completadas deve ser um número inteiro'),

  repetitions_completed: z
    .number()
    .min(0, 'Repetições completadas não pode ser negativo')
    .int('Repetições completadas deve ser um número inteiro')
    .optional(),

  duration_completed_seconds: z
    .number()
    .min(0, 'Duração completada não pode ser negativa')
    .int('Duração completada deve ser um número inteiro')
    .optional(),

  difficulty_rating: z
    .number()
    .min(1, 'Avaliação de dificuldade deve estar entre 1 e 5')
    .max(5, 'Avaliação de dificuldade deve estar entre 1 e 5')
    .int('Avaliação de dificuldade deve ser um número inteiro')
    .optional(),

  pain_during_exercise: z
    .number()
    .min(0, 'Dor durante exercício deve estar entre 0 e 10')
    .max(10, 'Dor durante exercício deve estar entre 0 e 10')
    .int('Dor durante exercício deve ser um número inteiro')
    .optional(),

  notes: z
    .string()
    .max(500, 'Notas devem ter no máximo 500 caracteres')
    .optional()
});

// Helper functions
export function getExerciseCategoryLabel(category: ExerciseCategoryType): string {
  const labels = {
    mobilizacao_neural: 'Mobilização Neural',
    cervical: 'Cervical',
    membros_superiores: 'Membros Superiores',
    tronco_core: 'Tronco/Core',
    membros_inferiores: 'Membros Inferiores',
    fortalecimento: 'Fortalecimento',
    alongamento: 'Alongamento',
    propriocepcao: 'Propriocepção',
    cardiorrespiratorio: 'Cardiorrespiratório'
  };
  return labels[category];
}

export function getDifficultyLevelLabel(level: DifficultyLevelType): string {
  const labels = {
    1: 'Muito Fácil',
    2: 'Fácil',
    3: 'Moderado',
    4: 'Difícil',
    5: 'Muito Difícil'
  };
  return labels[level];
}

export function getDifficultyLevelColor(level: DifficultyLevelType): string {
  const colors = {
    1: 'green',
    2: 'blue',
    3: 'yellow',
    4: 'orange',
    5: 'red'
  };
  return colors[level];
}

export function getEquipmentLabel(equipment: EquipmentTypeType): string {
  const labels = {
    none: 'Nenhum',
    mat: 'Colchonete',
    ball: 'Bola',
    band: 'Faixa Elástica',
    weights: 'Pesos',
    bosu: 'Bosu',
    theraband: 'Theraband',
    foam_roller: 'Rolo de Espuma',
    balance_board: 'Prancha de Equilíbrio',
    proprioceptive_disc: 'Disco Proprioceptivo'
  };
  return labels[equipment];
}

export function formatExerciseDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

export function calculateCompletionRate(logs: ExerciseLog[], prescription: ExercisePrescriptionItem): number {
  const totalExpectedSessions = prescription.sets;
  const completedSessions = logs.reduce((sum, log) => sum + log.sets_completed, 0);
  return Math.min((completedSessions / totalExpectedSessions) * 100, 100);
}

export function getExerciseProgress(logs: ExerciseLog[]): 'improving' | 'stable' | 'declining' {
  if (logs.length < 3) return 'stable';

  const recent = logs.slice(-3);
  const older = logs.slice(-6, -3);

  if (older.length === 0) return 'stable';

  const recentAvg = recent.reduce((sum, log) => {
    const completed = log.sets_completed + (log.repetitions_completed || 0);
    return sum + completed;
  }, 0) / recent.length;

  const olderAvg = older.reduce((sum, log) => {
    const completed = log.sets_completed + (log.repetitions_completed || 0);
    return sum + completed;
  }, 0) / older.length;

  const improvement = (recentAvg - olderAvg) / olderAvg;

  if (improvement > 0.1) return 'improving';
  if (improvement < -0.1) return 'declining';
  return 'stable';
}

// Common target muscles for autocomplete
export const COMMON_TARGET_MUSCLES = [
  'Quadríceps',
  'Isquiotibiais',
  'Glúteos',
  'Panturrilha',
  'Tibial anterior',
  'Core/Abdominais',
  'Deltoides',
  'Bíceps',
  'Tríceps',
  'Peitoral',
  'Dorsal',
  'Trapézio',
  'Romboides',
  'Cervicais',
  'Paravertebrais'
] as const;

// Common exercise benefits
export const COMMON_BENEFITS = [
  'Fortalecimento muscular',
  'Melhora da flexibilidade',
  'Aumento da amplitude de movimento',
  'Melhora do equilíbrio',
  'Melhora da coordenação',
  'Alívio da dor',
  'Melhora da postura',
  'Prevenção de lesões',
  'Melhora da função cardiovascular',
  'Relaxamento muscular'
] as const;