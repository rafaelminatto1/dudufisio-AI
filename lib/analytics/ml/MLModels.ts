import { createClient } from '@supabase/supabase-js';
import {
  MLFeatures,
  NoShowPrediction,
  OutcomePrediction,
  Anomaly
} from '../types';

export class MLModels {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async predictNoShow(appointmentId: string, features?: MLFeatures): Promise<NoShowPrediction> {
    try {
      console.log(`🤖 Predição de no-show para consulta: ${appointmentId}`);

      // If features not provided, extract them from appointment data
      const appointmentFeatures = features || await this.extractNoShowFeatures(appointmentId);

      // Simple heuristic-based model (in production, this would be a trained ML model)
      const prediction = this.calculateNoShowProbability(appointmentFeatures);

      return {
        appointmentId,
        probability: prediction.probability,
        confidence: prediction.confidence,
        riskLevel: this.categorizeNoShowRisk(prediction.probability),
        factors: prediction.factors,
        featureImportance: prediction.featureImportance,
        recommendations: this.getNoShowRecommendations(prediction.probability, prediction.factors)
      };

    } catch (error) {
      console.error('❌ Erro na predição de no-show:', error);

      return {
        appointmentId,
        probability: 0.15, // default probability
        confidence: 0.5,
        riskLevel: 'medium',
        factors: [],
        featureImportance: {},
        recommendations: ['Enviar lembrete de confirmação']
      };
    }
  }

  async predictTreatmentOutcome(patientId: string, treatmentType: string): Promise<OutcomePrediction> {
    try {
      console.log(`🎯 Predição de resultado para paciente: ${patientId}`);

      const features = await this.extractOutcomeFeatures(patientId, treatmentType);
      const prediction = this.calculateOutcomeProbability(features);

      return {
        patientId,
        probability: prediction.probability,
        confidence: prediction.confidence,
        successProbability: prediction.successProbability,
        estimatedSessions: prediction.estimatedSessions,
        estimatedDuration: prediction.estimatedDuration,
        riskFactors: prediction.riskFactors,
        featureImportance: prediction.featureImportance,
        recommendations: this.getOutcomeRecommendations(prediction)
      };

    } catch (error) {
      console.error('❌ Erro na predição de resultado:', error);

      return {
        patientId,
        probability: 0.75,
        confidence: 0.6,
        successProbability: 0.75,
        estimatedSessions: 8,
        estimatedDuration: 60,
        riskFactors: [],
        featureImportance: {},
        recommendations: ['Seguir protocolo padrão de tratamento']
      };
    }
  }

  async detectAnomalies(period: { start: Date; end: Date }): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    try {
      console.log('🔍 Detectando anomalias no período...');

      // Revenue anomalies
      const revenueAnomalies = await this.detectRevenueAnomalies(period);
      anomalies.push(...revenueAnomalies);

      // Appointment anomalies
      const appointmentAnomalies = await this.detectAppointmentAnomalies(period);
      anomalies.push(...appointmentAnomalies);

      // No-show anomalies
      const noShowAnomalies = await this.detectNoShowAnomalies(period);
      anomalies.push(...noShowAnomalies);

      // Cancellation anomalies
      const cancellationAnomalies = await this.detectCancellationAnomalies(period);
      anomalies.push(...cancellationAnomalies);

      console.log(`🔍 Detectadas ${anomalies.length} anomalias`);
      return anomalies;

    } catch (error) {
      console.error('❌ Erro na detecção de anomalias:', error);
      return [];
    }
  }

  private async extractNoShowFeatures(appointmentId: string): Promise<MLFeatures> {
    const { data: appointment } = await this.supabase
      .from('fact_appointments')
      .select(`
        *,
        dim_patients!inner(age, age_group, data_quality_score),
        dim_therapists!inner(experience_years, specialization)
      `)
      .eq('appointment_id', appointmentId)
      .single();

    if (!appointment) {
      throw new Error('Consulta não encontrada');
    }

    // Get patient's historical no-show rate
    const { data: patientHistory } = await this.supabase
      .from('fact_appointments')
      .select('is_no_show')
      .eq('patient_key', appointment.patient_key);

    const historicalNoShowRate = patientHistory ?
      patientHistory.filter(a => a.is_no_show).length / patientHistory.length : 0;

    // Extract features
    const dayOfWeek = new Date(appointment.appointment_date).getDay();
    const hour = parseInt(appointment.start_time?.split(':')[0] || '0');
    const timeSlot = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

    return {
      patient_age: appointment.dim_patients?.age || 0,
      historical_no_show_rate: historicalNoShowRate,
      day_of_week: dayOfWeek,
      time_slot_morning: timeSlot === 'morning' ? 1 : 0,
      time_slot_afternoon: timeSlot === 'afternoon' ? 1 : 0,
      time_slot_evening: timeSlot === 'evening' ? 1 : 0,
      therapist_experience: appointment.dim_therapists?.experience_years || 0,
      appointment_duration: appointment.duration_minutes || 60,
      is_first_appointment: patientHistory ? (patientHistory.length === 1 ? 1 : 0) : 1,
      data_quality_score: appointment.dim_patients?.data_quality_score || 0,
      is_weekend: dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0
    };
  }

  private calculateNoShowProbability(features: MLFeatures): {
    probability: number;
    confidence: number;
    factors: string[];
    featureImportance: Record<string, number>;
  } {
    let score = 0.15; // base probability
    const factors: string[] = [];
    const featureImportance: Record<string, number> = {};

    // Historical pattern (highest importance)
    if (features.historical_no_show_rate > 0.2) {
      score += 0.3;
      factors.push('Histórico de faltas elevado');
      featureImportance['historical_no_show_rate'] = 0.35;
    }

    // Day of week effect
    if (features.day_of_week === 1) { // Monday
      score += 0.1;
      factors.push('Consulta na segunda-feira');
      featureImportance['day_of_week'] = 0.15;
    }

    // Time slot effect
    if (features.time_slot_evening) {
      score += 0.05;
      factors.push('Horário noturno');
      featureImportance['time_slot'] = 0.1;
    }

    // First appointment risk
    if (features.is_first_appointment) {
      score += 0.1;
      factors.push('Primeira consulta');
      featureImportance['is_first_appointment'] = 0.2;
    }

    // Age factor
    if (features.patient_age < 25 || features.patient_age > 65) {
      score += 0.05;
      factors.push('Faixa etária de risco');
      featureImportance['patient_age'] = 0.1;
    }

    // Data quality
    if (features.data_quality_score < 50) {
      score += 0.08;
      factors.push('Dados de contato incompletos');
      featureImportance['data_quality_score'] = 0.1;
    }

    return {
      probability: Math.min(0.95, score),
      confidence: 0.8,
      factors,
      featureImportance
    };
  }

  private async extractOutcomeFeatures(patientId: string, treatmentType: string): Promise<MLFeatures> {
    // Get patient information
    const { data: patient } = await this.supabase
      .from('dim_patients')
      .select('*')
      .eq('patient_id', patientId)
      .eq('is_current', true)
      .single();

    // Get patient's treatment history
    const { data: history } = await this.supabase
      .from('fact_clinical_outcomes')
      .select('*')
      .eq('patient_key', patient?.patient_key || '');

    // Calculate features
    const avgPainImprovement = history?.length > 0 ?
      history.reduce((sum, h) => sum + (h.pain_improvement || 0), 0) / history.length : 0;

    const avgSatisfaction = history?.length > 0 ?
      history.reduce((sum, h) => sum + (h.patient_satisfaction || 0), 0) / history.length : 0;

    return {
      patient_age: patient?.age || 0,
      age_group_adult: patient?.age_group === 'Adulto' ? 1 : 0,
      age_group_elderly: patient?.age_group === 'Idoso' ? 1 : 0,
      historical_sessions: history?.length || 0,
      avg_pain_improvement: avgPainImprovement,
      avg_satisfaction: avgSatisfaction,
      treatment_type_physio: treatmentType === 'physiotherapy' ? 1 : 0,
      treatment_type_massage: treatmentType === 'massotherapy' ? 1 : 0,
      data_quality_score: patient?.data_quality_score || 0,
      has_previous_success: avgPainImprovement >= 2 ? 1 : 0
    };
  }

  private calculateOutcomeProbability(features: MLFeatures): {
    probability: number;
    confidence: number;
    successProbability: number;
    estimatedSessions: number;
    estimatedDuration: number;
    riskFactors: string[];
    featureImportance: Record<string, number>;
  } {
    let successScore = 0.75; // base success probability
    const riskFactors: string[] = [];
    const featureImportance: Record<string, number> = {};

    // Historical success
    if (features.has_previous_success) {
      successScore += 0.15;
      featureImportance['previous_success'] = 0.3;
    } else if (features.historical_sessions > 0) {
      successScore -= 0.1;
      riskFactors.push('Histórico de resultados limitados');
      featureImportance['previous_success'] = 0.3;
    }

    // Age factor
    if (features.age_group_elderly) {
      successScore -= 0.1;
      riskFactors.push('Idade avançada pode impactar recuperação');
      featureImportance['age'] = 0.2;
    }

    // Treatment type effectiveness
    if (features.treatment_type_physio) {
      successScore += 0.05;
      featureImportance['treatment_type'] = 0.15;
    }

    // Data quality impact
    if (features.data_quality_score > 80) {
      successScore += 0.05;
      featureImportance['data_quality'] = 0.1;
    }

    // Estimate sessions based on complexity
    let estimatedSessions = 8;
    if (features.age_group_elderly) estimatedSessions += 2;
    if (features.historical_sessions > 5) estimatedSessions += 1;
    if (features.has_previous_success) estimatedSessions -= 1;

    return {
      probability: Math.min(0.95, successScore),
      confidence: 0.7,
      successProbability: Math.min(0.95, successScore),
      estimatedSessions: Math.max(4, Math.min(12, estimatedSessions)),
      estimatedDuration: estimatedSessions * 60,
      riskFactors,
      featureImportance
    };
  }

  private categorizeNoShowRisk(probability: number): 'low' | 'medium' | 'high' {
    if (probability < 0.2) return 'low';
    if (probability < 0.4) return 'medium';
    return 'high';
  }

  private getNoShowRecommendations(probability: number, factors: string[]): string[] {
    const recommendations: string[] = [];

    if (probability > 0.4) {
      recommendations.push('Realizar ligação de confirmação 24h antes');
      recommendations.push('Enviar SMS de lembrete');
    }

    if (factors.includes('Primeira consulta')) {
      recommendations.push('Explicar importância da primeira consulta');
      recommendations.push('Facilitar processo de reagendamento');
    }

    if (factors.includes('Histórico de faltas elevado')) {
      recommendations.push('Implementar política de cobrança por falta');
      recommendations.push('Ofertar horários mais flexíveis');
    }

    if (factors.includes('Dados de contato incompletos')) {
      recommendations.push('Atualizar informações de contato');
      recommendations.push('Solicitar contato alternativo');
    }

    return recommendations;
  }

  private getOutcomeRecommendations(prediction: any): string[] {
    const recommendations: string[] = [];

    if (prediction.successProbability < 0.6) {
      recommendations.push('Considerar avaliação multidisciplinar');
      recommendations.push('Monitorar progresso mais frequentemente');
      recommendations.push('Adaptar protocolo de tratamento');
    }

    if (prediction.estimatedSessions > 10) {
      recommendations.push('Planejar tratamento em fases');
      recommendations.push('Definir metas intermediárias');
      recommendations.push('Considerar exercícios domiciliares');
    }

    for (const factor of prediction.riskFactors) {
      if (factor.includes('Idade avançada')) {
        recommendations.push('Adaptar exercícios para idade');
        recommendations.push('Focar em exercícios funcionais');
      }
    }

    return recommendations;
  }

  // Anomaly detection methods
  private async detectRevenueAnomalies(period: { start: Date; end: Date }): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    // Get daily revenue for the period
    const { data: dailyRevenue } = await this.supabase
      .from('fact_financial_transactions')
      .select('transaction_date, net_amount')
      .eq('is_revenue', true)
      .eq('status', 'completed')
      .gte('transaction_date', period.start.toISOString())
      .lte('transaction_date', period.end.toISOString());

    if (!dailyRevenue || dailyRevenue.length === 0) return anomalies;

    // Calculate daily totals
    const dailyTotals = dailyRevenue.reduce((acc: Record<string, number>, transaction) => {
      const date = transaction.transaction_date.split('T')[0];
      acc[date] = (acc[date] || 0) + transaction.net_amount;
      return acc;
    }, {});

    const revenues = Object.values(dailyTotals);
    const mean = revenues.reduce((sum, val) => sum + val, 0) / revenues.length;
    const stdDev = Math.sqrt(
      revenues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / revenues.length
    );

    // Check for anomalies (values beyond 2 standard deviations)
    for (const [date, revenue] of Object.entries(dailyTotals)) {
      const deviation = Math.abs(revenue - mean);
      if (deviation > 2 * stdDev) {
        const severity = deviation > 3 * stdDev ? 'critical' : 'high';

        anomalies.push({
          type: 'revenue',
          severity,
          description: `Receita anômala detectada em ${date}`,
          affectedMetric: 'Receita Diária',
          detectedAt: new Date(),
          value: revenue,
          expectedValue: mean,
          deviation: (revenue - mean) / mean * 100,
          recommendations: [
            'Verificar transações do dia',
            'Investigar possíveis erros de lançamento',
            'Confirmar validade dos dados'
          ]
        });
      }
    }

    return anomalies;
  }

  private async detectAppointmentAnomalies(period: { start: Date; end: Date }): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    // Get daily appointment counts
    const { data: dailyAppointments } = await this.supabase
      .from('fact_appointments')
      .select('appointment_date')
      .gte('appointment_date', period.start.toISOString())
      .lte('appointment_date', period.end.toISOString());

    if (!dailyAppointments) return anomalies;

    const dailyCounts = dailyAppointments.reduce((acc: Record<string, number>, appointment) => {
      const date = appointment.appointment_date.split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const counts = Object.values(dailyCounts);
    const mean = counts.reduce((sum, val) => sum + val, 0) / counts.length;
    const stdDev = Math.sqrt(
      counts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / counts.length
    );

    for (const [date, count] of Object.entries(dailyCounts)) {
      const deviation = Math.abs(count - mean);
      if (deviation > 2 * stdDev) {
        const severity = count < mean - 2 * stdDev ? 'high' : 'medium';

        anomalies.push({
          type: 'appointments',
          severity,
          description: count < mean ?
            `Baixo número de consultas em ${date}` :
            `Alto número de consultas em ${date}`,
          affectedMetric: 'Número de Consultas',
          detectedAt: new Date(),
          value: count,
          expectedValue: mean,
          deviation: (count - mean) / mean * 100,
          recommendations: count < mean ? [
            'Investigar cancelamentos em massa',
            'Verificar disponibilidade dos profissionais',
            'Analisar fatores externos (feriados, eventos)'
          ] : [
            'Verificar sobrecarga da equipe',
            'Considerar horários adicionais',
            'Monitorar qualidade do atendimento'
          ]
        });
      }
    }

    return anomalies;
  }

  private async detectNoShowAnomalies(period: { start: Date; end: Date }): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    // Get daily no-show rates
    const { data: appointments } = await this.supabase
      .from('fact_appointments')
      .select('appointment_date, is_no_show')
      .gte('appointment_date', period.start.toISOString())
      .lte('appointment_date', period.end.toISOString());

    if (!appointments) return anomalies;

    const dailyStats = appointments.reduce((acc: Record<string, { total: number; noShows: number }>, appointment) => {
      const date = appointment.appointment_date.split('T')[0];
      if (!acc[date]) acc[date] = { total: 0, noShows: 0 };
      acc[date].total++;
      if (appointment.is_no_show) acc[date].noShows++;
      return acc;
    }, {});

    const noShowRates = Object.values(dailyStats).map(stat => stat.total > 0 ? stat.noShows / stat.total : 0);
    const avgRate = noShowRates.reduce((sum, rate) => sum + rate, 0) / noShowRates.length;

    for (const [date, stats] of Object.entries(dailyStats)) {
      const rate = stats.total > 0 ? stats.noShows / stats.total : 0;
      if (rate > avgRate * 2 && rate > 0.3) {
        anomalies.push({
          type: 'no_shows',
          severity: rate > 0.5 ? 'critical' : 'high',
          description: `Taxa de faltas anômala em ${date}: ${(rate * 100).toFixed(1)}%`,
          affectedMetric: 'Taxa de Faltas',
          detectedAt: new Date(),
          value: rate * 100,
          expectedValue: avgRate * 100,
          deviation: ((rate - avgRate) / avgRate) * 100,
          recommendations: [
            'Investigar problemas de comunicação',
            'Verificar condições climáticas ou eventos especiais',
            'Reforçar lembretes de confirmação'
          ]
        });
      }
    }

    return anomalies;
  }

  private async detectCancellationAnomalies(period: { start: Date; end: Date }): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    // Similar implementation to no-show detection but for cancellations
    const { data: appointments } = await this.supabase
      .from('fact_appointments')
      .select('appointment_date, is_cancelled')
      .gte('appointment_date', period.start.toISOString())
      .lte('appointment_date', period.end.toISOString());

    if (!appointments) return anomalies;

    const dailyStats = appointments.reduce((acc: Record<string, { total: number; cancelled: number }>, appointment) => {
      const date = appointment.appointment_date.split('T')[0];
      if (!acc[date]) acc[date] = { total: 0, cancelled: 0 };
      acc[date].total++;
      if (appointment.is_cancelled) acc[date].cancelled++;
      return acc;
    }, {});

    const cancellationRates = Object.values(dailyStats).map(stat => stat.total > 0 ? stat.cancelled / stat.total : 0);
    const avgRate = cancellationRates.reduce((sum, rate) => sum + rate, 0) / cancellationRates.length;

    for (const [date, stats] of Object.entries(dailyStats)) {
      const rate = stats.total > 0 ? stats.cancelled / stats.total : 0;
      if (rate > avgRate * 2 && rate > 0.2) {
        anomalies.push({
          type: 'cancellations',
          severity: rate > 0.4 ? 'high' : 'medium',
          description: `Taxa de cancelamentos anômala em ${date}: ${(rate * 100).toFixed(1)}%`,
          affectedMetric: 'Taxa de Cancelamentos',
          detectedAt: new Date(),
          value: rate * 100,
          expectedValue: avgRate * 100,
          deviation: ((rate - avgRate) / avgRate) * 100,
          recommendations: [
            'Investigar motivos de cancelamento',
            'Verificar problemas operacionais',
            'Melhorar flexibilidade de reagendamento'
          ]
        });
      }
    }

    return anomalies;
  }
}