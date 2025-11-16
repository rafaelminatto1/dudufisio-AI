/**
 * Quality Assurance and Compliance Types
 * Tipos para Dashboard de Garantia de Qualidade e Conformidade
 */

// Tipos de métricas de qualidade
export enum QualityMetricType {
  ClinicalOutcome = 'clinical_outcome',
  PatientSafety = 'patient_safety',
  PatientSatisfaction = 'patient_satisfaction',
  Compliance = 'compliance',
  Documentation = 'documentation',
  ProcessEfficiency = 'process_efficiency',
  StaffPerformance = 'staff_performance',
  ResourceUtilization = 'resource_utilization'
}

// Status de conformidade
export enum ComplianceStatus {
  Compliant = 'compliant',
  PartiallyCompliant = 'partially_compliant',
  NonCompliant = 'non_compliant',
  UnderReview = 'under_review',
  ActionRequired = 'action_required'
}

// Severidade de não conformidade
export enum NonComplianceSeverity {
  Critical = 'critical',
  Major = 'major',
  Minor = 'minor',
  Observation = 'observation'
}

// Frameworks de conformidade
export enum ComplianceFramework {
  COFFITO = 'COFFITO',      // Conselho Federal de Fisioterapia
  LGPD = 'LGPD',            // Lei Geral de Proteção de Dados
  ISO9001 = 'ISO9001',      // Sistema de Gestão da Qualidade
  ANS = 'ANS',              // Agência Nacional de Saúde Suplementar
  ANVISA = 'ANVISA',        // Agência Nacional de Vigilância Sanitária
  InternalPolicy = 'internal_policy'
}

// Métricas de qualidade
export interface QualityMetric {
  id: string;
  name: string;
  type: QualityMetricType;
  description: string;
  
  // Valores
  currentValue: number;
  targetValue: number;
  unit: string;
  
  // Status
  status: 'excellent' | 'good' | 'acceptable' | 'needs_improvement' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
  
  // Contexto
  benchmark?: {
    national?: number;
    regional?: number;
    industry?: number;
  };
  
  // Histórico
  historicalData: {
    date: Date;
    value: number;
  }[];
  
  // Metadados
  lastUpdated: Date;
  dataSource: string;
  calculationMethod: string;
  
  // Ações
  actionsRequired: boolean;
  recommendations?: string[];
}

// Indicadores de qualidade clínica
export interface ClinicalQualityIndicator {
  id: string;
  name: string;
  category: string;
  
  // Definição
  numerator: string;
  denominator: string;
  calculation: string;
  
  // Valores
  value: number;
  target: number;
  threshold: {
    excellent: number;
    good: number;
    acceptable: number;
  };
  
  // Análise
  performance: 'above_target' | 'at_target' | 'below_target' | 'critical';
  variance: number;
  
  // Detalhes
  period: {
    start: Date;
    end: Date;
  };
  sampleSize: number;
  
  // Contexto
  evidenceLevel: string;
  references: string[];
  
  // Ações
  improvementPlan?: QualityImprovementPlan;
}

// Plano de melhoria de qualidade
export interface QualityImprovementPlan {
  id: string;
  indicatorId: string;
  title: string;
  description: string;
  
  // Gap analysis
  currentState: string;
  desiredState: string;
  gap: string;
  rootCauses: string[];
  
  // Plano
  objectives: {
    objective: string;
    measurable: boolean;
    metric: string;
    target: number;
    deadline: Date;
  }[];
  
  interventions: {
    intervention: string;
    type: 'process' | 'training' | 'technology' | 'policy';
    owner: string;
    startDate: Date;
    endDate: Date;
    status: 'planned' | 'in_progress' | 'completed' | 'delayed';
    resources: string[];
    estimatedCost?: number;
  }[];
  
  // Monitoramento
  milestones: {
    milestone: string;
    date: Date;
    achieved: boolean;
    notes?: string;
  }[];
  
  // Resultados
  results?: {
    metric: string;
    baseline: number;
    current: number;
    improvement: number;
    sustained: boolean;
  }[];
  
  // Status
  status: 'draft' | 'approved' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
}

// Requisito de conformidade
export interface ComplianceRequirement {
  id: string;
  framework: ComplianceFramework;
  category: string;
  
  // Requisito
  code: string;
  title: string;
  description: string;
  mandatory: boolean;
  
  // Compliance
  status: ComplianceStatus;
  complianceLevel: number; // 0-100%
  
  // Evidências
  evidences: {
    id: string;
    type: 'document' | 'process' | 'record' | 'audit';
    description: string;
    fileUrl?: string;
    verifiedBy?: string;
    verifiedAt?: Date;
  }[];
  
  // Gaps
  gaps?: {
    description: string;
    severity: NonComplianceSeverity;
    actionPlan: string;
    responsible: string;
    dueDate: Date;
    status: 'open' | 'in_progress' | 'resolved';
  }[];
  
  // Auditoria
  lastAuditDate?: Date;
  nextAuditDate: Date;
  auditor?: string;
  
  // Metadados
  source: string;
  effectiveDate: Date;
  reviewDate: Date;
}

// Auditoria de qualidade
export interface QualityAudit {
  id: string;
  type: 'internal' | 'external' | 'regulatory' | 'certification';
  scope: string[];
  
  // Planejamento
  plannedDate: Date;
  auditor: string;
  auditorOrganization?: string;
  
  // Execução
  actualDate?: Date;
  duration?: number; // horas
  
  // Áreas auditadas
  areasAudited: {
    area: string;
    standards: string[];
    findings: AuditFinding[];
    score?: number;
  }[];
  
  // Resultados
  overallScore?: number;
  certification?: {
    granted: boolean;
    certificateNumber?: string;
    validUntil?: Date;
    conditions?: string[];
  };
  
  // Findings
  totalFindings: number;
  criticalFindings: number;
  majorFindings: number;
  minorFindings: number;
  observations: number;
  
  // Follow-up
  correctiveActions: CorrectiveAction[];
  followUpDate?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'follow_up_required';
  
  // Documentação
  reportUrl?: string;
  attachments?: string[];
  
  createdAt: Date;
  completedAt?: Date;
}

// Achado de auditoria
export interface AuditFinding {
  id: string;
  auditId: string;
  
  // Classificação
  severity: NonComplianceSeverity;
  category: string;
  requirement: string;
  
  // Descrição
  finding: string;
  evidence: string;
  impact: string;
  rootCause?: string;
  
  // Resposta
  correctiveActionRequired: boolean;
  correctiveActionId?: string;
  
  // Status
  status: 'open' | 'action_planned' | 'in_progress' | 'resolved' | 'verified';
  
  identifiedDate: Date;
  resolvedDate?: Date;
}

// Ação corretiva
export interface CorrectiveAction {
  id: string;
  findingId: string;
  
  // Problema
  problem: string;
  rootCause: string;
  impact: string;
  
  // Ação
  action: string;
  preventiveAction: string;
  responsible: string;
  
  // Timeline
  createdDate: Date;
  dueDate: Date;
  completedDate?: Date;
  
  // Implementação
  implementationSteps: {
    step: string;
    responsible: string;
    deadline: Date;
    completed: boolean;
    completedDate?: Date;
    evidence?: string;
  }[];
  
  // Verificação
  verified: boolean;
  verifiedBy?: string;
  verifiedDate?: Date;
  effective: boolean;
  effectivenessNotes?: string;
  
  // Status
  status: 'planned' | 'in_progress' | 'completed' | 'verified' | 'closed';
  
  // Follow-up
  followUpRequired: boolean;
  followUpDate?: Date;
}

// Dashboard de garantia de qualidade
export interface QualityAssuranceDashboard {
  period: {
    start: Date;
    end: Date;
  };
  
  // Overview
  summary: {
    overallQualityScore: number;
    complianceRate: number;
    activeNonCompliances: number;
    criticalIssues: number;
    openCorrectiveActions: number;
    upcomingAudits: number;
  };
  
  // Métricas de qualidade
  qualityMetrics: QualityMetric[];
  clinicalIndicators: ClinicalQualityIndicator[];
  
  // Conformidade
  complianceOverview: {
    framework: ComplianceFramework;
    totalRequirements: number;
    compliant: number;
    partiallyCompliant: number;
    nonCompliant: number;
    complianceRate: number;
    criticalGaps: number;
  }[];
  
  complianceRequirements: ComplianceRequirement[];
  
  // Auditorias
  recentAudits: QualityAudit[];
  upcomingAudits: QualityAudit[];
  
  // Ações
  correctiveActions: CorrectiveAction[];
  improvementPlans: QualityImprovementPlan[];
  
  // Análises
  trends: QualityTrend[];
  riskAreas: RiskArea[];
  
  // Recomendações
  recommendations: QualityRecommendation[];
  
  // Alertas
  alerts: QualityAlert[];
}

// Tendência de qualidade
export interface QualityTrend {
  metric: string;
  category: QualityMetricType;
  
  timeSeriesData: {
    date: Date;
    value: number;
    target: number;
  }[];
  
  trend: 'improving' | 'stable' | 'declining';
  changeRate: number; // % change per period
  significance: 'significant' | 'not_significant';
  
  analysis: string;
  factors: string[];
}

// Área de risco
export interface RiskArea {
  id: string;
  area: string;
  category: string;
  
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  
  issues: {
    issue: string;
    severity: NonComplianceSeverity;
    impact: string;
  }[];
  
  indicators: {
    metric: string;
    currentValue: number;
    targetValue: number;
    variance: number;
  }[];
  
  recommendations: string[];
  
  priority: number;
  assignedTo?: string;
}

// Recomendação de qualidade
export interface QualityRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  
  title: string;
  description: string;
  rationale: string;
  
  // Impacto
  expectedImpact: {
    metric: string;
    currentValue: number;
    expectedValue: number;
    improvement: number;
  }[];
  
  // Implementação
  implementationSteps: string[];
  resources: string[];
  estimatedCost?: number;
  estimatedTime: string;
  
  // Priorização
  urgency: number; // 1-10
  feasibility: number; // 1-10
  impact: number; // 1-10
  priorityScore: number;
  
  // Status
  status: 'proposed' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  assignedTo?: string;
  
  createdAt: Date;
  createdBy: string;
}

// Alerta de qualidade
export interface QualityAlert {
  id: string;
  type: 'metric_threshold' | 'compliance_gap' | 'audit_finding' | 'pattern_detected';
  severity: 'critical' | 'high' | 'medium' | 'low';
  
  title: string;
  description: string;
  
  // Contexto
  relatedMetric?: string;
  relatedRequirement?: string;
  relatedAudit?: string;
  
  // Valores
  currentValue?: number;
  thresholdValue?: number;
  
  // Ações
  actionRequired: boolean;
  suggestedActions: string[];
  
  // Status
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: string;
  
  triggeredAt: Date;
  expiresAt?: Date;
}

// Relatório de qualidade
export interface QualityReport {
  id: string;
  title: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'audit' | 'custom';
  
  period: {
    start: Date;
    end: Date;
  };
  
  // Conteúdo
  executiveSummary: string;
  
  sections: {
    title: string;
    content: string;
    metrics: QualityMetric[];
    charts: {
      type: string;
      data: any;
      title: string;
    }[];
  }[];
  
  // Análise
  keyFindings: string[];
  achievements: string[];
  challenges: string[];
  recommendations: string[];
  
  // Anexos
  appendices: {
    title: string;
    type: string;
    content: string;
    fileUrl?: string;
  }[];
  
  // Status
  status: 'draft' | 'review' | 'approved' | 'published';
  
  generatedAt: Date;
  generatedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  
  fileUrl?: string;
}

// Configuração de monitoramento
export interface QualityMonitoringConfig {
  id: string;
  name: string;
  description: string;
  
  // Métricas monitoradas
  metrics: {
    metricId: string;
    metricName: string;
    threshold: {
      critical: number;
      warning: number;
      target: number;
    };
    frequency: 'real_time' | 'daily' | 'weekly' | 'monthly';
    alerts: {
      enabled: boolean;
      recipients: string[];
      channels: ('email' | 'sms' | 'in_app')[];
    };
  }[];
  
  // Conformidade
  complianceChecks: {
    framework: ComplianceFramework;
    requirements: string[];
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    autoVerify: boolean;
  }[];
  
  // Relatórios
  reporting: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    recipients: string[];
    format: 'email' | 'pdf' | 'dashboard';
    includeMetrics: string[];
  };
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Benchmarking de qualidade
export interface QualityBenchmark {
  metric: string;
  category: string;
  
  clinicValue: number;
  
  benchmarks: {
    level: 'top_quartile' | 'national_average' | 'regional_average' | 'specialty_average';
    value: number;
    source: string;
    date: Date;
  }[];
  
  percentile: number; // 0-100
  
  gap: {
    toTopQuartile: number;
    toNationalAverage: number;
  };
  
  interpretation: string;
  recommendations: string[];
}

// Certificação de qualidade
export interface QualityCertification {
  id: string;
  certificationBody: string;
  certificationType: string;
  standard: string;
  
  // Status
  status: 'not_applied' | 'application_in_progress' | 'active' | 'expired' | 'suspended' | 'revoked';
  
  // Datas
  applicationDate?: Date;
  grantedDate?: Date;
  expiryDate?: Date;
  
  // Certificado
  certificateNumber?: string;
  certificateUrl?: string;
  
  // Condições
  conditions?: string[];
  restrictions?: string[];
  
  // Manutenção
  surveillanceAudits: {
    date: Date;
    outcome: 'passed' | 'conditional' | 'failed';
    findings: number;
    notes?: string;
  }[];
  
  nextSurveillanceDate?: Date;
  
  // Custos
  applicationCost?: number;
  annualCost?: number;
  
  // Benefícios
  benefits: string[];
}

// Programa de qualidade
export interface QualityProgram {
  id: string;
  name: string;
  description: string;
  
  // Objetivos
  objectives: string[];
  scope: string[];
  
  // Estrutura
  leadership: {
    qualityManager: string;
    committee: string[];
  };
  
  // Processos
  processes: {
    process: string;
    owner: string;
    description: string;
    documentation: string[];
  }[];
  
  // Métricas
  keyMetrics: string[];
  
  // Treinamento
  trainingPrograms: {
    program: string;
    audience: string;
    frequency: string;
    lastDelivered?: Date;
    nextScheduled?: Date;
  }[];
  
  // Revisão
  reviewFrequency: 'monthly' | 'quarterly' | 'annually';
  lastReview?: Date;
  nextReview: Date;
  
  // Status
  status: 'active' | 'under_review' | 'suspended';
  
  establishedDate: Date;
  updatedAt: Date;
}

