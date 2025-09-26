import React from 'react';

// --- User & Auth Types ---

export enum Role {
  Admin = 'Admin',
  Therapist = 'Fisioterapeuta',
  Patient = 'Paciente',
  EducadorFisico = 'EducadorFisico',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
  phone?: string;
  patientId?: string;
  emailVerified?: boolean;
  createdAt?: string;
  lastSignIn?: string | null;
  mfaEnabled?: boolean;
}

export interface Therapist {
  id:string;
  name: string;
  color: string; // e.g., 'teal', 'sky', 'indigo'
  avatarUrl: string;
}

// --- Patient Related Types ---

// FIX: Add PatientStatus enum to be used across the application and fix import error.
export enum PatientStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Discharged = 'Discharged',
}

export interface Surgery {
  name: string;
  date: string; // YYYY-MM-DD
}

export interface Condition {
  name: string;
  date: string; // YYYY-MM-DD
}

export interface TrackedMetric {
  id: string;
  name: string;
  unit: string;
  isActive: boolean;
}

export interface MetricResult {
  metricId: string;
  value: number;
}

export interface PatientAttachment {
    name: string;
    url: string;
    type: string;
    size: number;
}

export interface CommunicationLog {
  id: string;
  date: string; // ISO String
  type: 'WhatsApp' | 'Ligação' | 'Email' | 'Outro';
  notes: string;
  actor: string; // who made the contact, e.g., 'Dr. Roberto'
}

export interface PainPoint {
  id: string;
  x: number; // percentage
  y: number; // percentage
  intensity: number; // 0-10
  type: 'latejante' | 'aguda' | 'queimação' | 'formigamento' | 'cansaço';
  description: string;
  date: string; // ISO String
  bodyPart: 'front' | 'back';
}

export interface Patient {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  email: string;
  emergencyContact: {
    name: string;
    phone:string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  // FIX: Use PatientStatus enum for consistency.
  status: PatientStatus;
  lastVisit: string;
  registrationDate: string;
  avatarUrl: string;
  consentGiven: boolean;
  whatsappConsent: 'opt-in' | 'opt-out';
  allergies?: string;
  medicalAlerts?: string;
  surgeries?: Surgery[];
  conditions?: Condition[];
  attachments?: PatientAttachment[];
  trackedMetrics?: TrackedMetric[];
  communicationLogs?: CommunicationLog[];
  painPoints?: PainPoint[];
}

export type AlertType = 'abandonment' | 'highRisk' | 'attention';

export interface AlertPatient extends Patient {
    alertReason: string;
    alertType: AlertType;
}

export interface PatientSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  // FIX: Use PatientStatus enum for consistency.
  status: PatientStatus;
  lastVisit: string;
  avatarUrl: string;
  medicalAlerts?: string;
  cpf?: string;
}

// --- Appointment & Scheduling Types ---

export enum AppointmentStatus {
  Scheduled = 'Agendado',
  Completed = 'Realizado',
  Canceled = 'Cancelado',
  NoShow = 'Faltou'
}

export enum AppointmentType {
    Evaluation = 'Avaliação',
    Session = 'Sessão',
    Return = 'Retorno',
    Pilates = 'Pilates',
    Urgent = 'Urgente',
    Teleconsulta = 'Teleconsulta',
}

export const AppointmentTypeColors: Record<string, string> = {
    [AppointmentType.Evaluation]: 'purple',
    [AppointmentType.Session]: 'emerald',
    [AppointmentType.Return]: 'blue',
    [AppointmentType.Pilates]: 'amber',
    [AppointmentType.Urgent]: 'red',
    [AppointmentType.Teleconsulta]: 'cyan',
};


export interface RecurrenceRule {
    frequency: 'weekly';
    days: number[]; // 0=Sun, 1=Mon, ...
    until: string; // YYYY-MM-DD
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatarUrl: string; // Added for easier access
  therapistId: string;
  startTime: Date;
  endTime: Date;
  title: string;
  type: AppointmentType;
  status: AppointmentStatus;
  value: number;
  paymentStatus: 'paid' | 'pending';
  observations?: string;
  seriesId?: string;
  recurrenceRule?: RecurrenceRule;
  sessionNumber?: number;
  totalSessions?: number;
}

export interface EnrichedAppointment extends Appointment {
    therapistColor: string;
    typeColor: string;
    patientPhone: string;
    patientMedicalAlerts?: string | undefined;
    therapistName: string;
    notes?: string;
}

export interface AvailabilityBlock {
  id: string;
  therapistId: string;
  startTime: Date;
  endTime: Date;
  title: string; // e.g., 'Almoço', 'Férias'
}

export interface AppointmentHeatmapData {
    day: string;
    '8h': number; '9h': number; '10h': number; '11h': number;
    '12h': number; '13h': number; '14h': number; '15h': number;
    '16h': number; '17h': number; '18h': number; '19h': number;
}

// --- Scheduling Settings Types ---

export interface TimeSlotLimit {
  id: string;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  limit: number;
}

export interface DayLimits {
  weekday: TimeSlotLimit[];
  saturday: TimeSlotLimit[];
}

export interface SchedulingSettings {
  limits: DayLimits;
  maxEvaluationsPerSlot: number;
  teleconsultaEnabled: boolean;
}


// --- Clinical & Documentation Types ---

export interface SoapNote {
  id: string;
  patientId: string;
  date: string;
  therapist: string;
  sessionNumber?: number;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  bodyParts?: string[];
  painScale?: number;
  attachments?: { name: string; url: string; }[];
  metricResults?: MetricResult[];
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  coffitoDiagnosisCodes: string;
  treatmentGoals: string;
  frequencyPerWeek: number;
  durationWeeks: number;
  modalities: string[];
  outcomeMeasures: string[];
  createdByCrefito: string;
  exercises?: ExercisePrescription[];
}

export interface ExercisePrescription {
    id: string;
    treatmentPlanId: string;
    exerciseName: string;
    sets: number;
    repetitions: string; // Can be "15" or "30s"
    resistanceLevel: string;
    progressionCriteria: string;
    demonstrationVideoUrl?: string;
}

export interface AuditLogEntry {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: Date;
  ipAddress: string;
}

// --- Clinical Protocols Types ---

export enum ProtocolCategory {
  Orthopedic = 'Ortopedia',
  Neurological = 'Neurologia',
  Cardiorespiratory = 'Cardiorrespiratória',
  Pediatric = 'Pediatria',
  Sports = 'Esportiva',
  Geriatric = 'Gerontologia',
  Oncology = 'Oncologia',
  Women = 'Saúde da Mulher',
}

export enum EvidenceLevel {
  IA = '1A',
  IB = '1B',
  IIA = '2A',
  IIB = '2B',
  III = '3',
  IV = '4',
  V = '5',
}

export enum ProtocolPhase {
  Acute = 'Aguda',
  Subacute = 'Subaguda',
  Chronic = 'Crônica',
  Maintenance = 'Manutenção',
}

export interface Protocol {
  id: string;
  name: string;
  description: string;
  category: ProtocolCategory;
  subcategory?: string;
  version: string;
  lastUpdated: string;
  createdBy: string;
  reviewedBy?: string[];
  evidenceLevel: EvidenceLevel;
  references: ProtocolReference[];
  
  // Clinical Information
  definition: string;
  epidemiology?: string;
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  contraindications: string[];
  precautions: string[];
  
  // Assessment
  assessmentTools: AssessmentTool[];
  outcomeMetrics: OutcomeMetric[];
  
  // Treatment Phases
  phases: ProtocolPhase[];
  treatmentPlan: TreatmentPhaseDetail[];
  
  // Progression Criteria
  progressionCriteria: ProgressionCriteria[];
  dischargeCriteria: string[];
  
  // Implementation
  estimatedDuration: {
    min: number;
    max: number;
    unit: 'days' | 'weeks' | 'months';
  };
  frequency: string;
  sessionDuration: number; // minutes
  
  // Quality Metrics
  successRate?: number;
  patientSatisfaction?: number;
  costEffectiveness?: string;
  
  // Usage Statistics
  timesUsed: number;
  averageOutcomes: {
    [metric: string]: number;
  };
  
  // Status and Approval
  status: 'draft' | 'review' | 'approved' | 'deprecated';
  approvedAt?: string;
  isActive: boolean;
  tags: string[];
}

export interface ProtocolReference {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  pmid?: string;
  url?: string;
  evidenceLevel: EvidenceLevel;
  relevanceScore: number; // 1-10
}

export interface AssessmentTool {
  id: string;
  name: string;
  type: 'scale' | 'test' | 'measurement' | 'questionnaire';
  description: string;
  instructions: string;
  scoringCriteria: string;
  normalValues?: string;
  reliability?: number;
  validity?: number;
  minimumDetectableChange?: number;
}

export interface OutcomeMetric {
  id: string;
  name: string;
  type: 'primary' | 'secondary';
  unit: string;
  expectedChange: {
    direction: 'increase' | 'decrease' | 'maintain';
    magnitude: number;
    timeframe: string;
  };
  assessmentFrequency: string;
  clinicalSignificance: number;
}

export interface TreatmentPhaseDetail {
  id: string;
  phase: ProtocolPhase;
  name: string;
  description: string;
  duration: {
    min: number;
    max: number;
    unit: 'days' | 'weeks' | 'sessions';
  };
  objectives: string[];
  interventions: ProtocolIntervention[];
  exerciseProgram: ExerciseProtocol[];
  precautions: string[];
  progressMarkers: string[];
}

export interface ProtocolIntervention {
  id: string;
  name: string;
  type: 'manual' | 'exercise' | 'modality' | 'education' | 'other';
  description: string;
  dosage: {
    frequency: string;
    duration: string;
    intensity: string;
    progression: string;
  };
  evidenceLevel: EvidenceLevel;
  contraindications?: string[];
  modifications?: InterventionModification[];
}

export interface InterventionModification {
  condition: string;
  modification: string;
  rationale: string;
}

export interface ExerciseProtocol {
  id: string;
  exerciseId: string;
  exerciseName: string;
  phase: ProtocolPhase;
  sets: number;
  repetitions: string;
  hold?: string;
  rest?: string;
  intensity: string;
  frequency: string;
  progression: ExerciseProgression[];
  modifications: ExerciseModification[];
  precautions: string[];
}

export interface ExerciseProgression {
  week: number;
  sets: number;
  repetitions: string;
  intensity: string;
  notes?: string;
}

export interface ExerciseModification {
  condition: string;
  modification: string;
  parameters?: {
    sets?: number;
    repetitions?: string;
    intensity?: string;
  };
}

export interface ProgressionCriteria {
  id: string;
  fromPhase: ProtocolPhase;
  toPhase: ProtocolPhase;
  criteria: ProgressionRule[];
  timeframe: string;
  requiredAssessments: string[];
}

export interface ProgressionRule {
  type: 'objective' | 'subjective' | 'functional' | 'time';
  parameter: string;
  operator: '>' | '<' | '>=' | '<=' | '=' | 'improved' | 'stable' | 'achieved';
  value: number | string;
  unit?: string;
  weight: number; // importance 1-10
}

export interface ProtocolPrescription {
  id: string;
  protocolId: string;
  patientId: string;
  prescribedBy: string;
  prescribedAt: string;
  currentPhase: ProtocolPhase;
  startDate: string;
  estimatedEndDate: string;
  
  // Customizations
  customizations: ProtocolCustomization[];
  excludedInterventions: string[];
  additionalNotes: string;
  
  // Progress Tracking
  phaseHistory: PhaseProgress[];
  assessmentResults: AssessmentResult[];
  adherenceRate: number;
  
  // Outcomes
  outcomes: ProtocolOutcome[];
  complications?: string[];
  modifications: ProtocolModification[];
  
  status: 'active' | 'completed' | 'discontinued' | 'on_hold';
  completedAt?: string;
  discontinuedReason?: string;
}

export interface ProtocolCustomization {
  type: 'exercise' | 'intervention' | 'frequency' | 'duration' | 'intensity';
  target: string; // ID or name of what's being customized
  modification: string;
  reason: string;
}

export interface PhaseProgress {
  phase: ProtocolPhase;
  startDate: string;
  endDate?: string;
  objectives: {
    [objectiveId: string]: {
      description: string;
      completed: boolean;
      completedAt?: string;
      notes?: string;
    };
  };
  assessments: string[]; // assessment IDs
  duration: number; // actual days in phase
}

export interface AssessmentResult {
  id: string;
  toolId: string;
  toolName: string;
  assessedAt: string;
  assessedBy: string;
  results: {
    [parameter: string]: {
      value: number | string;
      unit?: string;
      percentile?: number;
      interpretation: string;
    };
  };
  overallScore?: number;
  clinicalInterpretation: string;
}

export interface ProtocolOutcome {
  metricId: string;
  metricName: string;
  baselineValue: number;
  currentValue: number;
  targetValue?: number;
  unit: string;
  percentChange: number;
  clinicallySignificant: boolean;
  assessedAt: string;
}

export interface ProtocolModification {
  id: string;
  modifiedAt: string;
  modifiedBy: string;
  type: 'exercise' | 'intervention' | 'progression' | 'frequency' | 'other';
  description: string;
  reason: string;
  impact: 'minor' | 'moderate' | 'major';
}

export interface ProtocolAnalytics {
  protocolId: string;
  protocolName: string;
  totalPrescriptions: number;
  activePrescriptions: number;
  completedPrescriptions: number;
  averageDuration: number; // days
  successRate: number; // percentage
  adherenceRate: number; // percentage
  
  // Outcome Analytics
  outcomeMetrics: {
    [metricName: string]: {
      averageImprovement: number;
      successRate: number; // % achieving target
      clinicalSignificanceRate: number;
    };
  };
  
  // Phase Analytics
  phaseAnalytics: {
    [phase: string]: {
      averageDuration: number;
      completionRate: number;
      commonModifications: string[];
    };
  };
  
  // Patient Demographics
  demographics: {
    ageGroups: { [range: string]: number };
    genderDistribution: { [gender: string]: number };
    severityDistribution: { [level: string]: number };
  };
  
  // Therapist Performance
  therapistMetrics: {
    [therapistId: string]: {
      prescriptions: number;
      successRate: number;
      adherenceRate: number;
      averageDuration: number;
    };
  };
  
  // Time-based Trends
  monthlyTrends: {
    month: string;
    prescriptions: number;
    completions: number;
    successRate: number;
  }[];
  
  lastUpdated: string;
}

export interface ProtocolLibraryStats {
  totalProtocols: number;
  protocolsByCategory: { [category: string]: number };
  protocolsByEvidenceLevel: { [level: string]: number };
  recentlyUpdated: Protocol[];
  mostUsed: Protocol[];
  highestRated: Protocol[];
  pendingReview: number;
  averageSuccessRate: number;
}

export interface ProtocolRecommendation {
  id: string;
  patientId: string;
  protocolId: string;
  reason: string; // e.g., "Based on diagnosis: Gonalgia D"
  status: 'suggested' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface LibraryExercise {
  id: string;
  name: string;
  duration: string;
  videoUrl: string;
}

export interface ExerciseCategory {
  id: string;
  name: string;
  exercises: LibraryExercise[];
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  bodyParts: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  equipment: string[];
  instructions: string[];
  media: {
    videoUrl?: string;
    thumbnailUrl: string;
    duration?: number; // duration in seconds
  };
  indications?: string[];
  contraindications?: string[];
  modifications?: {
    easier?: string;
    harder?: string;
  };
  status?: 'approved' | 'pending_approval';
  authorId?: string;
}

export interface ClinicalMaterialData {
  nome_material: string;
  tipo_material: 'Escala de Avaliação' | 'Protocolo Clínico' | 'Material de Orientação';
}

export interface MedicalReport {
  id: number;
  patientId: string;
  therapistId: string;
  title: string;
  content: string;
  aiGeneratedContent: string;
  status: 'draft' | 'finalized' | 'sent';
  recipientDoctor?: string;
  recipientCrm?: string;
  generatedAt: Date;
  finalizedAt?: Date;
}


// --- Group & Gamification Types ---

export interface GroupMember {
  patientId: string;
  patientName: string;
  joinDate: string;
  status: 'active' | 'paused';
  level: 'beginner' | 'intermediate' | 'advanced';
  points?: number;
  avatarUrl?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  therapistId: string;
  capacity: {
    max: number;
    current: number;
  };
  members: GroupMember[];
  schedule: {
    days: string[]; // e.g., ["monday", "wednesday", "friday"]
    time: string; // e.g., "08:00"
    duration: number; // in minutes
  };
  exercises: {
    exerciseId: string;
    order: number;
  }[];
  status: 'active' | 'paused' | 'completed';
  gamification?: {
    totalPoints: number;
    level: number;
    badges: string[];
    challenges: {
      id: string;
      title: string;
      description: string;
      progress: number; // 0-100
    }[];
  };
  metrics?: {
    averageAdherence: number;
    averageSatisfaction: number;
    cohesionScore: number;
    progressRate: number;
  };
}

// --- Task & Project Management Types ---

export enum ProjectStatus {
  Active = 'Ativo',
  Concluded = 'Concluído',
  Paused = 'Pausado',
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  patientId?: string; // Optional link to a patient for clinical projects
  type: 'Clinical' | 'Research' | 'Operational';
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

export enum TaskStatus {
  ToDo = 'A Fazer',
  InProgress = 'Em Andamento',
  Done = 'Concluído',
}

export enum TaskPriority {
  High = 'Alta',
  Medium = 'Média',
  Low = 'Baixa',
}

export interface Task {
  id: string;
  projectId: string; // Link to a project
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  assignedUserId: string;
  actorUserId: string; // Who created/assigned it
}

// --- Patient Portal Types ---

export interface Document {
  id: string;
  patientId: string;
  name: string;
  type: 'Atestado' | 'Recibo' | 'Exame';
  issueDate: string;
  url: string;
}

export interface ExerciseEvaluation {
  id: string;
  patientId: string;
  exerciseId: string;
  exerciseName: string;
  date: Date;
  rating: 'easy' | 'medium' | 'hard';
  painLevel: number;
  comments?: string;
}

export type Achievement = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: React.ElementType;
};

export interface GamificationProgress {
    points: number;
    level: number;
    xpForNextLevel: number;
    streak: number;
    achievements: Achievement[];
}

// --- UI & General Types ---

export interface StatCardData {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  type: 'task_assigned' | 'announcement' | 'appointment_reminder' | 'exercise_reminder';
}

export interface RecentActivity {
  id: string;
  type: 'pain_point' | 'exercise_feedback' | 'new_message';
  patientId: string;
  patientName: string;
  patientAvatarUrl: string;
  summary: string;
  timestamp: Date;
}

// --- Clinical Library Types ---

export interface Material {
  id: string;
  name: string;
}

export interface MaterialCategory {
  id: string;
  name: string;
  materials: Material[];
}

// --- Specialty Assessment Types ---

export interface Specialty {
  id: string;
  name: string;
  imageUrl: string;
}

// --- Financial & Partnership Types ---

export enum TransactionType {
  Receita = 'Receita',
  Despesa = 'Despesa',
}

export enum ExpenseCategory {
  Aluguel = 'Aluguel',
  Salarios = 'Salários',
  Marketing = 'Marketing',
  Suprimentos = 'Suprimentos',
  Equipamentos = 'Equipamentos',
  Impostos = 'Impostos',
  Outros = 'Outros',
}

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  date: Date;
  description: string;
  amount: number;
  category: ExpenseCategory | AppointmentType;
  patientName?: string;
  appointmentId?: string;
}

export interface VoucherPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  credits: number; // e.g., number of sessions
  features: string[];
  popular?: boolean;
}

export interface Voucher {
  id: string;
  code: string;
  patientId: string;
  plan: VoucherPlan;
  status: 'activated' | 'expired' | 'cancelled';
  purchaseDate: Date;
  activationDate: Date;
  expiryDate: Date;
  remainingCredits: number;
}

export interface PartnershipClient {
    patient: Patient;
    voucher: Voucher;
}

export interface Partner {
  id: string;
  userId: string; // Links to a User with role=EducadorFisico, etc.
  name: string;
  avatarUrl: string;
  type: 'Educador Físico' | 'Nutricionista';
  professionalId: string; // CREF, CRN, etc.
  commissionRate: number; // Percentage, e.g., 70 for 70%
  bankDetails: {
    bank: string;
    agency: string;
    account: string;
    pixKey: string;
  };
}

export interface FinancialSummary {
  grossRevenue: number;
  platformFee: number;
  taxAmount: number;
  netRevenue: number;
  period: string;
}

export interface CommissionBreakdown {
    grossAmount: number;
    platformFee: number;
    taxAmount: number;
    netAmount: number;
}

export interface Transaction {
  id: string;
  type: 'voucher_purchase';
  patientName: string;
  planName: string;
  status: 'completed';
  breakdown: CommissionBreakdown;
  createdAt: Date;
}

// --- AI System Types ---

export enum AIProvider {
    CACHE = 'Cache',
    INTERNAL_KB = 'Base de Conhecimento',
    GEMINI = 'Google Gemini Pro',
    CHATGPT = 'ChatGPT Plus',
    CLAUDE = 'Claude Pro',
    PERPLEXITY = 'Perplexity Pro',
    MARS = 'Mars AI Pro',
}

export interface AIResponse {
  content: string;
  source: AIProvider;
}

export interface AIQueryLog {
    id: number;
    prompt: string;
    content: string;
    source: AIProvider;
    timestamp: Date;
}


export interface KnowledgeBaseEntry {
  id: string;
  type: 'protocol' | 'technique' | 'exercise' | 'case';
  title: string;
  content: string;
  tags: string[];
}

// --- WhatsApp Integration Types ---

export interface WhatsappMessage {
    id: string;
    patientId: string;
    patientName: string;
    phone: string;
    type: 'confirmation' | 'reminder' | 'hep' | 'chat';
    content: string;
    status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
    createdAt: Date;
}

// --- Mentorship & Teaching Module Types ---

export enum InternStatus {
  Active = 'Ativo',
  Inactive = 'Inativo',
  Graduated = 'Formado',
  Suspended = 'Suspenso',
}

export enum CompetencyLevel {
  Beginner = 'Iniciante',
  Intermediate = 'Intermediário',
  Advanced = 'Avançado',
  Expert = 'Expert',
}

export enum CompetencyCategory {
  Assessment = 'Avaliação',
  Treatment = 'Tratamento',
  Communication = 'Comunicação',
  Documentation = 'Documentação',
  Ethics = 'Ética',
  Research = 'Pesquisa',
}

export interface Competency {
  id: string;
  name: string;
  category: CompetencyCategory;
  description: string;
  evaluationCriteria: string[];
  requiredLevel: CompetencyLevel;
  weight: number; // 1-10
}

export interface InternCompetency {
  id: string;
  internId: string;
  competencyId: string;
  currentLevel: CompetencyLevel;
  targetLevel: CompetencyLevel;
  evaluations: CompetencyEvaluation[];
  lastEvaluatedAt?: string;
  progress: number; // 0-100
}

export interface CompetencyEvaluation {
  id: string;
  internCompetencyId: string;
  evaluatorId: string;
  evaluatorName: string;
  level: CompetencyLevel;
  score: number; // 0-10
  feedback: string;
  evaluatedAt: string;
  type: 'self' | 'supervisor' | 'peer' | 'patient';
}

export interface InternshipPlan {
  id: string;
  internId: string;
  supervisorId: string;
  startDate: string;
  endDate: string;
  objectives: LearningObjective[];
  schedule: InternshipSchedule;
  competencies: string[]; // competency IDs
  status: 'draft' | 'active' | 'completed' | 'suspended';
  progressReports: ProgressReport[];
}

export interface LearningObjective {
  id: string;
  description: string;
  type: 'knowledge' | 'skill' | 'attitude';
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  completed: boolean;
  completedAt?: string;
  evidence?: string;
}

export interface InternshipSchedule {
  weeklyHours: number;
  schedule: {
    [day: string]: {
      startTime: string;
      endTime: string;
      activities: string[];
    };
  };
  rotations: ScheduleRotation[];
}

export interface ScheduleRotation {
  id: string;
  name: string;
  specialty: string;
  startDate: string;
  endDate: string;
  supervisor: string;
  objectives: string[];
}

export interface ProgressReport {
  id: string;
  internId: string;
  supervisorId: string;
  period: string; // e.g., "2024-01"
  competencyProgress: {
    [competencyId: string]: {
      previousLevel: CompetencyLevel;
      currentLevel: CompetencyLevel;
      progress: number;
    };
  };
  achievements: string[];
  challenges: string[];
  nextSteps: string[];
  overallRating: number; // 1-5
  createdAt: string;
}

export interface Intern {
  id: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  semester: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: InternStatus;
  avatarUrl: string;
  supervisorId: string;
  supervisorName: string;
  averageGrade?: number;
  totalHours: number;
  completedHours: number;
  internshipPlan?: InternshipPlan;
  competencies: InternCompetency[];
  clinicalCases: string[]; // case IDs assigned
}

export interface EducationalCase {
  id: string;
  title: string;
  description: string;
  specialty: 'Ortopedia' | 'Neurologia' | 'Cardiorrespiratória' | 'Pediatria' | 'Esportiva' | 'Gerontologia';
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  patientProfile: {
    age: number;
    gender: 'M' | 'F';
    occupation: string;
    medicalHistory: string[];
    currentComplaints: string;
  };
  clinicalPresentation: {
    symptoms: string[];
    physicalExam: string;
    functionalTests: string[];
    imaging: string[];
  };
  diagnosis: {
    primary: string;
    secondary?: string[];
    differentialDiagnosis: string[];
  };
  treatmentPlan: {
    goals: string[];
    interventions: string[];
    duration: string;
    frequency: string;
    progressIndicators: string[];
  };
  outcomes: {
    shortTerm: string[];
    longTerm: string[];
    complications?: string[];
  };
  learningObjectives: string[];
  discussionPoints: string[];
  references: string[];
  createdBy: string; // Therapist name
  createdAt: string; // YYYY-MM-DD
  lastUpdated: string;
  tags: string[];
  isPublished: boolean;
  discussions: CaseDiscussion[];
  evaluations: CaseEvaluation[];
}

export interface CaseDiscussion {
  id: string;
  caseId: string;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  createdAt: string;
  replies: CaseDiscussionReply[];
  votes: number;
}

export interface CaseDiscussionReply {
  id: string;
  discussionId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  votes: number;
}

export interface CaseEvaluation {
  id: string;
  caseId: string;
  userId: string;
  rating: number; // 1-5
  difficulty: number; // 1-5
  usefulness: number; // 1-5
  feedback: string;
  createdAt: string;
}

export interface EducationalResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'webinar' | 'protocol' | 'guideline' | 'quiz';
  category: string;
  specialty: string[];
  description: string;
  content?: string;
  url?: string;
  duration?: number; // in minutes
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  author: string;
  publishedAt: string;
  lastUpdated: string;
  views: number;
  rating: number;
  reviews: ResourceReview[];
  isRecommended: boolean;
  prerequisites?: string[];
  learningOutcomes: string[];
}

export interface ResourceReview {
  id: string;
  resourceId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  review: string;
  createdAt: string;
  helpful: number; // helpful votes
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  specialty: string;
  difficulty: CompetencyLevel;
  estimatedDuration: number; // in hours
  resources: string[]; // resource IDs
  prerequisites: string[];
  objectives: string[];
  assessments: string[];
  completionCriteria: string[];
  createdBy: string;
  createdAt: string;
  enrollments: number;
  completions: number;
}

export interface Certification {
  id: string;
  name: string;
  description: string;
  issuer: string;
  type: 'completion' | 'competency' | 'continuing_education';
  requirements: CertificationRequirement[];
  validityPeriod?: number; // in months
  credits?: number; // CE credits
  badgeUrl: string;
  issuedAt?: string;
  expiresAt?: string;
  verificationUrl?: string;
}

export interface CertificationRequirement {
  type: 'course' | 'assessment' | 'hours' | 'project';
  description: string;
  target: string | number;
  completed: boolean;
  completedAt?: string;
}

export interface MentorshipMetrics {
  totalInterns: number;
  activeInterns: number;
  graduatedInterns: number;
  averageCompetencyProgress: number;
  totalCases: number;
  averageCaseRating: number;
  totalResources: number;
  totalLearningPaths: number;
  monthlyProgress: {
    month: string;
    newInterns: number;
    graduatedInterns: number;
    completedCases: number;
    resourcesAdded: number;
  }[];
  competencyDistribution: {
    [category: string]: {
      [level: string]: number;
    };
  };
}

// --- Inventory & Supplies Types ---

export interface InventoryCategory {
  id: string;
  name: string;
  color: string;
  icon: string; // Icon name from lucide-react
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

export enum ItemStatus {
  Active = 'Ativo',
  OutOfStock = 'Sem Estoque',
  Discontinued = 'Descontinuado',
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  supplierId?: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitCost?: number;
  status: ItemStatus;
  location?: string;
  expiryDate?: string; // YYYY-MM-DD
}

export enum MovementType {
  In = 'Entrada',
  Out = 'Saída',
}

export interface StockMovement {
  id: string;
  itemId: string;
  movementType: MovementType;
  quantity: number;
  userId: string;
  reason?: string;
  patientId?: string;
  createdAt: string; // ISO String
}

export enum InventoryAlertType {
    LowStock = 'Estoque Baixo',
    OutOfStock = 'Sem Estoque',
    Expiring = 'Vencimento Próximo',
    Expired = 'Vencido',
}

export interface InventoryAlert {
    id: string;
    type: InventoryAlertType;
    itemId: string;
    itemName: string;
    message: string;
    severity: 'high' | 'critical';
    createdAt: string; // ISO String
}

export interface InventoryMetrics {
    totalItems: number;
    lowStockItems: number;
    expiringSoon: number;
    totalValue: number;
    criticalAlerts: InventoryAlert[];
}

// --- Event Management Types ---

export enum EventType {
  Corrida = 'Corrida de Rua',
  Workshop = 'Workshop',
  Palestra = 'Palestra',
  Campanha = 'Campanha de Saúde',
  Atendimento = 'Atendimento Externo'
}

export enum EventStatus {
  Draft = 'Rascunho',
  Published = 'Publicado',
  Active = 'Ativo',
  Completed = 'Concluído',
  Cancelled = 'Cancelado'
}

export enum RegistrationStatus {
  Pending = 'Pendente',
  Confirmed = 'Confirmado',
  Attended = 'Compareceu',
  Cancelled = 'Cancelado'
}

export enum ProviderStatus {
  Applied = 'Inscrito',
  Confirmed = 'Confirmado',
  Paid = 'Pago',
  Cancelled = 'Cancelado'
}

export interface Event {
  id: string;
  name: string;
  description: string;
  eventType: EventType;
  startDate: Date;
  endDate: Date;
  location: string;
  address?: string;
  capacity?: number;
  isFree: boolean;
  price?: number;
  status: EventStatus;
  organizerId: string; // User ID
  requiresRegistration: boolean;
  allowsProviders: boolean;
  providerRate?: number;
  bannerUrl?: string;
  registrations: EventRegistration[];
  providers: EventProvider[];
}

export interface EventRegistration {
  id: string;
  eventId: string;
  fullName: string;
  email: string;
  phone: string;
  cpf?: string;
  status: RegistrationStatus;
  registrationDate: Date;
  qrCode: string;
  checkedInAt?: Date;
  checkedInBy?: string; // User ID
}

export interface EventProvider {
  id: string;
  eventId: string;
  name: string;
  phone: string;
  professionalId?: string; // CREFITO, etc.
  pixKey?: string;
  status: ProviderStatus;
  applicationDate: Date;
}

// --- Body Map Types ---

// Professional-grade BodyPoint interface following engineering specifications
export interface BodyPoint {
  id: string;
  patientId: string;
  coordinates: {
    x: number;        // Normalized position (0-1) for responsiveness
    y: number;        // Normalized position (0-1) for responsiveness
  };
  bodySide: 'front' | 'back';
  painLevel: number;  // 0-10 scale
  painType: 'acute' | 'chronic' | 'intermittent' | 'constant';
  bodyRegion: 'cervical' | 'thoracic' | 'lumbar' | 'sacral' | 'shoulder' | 'elbow' | 'wrist' | 'hip' | 'knee' | 'ankle' | 'head' | 'other';
  description: string;
  symptoms: string[]; // Array of symptoms
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  sessionId?: string; // Optional link to specific session
}

// State management interface for body map
export interface BodyMapState {
  points: BodyPoint[];
  selectedPoint: BodyPoint | null;
  activeSide: 'front' | 'back';
  timelineDate: Date;
  isLoading: boolean;
  error: string | null;
}

// Analytics interface for body map insights
export interface BodyMapAnalytics {
  totalPoints: number;
  averagePainLevel: number;
  painTrends: {
    date: string;
    averagePain: number;
    pointCount: number;
  }[];
  regionDistribution: Record<string, number>;
  painTypeDistribution: Record<string, number>;
  symptomFrequency: Record<string, number>;
}

// --- Calendar Integration Types ---

export enum CalendarFeature {
  CREATE_EVENT = 'CREATE_EVENT',
  UPDATE_EVENT = 'UPDATE_EVENT',
  DELETE_EVENT = 'DELETE_EVENT',
  REMINDERS = 'REMINDERS',
  RECURRENCE = 'RECURRENCE',
  ATTENDEES = 'ATTENDEES',
  AVAILABILITY = 'AVAILABILITY'
}

export interface CalendarLocation {
  name: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface CalendarAttendee {
  email: string;
  name: string;
  required?: boolean;
  responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
}

export interface CalendarReminder {
  method: 'email' | 'popup' | 'sms';
  minutesBefore: number;
}

export interface CalendarEvent {
  id?: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: CalendarLocation;
  attendees: CalendarAttendee[];
  reminders: CalendarReminder[];
  recurrence?: RecurrenceRule;
  metadata: Record<string, unknown>;
  timeZone?: string;
  privacy?: 'public' | 'private' | 'confidential';
}

export interface CalendarError {
  code: string;
  message: string;
  details?: unknown;
  retryable: boolean;
}

export interface CalendarResult {
  success: boolean;
  eventId?: string;
  error?: CalendarError;
  retryable: boolean;
  providerResponse?: unknown;
}

export interface TimeRange {
  start: Date;
  end: Date;
  timeZone?: string;
}

export interface AvailabilitySlot {
  start: Date;
  end: Date;
  status: 'free' | 'busy' | 'tentative' | 'unknown';
  eventId?: string;
  eventTitle?: string;
}

export interface ProviderConfig {
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  serviceAccount?: object;
  refreshToken?: string;
  redirectUri?: string;
}

export interface GoogleCalendarConfig extends ProviderConfig {
  serviceAccount: object;
  calendarId?: string;
}

export interface OutlookConfig extends ProviderConfig {
  tenantId: string;
}

export interface CalendarJob {
  id: string;
  type: 'send-invite' | 'update-invite' | 'cancel-invite' | 'sync-availability';
  appointmentId: string;
  patientEmail?: string;
  providerPreference?: string;
  metadata?: Record<string, unknown>;
  attempts: number;
  priority: number;
  scheduledFor?: Date;
}

export interface QueueConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  maxConcurrency?: number;
  defaultDelay?: number;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'exponential' | 'linear' | 'fixed';
  baseDelay: number;
  maxDelay: number;
}

export interface CalendarIntegration {
  id: string;
  appointmentId: string;
  patientId: string;
  provider: string;
  externalEventId?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  attempts: number;
  lastAttemptAt?: Date;
  errorMessage?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarPreferences {
  id: string;
  patientId: string;
  preferredProvider: 'google' | 'outlook' | 'apple' | 'ics';
  enableReminders: boolean;
  reminderTimes: number[]; // minutes before appointment
  autoAcceptInvites: boolean;
  shareAvailability: boolean;
  timeZone: string;
  language: 'pt-BR' | 'en-US' | 'es-ES';
}

export interface CalendarMetrics {
  totalInvitesSent: number;
  successRate: number;
  averageDeliveryTime: number; // in milliseconds
  providerPerformance: Record<string, {
    totalSent: number;
    successCount: number;
    averageDeliveryTime: number;
    lastFailure?: Date;
  }>;
  queueStats: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
}

// --- Communication System Types ---

// Core Communication Types
export type MessageId = string;
export type TemplateId = string;
export type CampaignId = string;
export type TriggerEventType = string;

export enum ChannelCapability {
  TEXT = 'TEXT',
  MEDIA = 'MEDIA',
  INTERACTIVE = 'INTERACTIVE',
  TEMPLATES = 'TEMPLATES',
  TWO_WAY = 'TWO_WAY',
  DELIVERY_RECEIPTS = 'DELIVERY_RECEIPTS',
  READ_RECEIPTS = 'READ_RECEIPTS'
}

export enum MessagePriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 8,
  URGENT = 10
}

export enum MessageStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum CommunicationChannel {
  WHATSAPP = 'whatsapp',
  SMS = 'sms',
  EMAIL = 'email',
  PUSH = 'push'
}

// Recipient and Preferences
export interface Recipient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  pushToken?: string;
  preferences: CommunicationPreferences;
  optOuts: OptOutStatus[];
  timezone: string;
  language: string;
}

export interface CommunicationPreferences {
  preferredChannel: CommunicationChannel;
  whatsappOptIn: boolean;
  smsOptIn: boolean;
  emailOptIn: boolean;
  pushOptIn: boolean;
  preferredTimeStart: string; // HH:mm format
  preferredTimeEnd: string; // HH:mm format
  timezone: string;
}

export interface OptOutStatus {
  channel: CommunicationChannel;
  optedOut: boolean;
  optedOutAt?: Date;
  reason?: string;
}

// Message Types
export interface MessageContent {
  subject?: string;
  body: string;
  attachments?: Attachment[];
  variables: Record<string, unknown>;
  mediaUrls?: string[];
  interactiveElements?: InteractiveElement[];
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface InteractiveElement {
  type: 'button' | 'list' | 'reply';
  id: string;
  title: string;
  description?: string;
  action?: string;
}

export interface MessageMetadata {
  campaignId?: CampaignId;
  triggerEvent?: TriggerEventType;
  patientId?: string;
  appointmentId?: string;
  source: 'manual' | 'automated' | 'triggered';
  tags: string[];
  customData: Record<string, unknown>;
}

export interface Message {
  id: MessageId;
  templateId?: TemplateId;
  recipient: Recipient;
  content: MessageContent;
  metadata: MessageMetadata;
  priority: MessagePriority;
  scheduledFor?: Date;
  expiresAt?: Date;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
}

// Delivery and Results
export interface DeliveryResult {
  success: boolean;
  messageId?: string;
  externalMessageId?: string;
  channel: CommunicationChannel;
  deliveredAt?: Date;
  cost?: number;
  error?: CommunicationError;
  retryable: boolean;
  metadata?: Record<string, unknown>;
}

export interface CommunicationError {
  code: string;
  message: string;
  details?: unknown;
  retryable: boolean;
  retryAfter?: number; // seconds
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Templates
export interface CommunicationTemplate {
  id: TemplateId;
  name: string;
  type: TemplateType;
  channel: CommunicationChannel;
  subject?: string;
  content: string;
  variables: TemplateVariable[];
  active: boolean;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum TemplateType {
  APPOINTMENT_REMINDER = 'appointment_reminder',
  BIRTHDAY_GREETING = 'birthday_greeting',
  PAYMENT_REMINDER = 'payment_reminder',
  SATISFACTION_SURVEY = 'satisfaction_survey',
  INACTIVE_PATIENT = 'inactive_patient',
  WELCOME_MESSAGE = 'welcome_message',
  CUSTOM = 'custom'
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  required: boolean;
  defaultValue?: unknown;
  description: string;
}

// Campaigns and Automation
export interface Campaign {
  id: CampaignId;
  name: string;
  description: string;
  templateId: TemplateId;
  audienceFilter: AudienceFilter;
  scheduledFor?: Date;
  triggerConditions?: TriggerCondition[];
  status: CampaignStatus;
  statistics: CampaignStatistics;
  createdAt: Date;
  updatedAt: Date;
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface AudienceFilter {
  patientStatus?: string[];
  ageRange?: { min: number; max: number };
  lastVisit?: { after?: Date; before?: Date };
  tags?: string[];
  customFilters?: Record<string, unknown>;
}

export interface TriggerCondition {
  event: TriggerEventType;
  delay?: number; // minutes
  conditions?: Record<string, unknown>;
}

export interface CampaignStatistics {
  totalRecipients: number;
  messagesSent: number;
  messagesDelivered: number;
  messagesRead: number;
  messagesFailed: number;
  totalCost: number;
  engagementRate: number;
}

// Queue and Jobs
export interface MessageJob {
  id: string;
  type: 'send-message' | 'retry-message' | 'status-update';
  messageId: MessageId;
  channelName: string;
  attempts: number;
  maxAttempts: number;
  priority: number;
  scheduledFor: Date;
  metadata: Record<string, unknown>;
}

export interface FailedMessageJob extends MessageJob {
  failureReason: string;
  lastAttemptAt: Date;
  canRetry: boolean;
}

// Configuration
export interface MessageBusConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  maxConcurrency: number;
  defaultJobOptions: {
    attempts: number;
    backoff: string;
    removeOnComplete: number;
    removeOnFail: number;
  };
}

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  webhookVerifyToken: string;
  apiVersion?: string;
}

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export interface EmailConfig {
  provider: 'resend' | 'sendgrid' | 'ses';
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export interface PushConfig {
  vapidPublicKey: string;
  vapidPrivateKey: string;
  vapidSubject: string;
}

// Analytics
export interface CommunicationMetrics {
  totalMessagesSent: number;
  deliveryRate: number;
  readRate: number;
  failureRate: number;
  averageDeliveryTime: number;
  totalCost: number;
  channelPerformance: Record<CommunicationChannel, ChannelMetrics>;
  campaignMetrics: CampaignMetrics[];
}

export interface ChannelMetrics {
  messagesSent: number;
  messagesDelivered: number;
  messagesRead: number;
  messagesFailed: number;
  deliveryRate: number;
  readRate: number;
  averageDeliveryTime: number;
  averageCost: number;
  lastFailure?: Date;
}

export interface CampaignMetrics {
  campaignId: CampaignId;
  campaignName: string;
  totalRecipients: number;
  messagesSent: number;
  deliveryRate: number;
  engagementRate: number;
  totalCost: number;
  roi?: number;
}

// Domain Events
export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  data: Record<string, unknown>;
  occurredAt: Date;
  version: number;
}

// Webhook Types
export interface WebhookPayload {
  event: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

export interface WhatsAppWebhook extends WebhookPayload {
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        messages?: WhatsAppMessage[];
        statuses?: WhatsAppStatus[];
      };
    }>;
  }>;
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string; sha256: string };
  document?: { id: string; filename: string; mime_type: string; sha256: string };
}

export interface WhatsAppStatus {
  id: string;
  recipient_id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  errors?: Array<{
    code: number;
    title: string;
    message: string;
  }>;
}

// --- Automation Types ---

export enum TriggerType {
  APPOINTMENT_CREATED = 'appointment_created',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  PAYMENT_DUE = 'payment_due',
  PAYMENT_RECEIVED = 'payment_received',
  TREATMENT_COMPLETED = 'treatment_completed',
  PATIENT_REGISTERED = 'patient_registered',
  FOLLOW_UP_DUE = 'follow_up_due'
}

export enum CommunicationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  PUSH_NOTIFICATION = 'push_notification'
}

export interface AutomationCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: string | number | boolean;
}

export interface AutomationAction {
  id: string;
  type: 'send_message' | 'send_email' | 'create_task' | 'update_status' | 'send_notification';
  channel: CommunicationChannel;
  templateId?: string;
  message?: string;
  delay?: number; // in minutes
  conditions?: AutomationCondition[];
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  triggerType: TriggerType;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastExecuted?: string;
  executionCount: number;
}

export enum TemplateType {
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_CONFIRMATION = 'appointment_confirmation',
  TREATMENT_UPDATE = 'treatment_update',
  PAYMENT_REMINDER = 'payment_reminder',
  WELCOME = 'welcome',
  MARKETING = 'marketing'
}

export interface MessageTemplate {
  id: string;
  name: string;
  type: TemplateType;
  channel: CommunicationChannel;
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}