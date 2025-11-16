/**
 * Risk Stratification System Types
 * Sistema de Estratificação de Risco para DuduFisio-AI
 */

export enum RiskLevel {
  Low = 'low',
  Moderate = 'moderate',
  High = 'high',
  Critical = 'critical'
}

export enum RiskType {
  Fall = 'fall',                          // Risco de queda
  Deconditioning = 'deconditioning',      // Risco de descondicionamento
  Abandonment = 'abandonment',            // Risco de abandono do tratamento
  Complication = 'complication',          // Risco de complicação
  NoShow = 'no_show',                     // Risco de falta
  Readmission = 'readmission',            // Risco de readmissão
  ChronicPain = 'chronic_pain',           // Risco de dor crônica
  FunctionalDecline = 'functional_decline' // Risco de declínio funcional
}

export interface RiskFactor {
  id: string;
  name: string;
  category: 'demographic' | 'clinical' | 'behavioral' | 'social' | 'environmental';
  value: any;
  weight: number;          // Peso do fator (0-1)
  contribution: number;    // Contribuição para o score total (0-100%)
  description?: string;
  isModifiable: boolean;   // Se pode ser modificado com intervenção
}

export interface RiskAssessment {
  id: string;
  patientId: string;
  patientName: string;
  riskType: RiskType;
  riskLevel: RiskLevel;
  score: number;           // Score de 0-100
  confidence: number;      // Confiança da predição (0-1)
  factors: RiskFactor[];
  recommendations: RiskRecommendation[];
  assessedAt: Date;
  assessedBy: string;
  validUntil: Date;
  previousScore?: number;
  trend?: 'improving' | 'stable' | 'worsening';
  notes?: string;
}

export interface RiskRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  rationale: string;
  targetFactors: string[];  // IDs dos fatores que a recomendação endereça
  estimatedImpact: number;  // Impacto esperado na redução do risco (0-100%)
  category: 'prevention' | 'intervention' | 'monitoring';
  assignedTo?: string;
  dueDate?: Date;
  completed: boolean;
  completedAt?: Date;
}

export interface RiskThreshold {
  riskType: RiskType;
  low: { min: number; max: number };
  moderate: { min: number; max: number };
  high: { min: number; max: number };
  critical: { min: number; max: number };
}

export interface RiskProfile {
  patientId: string;
  assessments: RiskAssessment[];
  overallRiskLevel: RiskLevel;
  highestRisks: RiskType[];
  lastAssessmentDate: Date;
  nextAssessmentDue: Date;
  interventionPlan?: RiskInterventionPlan;
}

export interface RiskInterventionPlan {
  id: string;
  patientId: string;
  targetRisks: RiskType[];
  interventions: RiskIntervention[];
  goals: RiskGoal[];
  createdAt: Date;
  createdBy: string;
  status: 'active' | 'completed' | 'cancelled';
  reviewDate: Date;
}

export interface RiskIntervention {
  id: string;
  type: 'education' | 'exercise' | 'medication' | 'environmental' | 'behavioral';
  description: string;
  frequency: string;
  duration: string;
  targetRiskFactors: string[];
  assignedTo: string;
  status: 'planned' | 'in_progress' | 'completed';
  effectiveness?: number; // 0-100%
}

export interface RiskGoal {
  id: string;
  description: string;
  targetRiskType: RiskType;
  targetReduction: number; // % de redução esperada
  deadline: Date;
  achieved: boolean;
  achievedAt?: Date;
}

// Analytics e Reporting
export interface RiskAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  totalAssessments: number;
  riskDistribution: Record<RiskLevel, number>;
  topRiskTypes: Array<{
    type: RiskType;
    count: number;
    averageScore: number;
  }>;
  interventionEffectiveness: {
    totalInterventions: number;
    successRate: number;
    averageRiskReduction: number;
  };
  highRiskPatients: number;
  criticalAlerts: number;
}

export interface RiskAlert {
  id: string;
  patientId: string;
  patientName: string;
  riskType: RiskType;
  riskLevel: RiskLevel;
  score: number;
  triggeredAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  actions: RiskAlertAction[];
}

export interface RiskAlertAction {
  id: string;
  action: string;
  performedBy: string;
  performedAt: Date;
  notes?: string;
}

// Configurações do sistema de risco
export interface RiskSystemConfig {
  assessmentFrequency: {
    [key in RiskType]: number; // dias entre avaliações
  };
  autoAssessmentEnabled: boolean;
  alertThresholds: RiskThreshold[];
  notificationChannels: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  escalationRules: RiskEscalationRule[];
}

export interface RiskEscalationRule {
  riskLevel: RiskLevel;
  riskType?: RiskType;
  action: 'notify_therapist' | 'notify_supervisor' | 'create_task' | 'schedule_appointment';
  delayMinutes: number;
  notifyUsers: string[];
}

// Score Models
export interface RiskScoreModel {
  id: string;
  name: string;
  riskType: RiskType;
  version: string;
  algorithm: 'weighted_sum' | 'logistic_regression' | 'neural_network' | 'decision_tree';
  factors: RiskModelFactor[];
  accuracy?: number;
  lastCalibrated?: Date;
  isActive: boolean;
}

export interface RiskModelFactor {
  factorId: string;
  name: string;
  dataType: 'number' | 'boolean' | 'category' | 'date';
  weight: number;
  transformation?: 'linear' | 'logarithmic' | 'polynomial';
  thresholds?: Array<{
    value: any;
    score: number;
  }>;
}

// Fall Risk Specific (exemplo de modelo especializado)
export interface FallRiskFactors extends RiskFactor {
  age?: number;
  historyOfFalls?: boolean;
  medicationCount?: number;
  balanceScore?: number;
  visionImpairment?: boolean;
  cognitiveImpairment?: boolean;
  mobilityAidUse?: boolean;
  environmentalHazards?: number;
}

