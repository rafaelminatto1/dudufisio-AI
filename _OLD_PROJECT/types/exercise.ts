/**
 * Tipos TypeScript para Sistema de Exercícios Fisioterapêuticos
 * Baseado em melhores práticas do SparkyFitness e ExerciseDB
 */

export interface Exercise {
  id: string;
  
  // Informações Básicas
  name: string;
  description: string;
  category: ExerciseCategory;
  subcategory?: string;
  
  // Características Físicas
  targetMuscles: string[];
  secondaryMuscles: string[];
  equipment: EquipmentType[];
  difficulty: ExerciseDifficulty;
  
  // Instruções e Conteúdo
  instructions: string[];
  tips: string[];
  variations: string[];
  contraindications: string[];
  
  // Parâmetros de Execução
  duration?: number; // em minutos
  sets?: number;
  reps?: number;
  weight?: number; // em kg
  distance?: number; // em metros
  restTime?: number; // em segundos
  
  // Mídia
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  
  // Classificação e Tags
  tags: string[];
  keywords: string[];
  bodyParts: string[];
  
  // Metadados
  source: ExerciseSource;
  sourceId?: string; // ID de sistema externo
  isCustom: boolean;
  isPublic: boolean;
  isActive: boolean;
  
  // Relacionamentos
  createdBy: string; // ID do usuário
  assignedPatients: string[]; // IDs dos pacientes
  protocols: string[]; // IDs dos protocolos
  
  // Progressão
  progressionLevel: ProgressionLevel;
  prerequisites: string[]; // IDs de exercícios pré-requisitos
  
  // Auditoria
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  
  // Estatísticas
  usageCount: number;
  averageRating?: number;
  totalRatings: number;
}

export interface ExerciseCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ExerciseProtocol {
  id: string;
  name: string;
  description: string;
  exercises: ProtocolExercise[];
  duration: number; // em semanas
  frequency: number; // sessões por semana
  intensity: ProtocolIntensity;
  targetConditions: string[];
  createdBy: string;
  isPublic: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProtocolExercise {
  exerciseId: string;
  exercise: Exercise;
  order: number;
  sets: number;
  reps: number;
  duration?: number;
  weight?: number;
  restTime?: number;
  notes?: string;
  isOptional: boolean;
}

export interface ExerciseAssignment {
  id: string;
  patientId: string;
  exerciseId: string;
  exercise: Exercise;
  protocolId?: string;
  protocol?: ExerciseProtocol;
  assignedBy: string;
  assignedAt: Date;
  startDate: Date;
  endDate?: Date;
  status: AssignmentStatus;
  instructions?: string;
  notes?: string;
  progress: ExerciseProgress[];
  isActive: boolean;
}

export interface ExerciseProgress {
  id: string;
  assignmentId: string;
  sessionDate: Date;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  difficulty: number; // 1-10
  painLevel: number; // 1-10
  completionRate: number; // 0-100
  notes?: string;
  recordedBy: string;
  recordedAt: Date;
}

export interface ExerciseSession {
  id: string;
  patientId: string;
  therapistId: string;
  sessionDate: Date;
  exercises: SessionExercise[];
  totalDuration: number;
  notes?: string;
  overallRating: number; // 1-10
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionExercise {
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  restTime?: number;
  difficulty: number;
  painLevel: number;
  completionRate: number;
  notes?: string;
  isCompleted: boolean;
}

export interface ExerciseTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  exercises: TemplateExercise[];
  targetAudience: string[];
  duration: number;
  difficulty: ExerciseDifficulty;
  isPublic: boolean;
  usageCount: number;
  rating: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateExercise {
  exerciseId: string;
  order: number;
  sets: number;
  reps: number;
  duration?: number;
  weight?: number;
  restTime?: number;
  notes?: string;
}

// Enums e Tipos de União
export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type ExerciseSource = 'system' | 'user' | 'imported' | 'external';
export type EquipmentType = 'none' | 'dumbbell' | 'barbell' | 'resistance_band' | 'stability_ball' | 'mat' | 'chair' | 'wall' | 'other';
export type ProgressionLevel = 1 | 2 | 3 | 4 | 5;
export type ProtocolIntensity = 'low' | 'moderate' | 'high' | 'very_high';
export type AssignmentStatus = 'assigned' | 'in_progress' | 'completed' | 'paused' | 'cancelled';

// Tipos para Formulários
export interface ExerciseFormData {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  targetMuscles: string[];
  secondaryMuscles: string[];
  equipment: EquipmentType[];
  difficulty: ExerciseDifficulty;
  instructions: string[];
  tips: string[];
  variations: string[];
  contraindications: string[];
  duration?: number;
  sets?: number;
  reps?: number;
  weight?: number;
  distance?: number;
  restTime?: number;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  tags: string[];
  keywords: string[];
  bodyParts: string[];
  source: ExerciseSource;
  sourceId?: string;
  isCustom: boolean;
  isPublic: boolean;
  isActive: boolean;
  progressionLevel: ProgressionLevel;
  prerequisites: string[];
}

export interface ExerciseSearchFilters {
  query?: string;
  category?: string;
  difficulty?: ExerciseDifficulty;
  equipment?: EquipmentType[];
  targetMuscles?: string[];
  bodyParts?: string[];
  tags?: string[];
  isActive?: boolean;
  isPublic?: boolean;
  createdBy?: string;
}

export interface ExerciseAnalytics {
  totalExercises: number;
  totalAssignments: number;
  activeAssignments: number;
  completedSessions: number;
  averageCompletionRate: number;
  mostUsedExercises: ExerciseUsage[];
  categoryDistribution: CategoryStats[];
  difficultyDistribution: DifficultyStats[];
  monthlyProgress: MonthlyProgress[];
}

export interface ExerciseUsage {
  exercise: Exercise;
  usageCount: number;
  completionRate: number;
  averageRating: number;
}

export interface CategoryStats {
  category: ExerciseCategory;
  count: number;
  percentage: number;
}

export interface DifficultyStats {
  difficulty: ExerciseDifficulty;
  count: number;
  percentage: number;
}

export interface MonthlyProgress {
  month: string;
  sessions: number;
  completionRate: number;
  averageRating: number;
}

// Tipos para Exportação
export interface ExerciseExportData {
  exercises: Exercise[];
  categories: ExerciseCategory[];
  protocols: ExerciseProtocol[];
  templates: ExerciseTemplate[];
  exportDate: Date;
  exportedBy: string;
}

// Tipos para Importação
export interface ExerciseImportData {
  exercises: Partial<Exercise>[];
  categories: Partial<ExerciseCategory>[];
  protocols: Partial<ExerciseProtocol>[];
  templates: Partial<ExerciseTemplate>[];
  importOptions: ImportOptions;
}

export interface ImportOptions {
  overwriteExisting: boolean;
  createNewCategories: boolean;
  assignToCurrentUser: boolean;
  makePublic: boolean;
}

// Tipos para API
export interface ExerciseListResponse {
  exercises: Exercise[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ExerciseCreateRequest {
  exercise: ExerciseFormData;
  createProtocol?: boolean;
  protocolData?: Partial<ExerciseProtocol>;
}

export interface ExerciseUpdateRequest {
  id: string;
  exercise: Partial<ExerciseFormData>;
  updateAssignments?: boolean;
}

export interface ExerciseDeleteRequest {
  id: string;
  deleteAssignments?: boolean;
  reassignTo?: string;
}

// Tipos para Validação
export interface ExerciseValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}