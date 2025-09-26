import { createClient } from '@supabase/supabase-js';
import {
  KPIDashboard,
  FinancialKPIs,
  OperationalKPIs,
  ClinicalKPIs,
  PatientKPIs,
  DateRange,
  TrendAnalysis,
  BusinessAlert,
  ChartConfig
} from '../types';

export class ExecutiveDashboard {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async generateDashboard(period: DateRange): Promise<KPIDashboard> {
    try {
      console.log('📊 Gerando Dashboard Executivo...');

      const [financial, operational, clinical, patient] = await Promise.all([
        this.calculateFinancialKPIs(period),
        this.calculateOperationalKPIs(period),
        this.calculateClinicalKPIs(period),
        this.calculatePatientKPIs(period)
      ]);

      const trends = await this.analyzeTrends(period);
      const alerts = await this.generateBusinessAlerts(financial, operational, clinical, patient);

      const dashboard: KPIDashboard = {
        period,
        financial,
        operational,
        clinical,
        patient,
        trends,
        alerts,
        lastUpdated: new Date()
      };

      console.log('✅ Dashboard Executivo gerado com sucesso');
      return dashboard;

    } catch (error) {
      console.error('❌ Erro ao gerar dashboard:', error);
      throw error;
    }
  }

  private async calculateFinancialKPIs(period: DateRange): Promise<FinancialKPIs> {
    try {
      // Total Revenue
      const { data: revenueData } = await this.supabase
        .from('fact_financial_transactions')
        .select('net_amount')
        .eq('is_revenue', true)
        .eq('status', 'completed')
        .gte('transaction_date', period.start.toISOString())
        .lte('transaction_date', period.end.toISOString());

      const totalRevenue = revenueData?.reduce((sum, t) => sum + t.net_amount, 0) || 0;

      // Revenue Growth (compare with previous period)
      const previousPeriod = this.getPreviousPeriod(period);
      const { data: previousRevenueData } = await this.supabase
        .from('fact_financial_transactions')
        .select('net_amount')
        .eq('is_revenue', true)
        .eq('status', 'completed')
        .gte('transaction_date', previousPeriod.start.toISOString())
        .lte('transaction_date', previousPeriod.end.toISOString());

      const previousRevenue = previousRevenueData?.reduce((sum, t) => sum + t.net_amount, 0) || 0;
      const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      // Paying Patients
      const { data: payingPatientsData } = await this.supabase
        .from('fact_financial_transactions')
        .select('patient_key')
        .eq('is_revenue', true)
        .eq('status', 'completed')
        .gte('transaction_date', period.start.toISOString())
        .lte('transaction_date', period.end.toISOString());

      const payingPatients = new Set(payingPatientsData?.map(p => p.patient_key) || []).size;

      // Average Transaction Value
      const avgTransactionValue = revenueData && revenueData.length > 0 ?
        totalRevenue / revenueData.length : 0;

      // Collection Rate
      const { data: allTransactionsData } = await this.supabase
        .from('fact_financial_transactions')
        .select('gross_amount, net_amount, status')
        .gte('transaction_date', period.start.toISOString())
        .lte('transaction_date', period.end.toISOString());

      const totalBilled = allTransactionsData?.reduce((sum, t) => sum + t.gross_amount, 0) || 0;
      const collectionRate = totalBilled > 0 ? (totalRevenue / totalBilled) * 100 : 0;

      // Overdue Rate
      const { data: overdueData } = await this.supabase
        .from('fact_financial_transactions')
        .select('net_amount')
        .eq('status', 'overdue')
        .gte('transaction_date', period.start.toISOString())
        .lte('transaction_date', period.end.toISOString());

      const overdueAmount = overdueData?.reduce((sum, t) => sum + t.net_amount, 0) || 0;
      const overdueRate = totalBilled > 0 ? (overdueAmount / totalBilled) * 100 : 0;

      return {
        totalRevenue,
        revenueGrowth,
        payingPatients,
        avgTransactionValue,
        collectionRate,
        overdueRate,
        period
      };

    } catch (error) {
      console.error('❌ Erro no cálculo de KPIs financeiros:', error);
      return {
        totalRevenue: 0,
        revenueGrowth: 0,
        payingPatients: 0,
        avgTransactionValue: 0,
        collectionRate: 0,
        overdueRate: 0,
        period
      };
    }
  }

  private async calculateOperationalKPIs(period: DateRange): Promise<OperationalKPIs> {
    try {
      // Total Appointments
      const { data: appointmentsData } = await this.supabase
        .from('fact_appointments')
        .select('*')
        .gte('appointment_date', period.start.toISOString())
        .lte('appointment_date', period.end.toISOString());

      const totalAppointments = appointmentsData?.length || 0;

      // Appointment Growth
      const previousPeriod = this.getPreviousPeriod(period);
      const { data: previousAppointmentsData } = await this.supabase
        .from('fact_appointments')
        .select('*')
        .gte('appointment_date', previousPeriod.start.toISOString())
        .lte('appointment_date', previousPeriod.end.toISOString());

      const previousAppointments = previousAppointmentsData?.length || 0;
      const appointmentGrowth = previousAppointments > 0 ?
        ((totalAppointments - previousAppointments) / previousAppointments) * 100 : 0;

      // No Show Rate
      const noShowAppointments = appointmentsData?.filter(a => a.is_no_show).length || 0;
      const noShowRate = totalAppointments > 0 ? (noShowAppointments / totalAppointments) * 100 : 0;

      // Cancellation Rate
      const cancelledAppointments = appointmentsData?.filter(a => a.is_cancelled).length || 0;
      const cancellationRate = totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0;

      // Average Session Duration
      const totalDuration = appointmentsData?.reduce((sum, a) => sum + (a.duration_minutes || 0), 0) || 0;
      const avgSessionDuration = totalAppointments > 0 ? totalDuration / totalAppointments : 0;

      // Therapist Utilization
      const { data: therapistData } = await this.supabase
        .from('dim_therapists')
        .select('therapist_key')
        .eq('is_current', true);

      const totalTherapists = therapistData?.length || 1;
      const workingHoursPerDay = 8;
      const workingDaysInPeriod = this.calculateWorkingDays(period);
      const totalAvailableHours = totalTherapists * workingHoursPerDay * workingDaysInPeriod;
      const totalUsedHours = totalDuration / 60;
      const therapistUtilization = totalAvailableHours > 0 ? (totalUsedHours / totalAvailableHours) * 100 : 0;

      return {
        totalAppointments,
        appointmentGrowth,
        noShowRate,
        cancellationRate,
        avgSessionDuration,
        therapistUtilization,
        period
      };

    } catch (error) {
      console.error('❌ Erro no cálculo de KPIs operacionais:', error);
      return {
        totalAppointments: 0,
        appointmentGrowth: 0,
        noShowRate: 0,
        cancellationRate: 0,
        avgSessionDuration: 0,
        therapistUtilization: 0,
        period
      };
    }
  }

  private async calculateClinicalKPIs(period: DateRange): Promise<ClinicalKPIs> {
    try {
      // Total Treatments
      const { data: treatmentsData } = await this.supabase
        .from('fact_clinical_outcomes')
        .select('*')
        .gte('session_date', period.start.toISOString())
        .lte('session_date', period.end.toISOString());

      const totalTreatments = treatmentsData?.length || 0;

      // Average Pain Reduction
      const totalPainReduction = treatmentsData?.reduce((sum, t) => sum + (t.pain_improvement || 0), 0) || 0;
      const avgPainReduction = totalTreatments > 0 ? totalPainReduction / totalTreatments : 0;

      // Success Rate (improvement >= 2 points)
      const successfulTreatments = treatmentsData?.filter(t => (t.pain_improvement || 0) >= 2).length || 0;
      const successRate = totalTreatments > 0 ? (successfulTreatments / totalTreatments) * 100 : 0;

      // Patient Satisfaction
      const totalSatisfaction = treatmentsData?.reduce((sum, t) => sum + (t.patient_satisfaction || 0), 0) || 0;
      const patientSatisfaction = totalTreatments > 0 ? totalSatisfaction / totalTreatments : 0;

      // Average Sessions Per Treatment
      const { data: patientsWithSessions } = await this.supabase
        .from('fact_clinical_outcomes')
        .select('patient_key')
        .gte('session_date', period.start.toISOString())
        .lte('session_date', period.end.toISOString());

      const uniquePatients = new Set(patientsWithSessions?.map(p => p.patient_key) || []).size;
      const avgSessionsPerTreatment = uniquePatients > 0 ? totalTreatments / uniquePatients : 0;

      // Average Treatment Duration
      const totalDuration = treatmentsData?.reduce((sum, t) => sum + (t.duration_minutes || 0), 0) || 0;
      const avgTreatmentDuration = totalTreatments > 0 ? totalDuration / totalTreatments : 0;

      return {
        totalTreatments,
        avgPainReduction,
        successRate,
        patientSatisfaction,
        avgSessionsPerTreatment,
        avgTreatmentDuration,
        period
      };

    } catch (error) {
      console.error('❌ Erro no cálculo de KPIs clínicos:', error);
      return {
        totalTreatments: 0,
        avgPainReduction: 0,
        successRate: 0,
        patientSatisfaction: 0,
        avgSessionsPerTreatment: 0,
        avgTreatmentDuration: 0,
        period
      };
    }
  }

  private async calculatePatientKPIs(period: DateRange): Promise<PatientKPIs> {
    try {
      // Total Patients
      const { data: allPatientsData } = await this.supabase
        .from('dim_patients')
        .select('*')
        .eq('is_current', true);

      const totalPatients = allPatientsData?.length || 0;

      // New Patients
      const { data: newPatientsData } = await this.supabase
        .from('dim_patients')
        .select('*')
        .eq('is_current', true)
        .gte('effective_date', period.start.toISOString())
        .lte('effective_date', period.end.toISOString());

      const newPatients = newPatientsData?.length || 0;

      // Active Patients (patients with appointments in period)
      const { data: activePatientData } = await this.supabase
        .from('fact_appointments')
        .select('patient_key')
        .gte('appointment_date', period.start.toISOString())
        .lte('appointment_date', period.end.toISOString());

      const activePatients = new Set(activePatientData?.map(a => a.patient_key) || []).size;

      // Retention Rate
      const previousPeriod = this.getPreviousPeriod(period);
      const { data: previousActiveData } = await this.supabase
        .from('fact_appointments')
        .select('patient_key')
        .gte('appointment_date', previousPeriod.start.toISOString())
        .lte('appointment_date', previousPeriod.end.toISOString());

      const previousActivePatients = new Set(previousActiveData?.map(a => a.patient_key) || []);
      const currentActivePatients = new Set(activePatientData?.map(a => a.patient_key) || []);

      const retainedPatients = Array.from(previousActivePatients).filter(p =>
        currentActivePatients.has(p)
      ).length;

      const retentionRate = previousActivePatients.size > 0 ?
        (retainedPatients / previousActivePatients.size) * 100 : 0;

      // Average Age Group
      const ageGroups = allPatientsData?.map(p => p.age_group) || [];
      const ageGroupCounts = ageGroups.reduce((acc: Record<string, number>, group: string) => {
        acc[group] = (acc[group] || 0) + 1;
        return acc;
      }, {});

      const avgAgeGroup = Object.entries(ageGroupCounts).reduce((a, b) =>
        ageGroupCounts[a[0]] > ageGroupCounts[b[0]] ? a : b
      )?.[0] || 'Adulto';

      // Referral Rate (estimate based on patient engagement)
      const { data: engagementData } = await this.supabase
        .from('fact_patient_engagement')
        .select('*')
        .eq('engagement_type', 'referral')
        .gte('engagement_date', period.start.toISOString())
        .lte('engagement_date', period.end.toISOString());

      const referralRate = totalPatients > 0 ? ((engagementData?.length || 0) / totalPatients) * 100 : 0;

      return {
        totalPatients,
        newPatients,
        activePatients,
        retentionRate,
        avgAgeGroup,
        referralRate,
        period
      };

    } catch (error) {
      console.error('❌ Erro no cálculo de KPIs de pacientes:', error);
      return {
        totalPatients: 0,
        newPatients: 0,
        activePatients: 0,
        retentionRate: 0,
        avgAgeGroup: 'Adulto',
        referralRate: 0,
        period
      };
    }
  }

  private async analyzeTrends(period: DateRange): Promise<TrendAnalysis[]> {
    const trends: TrendAnalysis[] = [];

    try {
      // Revenue trend
      const revenueTrend = await this.calculateMetricTrend('revenue', period);
      trends.push(revenueTrend);

      // Appointments trend
      const appointmentsTrend = await this.calculateMetricTrend('appointments', period);
      trends.push(appointmentsTrend);

      // Patient satisfaction trend
      const satisfactionTrend = await this.calculateMetricTrend('satisfaction', period);
      trends.push(satisfactionTrend);

      // No-show rate trend
      const noShowTrend = await this.calculateMetricTrend('no_show_rate', period);
      trends.push(noShowTrend);

    } catch (error) {
      console.error('❌ Erro na análise de tendências:', error);
    }

    return trends;
  }

  private async calculateMetricTrend(metric: string, period: DateRange): Promise<TrendAnalysis> {
    const previousPeriod = this.getPreviousPeriod(period);

    let currentValue = 0;
    let previousValue = 0;

    switch (metric) {
      case 'revenue':
        currentValue = await this.getRevenueForPeriod(period);
        previousValue = await this.getRevenueForPeriod(previousPeriod);
        break;
      case 'appointments':
        currentValue = await this.getAppointmentsCountForPeriod(period);
        previousValue = await this.getAppointmentsCountForPeriod(previousPeriod);
        break;
      case 'satisfaction':
        currentValue = await this.getAvgSatisfactionForPeriod(period);
        previousValue = await this.getAvgSatisfactionForPeriod(previousPeriod);
        break;
      case 'no_show_rate':
        currentValue = await this.getNoShowRateForPeriod(period);
        previousValue = await this.getNoShowRateForPeriod(previousPeriod);
        break;
    }

    const change = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
    const trend = change > 5 ? 'up' : change < -5 ? 'down' : 'stable';
    const significance = Math.abs(change) > 20 ? 'high' : Math.abs(change) > 10 ? 'medium' : 'low';

    return {
      metric,
      trend,
      change,
      significance,
      description: this.getTrendDescription(metric, trend, change)
    };
  }

  private async generateBusinessAlerts(
    financial: FinancialKPIs,
    operational: OperationalKPIs,
    clinical: ClinicalKPIs,
    patient: PatientKPIs
  ): Promise<BusinessAlert[]> {
    const alerts: BusinessAlert[] = [];

    // Revenue alerts
    if (financial.revenueGrowth < -10) {
      alerts.push({
        id: `revenue_decline_${Date.now()}`,
        type: 'revenue',
        severity: 'critical',
        title: 'Queda Significativa na Receita',
        description: `A receita diminuiu ${Math.abs(financial.revenueGrowth).toFixed(1)}% comparado ao período anterior.`,
        recommendations: [
          'Revisar preços dos serviços',
          'Implementar campanhas de marketing',
          'Analisar concorrência local',
          'Melhorar retenção de pacientes'
        ],
        createdAt: new Date()
      });
    }

    // No-show rate alerts
    if (operational.noShowRate > 15) {
      alerts.push({
        id: `no_show_high_${Date.now()}`,
        type: 'operational',
        severity: 'warning',
        title: 'Alta Taxa de Faltas',
        description: `Taxa de faltas está em ${operational.noShowRate.toFixed(1)}%, acima do ideal (< 10%).`,
        recommendations: [
          'Implementar sistema de lembretes por SMS/WhatsApp',
          'Aplicar política de cobrança por faltas',
          'Melhorar comunicação com pacientes',
          'Oferecer reagendamento flexível'
        ],
        createdAt: new Date()
      });
    }

    // Clinical effectiveness alerts
    if (clinical.successRate < 70) {
      alerts.push({
        id: `clinical_effectiveness_${Date.now()}`,
        type: 'clinical',
        severity: 'warning',
        title: 'Baixa Taxa de Sucesso Clínico',
        description: `Taxa de sucesso dos tratamentos está em ${clinical.successRate.toFixed(1)}%, abaixo do esperado (> 75%).`,
        recommendations: [
          'Revisar protocolos de tratamento',
          'Investir em capacitação da equipe',
          'Implementar avaliações mais frequentes',
          'Considerar especialização em áreas específicas'
        ],
        createdAt: new Date()
      });
    }

    // Patient retention alerts
    if (patient.retentionRate < 60) {
      alerts.push({
        id: `retention_low_${Date.now()}`,
        type: 'patient',
        severity: 'critical',
        title: 'Baixa Taxa de Retenção',
        description: `Taxa de retenção de pacientes está em ${patient.retentionRate.toFixed(1)}%, muito abaixo do ideal (> 80%).`,
        recommendations: [
          'Melhorar experiência do paciente',
          'Implementar programa de fidelidade',
          'Pesquisar motivos de abandono',
          'Criar follow-up pós-tratamento'
        ],
        createdAt: new Date()
      });
    }

    return alerts;
  }

  // Utility methods
  private getPreviousPeriod(period: DateRange): DateRange {
    const duration = period.end.getTime() - period.start.getTime();
    return {
      start: new Date(period.start.getTime() - duration),
      end: new Date(period.end.getTime() - duration)
    };
  }

  private calculateWorkingDays(period: DateRange): number {
    let count = 0;
    const current = new Date(period.start);

    while (current <= period.end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Monday to Friday
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  private async getRevenueForPeriod(period: DateRange): Promise<number> {
    const { data } = await this.supabase
      .from('fact_financial_transactions')
      .select('net_amount')
      .eq('is_revenue', true)
      .eq('status', 'completed')
      .gte('transaction_date', period.start.toISOString())
      .lte('transaction_date', period.end.toISOString());

    return data?.reduce((sum, t) => sum + t.net_amount, 0) || 0;
  }

  private async getAppointmentsCountForPeriod(period: DateRange): Promise<number> {
    const { count } = await this.supabase
      .from('fact_appointments')
      .select('*', { count: 'exact', head: true })
      .gte('appointment_date', period.start.toISOString())
      .lte('appointment_date', period.end.toISOString());

    return count || 0;
  }

  private async getAvgSatisfactionForPeriod(period: DateRange): Promise<number> {
    const { data } = await this.supabase
      .from('fact_clinical_outcomes')
      .select('patient_satisfaction')
      .gte('session_date', period.start.toISOString())
      .lte('session_date', period.end.toISOString());

    const total = data?.reduce((sum, s) => sum + (s.patient_satisfaction || 0), 0) || 0;
    return data && data.length > 0 ? total / data.length : 0;
  }

  private async getNoShowRateForPeriod(period: DateRange): Promise<number> {
    const { data } = await this.supabase
      .from('fact_appointments')
      .select('is_no_show')
      .gte('appointment_date', period.start.toISOString())
      .lte('appointment_date', period.end.toISOString());

    const total = data?.length || 0;
    const noShows = data?.filter(a => a.is_no_show).length || 0;

    return total > 0 ? (noShows / total) * 100 : 0;
  }

  private getTrendDescription(metric: string, trend: string, change: number): string {
    const direction = trend === 'up' ? 'aumento' : trend === 'down' ? 'diminuição' : 'estabilidade';
    const metricName = {
      'revenue': 'receita',
      'appointments': 'consultas',
      'satisfaction': 'satisfação dos pacientes',
      'no_show_rate': 'taxa de faltas'
    }[metric] || metric;

    return `${direction} de ${Math.abs(change).toFixed(1)}% na ${metricName}`;
  }

  async exportDashboard(dashboard: KPIDashboard, format: 'json' | 'pdf' | 'excel'): Promise<string> {
    switch (format) {
      case 'json':
        return JSON.stringify(dashboard, null, 2);
      case 'pdf':
        // Integration with PDF generation library would go here
        return 'PDF export not implemented';
      case 'excel':
        // Integration with Excel generation library would go here
        return 'Excel export not implemented';
      default:
        throw new Error('Unsupported export format');
    }
  }
}