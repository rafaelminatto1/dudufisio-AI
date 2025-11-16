/**
 * Population Health Analytics Types
 * Tipos para Análise de Saúde da População
 */

// Tendência de saúde (para gráficos)
export interface HealthTrend {
  period: string;
  value: number;
  change: number;
  patientCount: number;
}

// Tipos de análise populacional
export enum PopulationMetricType {
  Demographics = 'demographics',
  ClinicalOutcomes = 'clinical_outcomes',
  TreatmentEffectiveness = 'treatment_effectiveness',
  ServiceUtilization = 'service_utilization',
  RiskDistribution = 'risk_distribution',
  Adherence = 'adherence',
  SatisfactionQuality = 'satisfaction_quality'
}

// Período de análise
export interface AnalysisPeriod {
  start: Date;
  end: Date;
  label: string;
  comparisonPeriod?: {
    start: Date;
    end: Date;
  };
}

// Filtros de população
export interface PopulationFilters {
  ageRange?: { min: number; max: number };
  gender?: ('M' | 'F' | 'other')[];
  conditions?: string[];
  treatmentTypes?: string[];
  therapists?: string[];
  status?: string[];
  riskLevels?: string[];
  location?: string[];
  insuranceType?: string[];
  customFilters?: Record<string, any>;
}

// Dados demográficos da população
export interface PopulationDemographics {
  totalPatients: number;
  activePatients: number;
  newPatients: number;
  inactivePatients: number;
  
  ageDistribution: {
    range: string; // ex: "18-25", "26-35"
    count: number;
    percentage: number;
  }[];
  
  genderDistribution: {
    gender: 'M' | 'F' | 'other';
    count: number;
    percentage: number;
  }[];
  
  geographicDistribution: {
    city: string;
    state: string;
    count: number;
    percentage: number;
  }[];
  
  insuranceDistribution: {
    type: 'private' | 'public' | 'none';
    count: number;
    percentage: number;
  }[];
}

// Distribuição de condições
export interface ConditionDistribution {
  condition: string;
  icd10Code?: string;
  count: number;
  percentage: number;
  averageTreatmentDuration: number; // dias
  averageSessionsRequired: number;
  successRate: number; // 0-1
  comorbidities: {
    condition: string;
    cooccurrenceRate: number; // 0-1
  }[];
  seasonalPattern?: {
    month: string;
    incidence: number;
  }[];
}

// Outcomes clínicos
export interface ClinicalOutcomes {
  period: AnalysisPeriod;
  
  overallImprovement: {
    metric: string;
    averageChange: number;
    unit: string;
    clinicallySignificantRate: number; // 0-1
  }[];
  
  successRate: number; // 0-1
  completionRate: number; // 0-1
  dropoutRate: number; // 0-1
  
  painReduction: {
    averageInitialPain: number;
    averageFinalPain: number;
    averageReduction: number;
    percentageReduction: number;
  };
  
  functionalImprovement: {
    metric: string;
    baselineAverage: number;
    finalAverage: number;
    improvement: number;
    percentImproved: number;
  }[];
  
  qualityOfLife: {
    metric: string;
    preScore: number;
    postScore: number;
    change: number;
  }[];
}

// Efetividade de tratamentos
export interface TreatmentEffectiveness {
  treatmentType: string;
  
  patientstreated: number;
  
  outcomes: {
    successRate: number; // 0-1
    averageImprovement: number;
    completionRate: number;
    dropoutRate: number;
    patientSatisfaction: number; // 0-10
  };
  
  timeline: {
    averageDuration: number; // dias
    medianDuration: number;
    averageSessions: number;
  };
  
  costEffectiveness: {
    averageCostPerSession: number;
    totalCostPerPatient: number;
    costPerSuccessfulOutcome: number;
  };
  
  comparisonToNorm?: {
    nationalAverage?: number;
    regionalAverage?: number;
    varianceFromNorm: number;
  };
  
  patientCharacteristics: {
    averageAge: number;
    genderDistribution: Record<string, number>;
    severityDistribution: Record<string, number>;
  };
}

// Utilização de serviços
export interface ServiceUtilization {
  period: AnalysisPeriod;
  
  appointmentMetrics: {
    totalScheduled: number;
    totalCompleted: number;
    totalCancelled: number;
    totalNoShows: number;
    attendanceRate: number; // 0-1
    cancellationRate: number; // 0-1
    noShowRate: number; // 0-1
  };
  
  capacityUtilization: {
    totalCapacity: number; // horas disponíveis
    usedCapacity: number; // horas utilizadas
    utilizationRate: number; // 0-1
    peakHours: { hour: number; utilizationRate: number }[];
    peakDays: { day: string; utilizationRate: number }[];
  };
  
  serviceTypes: {
    type: string;
    count: number;
    percentage: number;
    averageDuration: number;
    revenue: number;
  }[];
  
  therapistUtilization: {
    therapistId: string;
    therapistName: string;
    hoursWorked: number;
    patientsServed: number;
    utilizationRate: number;
    patientSatisfaction: number;
  }[];
}

// Distribuição de risco
export interface RiskDistribution {
  period: AnalysisPeriod;
  
  byRiskType: {
    riskType: string;
    lowRisk: number;
    moderateRisk: number;
    highRisk: number;
    criticalRisk: number;
    totalAssessed: number;
  }[];
  
  byCondition: {
    condition: string;
    averageRiskScore: number;
    highRiskPercentage: number;
    commonRiskFactors: string[];
  }[];
  
  trends: {
    date: Date;
    lowRisk: number;
    moderateRisk: number;
    highRisk: number;
    criticalRisk: number;
  }[];
  
  interventionImpact: {
    riskType: string;
    patientsIntervened: number;
    averageRiskReduction: number;
    successRate: number;
  }[];
}

// Adesão ao tratamento
export interface AdherenceMetrics {
  period: AnalysisPeriod;
  
  overallAdherence: {
    averageAttendanceRate: number; // 0-1
    completionRate: number; // 0-1
    onTimeCompletionRate: number; // 0-1
  };
  
  byTreatmentType: {
    treatmentType: string;
    adherenceRate: number;
    dropoutRate: number;
    averageSessionsAttended: number;
    averageSessionsPlanned: number;
  }[];
  
  byDemographic: {
    demographic: string;
    category: string;
    adherenceRate: number;
    count: number;
  }[];
  
  adherenceFactors: {
    factor: string;
    positiveImpact: boolean;
    effectSize: number; // -1 to 1
    significance: number; // p-value
  }[];
  
  trends: {
    date: Date;
    adherenceRate: number;
    dropoutRate: number;
  }[];
}

// Satisfação e qualidade
export interface SatisfactionQualityMetrics {
  period: AnalysisPeriod;
  
  patientSatisfaction: {
    averageScore: number; // 0-10
    nps: number; // Net Promoter Score (-100 to 100)
    responseRate: number; // 0-1
    
    byDimension: {
      dimension: string; // ex: "atendimento", "instalações", "resultados"
      averageScore: number;
      trend: 'improving' | 'stable' | 'declining';
    }[];
    
    distribution: {
      score: number;
      count: number;
      percentage: number;
    }[];
  };
  
  qualityIndicators: {
    indicator: string;
    value: number;
    target: number;
    unit: string;
    status: 'excellent' | 'good' | 'needs_improvement' | 'poor';
    trend: 'improving' | 'stable' | 'declining';
  }[];
  
  complaintAnalysis: {
    totalComplaints: number;
    complaintRate: number; // per 100 patients
    
    byCategory: {
      category: string;
      count: number;
      percentage: number;
      resolutionRate: number;
      averageResolutionTime: number; // dias
    }[];
    
    trends: {
      month: string;
      count: number;
      resolutionRate: number;
    }[];
  };
}

// Tendências epidemiológicas
export interface EpidemiologicalTrends {
  period: AnalysisPeriod;
  
  incidenceTrends: {
    condition: string;
    
    timeSeriesData: {
      date: Date;
      newCases: number;
      prevalence: number;
      incidenceRate: number; // per 1000 people
    }[];
    
    seasonality: {
      month: string;
      averageIncidence: number;
      peakSeason: boolean;
    }[];
    
    predictions: {
      date: Date;
      predictedCases: number;
      confidenceInterval: { lower: number; upper: number };
    }[];
  }[];
  
  outbreakDetection: {
    condition: string;
    currentCases: number;
    expectedCases: number;
    deviation: number;
    alertLevel: 'none' | 'watch' | 'warning' | 'alert';
    date: Date;
  }[];
  
  comorbidityNetworks: {
    condition: string;
    relatedConditions: {
      condition: string;
      cooccurrenceRate: number;
      relativeRisk: number;
    }[];
  }[];
}

// Análise de cohort
export interface CohortAnalysis {
  cohortDefinition: {
    name: string;
    criteria: PopulationFilters;
    size: number;
    startDate: Date;
    endDate?: Date;
  };
  
  demographics: PopulationDemographics;
  
  outcomes: {
    metric: string;
    baselineValue: number;
    currentValue: number;
    change: number;
    timePoints: {
      date: Date;
      value: number;
      count: number; // patients still in cohort
    }[];
  }[];
  
  retention: {
    timePoint: string; // ex: "1 month", "3 months"
    retained: number;
    retentionRate: number;
    dropped: number;
    dropoutReasons: Record<string, number>;
  }[];
  
  subgroupAnalysis: {
    subgroup: string;
    criteria: Record<string, any>;
    size: number;
    outcomes: Record<string, number>;
    comparisonToTotal: Record<string, number>;
  }[];
}

// Benchmarking
export interface BenchmarkComparison {
  metric: string;
  
  clinicValue: number;
  
  benchmarks: {
    level: 'national' | 'regional' | 'specialty' | 'size_category';
    value: number;
    percentile: number; // 0-100
    source: string;
    date: Date;
  }[];
  
  variance: {
    fromNational: number;
    fromRegional: number;
    fromTopQuartile: number;
  };
  
  interpretation: {
    status: 'above_average' | 'average' | 'below_average';
    message: string;
    recommendations: string[];
  };
}

// Dashboard de saúde da população
export interface PopulationHealthDashboard {
  period: AnalysisPeriod;
  filters: PopulationFilters;
  
  summary: {
    totalPatients: number;
    activePatients: number;
    newPatients: number;
    averageAge: number;
    mostCommonConditions: string[];
    overallSuccessRate: number;
    overallSatisfaction: number;
  };
  
  demographics: PopulationDemographics;
  conditionDistribution: ConditionDistribution[];
  clinicalOutcomes: ClinicalOutcomes;
  treatmentEffectiveness: TreatmentEffectiveness[];
  serviceUtilization: ServiceUtilization;
  riskDistribution: RiskDistribution;
  adherenceMetrics: AdherenceMetrics;
  satisfactionQuality: SatisfactionQualityMetrics;
  epidemiologicalTrends: EpidemiologicalTrends;
  
  insights: PopulationInsight[];
  recommendations: PopulationRecommendation[];
}

// Insights da população
export interface PopulationInsight {
  id: string;
  type: 'positive' | 'negative' | 'neutral' | 'alert';
  category: PopulationMetricType;
  title: string;
  description: string;
  metrics: {
    name: string;
    value: number;
    change?: number;
    trend?: 'up' | 'down' | 'stable';
  }[];
  impact: 'high' | 'medium' | 'low';
  confidence: number; // 0-1
  generatedAt: Date;
}

// Recomendações para a população
export interface PopulationRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  rationale: string;
  
  targetPopulation: {
    description: string;
    size: number;
    criteria: PopulationFilters;
  };
  
  expectedImpact: {
    metric: string;
    expectedChange: number;
    timeframe: string;
    confidence: number;
  }[];
  
  implementation: {
    steps: string[];
    resources: string[];
    estimatedCost?: number;
    estimatedTime?: string;
  };
  
  success_metrics: {
    metric: string;
    target: number;
    unit: string;
  }[];
}

// Relatório de saúde da população
export interface PopulationHealthReport {
  id: string;
  title: string;
  period: AnalysisPeriod;
  filters: PopulationFilters;
  
  executiveSummary: {
    keyFindings: string[];
    criticalIssues: string[];
    opportunities: string[];
  };
  
  sections: {
    title: string;
    content: string;
    charts: {
      type: string;
      data: any;
      title: string;
    }[];
    insights: PopulationInsight[];
  }[];
  
  recommendations: PopulationRecommendation[];
  
  appendices: {
    title: string;
    content: string;
    data?: any;
  }[];
  
  generatedAt: Date;
  generatedBy: string;
  format: 'html' | 'pdf' | 'excel';
}

// Analytics em tempo real
export interface RealTimePopulationMetrics {
  timestamp: Date;
  
  currentOccupancy: {
    activeAppointments: number;
    capacity: number;
    utilizationRate: number;
  };
  
  todayMetrics: {
    scheduledAppointments: number;
    completedAppointments: number;
    noShows: number;
    cancellations: number;
  };
  
  waitingList: {
    total: number;
    urgent: number;
    averageWaitTime: number; // dias
  };
  
  alerts: {
    type: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    count: number;
  }[];
}

// Configuração de análise
export interface AnalysisConfiguration {
  id: string;
  name: string;
  description: string;
  
  metrics: PopulationMetricType[];
  filters: PopulationFilters;
  period: AnalysisPeriod;
  
  benchmarking: {
    enabled: boolean;
    sources: string[];
  };
  
  alerts: {
    enabled: boolean;
    thresholds: {
      metric: string;
      threshold: number;
      condition: 'above' | 'below' | 'equal';
      severity: 'info' | 'warning' | 'critical';
    }[];
  };
  
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    recipients: string[];
    format: 'dashboard' | 'email' | 'pdf';
  };
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Exportação de dados
export interface DataExport {
  id: string;
  type: 'demographics' | 'outcomes' | 'full_report' | 'custom';
  format: 'csv' | 'excel' | 'json' | 'pdf';
  filters: PopulationFilters;
  period: AnalysisPeriod;
  
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  
  fileUrl?: string;
  fileSize?: number;
  recordCount?: number;
  
  requestedBy: string;
  requestedAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
}

