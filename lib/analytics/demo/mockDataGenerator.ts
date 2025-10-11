/**
 * Mock Data Generator for BI System Demo Mode
 * Generates realistic data for testing and demonstrations
 */

import { DateRange, KPIDashboard, Anomaly } from '../types';

export class MockDataGenerator {
  private static instance: MockDataGenerator;

  static getInstance(): MockDataGenerator {
    if (!MockDataGenerator.instance) {
      MockDataGenerator.instance = new MockDataGenerator();
    }
    return MockDataGenerator.instance;
  }

  /**
   * Generate mock dashboard data
   */
  generateMockDashboard(period: DateRange): KPIDashboard {
    return {
      period,
      financial: this.generateFinancialKPIs(),
      operational: this.generateOperationalKPIs(),
      clinical: this.generateClinicalKPIs(),
      patient: this.generatePatientKPIs(),
      trends: this.generateTrends(),
      alerts: this.generateAlerts(),
      lastUpdated: new Date()
    };
  }

  /**
   * Generate mock financial KPIs
   */
  private generateFinancialKPIs() {
    return {
      totalRevenue: this.randomAmount(50000, 150000),
      revenueGrowth: this.randomPercentage(-5, 25),
      payingPatients: this.randomInt(80, 150),
      avgTransactionValue: this.randomAmount(200, 600),
      collectionRate: this.randomPercentage(85, 98),
      pendingReceivables: this.randomAmount(5000, 25000),
      profitMargin: this.randomPercentage(15, 35),
      cashFlow: this.randomAmount(-5000, 30000)
    };
  }

  /**
   * Generate mock operational KPIs
   */
  private generateOperationalKPIs() {
    return {
      totalAppointments: this.randomInt(300, 600),
      appointmentGrowth: this.randomPercentage(-3, 15),
      utilizationRate: this.randomPercentage(70, 95),
      avgSessionDuration: this.randomInt(45, 75),
      noShowRate: this.randomPercentage(5, 15),
      cancellationRate: this.randomPercentage(8, 18),
      waitingListSize: this.randomInt(10, 50),
      avgWaitTime: this.randomInt(3, 14)
    };
  }

  /**
   * Generate mock clinical KPIs
   */
  private generateClinicalKPIs() {
    return {
      activeTreatments: this.randomInt(100, 250),
      completionRate: this.randomPercentage(75, 92),
      successRate: this.randomPercentage(80, 95),
      avgTreatmentDuration: this.randomInt(6, 12),
      patientSatisfaction: this.randomFloat(8.0, 9.8),
      treatmentCompliance: this.randomPercentage(70, 90),
      outcomeImprovement: this.randomPercentage(60, 85),
      adverseEvents: this.randomInt(0, 5)
    };
  }

  /**
   * Generate mock patient KPIs
   */
  private generatePatientKPIs() {
    return {
      totalPatients: this.randomInt(300, 800),
      activePatients: this.randomInt(150, 400),
      newPatients: this.randomInt(20, 60),
      patientRetention: this.randomPercentage(80, 95),
      avgPatientAge: this.randomInt(35, 55),
      genderDistribution: { male: 45, female: 55 },
      patientEngagement: this.randomPercentage(65, 90),
      referralRate: this.randomPercentage(15, 35)
    };
  }

  /**
   * Generate mock trends
   */
  private generateTrends() {
    return {
      revenue: { direction: this.randomTrend(), strength: this.randomPercentage(5, 25) },
      appointments: { direction: this.randomTrend(), strength: this.randomPercentage(3, 20) },
      satisfaction: { direction: this.randomTrend(), strength: this.randomPercentage(2, 15) },
      retention: { direction: this.randomTrend(), strength: this.randomPercentage(1, 10) }
    };
  }

  /**
   * Generate mock alerts
   */
  private generateAlerts() {
    const alerts = [];
    
    // Randomly generate some alerts
    if (Math.random() > 0.7) {
      alerts.push({
        id: `alert_${Date.now()}_1`,
        type: 'warning',
        severity: 'medium',
        title: 'Taxa de No-Show Acima do Normal',
        message: 'A taxa de no-show está 3% acima da média histórica',
        timestamp: new Date(),
        actionRequired: true
      });
    }

    if (Math.random() > 0.8) {
      alerts.push({
        id: `alert_${Date.now()}_2`,
        type: 'info',
        severity: 'low',
        title: 'Novo Recorde de Receita',
        message: 'A receita deste mês superou o recorde anterior em 12%',
        timestamp: new Date(),
        actionRequired: false
      });
    }

    if (Math.random() > 0.85) {
      alerts.push({
        id: `alert_${Date.now()}_3`,
        type: 'critical',
        severity: 'high',
        title: 'Pendências Financeiras Críticas',
        message: 'R$ 15.000 em recebíveis vencidos há mais de 60 dias',
        timestamp: new Date(),
        actionRequired: true
      });
    }

    return alerts;
  }

  /**
   * Generate mock anomalies
   */
  generateMockAnomalies(): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const count = this.randomInt(0, 5);

    for (let i = 0; i < count; i++) {
      anomalies.push({
        id: `anomaly_${Date.now()}_${i}`,
        type: this.randomFromArray(['revenue', 'appointment', 'clinical', 'operational']),
        severity: this.randomFromArray(['low', 'medium', 'high', 'critical']),
        description: this.generateAnomalyDescription(),
        detectedAt: new Date(Date.now() - this.randomInt(0, 7 * 24 * 60 * 60 * 1000)),
        metric: this.randomFromArray(['revenue', 'appointments', 'no_show_rate', 'satisfaction']),
        expectedValue: this.randomFloat(100, 1000),
        actualValue: this.randomFloat(50, 1500),
        deviation: this.randomPercentage(10, 50),
        confidence: this.randomPercentage(70, 98)
      });
    }

    return anomalies;
  }

  /**
   * Generate mock test results
   */
  generateMockTestResults() {
    return {
      healthCheck: Math.random() > 0.1,
      dashboard: Math.random() > 0.05,
      charts: Math.random() > 0.08,
      anomalies: Math.random() > 0.1,
      reports: Math.random() > 0.12,
      etl: Math.random() > 0.15,
      ml: Math.random() > 0.2,
      export: Math.random() > 0.1,
      performance: Math.random() > 0.05
    };
  }

  /**
   * Generate mock performance metrics
   */
  generateMockPerformanceMetrics() {
    return {
      avgQueryTime: this.randomInt(50, 500),
      totalQueries: this.randomInt(100, 1000),
      cacheHitRate: this.randomPercentage(70, 95),
      memoryUsage: this.randomInt(100, 800),
      cpuUsage: this.randomPercentage(20, 80),
      activeConnections: this.randomInt(5, 50),
      queuedJobs: this.randomInt(0, 10),
      errorRate: this.randomPercentage(0, 3)
    };
  }

  /**
   * Generate mock ETL metrics
   */
  generateMockETLMetrics() {
    return {
      totalRecordsProcessed: this.randomInt(10000, 100000),
      successfulRecords: this.randomInt(9500, 99000),
      failedRecords: this.randomInt(0, 500),
      avgProcessingTime: this.randomInt(100, 5000),
      lastExecutionTime: new Date(Date.now() - this.randomInt(0, 24 * 60 * 60 * 1000)),
      nextScheduledExecution: new Date(Date.now() + this.randomInt(1, 24 * 60 * 60 * 1000)),
      dataQualityScore: this.randomPercentage(85, 99)
    };
  }

  /**
   * Generate mock chart data
   */
  generateMockChartData(type: string, points: number = 12) {
    const labels = this.generateTimeLabels(points);
    const data = Array.from({ length: points }, () => this.randomInt(50, 500));
    
    return {
      labels,
      datasets: [{
        label: this.getChartLabel(type),
        data,
        borderColor: this.getChartColor(type),
        backgroundColor: this.getChartColor(type, 0.2),
        tension: 0.4
      }]
    };
  }

  /**
   * Generate time series data
   */
  generateTimeSeriesData(days: number = 30) {
    const data = [];
    const now = Date.now();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toISOString().split('T')[0],
        value: this.randomFloat(1000, 5000),
        count: this.randomInt(10, 50)
      });
    }
    
    return data;
  }

  // Utility methods

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private randomAmount(min: number, max: number): number {
    return Math.round(this.randomFloat(min, max) * 100) / 100;
  }

  private randomPercentage(min: number, max: number): number {
    return Math.round(this.randomFloat(min, max) * 10) / 10;
  }

  private randomTrend(): 'up' | 'down' | 'stable' {
    const rand = Math.random();
    if (rand < 0.4) return 'up';
    if (rand < 0.7) return 'stable';
    return 'down';
  }

  private randomFromArray<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private generateAnomalyDescription(): string {
    const descriptions = [
      'Queda súbita na receita detectada',
      'Aumento anormal na taxa de cancelamento',
      'Pico inesperado de agendamentos',
      'Desvio significativo na satisfação do paciente',
      'Anomalia no tempo médio de sessão',
      'Padrão incomum de no-shows',
      'Variação atípica em tratamentos concluídos'
    ];
    return this.randomFromArray(descriptions);
  }

  private generateTimeLabels(count: number): string[] {
    const labels = [];
    const now = new Date();
    
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }));
    }
    
    return labels;
  }

  private getChartLabel(type: string): string {
    const labels: Record<string, string> = {
      revenue: 'Receita',
      appointments: 'Consultas',
      satisfaction: 'Satisfação',
      patients: 'Pacientes'
    };
    return labels[type] || type;
  }

  private getChartColor(type: string, alpha: number = 1): string {
    const colors: Record<string, string> = {
      revenue: `rgba(34, 197, 94, ${alpha})`,
      appointments: `rgba(59, 130, 246, ${alpha})`,
      satisfaction: `rgba(168, 85, 247, ${alpha})`,
      patients: `rgba(249, 115, 22, ${alpha})`
    };
    return colors[type] || `rgba(100, 100, 100, ${alpha})`;
  }

  /**
   * Simulate async operation with delay
   */
  async simulateAsyncOperation<T>(result: T, delay: number = 1000): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(result), delay);
    });
  }

  /**
   * Simulate progressive operation with callbacks
   */
  async simulateProgressiveOperation(
    steps: number,
    onProgress: (progress: number, message: string) => void
  ): Promise<void> {
    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const progress = (i / steps) * 100;
      onProgress(progress, `Processando etapa ${i + 1} de ${steps + 1}...`);
    }
  }
}

export const mockDataGenerator = MockDataGenerator.getInstance();

