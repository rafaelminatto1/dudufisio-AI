/**
 * Integration Test for Business Intelligence System with Supabase
 */

import { BusinessIntelligenceSystem } from '../BusinessIntelligenceSystem';
import { BISystemDemo } from '../demo/BISystemDemo';
import { performanceMetrics } from '../metrics/PerformanceMetrics';
import { mockDataGenerator } from '../demo/mockDataGenerator';

export interface TestHistory {
  id: string;
  testName: string;
  timestamp: Date;
  duration: number;
  success: boolean;
  results: any;
}

export class BIIntegrationTest {
  private biSystem: BusinessIntelligenceSystem | null = null;
  private demo: BISystemDemo | null = null;
  private testHistory: TestHistory[] = [];
  private isRunning: boolean = false;

  /**
   * Initialize BI system with environment variables
   */
  async initializeBI(): Promise<boolean> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Check if we have valid credentials
      const hasValidCredentials = supabaseUrl &&
        supabaseKey &&
        supabaseUrl !== 'https://your_project_ref.supabase.co' &&
        supabaseKey !== 'your_supabase_anon_key' &&
        supabaseUrl.includes('supabase.co');

      if (!hasValidCredentials) {
        
        return false;
      }

      
      this.biSystem = new BusinessIntelligenceSystem(supabaseUrl, supabaseKey);
      this.demo = new BISystemDemo(supabaseUrl, supabaseKey);

      // Test basic connection
      await this.biSystem.initialize();
      

      return true;
    } catch (error) {
      console.error('❌ BI System initialization failed:', error);
      return false;
    }
  }

  /**
   * Run basic BI system verification
   */
  async runBasicVerification(): Promise<{
    healthCheck: boolean;
    dashboard: boolean;
    charts: boolean;
    anomalies: boolean;
    reports: boolean;
  }> {
    const results = {
      healthCheck: false,
      dashboard: false,
      charts: false,
      anomalies: false,
      reports: false
    };

    if (!this.biSystem) {
      
      return results;
    }

    const period = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    };

    try {
      // Health Check
      
      const health = await this.biSystem.healthCheck();
      results.healthCheck = health.status !== 'error';
      

      // Dashboard
      
      const dashboard = await this.biSystem.generateExecutiveDashboard(period);
      results.dashboard = !!dashboard && !!dashboard.financial;
      

      // Charts
      
      const charts = await this.biSystem.generateCharts('financial', period);
      results.charts = Array.isArray(charts);
      

      // Anomalies
      
      const anomalies = await this.biSystem.detectAnomalies(period);
      results.anomalies = Array.isArray(anomalies);
      

      // Reports
      
      const report = await this.biSystem.generateCompleteReport(period);
      results.reports = !!report && !!report.id;
      

    } catch (error) {
      console.error('❌ Basic verification failed:', error);
    }

    return results;
  }

  /**
   * Run complete BI demo if available
   */
  async runCompleteDemo(): Promise<boolean> {
    if (!this.demo) {
      
      return false;
    }

    try {
      
      await this.demo.runCompleteDemo();
      
      return true;
    } catch (error) {
      console.error('❌ Complete demo failed:', error);
      return false;
    }
  }

  /**
   * Run ETL pipeline test
   */
  async runETLTest(): Promise<{ success: boolean; metrics: any }> {
    const testId = `etl_test_${Date.now()}`;
    performanceMetrics.startOperation(testId);

    try {
      

      if (!this.biSystem) {
        return { success: false, metrics: null };
      }

      await this.biSystem.runETL(true);
      const metrics = await this.biSystem.getSystemMetrics();

      const duration = performanceMetrics.endOperation(testId, 'etl', true);
      
      this.addToHistory({
        id: testId,
        testName: 'ETL Pipeline Test',
        timestamp: new Date(),
        duration,
        success: true,
        results: metrics.etlMetrics
      });

      
      return { success: true, metrics: metrics.etlMetrics };
    } catch (error) {
      performanceMetrics.endOperation(testId, 'etl', false);
      console.error('❌ ETL test failed:', error);
      return { success: false, metrics: null };
    }
  }

  /**
   * Run Data Warehouse test
   */
  async runDataWarehouseTest(): Promise<{ success: boolean; recordCount: number }> {
    const testId = `warehouse_test_${Date.now()}`;
    performanceMetrics.startOperation(testId);

    try {
      

      if (!this.biSystem) {
        return { success: false, recordCount: 0 };
      }

      // Test health check first
      const health = await this.biSystem.healthCheck();
      const success = health.components.warehouse === 'ok';

      const duration = performanceMetrics.endOperation(testId, 'query', success);
      
      this.addToHistory({
        id: testId,
        testName: 'Data Warehouse Test',
        timestamp: new Date(),
        duration,
        success,
        results: { health }
      });

      
      return { success, recordCount: 0 };
    } catch (error) {
      performanceMetrics.endOperation(testId, 'query', false);
      console.error('❌ Data Warehouse test failed:', error);
      return { success: false, recordCount: 0 };
    }
  }

  /**
   * Run ML Models test
   */
  async runMLModelsTest(): Promise<{ success: boolean; predictions: number }> {
    const testId = `ml_test_${Date.now()}`;
    performanceMetrics.startOperation(testId);

    try {
      

      if (!this.biSystem) {
        return { success: false, predictions: 0 };
      }

      const period = {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date()
      };

      // Test anomaly detection
      const anomalies = await this.biSystem.detectAnomalies(period);
      
      // Test no-show prediction
      const noShowPrediction = await this.biSystem.predictNoShow('test_appointment_123');

      const success = Array.isArray(anomalies) && !!noShowPrediction;
      const duration = performanceMetrics.endOperation(testId, 'ml', success);
      
      this.addToHistory({
        id: testId,
        testName: 'ML Models Test',
        timestamp: new Date(),
        duration,
        success,
        results: { anomaliesCount: anomalies.length, noShowPrediction }
      });

      
      return { success, predictions: anomalies.length + 1 };
    } catch (error) {
      performanceMetrics.endOperation(testId, 'ml', false);
      console.error('❌ ML Models test failed:', error);
      return { success: false, predictions: 0 };
    }
  }

  /**
   * Run Chart Generation test
   */
  async runChartGenerationTest(): Promise<{ success: boolean; chartsGenerated: number }> {
    const testId = `charts_test_${Date.now()}`;
    performanceMetrics.startOperation(testId);

    try {
      

      if (!this.biSystem) {
        return { success: false, chartsGenerated: 0 };
      }

      const period = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      };

      const [financial, operational, clinical, patient] = await Promise.all([
        this.biSystem.generateCharts('financial', period),
        this.biSystem.generateCharts('operational', period),
        this.biSystem.generateCharts('clinical', period),
        this.biSystem.generateCharts('patient', period)
      ]);

      const totalCharts = financial.length + operational.length + clinical.length + patient.length;
      const success = totalCharts > 0;

      const duration = performanceMetrics.endOperation(testId, 'query', success);
      
      this.addToHistory({
        id: testId,
        testName: 'Chart Generation Test',
        timestamp: new Date(),
        duration,
        success,
        results: { totalCharts, financial: financial.length, operational: operational.length, clinical: clinical.length, patient: patient.length }
      });

      console.log(`${success ? '✅' : '❌'} Chart Generation test ${success ? 'passed' : 'failed'} (${totalCharts} charts)`);
      return { success, chartsGenerated: totalCharts };
    } catch (error) {
      performanceMetrics.endOperation(testId, 'query', false);
      console.error('❌ Chart Generation test failed:', error);
      return { success: false, chartsGenerated: 0 };
    }
  }

  /**
   * Run Export test
   */
  async runExportTest(): Promise<{ success: boolean; formats: string[] }> {
    const testId = `export_test_${Date.now()}`;
    performanceMetrics.startOperation(testId);

    try {
      

      if (!this.biSystem) {
        return { success: false, formats: [] };
      }

      const period = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      };

      const report = await this.biSystem.generateCompleteReport(period);
      
      const formats: string[] = [];
      
      // Test JSON export
      await this.biSystem.exportReport(report, { format: 'json', includeCharts: true, includeRawData: true });
      formats.push('json');

      const success = formats.length > 0;
      const duration = performanceMetrics.endOperation(testId, 'export', success);
      
      this.addToHistory({
        id: testId,
        testName: 'Export Test',
        timestamp: new Date(),
        duration,
        success,
        results: { formats }
      });

      console.log(`${success ? '✅' : '❌'} Export test ${success ? 'passed' : 'failed'} (${formats.length} formats)`);
      return { success, formats };
    } catch (error) {
      performanceMetrics.endOperation(testId, 'export', false);
      console.error('❌ Export test failed:', error);
      return { success: false, formats: [] };
    }
  }

  /**
   * Run Performance test
   */
  async runPerformanceTest(): Promise<{ success: boolean; metrics: any }> {
    const testId = `performance_test_${Date.now()}`;
    
    try {
      

      const period = {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date()
      };

      // Run multiple operations and measure
      const operations = [];
      
      if (this.biSystem) {
        operations.push(
          this.biSystem.generateExecutiveDashboard(period),
          this.biSystem.generateCharts('financial', period),
          this.biSystem.detectAnomalies(period)
        );
      }

      const startTime = performance.now();
      await Promise.all(operations);
      const totalDuration = performance.now() - startTime;

      const report = performanceMetrics.generateReport();
      const success = report.avgExecutionTime < 5000; // Less than 5 seconds average

      this.addToHistory({
        id: testId,
        testName: 'Performance Test',
        timestamp: new Date(),
        duration: totalDuration,
        success,
        results: report
      });

      
      return { success, metrics: report };
    } catch (error) {
      console.error('❌ Performance test failed:', error);
      return { success: false, metrics: null };
    }
  }

  /**
   * Run Stress test
   */
  async runStressTest(iterations: number = 10): Promise<{ success: boolean; completedIterations: number }> {
    const testId = `stress_test_${Date.now()}`;
    
    try {
      console.log(`🔥 Running Stress Test (${iterations} iterations)...`);

      let completed = 0;
      const period = {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date()
      };

      for (let i = 0; i < iterations; i++) {
        try {
          if (this.biSystem) {
            await this.biSystem.generateExecutiveDashboard(period);
          }
          completed++;
        } catch (error) {
          console.error(`Iteration ${i + 1} failed:`, error);
        }
      }

      const success = completed === iterations;
      
      this.addToHistory({
        id: testId,
        testName: 'Stress Test',
        timestamp: new Date(),
        duration: 0,
        success,
        results: { iterations, completed }
      });

      console.log(`${success ? '✅' : '❌'} Stress test ${success ? 'passed' : 'failed'} (${completed}/${iterations})`);
      return { success, completedIterations: completed };
    } catch (error) {
      console.error('❌ Stress test failed:', error);
      return { success: false, completedIterations: 0 };
    }
  }

  /**
   * Validate Data Quality
   */
  async validateDataQuality(): Promise<{ isValid: boolean; issues: string[] }> {
    const testId = `data_quality_${Date.now()}`;
    performanceMetrics.startOperation(testId);

    try {
      

      const issues: string[] = [];

      if (!this.biSystem) {
        issues.push('BI System not initialized');
        return { isValid: false, issues };
      }

      const health = await this.biSystem.healthCheck();
      
      if (health.status === 'error') {
        issues.push(...health.details);
      }

      const isValid = issues.length === 0;
      const duration = performanceMetrics.endOperation(testId, 'query', isValid);
      
      this.addToHistory({
        id: testId,
        testName: 'Data Quality Validation',
        timestamp: new Date(),
        duration,
        success: isValid,
        results: { issues }
      });

      
      return { isValid, issues };
    } catch (error) {
      performanceMetrics.endOperation(testId, 'query', false);
      console.error('❌ Data quality validation failed:', error);
      return { isValid: false, issues: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Get test history
   */
  getTestHistory(): TestHistory[] {
    return [...this.testHistory].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Generate comprehensive test report
   */
  async generateTestReport(): Promise<any> {
    const report = {
      generatedAt: new Date(),
      systemStatus: this.getIntegrationStatus(),
      testHistory: this.getTestHistory(),
      performanceMetrics: performanceMetrics.generateReport(),
      summary: {
        totalTests: this.testHistory.length,
        passedTests: this.testHistory.filter(t => t.success).length,
        failedTests: this.testHistory.filter(t => t.success === false).length,
        avgDuration: this.testHistory.length > 0 
          ? this.testHistory.reduce((sum, t) => sum + t.duration, 0) / this.testHistory.length 
          : 0
      }
    };

    return report;
  }

  /**
   * Clear test history
   */
  clearHistory(): void {
    this.testHistory = [];
    performanceMetrics.clearMetrics();
  }

  /**
   * Check if tests are currently running
   */
  isTestRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Add test to history
   */
  private addToHistory(test: TestHistory): void {
    this.testHistory.push(test);
    
    // Keep only last 50 tests
    if (this.testHistory.length > 50) {
      this.testHistory = this.testHistory.slice(-50);
    }
  }

  /**
   * Get integration status summary
   */
  getIntegrationStatus(): {
    initialized: boolean;
    hasCredentials: boolean;
    systemReady: boolean;
  } {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const hasValidCredentials = supabaseUrl &&
      supabaseKey &&
      supabaseUrl !== 'https://your_project_ref.supabase.co' &&
      supabaseKey !== 'your_supabase_anon_key' &&
      supabaseUrl.includes('supabase.co');

    return {
      initialized: !!this.biSystem,
      hasCredentials: hasValidCredentials,
      systemReady: !!this.biSystem && hasValidCredentials
    };
  }
}

// Export singleton instance for global use
export const biIntegrationTest = new BIIntegrationTest();

// Auto-initialize function for browser console
(window as any).testBIIntegration = async () => {
  
  

  const initialized = await biIntegrationTest.initializeBI();

  if (initialized) {
    
    const results = await biIntegrationTest.runBasicVerification();

    
    Object.entries(results).forEach(([test, passed]) => {
      
    });

    const allPassed = Object.values(results).every(Boolean);

    if (allPassed) {
      
      
      console.log('testBIDemo()');
    } else {
      
    }
  } else {
    console.log('\\n⚠️ BI System running in demo mode (no Supabase credentials).');
    
    
    
    
  }

  return biIntegrationTest.getIntegrationStatus();
};

// Complete demo function
(window as any).testBIDemo = async () => {
  const success = await biIntegrationTest.runCompleteDemo();
  if (!success) {
    
  }
  return success;
};