import { DataExtractor } from './DataExtractor';
import { DataTransformer } from './DataTransformer';
import { DataLoader } from './DataLoader';
import { DataWarehouse } from '../warehouse/DataWarehouse';
import { logger } from '../../logger';
import { ETLResult, ETLConfig, ExtractionResult, TransformationResult, LoadResult } from '../types';

export class ETLPipeline {
  private extractor: DataExtractor;
  private transformer: DataTransformer;
  private loader: DataLoader;
  private warehouse: DataWarehouse;
  private config: ETLConfig;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    config: ETLConfig
  ) {
    this.extractor = new DataExtractor(supabaseUrl, supabaseKey);
    this.transformer = new DataTransformer();
    this.loader = new DataLoader(supabaseUrl, supabaseKey);
    this.warehouse = new DataWarehouse(supabaseUrl, supabaseKey);
    this.config = config;
  }

  async executeFullETL(): Promise<ETLResult> {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];
    let totalRecordsProcessed = 0;

    try {
      logger.info('Iniciando ETL Pipeline completo.', { context: 'analytics.etl.run' });

      // Phase 1: Initialize Data Warehouse
      logger.info('Inicializando Data Warehouse.', { context: 'analytics.etl.run' });
      await this.warehouse.initializeSchema();
      await this.warehouse.populateDateDimension();

      // Phase 2: Extract Data
      logger.info('Extraindo dados das tabelas operacionais.', { context: 'analytics.etl.extract' });
      const extractionResults = await this.extractData();

      // Check for extraction errors
      extractionResults.forEach(result => {
        if (result.status === 'error') {
          errors.push(`Erro na extração da tabela ${result.table}`);
        } else if (result.status === 'warning') {
          warnings.push(`Aviso na extração da tabela ${result.table}`);
        }
        totalRecordsProcessed += result.recordsExtracted;
      });

      // Phase 3: Transform Data
      logger.info('Transformando dados.', { context: 'analytics.etl.transform' });
      const transformationResults = await this.transformData(extractionResults);

      // Check for transformation errors
      transformationResults.forEach((result, index) => {
        if (result.status === 'error') {
          errors.push(`Erro na transformação dos dados: ${extractionResults[index].table}`);
        } else if (result.status === 'warning') {
          warnings.push(`Aviso na transformação dos dados: ${extractionResults[index].table}`);
        }
      });

      // Phase 4: Load Data
      logger.info('Carregando dados no Data Warehouse.', { context: 'analytics.etl.load' });
      const loadResults = await this.loadData(transformationResults, extractionResults);

      // Check for loading errors
      loadResults.forEach(result => {
        if (result.status === 'error') {
          errors.push(`Erro no carregamento da tabela ${result.targetTable}`);
        }
      });

      // Phase 5: Update Statistics
      logger.info('Atualizando estatísticas do Data Warehouse.', { context: 'analytics.etl.stats' });
      await this.updateWarehouseStatistics();

      const endTime = Date.now();
      const duration = endTime - startTime;

      logger.info('ETL Pipeline concluído.', { context: 'analytics.etl.run', data: { durationMs: duration, totalRecordsProcessed } });

      return {
        success: errors.length === 0,
        recordsProcessed: totalRecordsProcessed,
        duration,
        warnings,
        errors,
        timestamp: new Date()
      };

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      errors.push(`Erro crítico no pipeline: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);

      return {
        success: false,
        recordsProcessed: totalRecordsProcessed,
        duration,
        warnings,
        errors,
        timestamp: new Date()
      };
    }
  }

  async executeIncrementalETL(lastExecutionTime: Date): Promise<ETLResult> {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];
    let totalRecordsProcessed = 0;

    try {
      logger.info('Iniciando ETL incremental.', { context: 'analytics.etl.incremental' });

      // Extract only changed data since last execution
      const extractionResults = await this.extractIncrementalData(lastExecutionTime);

      if (extractionResults.every(result => result.recordsExtracted === 0)) {
        logger.info('Nenhum dado novo encontrado para processamento.', { context: 'analytics.etl.incremental' });
        return {
          success: true,
          recordsProcessed: 0,
          duration: Date.now() - startTime,
          warnings: ['Nenhum dado novo para processar'],
          errors: [],
          timestamp: new Date()
        };
      }

      // Transform and load incremental data
      const transformationResults = await this.transformData(extractionResults);
      const loadResults = await this.loadData(transformationResults, extractionResults);

      // Calculate total records processed
      totalRecordsProcessed = extractionResults.reduce((sum, result) => sum + result.recordsExtracted, 0);

      const endTime = Date.now();
      const duration = endTime - startTime;

      logger.info('ETL incremental concluído.', { context: 'analytics.etl.incremental', data: { durationMs: duration, totalRecordsProcessed } });

      return {
        success: errors.length === 0,
        recordsProcessed: totalRecordsProcessed,
        duration,
        warnings,
        errors,
        timestamp: new Date()
      };

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      errors.push(`Erro no ETL incremental: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);

      return {
        success: false,
        recordsProcessed: totalRecordsProcessed,
        duration,
        warnings,
        errors,
        timestamp: new Date()
      };
    }
  }

  private async extractData(): Promise<ExtractionResult[]> {
    const extractorConfigs = this.config.extractors;
    const results: ExtractionResult[] = [];

    for (const config of extractorConfigs) {
      try {
        let result: ExtractionResult;

        switch (config.name) {
          case 'patients':
            result = await this.extractor.extractPatients();
            break;
          case 'appointments':
            result = await this.extractor.extractAppointments();
            break;
          case 'financial_transactions':
            result = await this.extractor.extractFinancialTransactions();
            break;
          case 'treatment_sessions':
            result = await this.extractor.extractTreatmentSessions();
            break;
          case 'therapists':
            result = await this.extractor.extractTherapists();
            break;
          case 'patient_engagement':
            result = await this.extractor.extractPatientEngagement();
            break;
          default:
            result = {
              table: config.name,
              recordsExtracted: 0,
              lastExtraction: new Date(),
              status: 'error',
              data: []
            };
        }

        results.push(result);
          logger.debug('Extração concluída.', { context: 'analytics.etl.extract', data: { table: result.table, recordsExtracted: result.recordsExtracted } });

      } catch (error) {
          logger.error('Erro na extração.', { context: 'analytics.etl.extract', data: { table: config.name, error } });
        results.push({
          table: config.name,
          recordsExtracted: 0,
          lastExtraction: new Date(),
          status: 'error',
          data: []
        });
      }
    }

    return results;
  }

  private async extractIncrementalData(lastExecutionTime: Date): Promise<ExtractionResult[]> {
    const extractorConfigs = this.config.extractors;
    const lastExtractionMap: Record<string, Date> = {};

    // Build last extraction map
    extractorConfigs.forEach(config => {
      lastExtractionMap[config.name] = lastExecutionTime;
    });

    return await this.extractor.extractAllTables(extractorConfigs, lastExtractionMap);
  }

  private async transformData(extractionResults: ExtractionResult[]): Promise<TransformationResult[]> {
    const results: TransformationResult[] = [];

    for (const extractionResult of extractionResults) {
      try {
        let transformationResult: TransformationResult;

        switch (extractionResult.table) {
          case 'patients':
            transformationResult = this.transformer.transformPatientData(extractionResult.data);
            break;
          case 'appointments':
            transformationResult = this.transformer.transformAppointmentData(extractionResult.data);
            break;
          case 'financial_transactions':
            transformationResult = this.transformer.transformFinancialData(extractionResult.data);
            break;
          case 'treatment_sessions':
            transformationResult = this.transformer.transformTreatmentData(extractionResult.data);
            break;
          case 'therapists':
            transformationResult = this.transformer.transformTherapistData(extractionResult.data);
            break;
          case 'patient_engagement':
            transformationResult = this.transformer.transformEngagementData(extractionResult.data);
            break;
          default:
            transformationResult = {
              recordsTransformed: 0,
              status: 'error',
              data: []
            };
        }

        results.push(transformationResult);
          logger.debug('Transformação concluída.', { context: 'analytics.etl.transform', data: { table: extractionResult.table, recordsTransformed: transformationResult.recordsTransformed } });

      } catch (error) {
          logger.error('Erro na transformação.', { context: 'analytics.etl.transform', data: { table: extractionResult.table, error } });
        results.push({
          recordsTransformed: 0,
          status: 'error',
          data: []
        });
      }
    }

    return results;
  }

  private async loadData(
    transformationResults: TransformationResult[],
    extractionResults: ExtractionResult[]
  ): Promise<LoadResult[]> {
    const results: LoadResult[] = [];

    // Load dimensions first (order is important for referential integrity)
    const dimensionLoads = [
      { transformation: this.findTransformationByTable(transformationResults, extractionResults, 'patients'), method: 'loadDimensionPatients' },
      { transformation: this.findTransformationByTable(transformationResults, extractionResults, 'therapists'), method: 'loadDimensionTherapists' },
      { transformation: this.findTransformationByTable(transformationResults, extractionResults, 'treatment_sessions'), method: 'loadDimensionTreatments' }
    ];

    for (const load of dimensionLoads) {
      if (load.transformation && load.transformation.data.length > 0) {
        try {
          const result = await (this.loader as any)[load.method](load.transformation.data);
          results.push(result);
            logger.debug('Carga concluída.', { context: 'analytics.etl.load', data: { targetTable: result.targetTable, recordsLoaded: result.recordsLoaded } });
        } catch (error) {
          logger.error('Erro no carregamento da dimensão.', { context: 'analytics.etl.load', data: { error } });
          results.push({
            recordsLoaded: 0,
            status: 'error',
            targetTable: load.method.replace('load', '').toLowerCase()
          });
        }
      }
    }

    // Load facts second
    const factLoads = [
      { transformation: this.findTransformationByTable(transformationResults, extractionResults, 'appointments'), method: 'loadFactAppointments' },
      { transformation: this.findTransformationByTable(transformationResults, extractionResults, 'financial_transactions'), method: 'loadFactFinancialTransactions' },
      { transformation: this.findTransformationByTable(transformationResults, extractionResults, 'treatment_sessions'), method: 'loadFactClinicalOutcomes' },
      { transformation: this.findTransformationByTable(transformationResults, extractionResults, 'patient_engagement'), method: 'loadFactPatientEngagement' }
    ];

    for (const load of factLoads) {
      if (load.transformation && load.transformation.data.length > 0) {
        try {
          const result = await (this.loader as any)[load.method](load.transformation.data);
          results.push(result);
            logger.debug('Carga concluída.', { context: 'analytics.etl.load', data: { targetTable: result.targetTable, recordsLoaded: result.recordsLoaded } });
        } catch (error) {
          logger.error('Erro no carregamento da tabela de fatos.', { context: 'analytics.etl.load', data: { error } });
          results.push({
            recordsLoaded: 0,
            status: 'error',
            targetTable: load.method.replace('load', '').toLowerCase()
          });
        }
      }
    }

    return results;
  }

  private findTransformationByTable(
    transformationResults: TransformationResult[],
    extractionResults: ExtractionResult[],
    tableName: string
  ): TransformationResult | null {
    const index = extractionResults.findIndex(result => result.table === tableName);
    return index !== -1 ? transformationResults[index] : null;
  }

  private async updateWarehouseStatistics(): Promise<void> {
    try {
      const tables = [
        'dim_patients',
        'dim_therapists',
        'dim_treatments',
        'dim_date',
        'fact_appointments',
        'fact_financial_transactions',
        'fact_clinical_outcomes',
        'fact_patient_engagement'
      ];

      for (const table of tables) {
        await this.warehouse.analyzeTable(table);
      }

      logger.info('Estatísticas do Data Warehouse atualizadas.', { context: 'analytics.etl.stats' });
    } catch (error) {
      logger.error('Erro ao atualizar estatísticas.', { context: 'analytics.etl.stats', data: { error } });
    }
  }

  async getETLMetrics(): Promise<{
    lastExecution: Date | null;
    totalRecordsProcessed: number;
    averageExecutionTime: number;
    successRate: number;
    tableMetrics: Record<string, any>;
  }> {
    try {
      // This would typically query an ETL log table
      // For now, returning mock metrics
      return {
        lastExecution: new Date(),
        totalRecordsProcessed: 0,
        averageExecutionTime: 0,
        successRate: 100,
        tableMetrics: {}
      };
    } catch (error) {
      return {
        lastExecution: null,
        totalRecordsProcessed: 0,
        averageExecutionTime: 0,
        successRate: 0,
        tableMetrics: {}
      };
    }
  }

  async scheduleETL(cronExpression: string): Promise<void> {
    // This would integrate with a job scheduler
    logger.info('ETL agendado.', { context: 'analytics.etl.schedule', data: { cronExpression } });
  }

  async validateDataQuality(): Promise<{ isValid: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Validate dimension integrity
      const dimensionChecks = await Promise.all([
        this.validateDimensionIntegrity('dim_patients'),
        this.validateDimensionIntegrity('dim_therapists'),
        this.validateDimensionIntegrity('dim_treatments')
      ]);

      dimensionChecks.forEach((check, index) => {
        const tables = ['dim_patients', 'dim_therapists', 'dim_treatments'];
        if (!check) {
          issues.push(`Problemas de integridade na tabela ${tables[index]}`);
        }
      });

      // Validate fact table relationships
      const factChecks = await Promise.all([
        this.validateFactIntegrity('fact_appointments'),
        this.validateFactIntegrity('fact_financial_transactions'),
        this.validateFactIntegrity('fact_clinical_outcomes')
      ]);

      factChecks.forEach((check, index) => {
        const tables = ['fact_appointments', 'fact_financial_transactions', 'fact_clinical_outcomes'];
        if (!check) {
          issues.push(`Problemas de integridade referencial na tabela ${tables[index]}`);
        }
      });

      return {
        isValid: issues.length === 0,
        issues
      };

    } catch (error) {
      return {
        isValid: false,
        issues: [`Erro na validação de qualidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
      };
    }
  }

  private async validateDimensionIntegrity(tableName: string): Promise<boolean> {
    // Implement dimension integrity checks
    return true;
  }

  private async validateFactIntegrity(tableName: string): Promise<boolean> {
    // Implement fact table integrity checks
    return true;
  }
}
