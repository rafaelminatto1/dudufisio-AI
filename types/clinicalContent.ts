/**
 * Tipos para Conteúdos Clínicos
 * Protocolos, Avaliações, Biblioteca, Materiais e Exercícios
 */

// ===== ESPECIALIDADES =====
export type FisioSpecialty = 'esportiva' | 'pos-operatoria' | 'geriatrica' | 'ortopedica' | 'neurologica';

// ===== PROTOCOLOS CLÍNICOS =====
export interface ClinicalProtocol {
  id: string;
  title: string;
  specialty: FisioSpecialty;
  description: string;
  summary: string;
  objectives: string[];
  indications: string[];
  contraindications: string[];
  phases: ProtocolPhase[];
  duration: string; // ex: "8-12 semanas"
  frequency: string; // ex: "2-3x por semana"
  evidenceLevel: 'A' | 'B' | 'C' | 'D'; // Nível de evidência científica
  references: string[];
  images: ProtocolImage[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  authorId?: string;
}

export interface ProtocolPhase {
  id: string;
  name: string;
  order: number;
  duration: string;
  goals: string[];
  activities: string[];
  precautions: string[];
  progressionCriteria: string[];
}

export interface ProtocolImage {
  url: string;
  prompt: string;
  caption: string;
  type: 'diagram' | 'photo' | 'illustration';
}

// ===== AVALIAÇÕES ESPECIALIZADAS =====
export interface SpecializedAssessment {
  id: string;
  title: string;
  specialty: FisioSpecialty;
  description: string;
  purpose: string;
  targetPopulation: string;
  duration: string; // ex: "30-45 minutos"
  materials: string[];
  procedures: AssessmentProcedure[];
  scoringCriteria: ScoringCriteria[];
  interpretationGuide: InterpretationGuide[];
  references: string[];
  images: ProtocolImage[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentProcedure {
  id: string;
  order: number;
  step: string;
  instruction: string;
  expectedOutcome: string;
  commonErrors: string[];
}

export interface ScoringCriteria {
  parameter: string;
  unit: string;
  normalRange: string;
  measurement: string;
}

export interface InterpretationGuide {
  range: string;
  interpretation: string;
  recommendations: string[];
}

// ===== BIBLIOTECA CLÍNICA =====
export interface ClinicalLibraryItem {
  id: string;
  type: 'article' | 'guideline' | 'case-study' | 'research' | 'review';
  title: string;
  specialty: FisioSpecialty;
  abstract: string;
  fullContent: string;
  authors: string[];
  journal?: string;
  year: number;
  doi?: string;
  keywords: string[];
  references: string[];
  relatedProtocols: string[]; // IDs de protocolos relacionados
  images: ProtocolImage[];
  accessLevel: 'public' | 'team' | 'admin';
  downloads: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// ===== MATERIAIS CLÍNICOS =====
export interface ClinicalMaterial {
  id: string;
  type: 'manual' | 'form' | 'checklist' | 'guideline' | 'template' | 'infographic';
  title: string;
  specialty: FisioSpecialty;
  description: string;
  category: 'patient-education' | 'professional-use' | 'evaluation' | 'documentation';
  content: string; // Pode ser markdown, HTML ou texto
  downloadable: boolean;
  printable: boolean;
  fileUrl?: string;
  thumbnailUrl?: string;
  images: ProtocolImage[];
  tags: string[];
  language: string;
  version: string;
  lastReviewed: string;
  createdAt: string;
  updatedAt: string;
}

// ===== EXERCÍCIOS =====
export interface Exercise {
  id: string;
  name: string;
  alias: string[]; // Nomes alternativos
  specialty: FisioSpecialty[];
  category: ExerciseCategory;
  bodyParts: BodyPart[];
  description: string;
  objectives: string[];
  instructions: ExerciseInstruction[];
  difficulty: 'iniciante' | 'intermediario' | 'avancado';
  duration: string; // ex: "30 segundos", "10 repetições"
  sets: number;
  repetitions: string;
  restPeriod: string;
  equipment: string[];
  variations: ExerciseVariation[];
  contraindications: string[];
  precautions: string[];
  benefits: string[];
  commonMistakes: string[];
  images: ExerciseImage[];
  videos: ExerciseVideo[];
  tags: string[];
  musclesWorked: string[];
  movementPattern: string;
  createdAt: string;
  updatedAt: string;
}

export type ExerciseCategory = 
  | 'mobilidade'
  | 'fortalecimento'
  | 'alongamento'
  | 'equilibrio'
  | 'coordenacao'
  | 'propriocepcao'
  | 'resistencia'
  | 'flexibilidade'
  | 'funcional';

export type BodyPart =
  | 'cervical'
  | 'ombro'
  | 'cotovelo'
  | 'punho'
  | 'mao'
  | 'toracica'
  | 'lombar'
  | 'quadril'
  | 'joelho'
  | 'tornozelo'
  | 'pe'
  | 'core'
  | 'corpo-inteiro';

export interface ExerciseInstruction {
  order: number;
  text: string;
  imageRef?: string;
}

export interface ExerciseVariation {
  id: string;
  name: string;
  description: string;
  difficultyModifier: 'easier' | 'harder';
  modifications: string[];
}

export interface ExerciseImage {
  url: string;
  prompt: string;
  caption: string;
  phase: 'inicio' | 'meio' | 'fim' | 'geral';
  angle: string; // ex: "vista lateral", "vista frontal"
}

export interface ExerciseVideo {
  url: string;
  thumbnail: string;
  duration: number;
  title: string;
  description: string;
}

// ===== BIBLIOTECA DE EXERCÍCIOS (COLEÇÕES) =====
export interface ExerciseLibrary {
  id: string;
  title: string;
  description: string;
  specialty: FisioSpecialty;
  targetCondition: string; // ex: "Lesão de LCA", "Tendinite de ombro"
  exercises: string[]; // IDs dos exercícios
  recommendedSequence: ExerciseSequence[];
  createdBy: string;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseSequence {
  exerciseId: string;
  order: number;
  notes: string;
  progressionWeek?: number;
}

// ===== PROGRAMA DE EXERCÍCIOS =====
export interface ExerciseProgram {
  id: string;
  patientId: string;
  title: string;
  specialty: FisioSpecialty;
  startDate: string;
  endDate: string;
  weeks: ProgramWeek[];
  goals: string[];
  notes: string;
  therapistId: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  adherenceRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramWeek {
  weekNumber: number;
  sessions: ProgramSession[];
  weeklyGoals: string[];
  notes: string;
}

export interface ProgramSession {
  sessionNumber: number;
  exercises: SessionExercise[];
  warmUp?: string;
  coolDown?: string;
  totalDuration: string;
  notes: string;
}

export interface SessionExercise {
  exerciseId: string;
  sets: number;
  repetitions: string;
  load?: string;
  notes: string;
  completed?: boolean;
}

// ===== CONTEÚDO EDUCACIONAL =====
export interface EducationalContent {
  id: string;
  type: 'video' | 'article' | 'infographic' | 'guide' | 'faq';
  title: string;
  specialty: FisioSpecialty;
  description: string;
  content: string;
  targetAudience: 'patient' | 'professional' | 'both';
  images: ProtocolImage[];
  readTime?: string; // ex: "5 min"
  tags: string[];
  relatedContent: string[];
  createdAt: string;
  updatedAt: string;
}

// ===== FILTROS E BUSCA =====
export interface ContentFilter {
  specialty?: FisioSpecialty | FisioSpecialty[];
  tags?: string[];
  difficulty?: string;
  bodyPart?: BodyPart | BodyPart[];
  category?: string;
  searchTerm?: string;
}

export interface ContentSearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  filters: ContentFilter;
}

