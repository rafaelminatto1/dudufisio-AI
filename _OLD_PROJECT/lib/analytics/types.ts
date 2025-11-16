/**
 * Core types for the Business Intelligence system
 */

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ETLResult {
  success: boolean;
  recordsProcessed: number;
  duration: number;
  warnings: string[];
  errors: string[];
  timestamp: Date;
}

export interface ExtractionResult {
  table: string;
  recordsExtracted: number;
  lastExtraction: Date;
  status: 'success' | 'error' | 'warning';
  data: Record<string, any>[];
}

export interface TransformationResult {
  recordsTransformed: number;
  status: 'success' | 'error' | 'warning';
  data: Record<string, any>[];
}

export interface LoadResult {
  recordsLoaded: number;
  status: 'success' | 'error' | 'warning';
  targetTable: string;
}

// KPI Types
export interface FinancialKPIs {
  totalRevenue: number;
  revenueGrowth: number;
  payingPatients: number;
  avgTransactionValue: number;
  collectionRate: number;
  overdueRate: number;
  period: DateRange;
}

export interface OperationalKPIs {
  totalAppointments: number;
  appointmentGrowth: number;
  noShowRate: number;
  cancellationRate: number;
  avgSessionDuration: number;
  therapistUtilization: number;
  period: DateRange;
}

export interface ClinicalKPIs {
  totalTreatments: number;
  avgPainReduction: number;
  successRate: number;
  patientSatisfaction: number;
  avgSessionsPerTreatment: number;
  avgTreatmentDuration: number;
  period: DateRange;
}

export interface PatientKPIs {
  totalPatients: number;
  newPatients: number;
  activePatients: number;
  retentionRate: number;
  avgAgeGroup: string;
  referralRate: number;
  period: DateRange;
}

export interface KPIDashboard {
  period: DateRange;
  financial: FinancialKPIs;
  operational: OperationalKPIs;
  clinical: ClinicalKPIs;
  patient: PatientKPIs;
  trends: TrendAnalysis[];
  alerts: BusinessAlert[];
  lastUpdated: Date;
}

// Trend Analysis
export interface TrendAnalysis {
  metric: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  significance: 'high' | 'medium' | 'low';
  description: string;
}

// Business Alerts
export interface BusinessAlert {
  id: string;
  type: 'revenue' | 'operational' | 'clinical' | 'patient';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  recommendations: string[];
  createdAt: Date;
}

// ML Models
export interface MLFeatures {
  [key: string]: number | string | boolean;
}

export interface MLPrediction {
  probability: number;
  confidence: number;
  featureImportance: Record<string, number>;
  recommendations: string[];
}

export interface NoShowPrediction extends MLPrediction {
  appointmentId: string;
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
}

export interface OutcomePrediction extends MLPrediction {
  patientId: string;
  successProbability: number;
  estimatedSessions: number;
  estimatedDuration: number;
  riskFactors: string[];
}

export interface Anomaly {
  type: 'revenue' | 'appointments' | 'no_shows' | 'cancellations';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedMetric: string;
  detectedAt: Date;
  value: number;
  expectedValue: number;
  deviation: number;
  recommendations: string[];
}

// Reporting
export interface Report {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  period: DateRange;
  sections: ReportSection[];
  charts: ChartConfig[];
  dataSets: ReportDataSet[];
  generatedAt: Date;
  generatedBy: string;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'summary' | 'metrics' | 'analysis' | 'recommendations';
  content: string;
  data?: Record<string, any>;
}

export interface ReportDataSet {
  name: string;
  headers: string[];
  rows: any[][];
}

export interface ReportRequest {
  title: string;
  period: DateRange;
  sections: string[];
  recipients?: string[];
  format: 'pdf' | 'excel' | 'html';
}

// Charts and Visualizations
export interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'heatmap' | 'scatter';
  title: string;
  data: ChartData;
  options: ChartOptions;
}

export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface Dataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartOptions {
  responsive: boolean;
  plugins?: {
    title?: {
      display: boolean;
      text: string;
    };
    legend?: {
      display: boolean;
      position: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip?: any;
  };
  scales?: any;
}

// Data Warehouse Schema Types
export interface DimensionTable {
  tableName: string;
  primaryKey: string;
  attributes: Record<string, string>;
  scdType: 1 | 2 | 3; // Slowly Changing Dimension type
}

export interface FactTable {
  tableName: string;
  primaryKey: string;
  dimensions: string[];
  measures: Record<string, string>;
  grain: string;
}

export interface DataMart {
  name: string;
  subject: string;
  factTables: string[];
  dimensionTables: string[];
  purpose: string;
}

// ETL Configuration
export interface ETLConfig {
  scheduleCron: string;
  batchSize: number;
  maxRetries: number;
  timeout: number;
  extractors: ExtractorConfig[];
  transformers: TransformerConfig[];
  loaders: LoaderConfig[];
}

export interface ExtractorConfig {
  name: string;
  type: 'database' | 'api' | 'file';
  source: string;
  incrementalKey?: string;
  batchSize: number;
}

export interface TransformerConfig {
  name: string;
  type: 'sql' | 'javascript' | 'python';
  rules: TransformationRule[];
}

export interface TransformationRule {
  field: string;
  operation: 'clean' | 'format' | 'calculate' | 'validate';
  expression: string;
}

export interface LoaderConfig {
  name: string;
  target: string;
  mode: 'insert' | 'upsert' | 'truncate_insert';
  batchSize: number;
}

// Cache and Performance
export interface CacheConfig {
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'fifo' | 'ttl';
}

export interface PerformanceMetrics {
  queryTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
}

// Export types
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  includeCharts: boolean;
  includeRawData: boolean;
  compression?: 'none' | 'zip' | 'gzip';
}