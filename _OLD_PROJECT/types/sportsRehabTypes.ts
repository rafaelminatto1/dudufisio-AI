/**
 * Sports Rehabilitation Module Types
 * Tipos para Módulo de Reabilitação Esportiva
 */

// Tipos de esportes
export enum SportType {
  Soccer = 'soccer',
  Basketball = 'basketball',
  Volleyball = 'volleyball',
  Tennis = 'tennis',
  Running = 'running',
  Swimming = 'swimming',
  Cycling = 'cycling',
  MartialArts = 'martial_arts',
  Gymnastics = 'gymnastics',
  CrossFit = 'crossfit',
  WeightLifting = 'weight_lifting',
  Other = 'other'
}

// Níveis de competição
export enum CompetitionLevel {
  Recreational = 'recreational',
  Amateur = 'amateur',
  SemiProfessional = 'semi_professional',
  Professional = 'professional',
  Elite = 'elite'
}

// Status de clearance para retorno
export enum ClearanceStatus {
  NotReady = 'not_ready',
  PartialClearance = 'partial_clearance',
  FullClearance = 'full_clearance',
  ReturnToPlay = 'return_to_play'
}

// Fases de reabilitação esportiva
export enum RehabPhase {
  Phase1_Acute = 'phase1_acute',              // Fase aguda: controle de dor e edema
  Phase2_Intermediate = 'phase2_intermediate', // Fase intermediária: ROM e força básica
  Phase3_Advanced = 'phase3_advanced',         // Fase avançada: força e resistência
  Phase4_SportSpecific = 'phase4_sport',       // Esporte-específico
  Phase5_ReturnToPlay = 'phase5_rtp'          // Retorno ao jogo
}

// Perfil do atleta
export interface AthleteProfile {
  id: string;
  patientId: string;
  sportType: SportType;
  position?: string;
  competitionLevel: CompetitionLevel;
  yearsPracticing: number;
  hoursPerWeek: number;
  competitionFrequency?: string;
  dominantSide: 'right' | 'left' | 'both';
  previousInjuries: InjuryHistory[];
  goals: AthleteGoal[];
  currentPhase: RehabPhase;
  targetReturnDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InjuryHistory {
  id: string;
  injuryType: string;
  bodyPart: string;
  date: Date;
  recoveryTime: number; // dias
  complications?: string;
  notes?: string;
}

export interface AthleteGoal {
  id: string;
  description: string;
  category: 'strength' | 'power' | 'endurance' | 'flexibility' | 'skill' | 'psychological';
  targetDate?: Date;
  achieved: boolean;
  achievedDate?: Date;
  priority: 'high' | 'medium' | 'low';
}

// Critérios de retorno ao esporte (Return to Sport - RTS)
export interface ReturnToSportCriteria {
  id: string;
  athleteId: string;
  assessmentDate: Date;
  assessedBy: string;
  
  // Critérios gerais
  painLevel: number; // 0-10
  swellingPresent: boolean;
  rangeOfMotion: ROMAssessment;
  strengthTests: StrengthTest[];
  functionalTests: FunctionalTest[];
  psychologicalReadiness: PsychologicalAssessment;
  
  // Scores e decisões
  overallScore: number; // 0-100
  clearanceStatus: ClearanceStatus;
  recommendations: string[];
  restrictions?: string[];
  nextAssessmentDate?: Date;
  
  notes?: string;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
}

// Avaliação de amplitude de movimento
export interface ROMAssessment {
  joint: string;
  movements: {
    movement: string;
    affectedSide: number; // graus
    unaffectedSide: number; // graus
    symmetryIndex: number; // % (affected/unaffected * 100)
    withinNormal: boolean;
  }[];
  overallSymmetry: number; // média dos índices de simetria
  passedCriteria: boolean; // >= 90% de simetria
}

// Teste de força
export interface StrengthTest {
  id: string;
  testName: string;
  muscle: string;
  testType: 'isokinetic' | 'isometric' | '1RM' | 'manual_resistance';
  affectedSide: number;
  unaffectedSide: number;
  unit: string; // N, kg, Nm, etc.
  symmetryIndex: number; // %
  comparedToNorm?: number; // % do normal para idade/sexo/esporte
  passedCriteria: boolean; // >= 90% de simetria
  date: Date;
  notes?: string;
}

// Testes funcionais
export interface FunctionalTest {
  id: string;
  testName: string;
  category: 'hop' | 'balance' | 'agility' | 'power' | 'endurance';
  description: string;
  
  // Resultados
  affectedSide?: number;
  unaffectedSide?: number;
  symmetryIndex?: number; // % (para testes bilaterais)
  
  // Valores absolutos (para testes não-comparativos)
  score?: number;
  unit?: string;
  comparedToNorm?: number; // %
  
  passedCriteria: boolean;
  criteriaThreshold: number; // threshold para passar (ex: 90%)
  date: Date;
  videoUrl?: string;
  notes?: string;
}

// Testes de hop específicos
export interface HopTest extends FunctionalTest {
  category: 'hop';
  testType: 'single_hop' | 'triple_hop' | 'crossover_hop' | '6m_timed_hop';
  distance?: number; // em cm ou metros
  time?: number; // em segundos (para timed hop)
}

// Avaliação psicológica
export interface PsychologicalAssessment {
  acl_rsi_score?: number; // ACL-Return to Sport after Injury (0-100)
  fearAvoidance: number; // 1-5 scale
  confidence: number; // 1-10 scale
  readiness: number; // 1-10 scale
  motivation: number; // 1-10 scale
  anxietyLevel: number; // 1-10 scale
  overallPsychologicalScore: number; // 0-100
  concerns?: string[];
  notes?: string;
}

// Métricas de performance
export interface PerformanceMetric {
  id: string;
  athleteId: string;
  metricType: 'strength' | 'power' | 'speed' | 'endurance' | 'agility' | 'flexibility';
  metricName: string;
  value: number;
  unit: string;
  date: Date;
  context?: string; // contexto do teste
  comparedToBaseline?: number; // % da baseline
  comparedToNorm?: number; // % da norma
  trend?: 'improving' | 'stable' | 'declining';
  notes?: string;
}

// Benchmarks por esporte
export interface SportBenchmark {
  id: string;
  sportType: SportType;
  position?: string;
  competitionLevel: CompetitionLevel;
  ageRange: { min: number; max: number };
  gender?: 'M' | 'F';
  
  benchmarks: {
    metricName: string;
    metricType: string;
    averageValue: number;
    excellentValue: number;
    minimumValue: number;
    unit: string;
    source?: string; // referência científica
  }[];
}

// Progressão de reabilitação
export interface RehabProgression {
  id: string;
  athleteId: string;
  currentPhase: RehabPhase;
  phaseStartDate: Date;
  estimatedPhaseCompletion?: Date;
  
  phaseGoals: {
    goal: string;
    completed: boolean;
    completedDate?: Date;
  }[];
  
  completedPhases: {
    phase: RehabPhase;
    startDate: Date;
    completionDate: Date;
    duration: number; // dias
    outcomes: string[];
  }[];
  
  progressionCriteria: {
    criterion: string;
    met: boolean;
    datemet?: Date;
    notes?: string;
  }[];
  
  overallProgress: number; // 0-100%
  estimatedReturnDate?: Date;
  notes?: string;
}

// Protocolo de reabilitação esportiva
export interface SportsRehabProtocol {
  id: string;
  name: string;
  sportType: SportType;
  injuryType: string;
  description: string;
  
  phases: RehabPhaseDetail[];
  
  totalDuration: {
    min: number;
    max: number;
    unit: 'weeks' | 'months';
  };
  
  returnToCriteria: string[];
  evidenceLevel: string;
  references: string[];
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RehabPhaseDetail {
  phase: RehabPhase;
  name: string;
  description: string;
  duration: {
    min: number;
    max: number;
    unit: 'days' | 'weeks';
  };
  
  goals: string[];
  
  exercises: {
    exerciseId: string;
    exerciseName: string;
    sets: number;
    reps: string;
    frequency: string;
    intensity: string;
    progression: string;
  }[];
  
  milestones: {
    milestone: string;
    timeframe: string;
    assessment: string;
  }[];
  
  progressionCriteria: string[];
  precautions: string[];
}

// Sessão de treino esportivo
export interface SportTrainingSession {
  id: string;
  athleteId: string;
  sessionDate: Date;
  sessionType: 'strength' | 'conditioning' | 'skill' | 'sport_specific' | 'recovery';
  phase: RehabPhase;
  duration: number; // minutos
  
  exercises: {
    exerciseId: string;
    exerciseName: string;
    sets: number;
    reps: number;
    load?: number;
    loadUnit?: string;
    restTime?: number;
    completed: boolean;
    perceivedExertion?: number; // RPE 1-10
    notes?: string;
  }[];
  
  metrics: {
    heartRateAvg?: number;
    heartRateMax?: number;
    perceivedExertion: number; // RPE geral da sessão
    fatigueLevel: number; // 1-10
    painLevel: number; // 0-10
    performanceRating: number; // 1-10
  };
  
  objectives: string[];
  objectivesAchieved: boolean;
  
  notes?: string;
  conductedBy?: string;
}

// Analytics e relatórios
export interface SportsRehabAnalytics {
  athleteId: string;
  period: {
    start: Date;
    end: Date;
  };
  
  progressSummary: {
    currentPhase: RehabPhase;
    daysInPhase: number;
    overallProgress: number; // %
    onTrackForReturn: boolean;
  };
  
  performanceMetrics: {
    metricType: string;
    baseline: number;
    current: number;
    changePercent: number;
    trend: 'improving' | 'stable' | 'declining';
  }[];
  
  strengthSymmetry: {
    muscle: string;
    symmetryIndex: number; // %
    passedCriteria: boolean;
  }[];
  
  functionalTestResults: {
    testName: string;
    lastScore: number;
    trend: number[]; // histórico de scores
    passedCriteria: boolean;
  }[];
  
  trainingLoad: {
    weeklyVolume: number;
    intensity: number;
    monotony: number;
    strain: number;
  };
  
  complianceRate: number; // % de sessões completadas
  
  predictedReturnDate?: Date;
  confidenceLevel?: number; // 0-1
  
  riskFactors: {
    factor: string;
    severity: 'low' | 'medium' | 'high';
    recommendation: string;
  }[];
}

// Bateria de testes padrão
export interface TestBattery {
  id: string;
  name: string;
  description: string;
  sportTypes: SportType[];
  injuryTypes: string[];
  
  tests: {
    testId: string;
    testName: string;
    category: string;
    required: boolean;
    order: number;
    passingCriteria: {
      metric: string;
      threshold: number;
      comparison: '>=' | '<=' | '>' | '<' | '=';
    };
  }[];
  
  interpretationGuidelines: string[];
}

// Resultado de bateria de testes
export interface TestBatteryResult {
  id: string;
  athleteId: string;
  batteryId: string;
  testDate: Date;
  conductedBy: string;
  
  testResults: {
    testId: string;
    testName: string;
    score: number;
    passed: boolean;
    notes?: string;
  }[];
  
  overallPassed: boolean;
  overallScore: number; // média ponderada
  clearanceRecommendation: ClearanceStatus;
  
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  
  nextTestDate?: Date;
}

// Comparação bilateral
export interface BilateralComparison {
  athleteId: string;
  assessmentDate: Date;
  
  comparisons: {
    parameter: string;
    affectedSide: number;
    unaffectedSide: number;
    unit: string;
    symmetryIndex: number; // %
    deficit: number;
    meetsCriteria: boolean; // >= 90%
  }[];
  
  overallSymmetry: number; // média de todos os índices
  readyForNextPhase: boolean;
}

// Load monitoring (controle de carga)
export interface LoadMonitoring {
  athleteId: string;
  week: string; // YYYY-WW
  
  dailyLoad: {
    date: Date;
    training: {
      duration: number; // minutos
      rpe: number; // 1-10
      sessionLoad: number; // duration * rpe
    };
    wellness: {
      sleepQuality: number; // 1-10
      sleepDuration: number; // horas
      musclesoreness: number; // 1-10
      stressLevel: number; // 1-10
      mood: number; // 1-10
      energy: number; // 1-10
    };
  }[];
  
  weeklyMetrics: {
    totalLoad: number;
    averageLoad: number;
    acuteLoad: number; // média dos últimos 7 dias
    chronicLoad: number; // média dos últimos 28 dias
    acwr: number; // Acute:Chronic Workload Ratio
    monotony: number;
    strain: number;
    riskLevel: 'low' | 'moderate' | 'high';
  };
  
  recommendations: string[];
}

