/**
 * Predictive Analytics Types
 * Tipos para Análise Preditiva de Resultados de Pacientes
 */

// Tipos de predição
export enum PredictionType {
  TreatmentOutcome = 'treatment_outcome',
  RecoveryTime = 'recovery_time',
  OptimalFrequency = 'optimal_frequency',
  RiskOfComplications = 'risk_of_complications',
  Adherence = 'adherence',
  PatientSatisfaction = 'patient_satisfaction',
  CostEffectiveness = 'cost_effectiveness',
  FunctionalImprovement = 'functional_improvement'
}

// Algoritmos de ML
export enum MLAlgorithm {
  LinearRegression = 'linear_regression',
  LogisticRegression = 'logistic_regression',
  RandomForest = 'random_forest',
  NeuralNetwork = 'neural_network',
  GradientBoosting = 'gradient_boosting',
  SVM = 'svm',
  KNN = 'knn',
  DecisionTree = 'decision_tree'
}

// Modelo preditivo
export interface PredictiveModel {
  id: string;
  name: string;
  version: string;
  predictionType: PredictionType;
  algorithm: MLAlgorithm;
  
  // Performance
  performance: {
    accuracy: number; // 0-1
    precision: number; // 0-1
    recall: number; // 0-1
    f1Score: number; // 0-1
    auc: number; // Area Under Curve (0-1)
    rmse?: number; // Root Mean Square Error (para regressão)
    mae?: number; // Mean Absolute Error
  };
  
  // Dados de treinamento
  trainingData: {
    sampleSize: number;
    features: string[];
    trainDate: Date;
    validationSplit: number; // 0-1
    testSplit: number; // 0-1
  };
  
  // Features (variáveis preditoras)
  features: ModelFeature[];
  
  // Calibração
  lastCalibrated: Date;
  nextCalibration: Date;
  calibrationFrequency: 'monthly' | 'quarterly' | 'annually';
  
  // Status
  isActive: boolean;
  isProduction: boolean;
  
  // Metadados
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  
  // Explicabilidade
  interpretability: {
    featureImportance: { feature: string; importance: number }[];
    shap_values?: boolean;
    lime_available?: boolean;
  };
}

// Feature do modelo
export interface ModelFeature {
  name: string;
  type: 'numeric' | 'categorical' | 'boolean' | 'date';
  description: string;
  source: 'patient_demographics' | 'clinical_data' | 'treatment_history' | 'behavioral' | 'environmental';
  
  importance: number; // 0-1
  required: boolean;
  
  // Para features numéricas
  normalization?: 'standard' | 'minmax' | 'robust' | 'none';
  
  // Para features categóricas
  encoding?: 'one_hot' | 'label' | 'ordinal';
  categories?: string[];
  
  // Valores
  defaultValue?: any;
  missingValueStrategy?: 'mean' | 'median' | 'mode' | 'forward_fill' | 'drop';
}

// Predição de resultado de tratamento
export interface TreatmentOutcomePrediction {
  id: string;
  patientId: string;
  treatmentPlanId: string;
  modelId: string;
  modelVersion: string;
  
  // Predição
  prediction: {
    outcome: 'excellent' | 'good' | 'fair' | 'poor';
    successProbability: number; // 0-1
    
    // Detalhes por métrica
    metrics: {
      metric: string;
      predictedValue: number;
      confidenceInterval: {
        lower: number;
        upper: number;
        confidence: number; // ex: 0.95 para 95% CI
      };
      unit: string;
    }[];
  };
  
  // Otimizações sugeridas
  recommendations: {
    recommendation: string;
    expectedImpact: number; // aumento % na probabilidade de sucesso
    rationale: string;
    evidenceLevel: string;
  }[];
  
  // Fatores de risco
  riskFactors: {
    factor: string;
    impact: 'positive' | 'negative';
    magnitude: number; // 0-1
    modifiable: boolean;
  }[];
  
  // Fatores protetores
  protectiveFactors: {
    factor: string;
    strength: number; // 0-1
  }[];
  
  // Confiança
  confidence: number; // 0-1
  modelCertainty: 'very_high' | 'high' | 'medium' | 'low';
  
  // Comparação
  similarCases: {
    caseId: string;
    similarity: number; // 0-1
    actualOutcome: string;
  }[];
  
  // Metadados
  predictedAt: Date;
  predictedBy: string;
  
  // Validação (após tratamento)
  actualOutcome?: {
    outcome: string;
    metrics: { metric: string; value: number }[];
    assessedAt: Date;
  };
  
  predictionAccurate?: boolean;
  accuracyScore?: number;
}

// Predição de frequência ótima
export interface OptimalFrequencyPrediction {
  id: string;
  patientId: string;
  treatmentType: string;
  
  // Predição
  recommendation: {
    sessionsPerWeek: number;
    totalSessions: number;
    duration: number; // semanas
    
    confidenceLevel: number; // 0-1
    expectedOutcome: number; // score de outcome esperado
  };
  
  // Análise de alternativas
  alternatives: {
    sessionsPerWeek: number;
    totalSessions: number;
    expectedOutcome: number;
    cost: number;
    patientBurden: number; // 1-10
    effectivenessRatio: number; // outcome/cost
  }[];
  
  // Fatores considerados
  factors: {
    factor: string;
    value: any;
    influence: number; // -1 to 1
  }[];
  
  // Justificativa
  rationale: string;
  evidenceBase: string[];
  
  predictedAt: Date;
  predictedBy: string;
}

// Predição de tempo de recuperação
export interface RecoveryTimePrediction {
  id: string;
  patientId: string;
  condition: string;
  
  // Predição
  estimatedRecoveryTime: {
    pessimistic: number; // dias
    realistic: number; // dias
    optimistic: number; // dias
    
    confidenceInterval: {
      lower: number;
      upper: number;
      confidence: number; // 0.95
    };
  };
  
  // Fases previstas
  phases: {
    phase: string;
    startDay: number;
    endDay: number;
    duration: number;
    keyMilestones: string[];
  }[];
  
  // Fatores que influenciam
  acceleratingFactors: {
    factor: string;
    impact: number; // dias economizados
  }[];
  
  delayingFactors: {
    factor: string;
    impact: number; // dias adicionados
  }[];
  
  // Comparação
  averageRecoveryTime: number;
  percentilePrediction: number; // 0-100
  
  predictedAt: Date;
  modelId: string;
}

// Predição de risco de complicação
export interface ComplicationRiskPrediction {
  id: string;
  patientId: string;
  treatmentType: string;
  
  // Risco geral
  overallRisk: {
    probability: number; // 0-1
    level: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  };
  
  // Complicações específicas
  specificRisks: {
    complication: string;
    probability: number;
    severity: 'minor' | 'moderate' | 'major' | 'severe';
    timeWindow: string; // quando é mais provável
    
    preventiveMeasures: string[];
    warningsSigns: string[];
  }[];
  
  // Fatores de risco
  riskFactors: {
    factor: string;
    contribution: number; // % de contribuição para o risco
    modifiable: boolean;
    interventions?: string[];
  }[];
  
  // Recomendações
  recommendations: {
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
    rationale: string;
    expectedRiskReduction: number; // %
  }[];
  
  predictedAt: Date;
  modelId: string;
}

// Predição de adesão
export interface AdherencePrediction {
  id: string;
  patientId: string;
  
  // Predição
  predictedAdherenceRate: number; // 0-1
  adherenceLevel: 'excellent' | 'good' | 'moderate' | 'poor';
  
  // Probabilidade de eventos
  dropoutRisk: {
    probability: number; // 0-1
    timeframe: string;
    criticalPeriod: { start: number; end: number }; // dias de tratamento
  };
  
  noShowRisk: {
    probability: number; // 0-1
    likelyScenarios: string[];
  };
  
  // Fatores
  positiveFactors: {
    factor: string;
    strength: number; // 0-1
  }[];
  
  negativeFactors: {
    factor: string;
    impact: number; // 0-1
    addressable: boolean;
  }[];
  
  // Intervenções recomendadas
  interventions: {
    intervention: string;
    timing: string;
    expectedImpact: number; // aumento % na adesão
    cost: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
  }[];
  
  // Estratégia personalizada
  personalizedStrategy: {
    communicationFrequency: string;
    preferredChannel: string;
    motivationalApproach: string;
    incentives: string[];
  };
  
  predictedAt: Date;
  confidence: number;
}

// Resultado da predição
export interface PredictionResult {
  id: string;
  patientId: string;
  predictionType: PredictionType;
  modelId: string;
  
  // Resultado
  prediction: any; // específico por tipo
  confidence: number; // 0-1
  
  // Input features usadas
  inputFeatures: {
    feature: string;
    value: any;
  }[];
  
  // Explicação
  explanation: {
    topFactors: {
      factor: string;
      contribution: number; // -1 to 1
      direction: 'positive' | 'negative';
    }[];
    
    visualExplanation?: string; // URL para gráfico SHAP ou similar
    textExplanation: string;
  };
  
  // Metadados
  predictedAt: Date;
  predictedBy?: string;
  
  // Validação (após outcome real)
  actualOutcome?: any;
  predictionError?: number;
  wasAccurate?: boolean;
}

// Analytics de predições
export interface PredictionAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  
  // Volume
  totalPredictions: number;
  predictionsByType: {
    type: PredictionType;
    count: number;
    averageConfidence: number;
  }[];
  
  // Acurácia (para predições validadas)
  validatedPredictions: number;
  overallAccuracy: number;
  
  accuracyByType: {
    type: PredictionType;
    validated: number;
    accurate: number;
    accuracy: number;
    mae?: number;
  }[];
  
  // Impacto
  clinicalImpact: {
    decisionsInfluenced: number;
    protocolsAdjusted: number;
    complicationsAvoided: number;
    outcomeImprovement: number; // %
  };
  
  // Uso
  adoptionRate: number; // 0-1
  therapistEngagement: {
    therapistId: string;
    predictionsRequested: number;
    predictionsActedUpon: number;
    feedback: 'positive' | 'neutral' | 'negative' | null;
  }[];
  
  // Tendências
  trends: {
    date: Date;
    predictions: number;
    accuracy: number;
    confidence: number;
  }[];
}

// Configuração de predições
export interface PredictionConfig {
  id: string;
  
  // Modelos ativos
  activeModels: {
    predictionType: PredictionType;
    modelId: string;
    enabled: boolean;
    autoTrigger: boolean;
    triggerConditions?: {
      condition: string;
      value: any;
    }[];
  }[];
  
  // Triggers automáticos
  autoGeneratePredictions: boolean;
  triggers: {
    event: 'new_patient' | 'treatment_plan_created' | 'phase_change' | 'poor_progress';
    predictionTypes: PredictionType[];
    delay?: number; // minutos
  }[];
  
  // Apresentação
  displaySettings: {
    showConfidenceIntervals: boolean;
    showExplanations: boolean;
    highlightRiskFactors: boolean;
    compareToSimilarCases: boolean;
  };
  
  // Notificações
  notifications: {
    notifyOnLowConfidence: boolean;
    notifyOnHighRisk: boolean;
    notifyOnOutlier: boolean;
    recipients: string[];
  };
  
  updatedAt: Date;
}

// Feedback de predição
export interface PredictionFeedback {
  id: string;
  predictionId: string;
  
  // Feedback
  helpful: boolean;
  accuracy?: 'very_accurate' | 'accurate' | 'somewhat_accurate' | 'inaccurate';
  actionTaken: boolean;
  
  comments?: string;
  
  // Resultado
  actualOutcome?: any;
  varianceFromPrediction?: number;
  
  providedBy: string;
  providedAt: Date;
}

// Ensemble prediction (múltiplos modelos)
export interface EnsemblePrediction {
  id: string;
  patientId: string;
  predictionType: PredictionType;
  
  // Predições individuais
  modelPredictions: {
    modelId: string;
    modelName: string;
    prediction: any;
    confidence: number;
    weight: number; // peso no ensemble
  }[];
  
  // Predição combinada
  ensemblePrediction: any;
  ensembleConfidence: number;
  
  // Variância entre modelos
  modelAgreement: number; // 0-1 (quanto os modelos concordam)
  standardDeviation?: number;
  
  // Decisão
  recommendedAction: string;
  
  predictedAt: Date;
}

// Simulação de cenários
export interface TreatmentScenario {
  id: string;
  patientId: string;
  scenarioName: string;
  
  // Parâmetros do cenário
  parameters: {
    sessionsPerWeek: number;
    totalWeeks: number;
    treatmentModalities: string[];
    exerciseIntensity: 'low' | 'moderate' | 'high';
    homeExerciseProgram: boolean;
  };
  
  // Predições para este cenário
  predictions: {
    outcome: {
      successProbability: number;
      expectedImprovement: number;
      unit: string;
    };
    
    recovery: {
      estimatedDays: number;
      confidenceInterval: [number, number];
    };
    
    adherence: {
      predictedRate: number;
      dropoutRisk: number;
    };
    
    cost: {
      estimatedTotal: number;
      costPerOutcome: number;
    };
  };
  
  // Comparação com baseline
  comparisonToBaseline: {
    metric: string;
    baselineValue: number;
    scenarioValue: number;
    difference: number;
    percentChange: number;
  }[];
  
  // Ranking
  optimizationScore: number; // 0-100 (outcome vs cost vs burden)
  
  createdAt: Date;
}

// Recomendações baseadas em ML
export interface MLRecommendation {
  id: string;
  patientId: string;
  
  type: 'treatment_adjustment' | 'frequency_change' | 'exercise_modification' | 
        'risk_mitigation' | 'discharge_planning';
  
  // Recomendação
  title: string;
  description: string;
  rationale: string;
  
  // Base da recomendação
  basedOn: {
    modelId: string;
    predictionType: PredictionType;
    keyFindings: string[];
  };
  
  // Impacto esperado
  expectedImpact: {
    metric: string;
    currentValue: number;
    predictedValue: number;
    improvement: number;
    confidence: number;
  }[];
  
  // Implementação
  implementation: {
    immediateActions: string[];
    timeframe: string;
    difficulty: 'easy' | 'moderate' | 'complex';
    requiredResources: string[];
  };
  
  // Monitoramento
  successMetrics: {
    metric: string;
    target: number;
    timeframe: string;
  }[];
  
  // Status
  status: 'suggested' | 'accepted' | 'implemented' | 'rejected' | 'monitoring';
  acceptedBy?: string;
  acceptedAt?: Date;
  implementedAt?: Date;
  
  // Resultado
  result?: {
    successful: boolean;
    actualImpact: { metric: string; value: number }[];
    notes?: string;
  };
  
  createdAt: Date;
}

// Cenário de resultado (para visualização de predições)
export interface OutcomeScenario {
  scenarioName: string;
  description: string;
  probability: number; // 0-1
  estimatedTimeframe: string;
  expectedOutcome: string;
  assumptions?: string[];
}

// Dashboard de análise preditiva
export interface PredictiveAnalyticsDashboard {
  patient: {
    id: string;
    name: string;
    age: number;
    condition: string;
  };
  
  // Predições ativas
  activePredictions: {
    type: PredictionType;
    prediction: any;
    confidence: number;
    createdAt: Date;
    status: 'current' | 'outdated' | 'validated';
  }[];
  
  // Recomendações
  activeRecommendations: MLRecommendation[];
  
  // Cenários comparados
  scenarios: TreatmentScenario[];
  optimalScenario?: TreatmentScenario;
  
  // Histórico de acurácia
  modelPerformance: {
    model: string;
    predictions: number;
    validated: number;
    accuracy: number;
  }[];
  
  // Insights
  insights: {
    type: 'opportunity' | 'risk' | 'optimization';
    message: string;
    priority: 'high' | 'medium' | 'low';
    actionable: boolean;
  }[];
}

