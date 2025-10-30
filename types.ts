import React from 'react';

// --- User & Auth Types ---

export enum Role {
  Admin = 'admin',
  Therapist = 'therapist',
  Patient = 'patient',
  Educator = 'educator',
  Partner = 'partner',
  Manager = 'manager',
  Receptionist = 'receptionist',
}

export interface User {
  id: string;
  fullName: string; // Mudado de 'name' para 'fullName' para alinhar com o banco
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

export enum AIProvider {
  Gemini = 'gemini',
  OpenAI = 'openai',
  Anthropic = 'anthropic',
  Groq = 'groq',
  Mock = 'mock'
}

export interface Therapist {
  id:string;
  name: string;
  color: string; // e.g., 'teal', 'sky', 'indigo'
  avatarUrl: string;
  crefito?: string; // Número de registro profissional CREFITO
}

// --- Patient Related Types ---

export enum PatientStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Discharged = 'Discharged',
}

export interface Surgery {
  id: string;
  patientId: string;
  name: string;
  date: string; // YYYY-MM-DD
  description?: string;
  surgeon?: string;
  hospital?: string;
  complications?: string;
  recoveryTimeDays?: number; // in days
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Condition {
  name: string;
  date: string; // YYYY-MM-DD
  description?: string;
}

export interface Pathology {
  id: string;
  patientId: string;
  name: string;
  icdCode?: string;
  diagnosisDate: string;
  status: 'active' | 'resolved' | 'chronic' | 'monitoring';
  severity?: 'mild' | 'moderate' | 'severe' | 'critical';
  affectedRegion?: string;
  description?: string;
  treatmentPlan?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientGoal {
  id: string;
  patientId: string;
  title: string;
  description?: string;
  category: 'performance' | 'recovery' | 'fitness' | 'lifestyle' | 'medical' | 'mobility' | 'strength' | 'pain_reduction' | 'functional';
  targetDate?: string; // YYYY-MM-DD
  targetValue?: string; // e.g., "10 km", "sem muletas"
  currentValue?: string;
  currentProgress?: number; // 0-100
  unit?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'completed' | 'paused' | 'cancelled' | 'archived';
  achievedAt?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
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

export interface AssessmentTestConfig {
  id: string;
  patientId: string;
  testName: string;
  testType: 'amplitude' | 'strength' | 'balance' | 'functional' | 'pain';
  frequencySessions?: number;
  frequencyDays?: number;
  isMandatory: boolean;
  lastPerformedDate?: string;
  nextDueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientAttachment {
    name: string;
    url: string;
    type: string;
    size: number;
}

// NOTA: CommunicationLog e PainPoint estão definidos mais abaixo com versão completa (linhas ~1948+)
// Mantidos aqui apenas para compatibilidade com código legacy que pode estar usando
// TODO: Refatorar código que usa estes tipos para usar as versões completas abaixo

export interface Patient {
  // === IDs e Código ===
  id: string;
  code?: string; // Código único PAC-XXXXXX (gerado pelo Supabase)
  
  // === Dados Pessoais ===
  name: string; // Também aceito como 'full_name' no Supabase
  cpf: string;
  rg?: string;
  birthDate: string; // Também aceito como 'birth_date'
  age?: number; // Calculado automaticamente
  gender?: 'M' | 'F' | 'male' | 'female' | 'other';
  marital_status?: string;
  occupation?: string;
  
  // === Contato ===
  phone: string;
  phone2?: string; // Telefone alternativo
  email: string;
  
  // === Endereço ===
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
  };
  
  // === Emergência ===
  emergencyContact: {
    name: string;
    phone: string;
  };
  
  // === Clínico ===
  blood_type?: string;
  height?: number; // em cm
  weight?: number; // em kg
  bmi?: number; // Calculado automaticamente
  main_diagnosis?: string;
  main_pathology?: string; // Patologia principal (ex: "Lesão de LCA", "Hérnia Discal")
  main_pathology_region?: string; // Região afetada (ex: "knee", "spine", "shoulder")
  referring_doctor?: string;
  referring_doctor_crm?: string;
  allergies?: string;
  medicalAlerts?: string;
  medical_history?: any; // JSONB do Supabase
  conditions?: Condition[];
  surgeries?: Surgery[];
  pathologies?: Pathology[];
  goals?: PatientGoal[];
  testConfigs?: AssessmentTestConfig[];
  
  // === Sessões e Métricas ===
  session_progress?: any; // JSONB
  treatment_metrics?: any; // JSONB
  trackedMetrics?: TrackedMetric[];
  
  // === Financeiro e Convênio ===
  insurance?: any; // JSONB - substituiu insuranceType
  insuranceType?: 'private' | 'public' | 'none'; // DEPRECATED - usar 'insurance'
  financial_info?: any; // JSONB
  
  // === Preferências ===
  preferred_days_of_week?: string[];
  preferred_time_slots?: string[];
  preferredLocale?: string;
  preferredChannel?: CommunicationChannel;
  preferredName?: string;
  
  // === Status e Datas ===
  status: PatientStatus;
  registration_date?: string; // Também aceito como 'registrationDate'
  registrationDate: string; // DEPRECATED - usar 'registration_date'
  first_appointment_date?: string;
  last_appointment_date?: string; // Também aceito como 'lastVisit'
  lastVisit: string; // DEPRECATED - usar 'last_appointment_date'
  
  // === Consentimento LGPD ===
  has_consent_form?: boolean;
  has_data_privacy_consent?: boolean; // Substituiu 'consentGiven'
  consentGiven: boolean; // DEPRECATED - usar 'has_data_privacy_consent'
  whatsappConsent: 'opt-in' | 'opt-out';
  
  // === Outros ===
  observations?: string;
  internal_notes?: string;
  tags?: string[];
  avatarUrl: string; // Também aceito como 'avatar_url'
  
  // === Anexos e Comunicação ===
  attachments?: PatientAttachment[];
  communicationLogs?: CommunicationLog[];
  painPoints?: PainPoint[];
  
  // === Metadata ===
  created_by?: string;
  created_at?: string;
  updated_by?: string;
  updated_at?: string;
  deleted_at?: string | null; // Soft delete
}

// === Type Helpers para Patient ===
export type PatientInput = Omit<Patient, 'id' | 'code' | 'age' | 'bmi' | 'created_at' | 'updated_at'>;
export type PatientUpdate = Partial<PatientInput>;
export type PatientSupabase = Patient; // Alias para compatibilidade

export interface PatientFilters {
  status?: PatientStatus | PatientStatus[];
  search?: string;
  therapistId?: string;
  registrationDateFrom?: string;
  registrationDateTo?: string;
  lastVisitFrom?: string;
  lastVisitTo?: string;
  tags?: string[];
  hasAlerts?: boolean;
  insuranceType?: string;
  minAge?: number;
  maxAge?: number;
  gender?: string;
}

export type PatientAlertType = 'abandonment' | 'highRisk' | 'attention';

export interface AlertPatient extends Patient {
    alertReason: string;
    alertType: PatientAlertType;
}

export interface ScheduledAlert {
  id: string;
  ruleId: string | null;
  supplyId: string | null;
  scheduledFor: string;
  status: string | null;
  attempts: number | null;
  maxAttempts: number | null;
  lastAttemptAt: string | null;
  errorMessage: string | null;
  createdAt: string | null;
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
  Confirmed = 'Confirmado', // NOVO
  InProgress = 'Em Andamento', // NOVO
  Completed = 'Realizado',
  Canceled = 'Cancelado',
  Cancelled = 'Cancelado', // Alias para Canceled
  NoShow = 'Faltou'
}

// Mapping for AppointmentStatus to lowercase keys for UI components
export const AppointmentStatusMap = {
  scheduled: AppointmentStatus.Scheduled,
  confirmed: AppointmentStatus.Confirmed,
  in_progress: AppointmentStatus.InProgress,
  completed: AppointmentStatus.Completed,
  canceled: AppointmentStatus.Canceled,
  cancelled: AppointmentStatus.Cancelled,
  no_show: AppointmentStatus.NoShow
} as const

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
    frequency: 'daily' | 'weekly' | 'monthly';
    interval?: number;
    days?: number[]; // 0=Domingo ... 6=Sábado (para weekly)
    monthDays?: number[]; // dias específicos do mês
    until?: string; // YYYY-MM-DD
    count?: number;
}

export interface RecurrenceTemplate {
  id: string;
  clinicId?: string;
  therapistId?: string;
  title: string;
  description?: string;
  durationMinutes: number;
  recurrenceRule: RecurrenceRule;
  timezone: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ScheduleBlockType = 'ausencia' | 'reuniao' | 'personalizado';

export interface Appointment {
  // === IDs ===
  id: string;
  appointment_id?: string; // Alias ou FK para outras tabelas
  patientId: string;
  patient_id?: string; // Alias Supabase
  therapistId?: string; // Opcional - pode ser definido após o atendimento
  therapist_id?: string; // Alias Supabase
  professional_id?: string; // Alias alternativo
  user_id?: string; // ID do usuário que criou
  
  // === Informações do Paciente (cache) ===
  patientName: string;
  full_name?: string; // Alias
  patientAvatarUrl: string;
  patientPhone?: string; // NOVO
  phone?: string; // Alias
  email?: string; // Email do paciente
  
  // === Informações do Terapeuta ===
  therapistName?: string;
  role?: string; // Role do terapeuta
  specialization?: string; // Especialização
  
  // === Agendamento ===
  startTime: Date;
  endTime: Date;
  appointment_date?: Date; // Alias Supabase
  scheduledTime?: string; // ISO string
  scheduled_at?: string; // ISO timestamp combinado (date + time)
  duration?: number; // Duração em minutos
  duration_minutes?: number; // Alias Supabase
  appointment_type?: string; // Tipo de agendamento (ex: "Consulta", "Retorno")
  
  // === Detalhes ===
  title: string;
  description?: string; // NOVO
  type: AppointmentType;
  status: AppointmentStatus;
  location?: string;
  is_virtual?: boolean; // Se é consulta virtual/teleconsulta
  meeting_url?: string; // URL da reunião virtual (Zoom, Google Meet, etc.)
  
  // === Financeiro ===
  value: number;
  amount?: number; // Alias
  price?: number; // Alias
  paymentStatus: 'paid' | 'pending';
  payment_status?: string; // Alias
  payment_method?: string; // Método de pagamento
  payment_method_id?: string; // ID do método
  provider?: string; // Provedor de pagamento
  provider_transaction_id?: string; // ID da transação
  transaction_type?: string; // Tipo de transação
  customer_id?: string; // ID do cliente
  currency?: string; // Moeda
  
  // === Observações ===
  observations?: string;
  notes?: string; // NOVO
  
  // === Recorrência ===
  seriesId?: string;
  recurrenceRule?: RecurrenceRule;
  recurrence_rule?: any; // Alias JSONB
  sessionNumber?: number;
  totalSessions?: number;
  recurrenceTemplateId?: string;
  parent_appointment_id?: string; // FK para agendamento pai
  is_recurring?: boolean; // Flag de recorrência
  
  // === Procedimentos ===
  procedures_performed?: string[]; // NOVO
  purpose_id?: string; // ID do propósito
  
  // === Cancelamento ===
  cancellationReason?: string;
  
  // === IA e Predições ===
  reminderSent?: boolean;
  confirmationReceived?: boolean;
  
  // === Conflitos ===
  hasConflict?: boolean;
  conflictReason?: string;
  conflictResolvedAt?: Date;
  
  // === Metadata ===
  metadata?: Record<string, any>;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
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
  blockType?: 'ausencia' | 'reuniao' | 'personalizado';
  metadata?: Record<string, any>;
}

export interface ScheduleBlock {
  id: string;
  therapistId: string;
  startTime: Date;
  endTime: Date;
  blockType: ScheduleBlockType;
  reason?: string;
  recurrenceRule?: RecurrenceRule;
  metadata?: Record<string, any>;
}

export type WaitlistStatus = 'waiting' | 'notified' | 'scheduled' | 'cancelled';

export interface WaitlistEntry {
  id: string;
  patientId: string;
  clinicId?: string;
  therapistId?: string;
  preferredStartFrom?: Date;
  preferredStartTo?: Date;
  preferredDays?: number[];
  preferredTimeRanges?: { start: string; end: string }[];
  urgency: 1 | 2 | 3 | 4 | 5;
  noShowRisk?: number;
  status: WaitlistStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastNotifiedAt?: Date;
}

export interface SchedulingAlert {
  id: string;
  alertType: 'patient_no_show_warning' | 'open_slot' | 'inactive_patient';
  patientId?: string;
  appointmentId?: string;
  payload: Record<string, any>;
  resolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
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
  sets?: number; // Added for exercise prescription
  reps?: number; // Added for exercise prescription
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
  progress?: number; // 0-1 when partially unlocked
  rewardPoints?: number;
};

export type GamificationMetric = 'sessions_completed' | 'pain_logs' | 'streak' | 'exercises_logged' | 'level' | 'custom';
export type GamificationChallengeStatus = 'active' | 'completed' | 'expired';

export interface GamificationChallenge {
  id: string;
  title: string;
  description: string;
  metric: GamificationMetric;
  currentValue: number;
  targetValue: number;
  progressPercentage: number;
  rewardPoints: number;
  status: GamificationChallengeStatus;
  expiresAt?: Date;
}

export interface GamificationReward {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  unlocked: boolean;
  claimed: boolean;
  icon?: React.ElementType;
}

export interface GamificationLeaderboardEntry {
  position: number;
  patientId: string;
  patientName: string;
  avatarUrl: string;
  points: number;
  level: number;
  streak: number;
}

export interface GamificationPointsBreakdown {
  id: string;
  label: string;
  points: number;
  icon?: React.ElementType;
  description?: string;
}

export interface GamificationMilestone {
  description: string;
  targetPoints: number;
  pointsRemaining: number;
}

export interface GamificationProgress {
    points: number;
    level: number;
    xpForNextLevel: number;
    pointsTowardsLevel: number;
    streak: number;
    achievements: Achievement[];
    pointsBreakdown: GamificationPointsBreakdown[];
    activeChallenges: GamificationChallenge[];
    completedChallenges: GamificationChallenge[];
    availableRewards: GamificationReward[];
    unlockedRewards: GamificationReward[];
    leaderboard: GamificationLeaderboardEntry[];
    nextMilestone: GamificationMilestone;
    recentActivities: { label: string; timestamp: Date; points: number }[];
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
  type: 'task_assigned' | 'announcement' | 'appointment_reminder' | 'exercise_reminder' | 'alert' | 'push_fallback';
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
  description?: string;
  type: string;
  category: MaterialCategory;
  updatedAt: string;
  // Campos avançados
  content?: string; // HTML do Tiptap
  tags?: string[];
  linkedMaterials?: string[]; // IDs de materiais relacionados
  mentions?: MaterialMention[];
  mediaAttachments?: MediaAttachment[];
  createdBy?: string; // User ID
  updatedBy?: string; // User ID
  version?: number;
  publishedAt?: string;
  status?: 'draft' | 'published' | 'archived';
  // Metadados de colaboração
  collaborators?: string[]; // User IDs
  lastEditedAt?: string;
  editCount?: number;
}

export interface MaterialCategory {
  id: string;
  name: string;
  materials: Material[];
}

export interface MaterialMention {
  id: string;
  userId: string;
  userName: string;
  position: number; // Posição no texto
  status: 'pending' | 'in_progress' | 'completed';
  taskId?: string;
  createdAt: string;
}

export interface MediaAttachment {
  id: string;
  type: 'image' | 'video' | 'gif' | 'document';
  url: string;
  thumbnailUrl?: string;
  filename: string;
  size: number;
  alt?: string;
  caption?: string;
  position?: number; // Posição no texto
}

export interface MaterialVersion {
  id: string;
  materialId: string;
  version: number;
  content: string;
  changes: string; // Descrição das mudanças
  createdBy: string;
  createdAt: string;
}

export interface MaterialTask {
  id: string;
  materialId: string;
  mentionedUserId: string;
  mentionedUserName: string;
  content: string; // Contexto da menção
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedAt: string;
  completedAt?: string;
  notes?: string;
}

export interface MaterialLink {
  id: string;
  fromMaterialId: string;
  toMaterialId: string;
  linkText: string; // Texto do link [[...]]
  position?: number; // Posição no texto
  createdAt: string;
}

// ============================================================================
// SISTEMA DE TEMPLATES - TIPOS
// ============================================================================

export interface MaterialTemplate {
  id: string;
  name: string;
  description?: string;
  category: MaterialCategory | string;
  content: string; // HTML do Tiptap
  thumbnail?: string;
  tags?: string[];
  isPublic: boolean;
  isSystemTemplate: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialComment {
  id: string;
  materialId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  parentCommentId?: string; // Para replies
  mentions?: string[]; // User IDs mencionados
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt?: string;
  replies?: MaterialComment[];
}

export interface MaterialCollaborator {
  id: string;
  materialId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  invitedBy: string;
  invitedAt: string;
  lastAccessAt?: string;
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
  Salaries = 'Salaries',
  Rent = 'Rent',
  Equipment = 'Equipment',
  Supplies = 'Supplies',
  Marketing = 'Marketing',
  Other = 'Other',
  Outros = 'Outros', // Portuguese compatibility
  Aluguel = 'Aluguel', // Portuguese for Rent
  Salarios = 'Salarios', // Portuguese for Salaries
  Suprimentos = 'Suprimentos', // Portuguese for Supplies
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

// Removed unused AIProvider enum

export interface AIResponse {
  content: string;
  source: string;
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
  Active = 'Active',
  Inactive = 'Inactive',
  Graduated = 'Graduated',
  Suspended = 'Suspended'
}

// Status color mapping for InternStatus
export const InternStatusColorMap: Record<InternStatus, string> = {
  [InternStatus.Active]: 'bg-green-100 text-green-800',
  [InternStatus.Inactive]: 'bg-slate-100 text-slate-800',
  [InternStatus.Graduated]: 'bg-blue-100 text-blue-800',
  [InternStatus.Suspended]: 'bg-red-100 text-red-800',
}

export enum CompetencyLevel {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  Expert = 'Expert'
}

export enum CompetencyCategory {
  Assessment = 'Assessment',
  Treatment = 'Treatment',
  Communication = 'Communication',
  Documentation = 'Documentation',
  Research = 'Research',
  Management = 'Management'
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
  area?: string; // Added for compatibility
  content?: string; // Added for compatibility
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
  Active = 'Active',
  Maintenance = 'Maintenance',
  Retired = 'Retired',
  Inactive = 'Inactive',
  OutOfStock = 'OutOfStock',
  Discontinued = 'Discontinued'
}

// Tipos que estavam faltando
export interface CommunicationLog {
  id: string;
  patientId: string;
  type: 'email' | 'sms' | 'call' | 'whatsapp';
  content: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'failed';
  userId: string;
}

export interface PainPoint {
  id: string;
  patientId: string;
  bodyRegion: string;
  bodySide: 'front' | 'back' | 'left' | 'right';
  painLevel: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
  brand?: string;
  sku?: string;
}

// REMOVED: MovementType enum and StockMovement interface - DEPRECATED
// Use InventoryMovementType (linha ~2979) e StockMovement (linha ~3052) instead

export enum InventoryAlertType {
    LowStock = 'LowStock',
    OutOfStock = 'OutOfStock',
    Expiring = 'Expiring',
    Expired = 'Expired',
    OverdueOrder = 'OverdueOrder',
    HighConsumption = 'HighConsumption',
    LowTurnover = 'LowTurnover',
    PriceChange = 'PriceChange',
    SupplierDelay = 'SupplierDelay'
}

export interface InventoryAlert {
    id: string;
    type: InventoryAlertType;
    itemId: string;
    itemName: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    createdAt: string; // ISO String
    isRead?: boolean;
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
  Workshop = 'Workshop',
  Seminar = 'Seminário',
  Conference = 'Conferência',
  Training = 'Treinamento',
  Meeting = 'Reunião',
  Campaign = 'Campanha',
  Race = 'Corrida',
  Other = 'Outro'
}

export enum EventStatus {
  Draft = 'Draft',
  Published = 'Published',
  Active = 'Active',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum RegistrationStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Attended = 'Attended',
  Cancelled = 'Cancelled'
}

export enum ProviderStatus {
  Applied = 'Applied',
  Confirmed = 'Confirmed',
  Paid = 'Paid',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled' // Added missing status
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

export interface CalendarPreferences {
  id: string;
  patient_id: string;
  auto_send_calendar_invite: boolean;
  preferred_calendar: 'google' | 'apple' | 'outlook' | 'yahoo' | 'none';
  send_via_whatsapp: boolean;
  send_via_email: boolean;
  send_via_sms: boolean;
  reminder_hours_before: number[]; // [24, 2]
  timezone: string;
  created_at?: string;
  updated_at?: string;
}

export interface CalendarLink {
  id: string;
  appointment_id: string;
  patient_id: string;
  universal_link: string; // .ics via Edge Function
  google_link: string;
  outlook_link?: string;
  yahoo_link?: string;
  apple_ics_link: string;
  event_title: string;
  event_date: string;
  sent_via: string[];
  link_accessed: boolean;
  accessed_at?: string;
  access_count: number;
  created_at: string;
  updated_at: string;
}

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

export enum CommunicationChannel {
  Email = 'email',
  SMS = 'sms',
  WhatsApp = 'whatsapp',
  Push = 'push',
  Voice = 'voice'
}

export enum ChannelCapability {
  // Channel types
  Email = 'email',
  SMS = 'sms',
  WhatsApp = 'whatsapp',
  Push = 'push',
  Voice = 'voice',
  Automation = 'automation',

  // Content capabilities
  TEXT = 'text',
  HTML = 'html',
  IMAGES = 'images',
  DOCUMENTS = 'documents',
  RICH_CONTENT = 'rich_content',
  ATTACHMENTS = 'attachments',
  TEMPLATES = 'templates',
  DELIVERY_STATUS = 'delivery_status',
  TRACKING = 'tracking',
  SHORT_LINKS = 'short_links'
}

export enum MessagePriority {
  Low = 'low',
  Normal = 'normal',
  High = 'high',
  Critical = 'critical'
}

export enum MessageStatus {
  Pending = 'pending',
  Queued = 'queued',
  Processing = 'processing',
  Sending = 'sending',
  Sent = 'sent',
  Delivered = 'delivered',
  Read = 'read',
  Failed = 'failed',
  Cancelled = 'cancelled',
  RetryScheduled = 'retry_scheduled'
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
  text?: string; // Plain text version
  html?: string; // HTML version
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
  filename?: string; // Optional filename for WhatsApp/email
  path?: string; // Optional local file path
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
  // Push notification specific
  actions?: Array<{ id: string; title: string; icon?: string }>;
  url?: string;
  [key: string]: unknown; // Allow additional properties
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
  from?: string; // Added for sender information
  subject?: string; // Added for email subject
  timestamp?: string; // Added for ISO timestamp
  read?: boolean; // Added for read status
  // Analytics fields
  status?: MessageStatus; // Message delivery status
  channel?: CommunicationChannel; // Channel used for delivery
  type?: MessageType; // Type of message
  errorCode?: string; // Error code if delivery failed
  deliveredAt?: Date; // When the message was delivered
  cost?: number; // Cost of sending the message
}

// Delivery and Results
export interface DeliveryResult {
  success: boolean;
  messageId?: string;
  externalMessageId?: string;
  channel: CommunicationChannel;
  deliveredAt?: Date;
  cost?: number;
  error?: any; // CommunicationError class from lib/communication/core/types.ts
  retryable: boolean;
  metadata?: Record<string, unknown>;
}

// CommunicationError is now defined as a class in lib/communication/core/types.ts
// Import it from there when needed

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
  Transactional = 'transactional',
  Reminder = 'reminder',
  Marketing = 'marketing',
  FollowUp = 'follow_up',
  Alert = 'alert'
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
  Draft = 'draft',
  Scheduled = 'scheduled',
  Running = 'running',
  Paused = 'paused',
  Completed = 'completed',
  Cancelled = 'cancelled'
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

// SMS/Twilio removed - not used in Brazil
// export interface TwilioConfig {
//   accountSid: string;
//   authToken: string;
//   fromNumber: string;
// }

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
  id?: string;
  type: string;
  aggregateId?: string;
  aggregateType?: string;
  data: Record<string, unknown>;
  occurredAt?: Date;
  timestamp?: Date; // Alias for occurredAt - simplified usage
  version?: number;
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
  APPOINTMENT_CREATED = 'APPOINTMENT_CREATED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  PAYMENT_DUE = 'PAYMENT_DUE',
  TREATMENT_COMPLETED = 'TREATMENT_COMPLETED',
  PATIENT_REGISTERED = 'PATIENT_REGISTERED',
  FOLLOW_UP_DUE = 'FOLLOW_UP_DUE'
}

// MessageType for communication system
export type MessageType =
  | 'appointment_confirmation'
  | 'appointment_reminder'
  | 'appointment_cancellation'
  | 'no_show_followup'
  | 'welcome_new_patient'
  | 'first_appointment_tips'
  | 'payment_reminder_gentle'
  | 'payment_reminder_urgent'
  | 'birthday_wishes'
  | 'treatment_completion_survey'
  | 'maintenance_tips'
  | 'generic'
  | 'text'
  | 'html'
  | 'template'
  | 'rich';

// Automation trigger with detailed configuration
export interface AutomationTrigger {
  type: 'appointment' | 'patient' | 'payment' | 'system';
  events: string[];
  timing?: {
    delay?: number; // milliseconds
    timeOfDay?: [number, number]; // [startHour, endHour]
    daysOfWeek?: number[]; // 0-6, Sunday = 0
  };
  filters?: Record<string, any>;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' |
           'greater_than' | 'less_than' | 'greater_than_or_equal' | 'less_than_or_equal' |
           'is_empty' | 'is_not_empty' | 'is_null' | 'is_not_null' |
           'starts_with' | 'ends_with' | 'in' | 'not_in' | 'regex' |
           'date_after' | 'date_before' | 'date_between' |
           'time_of_day_after' | 'time_of_day_before' | 'day_of_week' | 'day_of_month';
  value: string | number | boolean | Date | any[];
  type: 'string' | 'number' | 'boolean' | 'date' | 'time';
}

export interface AutomationAction {
  type: 'send_message' | 'send_email' | 'create_task' | 'update_status' | 'send_notification' |
        'schedule_message' | 'update_patient' | 'log_event' | 'webhook' | 'conditional' | 'delay';
  parameters: Record<string, any>;
}

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  conditions?: AutomationCondition[];
  conditionOperator?: 'AND' | 'OR';
  actions: AutomationAction[];
  isActive: boolean;
  priority?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Removed duplicate AutomationExecution interface - using unified version above

export interface MessageTemplate {
  id: string;
  name: string;
  type: MessageType;
  category?: string;
  channel?: CommunicationChannel;
  channels?: CommunicationChannel[]; // Added for multi-channel support
  subject?: string;
  body?: string; // Main body content
  content?: string; // Alias for body (for backward compatibility)
  text?: string; // Plain text version
  html?: string; // HTML version for email
  whatsapp?: string; // WhatsApp-specific template
  sms?: string; // SMS-specific template
  email?: string; // Email-specific template
  push?: string; // Push notification template
  variables: string[];
  locale?: string; // Language/locale for the template
  version?: number; // Template version
  metadata?: Record<string, any>; // Added for template metadata
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string;
}

// Template context for rendering
export interface TemplateContext {
  patient?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    preferredName?: string;
  };
  appointment?: {
    id: string;
    type: string;
    date: Date;
    therapist: string;
    location?: string;
    notes?: string;
  };
  clinic?: {
    name: string;
    phone: string;
    email: string;
    address?: string;
    website?: string;
    tagline?: string;
  };
  recipient?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  cancellation?: {
    reason?: string;
    refund?: boolean;
  };
  template?: {
    id: string;
    name: string;
    version?: number;
  };
  request?: {
    timestamp: Date;
    channel: CommunicationChannel;
    locale: string;
    device: string;
  };
  message?: string;
  personalization?: Record<string, any>;
  experiment?: {
    id: string;
    variant: string;
  };
  userAgent?: string;
  [key: string]: any; // Allow additional context properties
}

// ============================================================================
// SISTEMA DE GESTÃO DE INSUMOS - TIPOS
// ============================================================================

export type SupplyCategory = 
  | 'equipamentos'
  | 'materiais_descartaveis'
  | 'medicamentos_topicos'
  | 'materiais_limpeza'
  | 'materiais_escritorio'
  | 'equipamentos_protecao';

export type InventoryMovementType =
  | 'entrada'
  | 'saida'
  | 'ajuste'
  | 'vencimento'
  | 'perda';

// Helper utilities for InventoryMovementType
export const MovementTypeUtils = {
  isEntrada: (type: InventoryMovementType): boolean => {
    return type === 'entrada';
  },
  isSaida: (type: InventoryMovementType): boolean => {
    return type === 'saida';
  },
  toPortuguese: (type: InventoryMovementType): string => {
    switch (type) {
      case 'entrada':
        return 'Entrada';
      case 'saida':
        return 'Saída';
      case 'ajuste':
        return 'Ajuste';
      case 'vencimento':
        return 'Vencimento';
      case 'perda':
        return 'Perda';
      default:
        return type;
    }
  }
};

export type OrderStatus = 
  | 'pending'
  | 'approved'
  | 'ordered'
  | 'received'
  | 'cancelled'
  | 'partial';

export type AlertType = 
  | 'low_stock'
  | 'critical_stock'
  | 'expiring'
  | 'expired'
  | 'overdue_order';

export type AlertSeverity = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type NotificationMethod = 
  | 'in_app'
  | 'email'
  | 'both';

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  cnpj?: string;
  paymentTerms?: string;
  deliveryTimeDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Supply {
  id: string;
  name: string;
  description?: string;
  category: SupplyCategory;
  subcategory?: string;
  brand?: string;
  model?: string;
  unitOfMeasure: string;
  currentStock: number;
  minimumStock: number;
  maximumStock?: number;
  unitCost?: number;
  supplierId?: string;
  supplier?: Supplier;
  barcode?: string;
  expirationDate?: string;
  storageLocation?: string;
  isActive: boolean;
  requiresPrescription: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  supplyId: string;
  supply?: Supply;
  movementType: InventoryMovementType;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  reason?: string;
  referenceDocument?: string;
  movedBy?: string;
  patientId?: string;
  taskId?: string;
  batchNumber?: string;
  expirationDate?: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplier?: Supplier;
  status: OrderStatus;
  totalAmount: number;
  requestedBy?: string;
  approvedBy?: string;
  orderDate?: string;
  expectedDelivery?: string;
  receivedDate?: string;
  notes?: string;
  isAutoGenerated: boolean;
  items?: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  supplyId: string;
  supply?: Supply;
  quantityRequested: number;
  quantityReceived: number;
  unitCost?: number;
  totalCost?: number;
  createdAt: string;
}

export interface SupplyAlert {
  id: string;
  supplyId: string;
  supply?: Supply;
  alertType: AlertType;
  severity: AlertSeverity;
  message: string;
  isRead: boolean;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface UserAlertPreferences {
  id: string;
  userId: string;
  alertType?: string;
  isEnabled: boolean;
  notificationMethod: NotificationMethod;
  createdAt: string;
}

// Interfaces para relatórios e analytics
export interface SupplyConsumptionReport {
  supplyId: string;
  supplyName: string;
  category: SupplyCategory;
  totalConsumed: number;
  totalReceived: number;
  avgMonthlyConsumption: number;
  currentStock: number;
  stockTurnover: number;
  period: {
    start: string;
    end: string;
  };
}

export interface StockValuationReport {
  totalValue: number;
  categoryBreakdown: {
    category: SupplyCategory;
    value: number;
    percentage: number;
  }[];
  supplierBreakdown: {
    supplierId: string;
    supplierName: string;
    value: number;
    percentage: number;
  }[];
}

export interface CostAnalysisReport {
  taskId?: string;
  taskType?: string;
  patientId?: string;
  patientName?: string;
  totalCost: number;
  suppliesUsed: {
    supplyId: string;
    supplyName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }[];
  date: string;
}

// Interfaces para dashboard
export interface SuppliesDashboardData {
  totalSupplies: number;
  lowStockCount: number;
  expiringCount: number;
  totalValue: number;
  recentMovements: StockMovement[];
  topConsumedSupplies: {
    supplyId: string;
    supplyName: string;
    quantityConsumed: number;
  }[];
  alerts: SupplyAlert[];
}

// Interfaces para formulários
export interface CreateSupplyData {
  name: string;
  description?: string;
  category: SupplyCategory;
  subcategory?: string;
  brand?: string;
  model?: string;
  unitOfMeasure: string;
  minimumStock: number;
  maximumStock?: number;
  unitCost?: number;
  supplierId?: string;
  barcode?: string;
  expirationDate?: string;
  storageLocation?: string;
  requiresPrescription: boolean;
}

export interface UpdateSupplyData extends Partial<CreateSupplyData> {
  id: string;
}

export interface CreateStockMovementData {
  supplyId: string;
  movementType: InventoryMovementType;
  quantity: number;
  unitCost?: number;
  reason?: string;
  referenceDocument?: string;
  patientId?: string;
  taskId?: string;
  batchNumber?: string;
  expirationDate?: string;
}

export interface CreatePurchaseOrderData {
  supplierId: string;
  items: {
    supplyId: string;
    quantityRequested: number;
    unitCost?: number;
  }[];
  notes?: string;
  expectedDelivery?: string;
}

// Interfaces para filtros e busca
export interface SupplyFilters {
  category?: SupplyCategory;
  supplierId?: string;
  isActive?: boolean;
  lowStock?: boolean;
  expiring?: boolean;
  search?: string;
}

export interface StockMovementFilters {
  supplyId?: string;
  movementType?: InventoryMovementType;
  dateFrom?: string;
  dateTo?: string;
  patientId?: string;
  taskId?: string;
}

export interface PurchaseOrderFilters {
  supplierId?: string;
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  isAutoGenerated?: boolean;
}

// ============================================================================
// AUDIT TYPES
// ============================================================================

export type AuditAction =
  // Authentication
  | 'LOGIN_SUCCESS' | 'LOGIN_ATTEMPT_FAILED' | 'LOGOUT' | 'AUTO_LOGOUT' | 'PASSWORD_CHANGE'
  // Patient Management
  | 'CREATE_PATIENT' | 'UPDATE_PATIENT' | 'DELETE_PATIENT' | 'VIEW_PATIENT_RECORD'
  // Appointment Management
  | 'CREATE_APPOINTMENT' | 'UPDATE_APPOINTMENT' | 'CANCEL_APPOINTMENT' | 'RESCHEDULE_APPOINTMENT' | 'DELETE_APPOINTMENT'
  // Treatment Management
  | 'CREATE_TREATMENT' | 'UPDATE_TREATMENT' | 'COMPLETE_TREATMENT' | 'CANCEL_TREATMENT'
  // Financial Operations
  | 'CREATE_INVOICE' | 'PROCESS_PAYMENT' | 'REFUND_PAYMENT' | 'UPDATE_PAYMENT_STATUS'
  | 'CREATE_TRANSACTION' | 'UPDATE_TRANSACTION' | 'DELETE_TRANSACTION'
  // Medical Records
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'SIGN' | 'ARCHIVE' | 'RESTORE' | 'EXPORT'
  // System Operations
  | 'SYSTEM_BACKUP' | 'SYSTEM_RESTORE' | 'DATA_EXPORT' | 'DATA_IMPORT'
  // Backup Operations
  | 'BACKUP_CREATED' | 'BACKUP_FAILED' | 'BACKUP_RESTORED' | 'BACKUP_RESTORE_FAILED'
  | 'BACKUP_CONFIG_UPDATE' | 'BACKUP_MONITOR_CONFIG_UPDATE'
  | 'BACKUP_ALERT_CREATED' | 'BACKUP_ALERT_RESOLVED' | 'BACKUP_ALERT_RESOLVED_MANUAL' | 'BACKUP_ALERT_ACTION_EXECUTED'
  // Settings and Preferences
  | 'UPDATE_NOTIFICATION_PREFERENCES' | 'UPDATE_USER_SETTINGS'
  // Notification Operations
  | 'SUBSCRIBE_PUSH_NOTIFICATIONS' | 'SEND_TEMPLATED_NOTIFICATION'
  // Video Call Operations
  | 'VIDEOCALL_CONFIG_UPDATE' | 'VIDEOCALL_SESSION_CREATED' | 'VIDEOCALL_SESSION_JOINED' | 'VIDEOCALL_SESSION_LEFT' | 'VIDEOCALL_SESSION_ENDED' | 'VIDEOCALL_RECORDING_STARTED' | 'VIDEOCALL_RECORDING_COMPLETED';

export type ResourceType =
  | 'user' | 'appointment' | 'patient' | 'treatment' | 'transaction' | 'settings'
  | 'videocall-config' | 'videocall-session' | 'videocall-recording'
  | 'backup' | 'backup-config' | 'backup-alert' | 'notification'
  | 'backup-monitor' | 'supply' | 'supplier' | 'task' | 'session' | 'exercise'
  | 'body-point' | 'communication-log' | 'pain-point' | 'analytics-event';

export interface AuditLog {
  id: string;
  user: string;
  action: AuditAction;
  details: string;
  resourceId?: string;
  resourceType?: ResourceType;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// ============================================================================
// TIPOS ADICIONAIS PARA COMUNICAÇÃO E AUTOMAÇÃO
// ============================================================================

// AutomationExecution type for tracking automation execution (unified)
export interface AutomationExecution {
  id: string;
  ruleId: string;
  status: 'success' | 'failure' | 'pending' | 'running' | 'completed' | 'failed';
  triggeredAt: Date;
  completedAt?: Date;
  error?: string;
  result?: any;
  context?: {
    patientId?: string;
    appointmentId?: string;
    eventData?: any;
  };
}

// ============================================================================
// TASK SUPPLY INTEGRATION TYPES
// ============================================================================

export interface TaskSupplyUsed {
  id: string;
  taskId: string;
  supplyId: string;
  supply?: Supply;
  quantityUsed: number;
  unitCost?: number;
  totalCost?: number;
  usedBy?: string;
  patientId?: string;
  usageDate: string;
  batchNumber?: string;
  expirationDate?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateTaskSupplyUsedData {
  taskId: string;
  supplyId: string;
  quantityUsed: number;
  unitCost?: number;
  patientId?: string;
  batchNumber?: string;
  expirationDate?: string;
  notes?: string;
}

export interface TaskTypeSupplyTemplate {
  id: string;
  taskType: string;
  supplyId: string;
  supply?: Supply;
  defaultQuantity: number;
  isRequired: boolean;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface TaskCost {
  id: string;
  taskId: string;
  totalSupplyCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  calculatedAt: string;
  calculatedBy?: string;
}

// ============================================================================
// ADVANCED ALERT SYSTEM TYPES
// ============================================================================

export interface AutoAlertRule {
  id: string;
  ruleName: string;
  ruleType: string;
  conditions: Record<string, any>;
  severity: AlertSeverity;
  isActive: boolean;
  notificationChannels: string[];
  escalationRules?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UserNotificationSettings {
  id: string;
  userId: string;
  notificationType: string;
  channel: string;
  isEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  createdAt: string;
  updatedAt: string;
}

export interface AlertHistory {
  id: string;
  alertId: string;
  action: 'created' | 'read' | 'resolved' | 'escalated' | 'dismissed' | 'reopened';
  performedBy?: string;
  performedAt: string;
  notes?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// PATIENT TRACKING & ASSESSMENT TYPES
// ============================================================================

export interface ClinicalCaseCategory {
  id: string;
  name: string;
  specialty: 'sports' | 'post_operative' | 'orthopedic' | 'neurological' | 'cardiorespiratory' | 'other';
  description?: string;
  isSystemDefault: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AssessmentTemplate {
  id: string;
  categoryId: string;
  name: string;
  fieldType: 'number' | 'range' | 'angle' | 'scale' | 'text' | 'date' | 'boolean' | 'select';
  unit?: string;
  minValue?: number;
  maxValue?: number;
  options?: { label: string; value: string }[];
  isRequired: boolean;
  displayOrder: number;
  helpText?: string;
  createdAt: string;
}

export interface SessionObservation {
  id: string;
  patientId: string;
  sessionId?: string;
  authorId: string;
  authorName: string;
  observationType: 'general' | 'clinical' | 'evolution' | 'assessment' | 'alert' | 'recommendation';
  content: string;
  timing?: 'before' | 'during' | 'after' | 'independent';
  tags?: string[];
  isImportant: boolean;
  isPinned?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PatientAssessment {
  id: string;
  patientId: string;
  sessionId?: string;
  observationId?: string;
  templateId?: string;
  fieldName: string;
  fieldValue?: number;
  fieldText?: string;
  unit?: string;
  assessmentTiming: 'pre_session' | 'post_session' | 'mid_session' | 'independent';
  measuredBy: string;
  measuredAt: string;
  notes?: string;
}

export interface MandatoryAssessment {
  id: string;
  patientId: string;
  categoryId: string;
  templateId: string;
  frequencyType: 'every_session' | 'weekly' | 'biweekly' | 'monthly' | 'every_n_sessions' | 'milestones';
  frequencyValue?: number;
  milestoneSessions?: number[];
  assessmentTiming: ('pre_session' | 'post_session' | 'mid_session')[];
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
}

export interface AssessmentChartData {
  date: string;
  value: number;
  fieldName?: string; // Nome da métrica/campo
  unit?: string; // Unidade de medida
  sessionNumber?: number;
  timing?: string;
  notes?: string;
}

// Tipos para filtros e configurações
export interface ObservationFilters {
  type?: SessionObservation['observationType'];
  sessionId?: string;
  authorId?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  important?: boolean;
}

export interface AssessmentFilters {
  templateId?: string;
  fieldName?: string;
  dateFrom?: string;
  dateTo?: string;
  timing?: PatientAssessment['assessmentTiming'];
}

// Tipos para estatísticas e relatórios
export interface AssessmentStatistics {
  fieldName: string;
  unit?: string;
  count: number;
  min: number;
  max: number;
  average: number;
  latest: number;
  percentChange: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface EvolutionReportData {
  patientId: string;
  period: {
    start: string;
    end: string;
  };
  assessments: AssessmentChartData[];
  statistics: AssessmentStatistics[];
  observations: SessionObservation[];
  totalSessions: number;
}

// ============================================================================
// SISTEMA DE MAPA CORPORAL DE DOR - TIPOS
// ============================================================================

export interface BodyMapSession {
  id: string;
  patientId: string;
  sessionId?: string;
  appointmentId?: string;
  mainComplaintRegion: string;
  mainComplaintDescription?: string;
  sessionDate: Date;
  overallPainLevel: number; // 0-10
  painFree: boolean;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  painRegions?: BodyMapPainRegion[];
}

export interface BodyMapPainRegion {
  id: string;
  bodyMapSessionId: string;
  patientId: string;
  bodyRegion: string;
  bodySide: 'front' | 'back';
  coordinatesX: number; // 0-100 (percentual)
  coordinatesY: number; // 0-100 (percentual)
  painLevel: number; // 0-10
  painTypes: string[]; // ['aguda', 'latejante', 'queimação', 'formigamento', 'cansaço']
  symptoms: string[];
  description?: string;
  isMainComplaint: boolean;
  isActive: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface BodyMapVisualizationType {
  id: 'svg-detailed' | 'svg-simple' | 'canvas-interactive' | 'image-anatomical';
  name: string;
  description: string;
  icon?: React.ReactNode;
}

export interface BodyMapAnalytics {
  patientId: string;
  period: { start: Date; end: Date };
  
  // Tendência de dor ao longo do tempo
  painTrend: {
    date: Date;
    averagePain: number;
    activeRegions: number;
    painFreeSession: boolean;
  }[];
  
  // Frequência de dor por região
  regionFrequency: Record<string, number>;
  
  // Progresso da queixa principal
  mainComplaintProgress: {
    date: Date;
    painLevel: number;
    status: string;
  }[];
  
  // Dados para mapa de calor
  heatmapData: {
    region: string;
    frequency: number;
    avgPainLevel: number;
  }[];
  
  // Distribuição de tipos de dor
  painTypeDistribution: Record<string, number>;
  
  // Métricas resumidas
  totalSessions: number;
  painFreeSessions: number;
  activeRegions: number;
  resolvedRegions: number;
  averagePainLevel: number;
  improvementPercent: number;
}

export interface BodyMapAnalyticsCache {
  id: string;
  patientId: string;
  totalSessions: number;
  painFreeSessions: number;
  activePainRegions: number;
  resolvedPainRegions: number;
  painTrend: 'improving' | 'stable' | 'worsening';
  averagePainLevel: number;
  lastSessionDate: Date;
  daysSinceLastSession: number;
  mainComplaintInitialPain: number;
  mainComplaintCurrentPain: number;
  mainComplaintImprovementPercent: number;
  lastCalculatedAt: Date;
}

export interface BodyRegionReference {
  id: number;
  regionKey: string;
  regionNamePt: string;
  regionNameEn?: string;
  bodySide: 'front' | 'back' | 'both';
  parentRegion?: string;
  sortOrder: number;
}

export interface PatientMainPathology {
  mainPathology?: string;
  mainPathologyRegion?: string;
  mainPathologySince?: Date;
}

// Props para componentes de visualização do mapa corporal
export interface BodyMapVisualizationProps {
  bodySide: 'front' | 'back';
  painRegions: BodyMapPainRegion[];
  mainComplaint?: BodyMapPainRegion;
  onAddPoint: (x: number, y: number) => void;
  onSelectPoint: (region: BodyMapPainRegion) => void;
  readOnly?: boolean;
  showLabels?: boolean;
}

// Dados para geração de PDF
export interface BodyMapPDFData {
  patient: Patient;
  mainPathology?: PatientMainPathology;
  sessions: BodyMapSession[];
  analytics: BodyMapAnalytics;
  generatedAt: Date;
  generatedBy: string;
  clinicInfo?: {
    name: string;
    logo?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

// Filtros para consultas
export interface BodyMapFilters {
  patientId?: string;
  startDate?: Date;
  endDate?: Date;
  includePainFree?: boolean;
  onlyActiveRegions?: boolean;
  bodyRegion?: string;
  minPainLevel?: number;
  maxPainLevel?: number;
}

// Comparação entre sessões
export interface BodyMapComparison {
  firstSession: BodyMapSession;
  lastSession: BodyMapSession;
  improvements: string[];
  worsenings: string[];
  newRegions: string[];
  resolvedRegions: string[];
  overallChange: number; // percentual
}

// --- WhatsApp Service Types ---

// Tipos para queries com joins do Supabase
export interface AppointmentWithPatient {
  id: string;
  date: string;
  time: string;
  patient: {
    name: string;
    phone: string;
  };
  therapist: {
    name: string;
  };
}

export interface PaymentWithPatient {
  id: string;
  amount: number;
  due_date: string;
  patient: {
    name: string;
    phone: string;
  };
}

// Tipos para operações do Supabase
export interface WhatsAppMessageInsert {
  clinic_id: string;
  phone: string;
  direction: string;
  message_type: string;
  content: string;
  status: string;
  sent_at: string;
  metadata: {
    notification_type: string;
  };
}

export interface AIPredictionInsert {
  patient_id: string;
  prediction_type: string;
  outcome_prediction: string;
  confidence_score: number;
  confidence_level: string;
  input_features: any;
  features_used: string[];
  model_version: string;
  prediction_date: string;
  actual_outcome?: string;
  accuracy_score?: number;
  notes?: string;
  created_by: string;
}

// Tipos para Meta WhatsApp API
export interface CreateLeadInput {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source?: string;
  // Removido 'status' que não existe no tipo original
}

// ============================================================================
// SISTEMA DE EVOLUÇÃO DE SESSÃO - TIPOS
// ============================================================================

// Dados completos da evolução de uma sessão
export interface SessionEvolution {
  id: string;
  sessionId: string; // ID do appointment ou SOAP note
  patientId: string;
  sessionNumber: number;
  sessionDate: string; // ISO date
  therapistId: string;
  therapistName: string;
  
  // Dados SOAP
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  
  // Testes realizados na sessão
  testsPerformed: TestResult[];
  
  // Métricas rápidas
  painLevel?: number; // 0-10
  satisfactionLevel?: number; // 0-10
  
  // Metadata
  duration?: number; // minutos
  tags?: string[];
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Resultado de um teste/avaliação específico
export interface TestResult {
  id: string;
  testName: string;
  testType: 'amplitude' | 'strength' | 'balance' | 'functional' | 'pain' | 'other';
  value: number;
  unit: string;
  side?: 'left' | 'right' | 'bilateral';
  notes?: string;
  assessedAt: string;
  assessedBy?: string;
}

// Dados para evolução de testes ao longo do tempo (para gráficos)
export interface TestEvolutionData {
  sessionNumber: number;
  sessionDate: string;
  testName: string;
  value: number;
  unit: string;
  side?: 'left' | 'right' | 'bilateral';
  variation?: number; // variação em relação à sessão anterior
  percentChange?: number; // variação percentual
  notes?: string;
}

// Estatísticas de um teste específico
export interface TestStatistics {
  testName: string;
  unit: string;
  totalMeasurements: number;
  firstValue: number;
  lastValue: number;
  minValue: number;
  maxValue: number;
  averageValue: number;
  totalImprovement: number;
  percentImprovement: number;
  trend: 'improving' | 'stable' | 'declining';
  lastMeasuredAt: string;
}

// Template de conduta para replicação
export interface ConductTemplate {
  id: string;
  patientId: string;
  name: string;
  description?: string;
  
  // Dados da conduta
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  
  // Testes incluídos
  tests?: Array<{
    testName: string;
    testType: string;
    unit: string;
  }>;
  
  // Metadata
  sourceSessionId?: string;
  sourceSessionDate?: string;
  timesUsed: number;
  
  createdAt: string;
  createdBy?: string;
  isTemplate: boolean; // true se é template salvo, false se é de sessão anterior
}

// Alerta de teste obrigatório
export interface MandatoryTestAlert {
  id: string;
  testConfigId: string;
  testName: string;
  testType: 'amplitude' | 'strength' | 'balance' | 'functional' | 'pain';
  severity: 'critical' | 'important' | 'low';
  reason: string;
  message: string;
  dueAt: string; // quando deve ser realizado
  isCompleted: boolean;
  completedAt?: string;
  canSkip: boolean; // se pode pular (não crítico)
}

// Configuração de qual tipo de gráfico usar para cada métrica
export type ChartType = 'bar' | 'line' | 'area' | 'radar';

export interface ChartConfig {
  metricName: string;
  chartType: ChartType;
  color: string;
  showGoalLine?: boolean;
  goalValue?: number;
}

// Insight gerado automaticamente para relatório médico
export interface MedicalInsight {
  id: string;
  patientId: string;
  type: 'pain_reduction' | 'range_improvement' | 'strength_gain' | 'functional_progress' | 'milestone' | 'alert';
  title: string;
  description: string;
  data: {
    metric?: string;
    initialValue?: number;
    currentValue?: number;
    improvement?: number;
    percentImprovement?: number;
    sessions?: number;
    timeframe?: string;
  };
  severity?: 'info' | 'success' | 'warning' | 'error';
  suggestedText?: string; // texto sugerido para laudo
  generatedAt: string;
}

// --- Patient Monitoring Types ---

export type RiskLevel = 'low' | 'medium' | 'high';

export interface PatientWithMonitoringMetrics extends Patient {
  // Métricas calculadas
  attendanceRate: number; // Taxa de presença (0-100)
  consecutiveMisses: number; // Faltas consecutivas
  daysSinceLastSession: number; // Dias desde última sessão
  lastSessionDate: string | null; // Data da última sessão
  totalSessions: number; // Total de sessões realizadas
  totalMisses: number; // Total de faltas
  averagePainLevel: number; // Nível médio de dor (0-10)
  painTrend: 'improving' | 'stable' | 'worsening' | 'no_data'; // Tendência de dor
  riskLevel: RiskLevel; // Nível de risco calculado
  riskReasons: string[]; // Razões para o nível de risco
  nextScheduledSession?: string; // Próxima sessão agendada
}

export interface MonitoringFilters {
  searchTerm: string; // Busca por nome/CPF
  status: PatientStatus | 'all'; // Status do paciente
  riskLevel: RiskLevel | 'all'; // Nível de risco
  attendanceRange: 'all' | 'low' | 'medium' | 'high' | 'excellent'; // <50% | 50-75% | 75-90% | >90%
  painLevel: 'all' | 'none' | 'low' | 'moderate' | 'severe'; // Nível de dor
  therapistId: string | 'all'; // Terapeuta responsável
}

export type MonitoringSortField = 
  | 'name' 
  | 'status' 
  | 'lastSessionDate' 
  | 'attendanceRate' 
  | 'painLevel' 
  | 'riskLevel';

export interface MonitoringSortConfig {
  field: MonitoringSortField;
  direction: 'asc' | 'desc';
}

export interface KPIMetrics {
  totalActivePatients: number;
  averageAttendanceRate: number;
  patientsAtRisk: number; // Pacientes em risco médio ou alto
  totalMissesInPeriod: number;
  trends: {
    activePatients: number; // Variação percentual
    attendanceRate: number;
    patientsAtRisk: number;
    misses: number;
  };
}

export interface PresenceDataPoint {
  date: string; // YYYY-MM-DD
  attendanceRate: number; // 0-100
  totalSessions: number;
  completed: number;
  missed: number;
}

export interface PainDistributionData {
  category: 'none' | 'low' | 'moderate' | 'severe';
  label: string; // "Sem dor (0)", "Leve (1-3)", etc.
  count: number;
  percentage: number;
  color: string;
}

export interface QuickActionType {
  type: 'whatsapp' | 'schedule' | 'note' | 'details';
  label: string;
  icon: string;
}