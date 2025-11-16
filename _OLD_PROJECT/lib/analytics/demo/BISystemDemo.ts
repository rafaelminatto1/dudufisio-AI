import { BusinessIntelligenceSystem } from '../BusinessIntelligenceSystem';
// import { BISystemTests } from '../tests/BISystemTests'; // ❌ Comentado: testes não devem ser incluídos no build de produção
import { DateRange } from '../types';

/**
 * Demonstração completa do Sistema de Business Intelligence
 * Este arquivo mostra como usar todas as funcionalidades do sistema BI
 */
export class BISystemDemo {
  private biSystem: BusinessIntelligenceSystem;
  // private testSystem: BISystemTests; // ❌ Comentado: testes não devem ser incluídos no build de produção

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.biSystem = new BusinessIntelligenceSystem(supabaseUrl, supabaseKey);
    // this.testSystem = new BISystemTests(supabaseUrl, supabaseKey); // ❌ Comentado: testes não devem ser incluídos no build de produção
  }

  /**
   * Executa uma demonstração completa do sistema
   */
  async runCompleteDemo(): Promise<void> {
    
    

    try {
      // 1. Inicialização do Sistema
      
      
      await this.biSystem.initialize();
      

      // 2. Verificação de Saúde do Sistema
      
      
      const health = await this.biSystem.healthCheck();
      console.log(`Status: ${health.status.toUpperCase()}`);
      if (health.details.length > 0) {
        console.log('Alertas:', health.details.join(', '));
      }
      

      // 3. Definir período de análise
      const period: DateRange = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
        end: new Date()
      };

      // 4. Geração de Dashboard Executivo
      
      
      const dashboard = await this.biSystem.generateExecutiveDashboard(period);
      this.printDashboardSummary(dashboard);
      

      // 5. Análises Preditivas
      
      
      await this.demonstratePredictiveAnalytics();
      

      // 6. Detecção de Anomalias
      
      
      const anomalies = await this.biSystem.detectAnomalies(period);
      
      if (anomalies.length > 0) {
        anomalies.slice(0, 3).forEach(anomaly => {
          console.log(`- ${anomaly.type.toUpperCase()}: ${anomaly.description}`);
        });
      }
      

      // 7. Geração de Gráficos
      
      
      const allCharts = await this.generateAllCharts(period);
      console.log(`Total de gráficos gerados: ${Object.values(allCharts).flat().length}`);
      Object.entries(allCharts).forEach(([type, charts]) => {
        console.log(`- ${type.charAt(0).toUpperCase() + type.slice(1)}: ${charts.length} gráficos`);
      });
      

      // 8. Geração de Relatório Completo
      
      
      const report = await this.biSystem.generateCompleteReport(
        period,
        'Relatório Demonstrativo Completo'
      );
      
      
      
      
      

      // 9. Exportação em Múltiplos Formatos
      
      
      await this.demonstrateMultiFormatExport(report);
      

      // 10. Análise Abrangente
      
      
      const comprehensiveAnalysis = await this.biSystem.performComprehensiveAnalysis(period);
      
      console.log(`- Dashboard com ${Object.keys(comprehensiveAnalysis.dashboard.financial).length} KPIs financeiros`);
      
      
      console.log(`- ${Object.values(comprehensiveAnalysis.charts).flat().length} gráficos gerados`);
      

      // 11. Configuração de Relatórios Automatizados
      
      
      await this.biSystem.setupAutomatedReports();
      

      // 12. Métricas do Sistema
      
      
      const systemMetrics = await this.biSystem.getSystemMetrics();
      
      
      
      
      

      
      
      
      

    } catch (error) {
      console.error('❌ ERRO NA DEMONSTRAÇÃO:', error);
      throw error;
    }
  }

  /**
   * Executa apenas os testes do sistema
   * ❌ DESABILITADO: Testes não devem ser incluídos no build de produção
   */
  async runSystemTests(): Promise<void> {
    console.warn('⚠️ Testes do sistema desabilitados no build de produção');
    return;
    
    /* ❌ Comentado para evitar erro de build
    try {
      const testResults = await this.testSystem.runAllTests();

      if (testResults.success) {
        
        
      } else {
        
        
      }

      // Gerar relatório de testes
      const testReport = await this.testSystem.generateTestReport();
      
      
      

    } catch (error) {
      console.error('❌ ERRO NOS TESTES:', error);
      throw error;
    }
    */
  }

  /**
   * Demonstra o uso prático para diferentes cenários
   */
  async runPracticalScenarios(): Promise<void> {
    
    

    const period: DateRange = {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
      end: new Date()
    };

    // Cenário 1: Reunião Executiva Semanal
    
    
    await this.executiveWeeklyMeeting(period);

    // Cenário 2: Análise Operacional Diária
    
    
    await this.dailyOperationalAnalysis();

    // Cenário 3: Relatório Financeiro Mensal
    
    
    await this.monthlyFinancialReport();

    // Cenário 4: Alerta de Anomalias em Tempo Real
    
    
    await this.realTimeAnomalyAlerts(period);

    
  }

  // Métodos auxiliares para demonstração

  private printDashboardSummary(dashboard: any): void {
    
    console.log(`💰 Receita Total: R$ ${dashboard.financial.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    console.log(`📈 Crescimento: ${dashboard.financial.revenueGrowth.toFixed(1)}%`);
    
    
    console.log(`⭐ Satisfação: ${dashboard.clinical.patientSatisfaction.toFixed(1)}/10`);
    console.log(`🎯 Taxa de Sucesso: ${dashboard.clinical.successRate.toFixed(1)}%`);
  }

  private async demonstratePredictiveAnalytics(): Promise<void> {
    try {
      // Demonstração de predição de no-show (com dados mock)
      
      const noShowPrediction = await this.biSystem.predictNoShow('demo_appointment_123');
      console.log(`- Risco: ${noShowPrediction.riskLevel.toUpperCase()}`);
      console.log(`- Probabilidade: ${(noShowPrediction.probability * 100).toFixed(1)}%`);
      console.log(`- Confiança: ${(noShowPrediction.confidence * 100).toFixed(1)}%`);

      // Demonstração de predição de resultado de tratamento
      
      const outcomePrediction = await this.biSystem.predictTreatmentOutcome('demo_patient_123', 'physiotherapy');
      console.log(`- Probabilidade de Sucesso: ${(outcomePrediction.successProbability * 100).toFixed(1)}%`);
      
      

    } catch (error) {
      
    }
  }

  private async generateAllCharts(period: DateRange): Promise<Record<string, any[]>> {
    const financialCharts = await this.biSystem.generateCharts('financial', period);
    const operationalCharts = await this.biSystem.generateCharts('operational', period);
    const clinicalCharts = await this.biSystem.generateCharts('clinical', period);
    const patientCharts = await this.biSystem.generateCharts('patient', period);

    return {
      financial: financialCharts,
      operational: operationalCharts,
      clinical: clinicalCharts,
      patient: patientCharts
    };
  }

  private async demonstrateMultiFormatExport(report: any): Promise<void> {
    // Export em PDF
    
    await this.biSystem.exportReport(report, {
      format: 'pdf',
      includeCharts: true,
      includeRawData: false
    });

    // Export em Excel
    
    await this.biSystem.exportReport(report, {
      format: 'excel',
      includeCharts: true,
      includeRawData: true
    });

    // Export em JSON
    
    await this.biSystem.exportReport(report, {
      format: 'json',
      includeCharts: false,
      includeRawData: true
    });

    
  }

  // Cenários práticos

  private async executiveWeeklyMeeting(period: DateRange): Promise<void> {
    

    const dashboard = await this.biSystem.generateExecutiveDashboard(period);
    const financialCharts = await this.biSystem.generateCharts('financial', period);

    
    
    
  }

  private async dailyOperationalAnalysis(): Promise<void> {
    

    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const period = { start: yesterday, end: today };

    const operationalCharts = await this.biSystem.generateCharts('operational', period);
    const anomalies = await this.biSystem.detectAnomalies(period);

    
    
    
  }

  private async monthlyFinancialReport(): Promise<void> {
    

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const period = {
      start: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
      end: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0)
    };

    const report = await this.biSystem.generateReport({
      title: 'Relatório Financeiro Mensal',
      period,
      sections: ['executive_summary', 'financial_analysis'],
      format: 'pdf'
    });

    const exportedReport = await this.biSystem.exportReport(report, {
      format: 'excel',
      includeCharts: true,
      includeRawData: true
    });

    
    
  }

  private async realTimeAnomalyAlerts(period: DateRange): Promise<void> {
    

    const anomalies = await this.biSystem.detectAnomalies(period);

    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
    const highAnomalies = anomalies.filter(a => a.severity === 'high');

    
    

    if (criticalAnomalies.length > 0) {
      
      criticalAnomalies.forEach(anomaly => {
        
      });
    }

    
  }
}

// Exemplo de uso standalone
export async function runBIDemo(supabaseUrl: string, supabaseKey: string): Promise<void> {
  const demo = new BISystemDemo(supabaseUrl, supabaseKey);

  

  try {
    // Executar demonstração completa
    await demo.runCompleteDemo();

    // Executar testes - ❌ Desabilitado no build de produção
    // await demo.runSystemTests();

    // Executar cenários práticos
    
    await demo.runPracticalScenarios();

    
    
    

  } catch (error) {
    console.error('\n❌ ERRO NA DEMONSTRAÇÃO:', error);
    throw error;
  }
}