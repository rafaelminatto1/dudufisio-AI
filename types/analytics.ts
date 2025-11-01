export interface Prediction {
  id: string;
  type: 'demand' | 'revenue' | 'cancellation' | 'churn';
  value: number;
  confidence: number; // 0-100
  confidenceInterval?: {
    lower: number;
    upper: number;
  };
  factors: string[];
  predictedAt: Date;
  horizon: number; // days
  metadata?: Record<string, any>;
}

export interface Recommendation {
  id: string;
  type: 'scheduling' | 'pricing' | 'optimization' | 'upsell' | 'retention';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: {
    metric: string; // e.g., 'revenue', 'occupancy'
    estimatedChange: number; // % or absolute value
    confidence: number; // 0-100
  };
  actions: RecommendationAction[];
  createdAt: Date;
  expiresAt?: Date;
  status: 'active' | 'applied' | 'dismissed' | 'expired';
}

export interface RecommendationAction {
  id: string;
  label: string;
  description?: string;
  actionType: 'navigate' | 'execute' | 'external';
  actionData: any;
}

export interface Insight {
  id: string;
  category: 'pattern' | 'anomaly' | 'trend' | 'opportunity' | 'risk';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'success' | 'critical';
  data: {
    metric: string;
    currentValue: number;
    previousValue?: number;
    changePercent?: number;
  };
  visualizations?: {
    type: 'chart' | 'heatmap' | 'table';
    data: any;
  }[];
  createdAt: Date;
  isRead: boolean;
}

export interface ChurnPrediction {
  patientId: string;
  patientName: string;
  churnRisk: number; // 0-100
  factors: {
    factor: string;
    impact: number; // 0-100
  }[];
  recommendedActions: string[];
  predictedAt: Date;
}

export interface DemandForecast {
  date: Date;
  predictedAppointments: number;
  confidence: number;
  seasonalFactor: number;
  trendFactor: number;
}

export interface PricingRecommendation {
  serviceType: string;
  currentPrice: number;
  recommendedPrice: number;
  reasoning: string[];
  expectedImpact: {
    revenue: number;
    demand: number;
  };
}

export interface OptimizationSuggestion {
  type: 'schedule' | 'resource' | 'workflow';
  title: string;
  description: string;
  estimatedBenefit: string;
  difficulty: 'easy' | 'medium' | 'hard';
  steps: string[];
}

