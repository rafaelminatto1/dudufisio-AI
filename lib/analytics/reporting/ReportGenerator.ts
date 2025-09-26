import { createClient } from '@supabase/supabase-js';
import {
  Report,
  ReportSection,
  ReportDataSet,
  ReportRequest,
  DateRange,
  ChartConfig
} from '../types';
import { ExecutiveDashboard } from '../dashboard/ExecutiveDashboard';
import { MLModels } from '../ml/MLModels';

export class ReportGenerator {
  private supabase;
  private dashboard: ExecutiveDashboard;
  private mlModels: MLModels;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.dashboard = new ExecutiveDashboard(supabaseUrl, supabaseKey);
    this.mlModels = new MLModels(supabaseUrl, supabaseKey);
  }

  async generateReport(request: ReportRequest): Promise<Report> {
    try {
      console.log(`📋 Gerando relatório: ${request.title}`);

      const reportId = `report_${Date.now()}`;
      const sections: ReportSection[] = [];
      const charts: ChartConfig[] = [];
      const dataSets: ReportDataSet[] = [];

      // Generate dashboard data
      const dashboardData = await this.dashboard.generateDashboard(request.period);

      // Generate requested sections
      for (const sectionType of request.sections) {
        const section = await this.generateSection(sectionType, dashboardData, request.period);
        if (section) {
          sections.push(section);
        }
      }

      // Generate charts
      const reportCharts = await this.generateCharts(dashboardData, request.period);
      charts.push(...reportCharts);

      // Generate data sets
      const reportDataSets = await this.generateDataSets(request.period);
      dataSets.push(...reportDataSets);

      const report: Report = {
        id: reportId,
        title: request.title,
        type: this.determineReportType(request.period),
        period: request.period,
        sections,
        charts,
        dataSets,
        generatedAt: new Date(),
        generatedBy: 'Sistema BI'
      };

      console.log(`✅ Relatório gerado com sucesso: ${sections.length} seções`);
      return report;

    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      throw error;
    }
  }

  private async generateSection(
    sectionType: string,
    dashboardData: any,
    period: DateRange
  ): Promise<ReportSection | null> {
    switch (sectionType) {
      case 'executive_summary':
        return this.generateExecutiveSummary(dashboardData);
      case 'financial_analysis':
        return this.generateFinancialAnalysis(dashboardData.financial);
      case 'operational_metrics':
        return this.generateOperationalMetrics(dashboardData.operational);
      case 'clinical_outcomes':
        return this.generateClinicalOutcomes(dashboardData.clinical);
      case 'patient_insights':
        return this.generatePatientInsights(dashboardData.patient);
      case 'predictive_analytics':
        return await this.generatePredictiveAnalytics(period);
      case 'recommendations':
        return this.generateRecommendations(dashboardData);
      default:
        return null;
    }
  }

  private generateExecutiveSummary(dashboardData: any): ReportSection {
    const { financial, operational, clinical, patient } = dashboardData;

    const content = `
## Resumo Executivo

### Principais Indicadores do Período

**Desempenho Financeiro:**
- Receita Total: R$ ${financial.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Crescimento: ${financial.revenueGrowth.toFixed(1)}%
- Pacientes Pagantes: ${financial.payingPatients}
- Taxa de Cobrança: ${financial.collectionRate.toFixed(1)}%

**Operações:**
- Total de Consultas: ${operational.totalAppointments}
- Crescimento de Consultas: ${operational.appointmentGrowth.toFixed(1)}%
- Taxa de Faltas: ${operational.noShowRate.toFixed(1)}%
- Utilização dos Terapeutas: ${operational.therapistUtilization.toFixed(1)}%

**Resultados Clínicos:**
- Total de Tratamentos: ${clinical.totalTreatments}
- Taxa de Sucesso: ${clinical.successRate.toFixed(1)}%
- Redução Média de Dor: ${clinical.avgPainReduction.toFixed(1)} pontos
- Satisfação dos Pacientes: ${clinical.patientSatisfaction.toFixed(1)}/10

**Pacientes:**
- Total de Pacientes: ${patient.totalPatients}
- Novos Pacientes: ${patient.newPatients}
- Taxa de Retenção: ${patient.retentionRate.toFixed(1)}%
- Faixa Etária Principal: ${patient.avgAgeGroup}

### Alertas Importantes
${dashboardData.alerts.length > 0 ?
  dashboardData.alerts.map((alert: any) => `- **${alert.title}**: ${alert.description}`).join('\n') :
  'Nenhum alerta crítico identificado no período.'
}
    `;

    return {
      id: 'executive_summary',
      title: 'Resumo Executivo',
      type: 'summary',
      content: content.trim()
    };
  }

  private generateFinancialAnalysis(financial: any): ReportSection {
    const content = `
## Análise Financeira Detalhada

### Receita e Crescimento
- **Receita Total**: R$ ${financial.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- **Crescimento**: ${financial.revenueGrowth >= 0 ? '+' : ''}${financial.revenueGrowth.toFixed(1)}%
- **Ticket Médio**: R$ ${financial.avgTransactionValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

### Indicadores de Cobrança
- **Taxa de Cobrança**: ${financial.collectionRate.toFixed(1)}%
- **Taxa de Inadimplência**: ${financial.overdueRate.toFixed(1)}%
- **Pacientes Pagantes**: ${financial.payingPatients}

### Análise de Performance
${financial.revenueGrowth > 10 ?
  '✅ **Crescimento Excelente**: A receita apresenta crescimento muito positivo.' :
  financial.revenueGrowth > 0 ?
  '🔶 **Crescimento Moderado**: Receita em crescimento, mas com potencial de melhoria.' :
  '🔴 **Atenção Necessária**: Receita em declínio, requer ações imediatas.'
}

${financial.collectionRate > 90 ?
  '✅ **Cobrança Eficiente**: Taxa de cobrança excelente.' :
  financial.collectionRate > 75 ?
  '🔶 **Cobrança Adequada**: Taxa de cobrança satisfatória, mas pode melhorar.' :
  '🔴 **Cobrança Deficiente**: Taxa de cobrança baixa, requer atenção imediata.'
}

### Recomendações Financeiras
- ${financial.revenueGrowth < 0 ? 'Implementar estratégias de recuperação de receita' : 'Manter estratégias de crescimento atuais'}
- ${financial.overdueRate > 15 ? 'Melhorar processos de cobrança e follow-up' : 'Manter controle sobre inadimplência'}
- ${financial.avgTransactionValue < 100 ? 'Avaliar reajuste de preços ou pacotes de serviços' : 'Ticket médio adequado'}
    `;

    return {
      id: 'financial_analysis',
      title: 'Análise Financeira',
      type: 'analysis',
      content: content.trim(),
      data: financial
    };
  }

  private generateOperationalMetrics(operational: any): ReportSection {
    const content = `
## Métricas Operacionais

### Volume de Atendimento
- **Total de Consultas**: ${operational.totalAppointments}
- **Crescimento**: ${operational.appointmentGrowth >= 0 ? '+' : ''}${operational.appointmentGrowth.toFixed(1)}%
- **Duração Média da Sessão**: ${operational.avgSessionDuration.toFixed(0)} minutos

### Eficiência Operacional
- **Taxa de Faltas**: ${operational.noShowRate.toFixed(1)}%
- **Taxa de Cancelamentos**: ${operational.cancellationRate.toFixed(1)}%
- **Utilização dos Terapeutas**: ${operational.therapistUtilization.toFixed(1)}%

### Análise de Performance Operacional
${operational.noShowRate < 10 ?
  '✅ **Taxa de Faltas Baixa**: Excelente controle de no-shows.' :
  operational.noShowRate < 20 ?
  '🔶 **Taxa de Faltas Moderada**: Há espaço para melhorias.' :
  '🔴 **Taxa de Faltas Alta**: Requer ação imediata.'
}

${operational.therapistUtilization > 80 ?
  '🔴 **Sobrecarga**: Terapeutas podem estar sobrecarregados.' :
  operational.therapistUtilization > 60 ?
  '✅ **Utilização Ideal**: Boa utilização dos recursos.' :
  '🔶 **Subutilização**: Potencial para mais atendimentos.'
}

### Recomendações Operacionais
- ${operational.noShowRate > 15 ? 'Implementar sistema de lembretes automatizados' : 'Manter sistema atual de confirmações'}
- ${operational.therapistUtilization > 85 ? 'Considerar contratação de novos terapeutas' : 'Utilização adequada da equipe'}
- ${operational.cancellationRate > 10 ? 'Revisar política de cancelamentos' : 'Taxa de cancelamentos sob controle'}
    `;

    return {
      id: 'operational_metrics',
      title: 'Métricas Operacionais',
      type: 'metrics',
      content: content.trim(),
      data: operational
    };
  }

  private generateClinicalOutcomes(clinical: any): ReportSection {
    const content = `
## Resultados Clínicos

### Efetividade dos Tratamentos
- **Total de Tratamentos**: ${clinical.totalTreatments}
- **Taxa de Sucesso**: ${clinical.successRate.toFixed(1)}%
- **Redução Média de Dor**: ${clinical.avgPainReduction.toFixed(1)} pontos (escala 0-10)
- **Duração Média do Tratamento**: ${clinical.avgTreatmentDuration.toFixed(0)} minutos

### Satisfação dos Pacientes
- **Satisfação Média**: ${clinical.patientSatisfaction.toFixed(1)}/10
- **Sessões por Tratamento**: ${clinical.avgSessionsPerTreatment.toFixed(1)}

### Análise de Qualidade Clínica
${clinical.successRate > 75 ?
  '✅ **Excelente Efetividade**: Taxa de sucesso muito boa.' :
  clinical.successRate > 60 ?
  '🔶 **Efetividade Moderada**: Resultados satisfatórios com potencial de melhoria.' :
  '🔴 **Baixa Efetividade**: Requer revisão dos protocolos de tratamento.'
}

${clinical.patientSatisfaction > 8 ?
  '✅ **Alta Satisfação**: Pacientes muito satisfeitos com os resultados.' :
  clinical.patientSatisfaction > 6 ?
  '🔶 **Satisfação Moderada**: Boa satisfação, mas pode melhorar.' :
  '🔴 **Baixa Satisfação**: Requer atenção imediata à qualidade do atendimento.'
}

### Recomendações Clínicas
- ${clinical.successRate < 70 ? 'Revisar e atualizar protocolos de tratamento' : 'Manter protocolos atuais de tratamento'}
- ${clinical.patientSatisfaction < 7 ? 'Implementar programa de melhoria da experiência do paciente' : 'Manter foco na satisfação do paciente'}
- ${clinical.avgSessionsPerTreatment > 10 ? 'Avaliar eficiência dos tratamentos prolongados' : 'Duração dos tratamentos adequada'}
    `;

    return {
      id: 'clinical_outcomes',
      title: 'Resultados Clínicos',
      type: 'analysis',
      content: content.trim(),
      data: clinical
    };
  }

  private generatePatientInsights(patient: any): ReportSection {
    const content = `
## Análise de Pacientes

### Demografia dos Pacientes
- **Total de Pacientes**: ${patient.totalPatients}
- **Novos Pacientes**: ${patient.newPatients}
- **Pacientes Ativos**: ${patient.activePatients}
- **Faixa Etária Principal**: ${patient.avgAgeGroup}

### Retenção e Engajamento
- **Taxa de Retenção**: ${patient.retentionRate.toFixed(1)}%
- **Taxa de Indicação**: ${patient.referralRate.toFixed(1)}%

### Análise de Crescimento da Base
${patient.newPatients > patient.totalPatients * 0.1 ?
  '✅ **Crescimento Saudável**: Boa aquisição de novos pacientes.' :
  patient.newPatients > patient.totalPatients * 0.05 ?
  '🔶 **Crescimento Moderado**: Aquisição moderada de novos pacientes.' :
  '🔴 **Baixo Crescimento**: Necessário melhorar estratégias de aquisição.'
}

${patient.retentionRate > 80 ?
  '✅ **Alta Retenção**: Excelente fidelização de pacientes.' :
  patient.retentionRate > 60 ?
  '🔶 **Retenção Moderada**: Boa retenção, mas pode melhorar.' :
  '🔴 **Baixa Retenção**: Requer ações para melhorar fidelização.'
}

### Recomendações para Pacientes
- ${patient.retentionRate < 60 ? 'Implementar programa de fidelização' : 'Manter estratégias de retenção atuais'}
- ${patient.newPatients < patient.totalPatients * 0.05 ? 'Investir em marketing e parcerias' : 'Continuar estratégias de aquisição'}
- ${patient.referralRate < 5 ? 'Criar programa de indicações' : 'Manter programa de indicações ativo'}
    `;

    return {
      id: 'patient_insights',
      title: 'Análise de Pacientes',
      type: 'analysis',
      content: content.trim(),
      data: patient
    };
  }

  private async generatePredictiveAnalytics(period: DateRange): Promise<ReportSection> {
    try {
      const anomalies = await this.mlModels.detectAnomalies(period);

      const content = `
## Analytics Preditivos

### Detecção de Anomalias
${anomalies.length > 0 ?
  anomalies.map(anomaly =>
    `**${anomaly.affectedMetric}**: ${anomaly.description} (Desvio: ${anomaly.deviation.toFixed(1)}%)`
  ).join('\n') :
  'Nenhuma anomalia significativa detectada no período.'
}

### Previsões e Tendências
- **Risco de No-Show**: Monitoramento ativo implementado
- **Previsão de Resultados**: Modelos preditivos operacionais
- **Detecção de Padrões**: Sistema de alertas automáticos ativo

### Insights de Machine Learning
${anomalies.filter(a => a.severity === 'critical').length > 0 ?
  '🔴 **Atenção**: Anomalias críticas detectadas que requerem ação imediata.' :
  anomalies.filter(a => a.severity === 'high').length > 0 ?
  '🔶 **Monitoramento**: Anomalias de alta severidade identificadas.' :
  '✅ **Normal**: Operação dentro dos padrões esperados.'
}

### Recomendações Baseadas em IA
${anomalies.length > 0 ?
  anomalies.slice(0, 3).map(anomaly =>
    anomaly.recommendations[0]
  ).join('\n- ') :
  '- Continuar monitoramento com modelos preditivos\n- Manter coleta de dados para aprimoramento dos modelos'
}
      `;

      return {
        id: 'predictive_analytics',
        title: 'Analytics Preditivos',
        type: 'analysis',
        content: content.trim(),
        data: { anomalies }
      };

    } catch (error) {
      return {
        id: 'predictive_analytics',
        title: 'Analytics Preditivos',
        type: 'analysis',
        content: 'Erro ao gerar análise preditiva. Dados insuficientes ou sistema indisponível.',
        data: {}
      };
    }
  }

  private generateRecommendations(dashboardData: any): ReportSection {
    const recommendations: string[] = [];

    // Financial recommendations
    if (dashboardData.financial.revenueGrowth < 0) {
      recommendations.push('**Financeiro**: Implementar estratégias de recuperação de receita');
    }
    if (dashboardData.financial.overdueRate > 15) {
      recommendations.push('**Financeiro**: Melhorar processos de cobrança');
    }

    // Operational recommendations
    if (dashboardData.operational.noShowRate > 15) {
      recommendations.push('**Operacional**: Implementar sistema de lembretes automáticos');
    }
    if (dashboardData.operational.therapistUtilization > 85) {
      recommendations.push('**Operacional**: Considerar expansão da equipe');
    }

    // Clinical recommendations
    if (dashboardData.clinical.successRate < 70) {
      recommendations.push('**Clínico**: Revisar protocolos de tratamento');
    }
    if (dashboardData.clinical.patientSatisfaction < 7) {
      recommendations.push('**Clínico**: Melhorar experiência do paciente');
    }

    // Patient recommendations
    if (dashboardData.patient.retentionRate < 60) {
      recommendations.push('**Pacientes**: Implementar programa de fidelização');
    }
    if (dashboardData.patient.referralRate < 5) {
      recommendations.push('**Pacientes**: Criar programa de indicações');
    }

    const content = `
## Recomendações Estratégicas

### Ações Prioritárias
${recommendations.length > 0 ?
  recommendations.map(rec => `- ${rec}`).join('\n') :
  '- Manter estratégias atuais\n- Continuar monitoramento de indicadores\n- Focar na melhoria contínua'
}

### Implementação Sugerida
1. **Curto Prazo (1-30 dias)**: Ações corretivas imediatas
2. **Médio Prazo (1-3 meses)**: Implementação de melhorias operacionais
3. **Longo Prazo (3-6 meses)**: Estratégias de crescimento e expansão

### Métricas de Acompanhamento
- Monitorar indicadores mensalmente
- Revisar efetividade das ações implementadas
- Ajustar estratégias baseado nos resultados
    `;

    return {
      id: 'recommendations',
      title: 'Recomendações',
      type: 'recommendations',
      content: content.trim(),
      data: { recommendations }
    };
  }

  private async generateCharts(dashboardData: any, period: DateRange): Promise<ChartConfig[]> {
    const charts: ChartConfig[] = [];

    // Revenue trend chart
    const revenueChart: ChartConfig = {
      id: 'revenue_trend',
      type: 'line',
      title: 'Tendência de Receita',
      data: {
        labels: ['Período Anterior', 'Período Atual'],
        datasets: [{
          label: 'Receita (R$)',
          data: [
            dashboardData.financial.totalRevenue / (1 + dashboardData.financial.revenueGrowth/100),
            dashboardData.financial.totalRevenue
          ],
          borderColor: '#10b981',
          backgroundColor: '#10b98120',
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Evolução da Receita' },
          legend: { display: true, position: 'top' }
        }
      }
    };
    charts.push(revenueChart);

    // KPI overview pie chart
    const kpiChart: ChartConfig = {
      id: 'operational_kpis',
      type: 'pie',
      title: 'Distribuição Operacional',
      data: {
        labels: ['Consultas Realizadas', 'Faltas', 'Cancelamentos'],
        datasets: [{
          label: 'Distribuição',
          data: [
            dashboardData.operational.totalAppointments * (100 - dashboardData.operational.noShowRate - dashboardData.operational.cancellationRate) / 100,
            dashboardData.operational.totalAppointments * dashboardData.operational.noShowRate / 100,
            dashboardData.operational.totalAppointments * dashboardData.operational.cancellationRate / 100
          ],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Status das Consultas' },
          legend: { display: true, position: 'bottom' }
        }
      }
    };
    charts.push(kpiChart);

    return charts;
  }

  private async generateDataSets(period: DateRange): Promise<ReportDataSet[]> {
    const dataSets: ReportDataSet[] = [];

    // Financial transactions summary
    const { data: financialData } = await this.supabase
      .from('fact_financial_transactions')
      .select('transaction_date, net_amount, payment_method, status')
      .gte('transaction_date', period.start.toISOString())
      .lte('transaction_date', period.end.toISOString())
      .limit(100);

    if (financialData && financialData.length > 0) {
      dataSets.push({
        name: 'Transações Financeiras',
        headers: ['Data', 'Valor', 'Método', 'Status'],
        rows: financialData.map(row => [
          new Date(row.transaction_date).toLocaleDateString('pt-BR'),
          `R$ ${row.net_amount.toFixed(2)}`,
          row.payment_method,
          row.status
        ])
      });
    }

    // Appointments summary
    const { data: appointmentData } = await this.supabase
      .from('fact_appointments')
      .select('appointment_date, status, duration_minutes, is_no_show, is_cancelled')
      .gte('appointment_date', period.start.toISOString())
      .lte('appointment_date', period.end.toISOString())
      .limit(100);

    if (appointmentData && appointmentData.length > 0) {
      dataSets.push({
        name: 'Consultas',
        headers: ['Data', 'Status', 'Duração (min)', 'Faltou', 'Cancelou'],
        rows: appointmentData.map(row => [
          new Date(row.appointment_date).toLocaleDateString('pt-BR'),
          row.status,
          row.duration_minutes?.toString() || '0',
          row.is_no_show ? 'Sim' : 'Não',
          row.is_cancelled ? 'Sim' : 'Não'
        ])
      });
    }

    return dataSets;
  }

  private determineReportType(period: DateRange): 'daily' | 'weekly' | 'monthly' | 'custom' {
    const duration = period.end.getTime() - period.start.getTime();
    const days = duration / (1000 * 60 * 60 * 24);

    if (days <= 1) return 'daily';
    if (days <= 7) return 'weekly';
    if (days <= 31) return 'monthly';
    return 'custom';
  }

  async scheduleAutomatedReports(schedules: {
    reportType: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    format: 'pdf' | 'excel' | 'html';
  }[]): Promise<void> {
    // In a real implementation, this would integrate with a job scheduler
    console.log('📅 Agendamento de relatórios automatizados configurado');
    console.log(`Configurados ${schedules.length} relatórios automáticos`);

    // Store schedule configuration in database
    for (const schedule of schedules) {
      const { error } = await this.supabase
        .from('report_schedules')
        .upsert({
          report_type: schedule.reportType,
          frequency: schedule.frequency,
          recipients: schedule.recipients,
          format: schedule.format,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        });

      if (error) {
        console.error('Erro ao salvar agendamento:', error);
      }
    }
  }

  async getScheduledReports(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('report_schedules')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Erro ao buscar relatórios agendados:', error);
      return [];
    }

    return data || [];
  }

  async executeScheduledReport(scheduleId: string): Promise<void> {
    // Implementation for executing a scheduled report
    console.log(`🔄 Executando relatório agendado: ${scheduleId}`);
  }
}