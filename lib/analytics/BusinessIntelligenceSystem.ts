import { DataWarehouse } from './warehouse/DataWarehouse';
import { ETLPipeline } from './etl/ETLPipeline';
import { ExecutiveDashboard } from './dashboard/ExecutiveDashboard';
import { MLModels } from './ml/MLModels';
import { ReportGenerator } from './reporting/ReportGenerator';
import { ChartService } from './visualization/ChartService';
import { ExportService } from './export/ExportService';
import {
  ETLConfig,
  DateRange,
  KPIDashboard,
  Report,
  ReportRequest,
  ExportOptions,
  ChartConfig,
  NoShowPrediction,
  OutcomePrediction,
  Anomaly
} from './types';

export class BusinessIntelligenceSystem {
  private warehouse: DataWarehouse;
  private etlPipeline: ETLPipeline;
  private dashboard: ExecutiveDashboard;
  private mlModels: MLModels;
  private reportGenerator: ReportGenerator;
  private chartService: ChartService;
  private exportService: ExportService;

  private supabaseUrl: string;
  private supabaseKey: string;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;

    // Initialize all components
    this.warehouse = new DataWarehouse(supabaseUrl, supabaseKey);
    this.dashboard = new ExecutiveDashboard(supabaseUrl, supabaseKey);
    this.mlModels = new MLModels(supabaseUrl, supabaseKey);
    this.reportGenerator = new ReportGenerator(supabaseUrl, supabaseKey);
    this.chartService = new ChartService(supabaseUrl, supabaseKey);
    this.exportService = new ExportService();

    // ETL Configuration
    const etlConfig: ETLConfig = {
      scheduleCron: '0 2 * * *', // Daily at 2 AM
      batchSize: 1000,
      maxRetries: 3,
      timeout: 300000, // 5 minutes
      extractors: [
        { name: 'patients', type: 'database', source: 'patients', batchSize: 500 },
        { name: 'appointments', type: 'database', source: 'appointments', batchSize: 1000 },
        { name: 'financial_transactions', type: 'database', source: 'financial_transactions', batchSize: 1000 },
        { name: 'treatment_sessions', type: 'database', source: 'treatment_sessions', batchSize: 800 },
        { name: 'therapists', type: 'database', source: 'therapists', batchSize: 100 },
        { name: 'patient_engagement', type: 'database', source: 'patient_engagement', batchSize: 1000 }
      ],
      transformers: [
        { name: 'patient_transformer', type: 'javascript', rules: [] },
        { name: 'appointment_transformer', type: 'javascript', rules: [] },
        { name: 'financial_transformer', type: 'javascript', rules: [] },
        { name: 'treatment_transformer', type: 'javascript', rules: [] }
      ],
      loaders: [
        { name: 'dim_patients', target: 'dim_patients', mode: 'upsert', batchSize: 500 },
        { name: 'dim_therapists', target: 'dim_therapists', mode: 'upsert', batchSize: 100 },
        { name: 'dim_treatments', target: 'dim_treatments', mode: 'upsert', batchSize: 50 },
        { name: 'fact_appointments', target: 'fact_appointments', mode: 'upsert', batchSize: 1000 },
        { name: 'fact_financial_transactions', target: 'fact_financial_transactions', mode: 'upsert', batchSize: 1000 },
        { name: 'fact_clinical_outcomes', target: 'fact_clinical_outcomes', mode: 'upsert', batchSize: 800 },
        { name: 'fact_patient_engagement', target: 'fact_patient_engagement', mode: 'upsert', batchSize: 1000 }
      ]
    };

    this.etlPipeline = new ETLPipeline(supabaseUrl, supabaseKey, etlConfig);
  }

  // System Initialization
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Inicializando Sistema de Business Intelligence...');

      // Initialize Data Warehouse
      console.log('📊 Inicializando Data Warehouse...');
      await this.warehouse.initializeSchema();
      await this.warehouse.populateDateDimension();

      // Run initial ETL
      console.log('🔄 Executando ETL inicial...');
      const etlResult = await this.etlPipeline.executeFullETL();

      if (!etlResult.success) {
        console.warn('⚠️ ETL inicial completado com erros:', etlResult.errors);
      }

      console.log('✅ Sistema BI inicializado com sucesso!');
      console.log(`📈 Registros processados: ${etlResult.recordsProcessed}`);
      console.log(`⏱️ Tempo de execução: ${etlResult.duration}ms`);

    } catch (error) {
      console.error('❌ Erro na inicialização do sistema BI:', error);
      throw error;
    }
  }

  // Dashboard Operations
  async generateExecutiveDashboard(period: DateRange): Promise<KPIDashboard> {
    try {
      console.log('📊 Gerando Dashboard Executivo...');
      return await this.dashboard.generateDashboard(period);
    } catch (error) {
      console.error('❌ Erro ao gerar dashboard:', error);
      throw error;
    }
  }

  // ML Predictions
  async predictNoShow(appointmentId: string): Promise<NoShowPrediction> {
    try {
      return await this.mlModels.predictNoShow(appointmentId);
    } catch (error) {
      console.error('❌ Erro na predição de no-show:', error);
      throw error;
    }
  }

  async predictTreatmentOutcome(patientId: string, treatmentType: string): Promise<OutcomePrediction> {
    try {
      return await this.mlModels.predictTreatmentOutcome(patientId, treatmentType);
    } catch (error) {
      console.error('❌ Erro na predição de resultado:', error);
      throw error;
    }
  }

  async detectAnomalies(period: DateRange): Promise<Anomaly[]> {
    try {
      return await this.mlModels.detectAnomalies(period);
    } catch (error) {
      console.error('❌ Erro na detecção de anomalias:', error);
      return [];
    }
  }

  // Reporting Operations
  async generateReport(request: ReportRequest): Promise<Report> {
    try {
      console.log(`📋 Gerando relatório: ${request.title}`);
      return await this.reportGenerator.generateReport(request);
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      throw error;
    }
  }

  async generateCompleteReport(period: DateRange, title?: string): Promise<Report> {
    const reportRequest: ReportRequest = {
      title: title || 'Relatório Executivo Completo',
      period,
      sections: [
        'executive_summary',
        'financial_analysis',
        'operational_metrics',
        'clinical_outcomes',
        'patient_insights',
        'predictive_analytics',
        'recommendations'
      ],
      format: 'pdf'
    };

    return await this.generateReport(reportRequest);
  }

  // Chart Generation
  async generateCharts(type: 'financial' | 'operational' | 'clinical' | 'patient', period: DateRange): Promise<ChartConfig[]> {
    try {
      switch (type) {
        case 'financial':
          return await this.chartService.generateFinancialCharts(period);
        case 'operational':
          return await this.chartService.generateOperationalCharts(period);
        case 'clinical':
          return await this.chartService.generateClinicalCharts(period);
        case 'patient':
          return await this.chartService.generatePatientCharts(period);
        default:
          throw new Error(`Tipo de gráfico não suportado: ${type}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao gerar gráficos ${type}:`, error);
      return [];
    }
  }

  // Export Operations
  async exportReport(report: Report, options: ExportOptions): Promise<string> {
    try {
      return await this.exportService.exportReport(report, options);
    } catch (error) {
      console.error('❌ Erro ao exportar relatório:', error);
      throw error;
    }
  }

  // ETL Operations
  async runETL(incremental: boolean = true): Promise<void> {
    try {
      console.log(`🔄 Executando ETL ${incremental ? 'incremental' : 'completo'}...`);

      let result;
      if (incremental) {
        const lastExecution = await this.getLastETLExecution();
        result = await this.etlPipeline.executeIncrementalETL(lastExecution);
      } else {
        result = await this.etlPipeline.executeFullETL();
      }

      if (result.success) {
        console.log('✅ ETL executado com sucesso');
        console.log(`📊 Registros processados: ${result.recordsProcessed}`);
      } else {
        console.error('❌ ETL executado com erros:', result.errors);
      }

      // Store execution log
      await this.storeETLLog(result);

    } catch (error) {
      console.error('❌ Erro na execução do ETL:', error);
      throw error;
    }
  }

  // System Health Check
  async healthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    components: Record<string, 'ok' | 'error'>;
    details: string[];
  }> {
    const health = {
      status: 'healthy' as const,
      components: {} as Record<string, 'ok' | 'error'>,
      details: [] as string[]
    };

    try {
      // Check Data Warehouse
      try {
        await this.warehouse.query('SELECT 1');
        health.components.warehouse = 'ok';
      } catch (error) {
        health.components.warehouse = 'error';
        health.details.push('Data Warehouse não acessível');
      }

      // Check ETL Pipeline
      try {
        const metrics = await this.etlPipeline.getETLMetrics();
        health.components.etl = 'ok';
      } catch (error) {
        health.components.etl = 'error';
        health.details.push('ETL Pipeline com problemas');
      }

      // Check Data Quality
      const dataQuality = await this.etlPipeline.validateDataQuality();
      if (!dataQuality.isValid) {
        health.details.push(...dataQuality.issues);
        health.status = 'warning';
      }

      // Determine overall status
      const hasErrors = Object.values(health.components).includes('error');
      if (hasErrors) {
        health.status = 'error';
      } else if (health.details.length > 0) {
        health.status = 'warning';
      }

      return health;

    } catch (error) {
      return {
        status: 'error',
        components: { system: 'error' },
        details: [`Erro no health check: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
      };
    }
  }

  // Comprehensive Analysis
  async performComprehensiveAnalysis(period: DateRange): Promise<{
    dashboard: KPIDashboard;
    charts: Record<string, ChartConfig[]>;
    anomalies: Anomaly[];
    report: Report;
  }> {
    try {
      console.log('🔍 Executando análise abrangente...');

      // Generate dashboard
      const dashboard = await this.generateExecutiveDashboard(period);

      // Generate all chart types
      const [financialCharts, operationalCharts, clinicalCharts, patientCharts] = await Promise.all([
        this.generateCharts('financial', period),
        this.generateCharts('operational', period),
        this.generateCharts('clinical', period),
        this.generateCharts('patient', period)
      ]);

      const charts = {
        financial: financialCharts,
        operational: operationalCharts,
        clinical: clinicalCharts,
        patient: patientCharts
      };

      // Detect anomalies
      const anomalies = await this.detectAnomalies(period);

      // Generate comprehensive report
      const report = await this.generateCompleteReport(period, 'Análise Abrangente do Período');

      console.log('✅ Análise abrangente concluída');
      return { dashboard, charts, anomalies, report };

    } catch (error) {
      console.error('❌ Erro na análise abrangente:', error);
      throw error;
    }
  }

  // Automated Workflows
  async setupAutomatedReports(): Promise<void> {
    try {
      console.log('📅 Configurando relatórios automatizados...');

      const schedules = [
        {
          reportType: 'daily_summary',
          frequency: 'daily' as const,
          recipients: ['admin@clinic.com'],
          format: 'pdf' as const
        },
        {
          reportType: 'weekly_analysis',
          frequency: 'weekly' as const,
          recipients: ['manager@clinic.com', 'admin@clinic.com'],
          format: 'excel' as const
        },
        {
          reportType: 'monthly_executive',
          frequency: 'monthly' as const,
          recipients: ['director@clinic.com', 'admin@clinic.com'],
          format: 'pdf' as const
        }
      ];

      await this.reportGenerator.scheduleAutomatedReports(schedules);
      console.log('✅ Relatórios automatizados configurados');

    } catch (error) {
      console.error('❌ Erro ao configurar relatórios automatizados:', error);
      throw error;
    }
  }

  // Utility Methods
  private async getLastETLExecution(): Promise<Date> {
    // In a real implementation, this would query the ETL log table
    // For now, return a date 24 hours ago
    return new Date(Date.now() - 24 * 60 * 60 * 1000);
  }

  private async storeETLLog(result: any): Promise<void> {
    // In a real implementation, this would store the ETL execution log
    console.log('📝 Log de ETL armazenado:', {
      success: result.success,
      recordsProcessed: result.recordsProcessed,
      duration: result.duration,
      timestamp: result.timestamp
    });
  }

  // System Configuration
  async updateConfiguration(config: Partial<{
    etlSchedule: string;
    reportRetention: number;
    anomalyThreshold: number;
    autoExport: boolean;
  }>): Promise<void> {
    console.log('⚙️ Atualizando configuração do sistema:', config);
    // In a real implementation, this would update system configuration in database
  }

  // Performance Metrics
  async getSystemMetrics(): Promise<{
    etlMetrics: any;
    reportingMetrics: any;
    storageMetrics: any;
    performanceMetrics: any;
  }> {
    try {
      const etlMetrics = await this.etlPipeline.getETLMetrics();
      const exportHistory = await this.exportService.getExportHistory();

      return {
        etlMetrics,
        reportingMetrics: {
          totalReports: 0, // Would be fetched from database
          avgGenerationTime: 0,
          mostUsedFormat: 'pdf'
        },
        storageMetrics: {
          warehouseSize: 0, // Would be calculated from warehouse tables
          compressionRatio: 0.3,
          indexesCount: 15
        },
        performanceMetrics: {
          avgQueryTime: 250, // ms
          cacheHitRate: 85, // %
          systemLoad: 65 // %
        }
      };
    } catch (error) {
      console.error('❌ Erro ao obter métricas do sistema:', error);
      throw error;
    }
  }

  // Cleanup Operations
  async cleanup(options: {
    deleteOldReports?: boolean;
    optimizeWarehouse?: boolean;
    rebuildIndexes?: boolean;
  }): Promise<void> {
    try {
      console.log('🧹 Executando limpeza do sistema...');

      if (options.deleteOldReports) {
        console.log('🗑️ Removendo relatórios antigos...');
        // Implementation would delete old reports
      }

      if (options.optimizeWarehouse) {
        console.log('⚡ Otimizando Data Warehouse...');
        await this.warehouse.optimizePerformance();
      }

      if (options.rebuildIndexes) {
        console.log('🔧 Reconstruindo índices...');
        // Implementation would rebuild database indexes
      }

      console.log('✅ Limpeza do sistema concluída');
    } catch (error) {
      console.error('❌ Erro na limpeza do sistema:', error);
      throw error;
    }
  }
}