/**
 * AI Prediction Service
 * Previsões inteligentes usando Gemini API
 */

import { Prediction, DemandForecast, ChurnPrediction } from '../../types/analytics';
import { EnrichedAppointment } from '../../types';
import { generateText } from '../geminiService';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

class PredictionService {
  /**
   * Prevê demanda futura de consultas
   */
  async predictDemand(
    historicalAppointments: EnrichedAppointment[],
    horizon: number = 30
  ): Promise<DemandForecast[]> {
    try {
      // Preparar dados históricos
      const dailyCounts = this.aggregateByDay(historicalAppointments);
      const avgPerDay = dailyCounts.reduce((sum, d) => sum + d.count, 0) / dailyCounts.length;
      
      const prompt = `
Você é um especialista em analytics de saúde. Analise estes dados históricos de agendamentos:

${dailyCounts.map(d => `${d.date}: ${d.count} consultas`).join('\n')}

Média diária: ${avgPerDay.toFixed(1)} consultas

Com base nestes dados, preveja a demanda para os próximos ${horizon} dias.
Considere:
- Tendências históricas
- Sazonalidade (dia da semana)
- Padrões de crescimento/declínio

Retorne APENAS um JSON válido no formato:
{
  "forecasts": [
    {
      "date": "YYYY-MM-DD",
      "predicted": número,
      "confidence": 0-100,
      "factors": ["fator1", "fator2"]
    }
  ]
}
`;

      const response = await generateText(prompt);
      const parsed = this.parseJSON(response);

      return parsed.forecasts.map((f: any) => ({
        date: new Date(f.date),
        predictedAppointments: Math.round(f.predicted),
        confidence: f.confidence,
        seasonalFactor: 1.0,
        trendFactor: 1.0
      }));
    } catch (error) {
      console.error('Prediction failed:', error);
      
      // Fallback: simple moving average
      return this.fallbackDemandPrediction(historicalAppointments, horizon);
    }
  }

  /**
   * Prevê risco de cancelamento de agendamento
   */
  async predictCancellationRisk(appointment: EnrichedAppointment): Promise<number> {
    // Fatores de risco
    let risk = 0;

    // 1. Histórico de no-shows do paciente (se disponível)
    risk += 20;

    // 2. Agendamento muito antecipado
    const daysUntil = Math.floor((appointment.startTime.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntil > 30) risk += 15;
    else if (daysUntil > 14) risk += 10;

    // 3. Primeira consulta
    if (appointment.sessionNumber === 1) risk += 15;

    // 4. Horário
    const hour = appointment.startTime.getHours();
    if (hour < 8 || hour > 18) risk += 10;

    // 5. Dia da semana
    const day = appointment.startTime.getDay();
    if (day === 0 || day === 6) risk += 5; // Fim de semana

    // 6. Pagamento pendente
    if (appointment.paymentStatus === 'pending') risk += 20;

    return Math.min(100, risk);
  }

  /**
   * Prevê risco de churn de paciente
   */
  async predictChurnRisk(
    patientId: string,
    patientAppointments: EnrichedAppointment[]
  ): Promise<ChurnPrediction> {
    const factors: ChurnPrediction['factors'] = [];
    let totalRisk = 0;

    // 1. Frequência decrescente
    const recentCount = patientAppointments.filter(apt =>
      apt.startTime.getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
    ).length;

    const olderCount = patientAppointments.filter(apt => {
      const time = apt.startTime.getTime();
      const now = Date.now();
      return time > now - 60 * 24 * 60 * 60 * 1000 && time <= now - 30 * 24 * 60 * 60 * 1000;
    }).length;

    if (recentCount < olderCount) {
      const impact = Math.min(40, ((olderCount - recentCount) / olderCount) * 40);
      factors.push({ factor: 'Frequência decrescente', impact });
      totalRisk += impact;
    }

    // 2. Cancelamentos frequentes
    const canceledCount = patientAppointments.filter(apt => apt.status === 'canceled').length;
    if (canceledCount > 2) {
      const impact = Math.min(30, canceledCount * 10);
      factors.push({ factor: `${canceledCount} cancelamentos`, impact });
      totalRisk += impact;
    }

    // 3. Última consulta há muito tempo
    const lastAppointment = patientAppointments
      .filter(apt => apt.status === 'completed')
      .sort((a, b) => b.endTime.getTime() - a.endTime.getTime())[0];

    if (lastAppointment) {
      const daysSinceLast = Math.floor((Date.now() - lastAppointment.endTime.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLast > 60) {
        const impact = Math.min(40, (daysSinceLast / 90) * 40);
        factors.push({ factor: `${daysSinceLast} dias desde última consulta`, impact });
        totalRisk += impact;
      }
    }

    // 4. NPS baixo (se disponível)
    // factors.push({ factor: 'NPS baixo', impact: 20 });

    const churnRisk = Math.min(100, totalRisk);
    const recommendedActions: string[] = [];

    if (churnRisk > 60) {
      recommendedActions.push('Entrar em contato urgentemente');
      recommendedActions.push('Oferecer desconto na próxima sessão');
      recommendedActions.push('Agendar reunião de follow-up');
    } else if (churnRisk > 30) {
      recommendedActions.push('Enviar mensagem de check-in');
      recommendedActions.push('Lembrar benefícios do tratamento');
    }

    return {
      patientId,
      patientName: patientAppointments[0]?.patientName || 'Unknown',
      churnRisk,
      factors,
      recommendedActions,
      predictedAt: new Date()
    };
  }

  /**
   * Prevê receita futura
   */
  async predictRevenue(
    historicalAppointments: EnrichedAppointment[],
    horizon: number = 30
  ): Promise<Prediction> {
    const completedAppointments = historicalAppointments.filter(apt => apt.status === 'completed');
    const avgRevenuePerDay = completedAppointments.reduce((sum, apt) => sum + apt.value, 0) / 30;

    // Simple model: avg * days with 10% variance
    const predictedRevenue = avgRevenuePerDay * horizon;
    const variance = predictedRevenue * 0.1;

    return {
      id: `revenue-pred-${Date.now()}`,
      type: 'revenue',
      value: predictedRevenue,
      confidence: 75,
      confidenceInterval: {
        lower: predictedRevenue - variance,
        upper: predictedRevenue + variance
      },
      factors: [
        `Média diária: R$ ${avgRevenuePerDay.toFixed(2)}`,
        `Baseado em ${completedAppointments.length} consultas completadas`,
        `Tendência: ${horizon} dias`
      ],
      predictedAt: new Date(),
      horizon
    };
  }

  /**
   * Helper: Agrega appointments por dia
   */
  private aggregateByDay(appointments: EnrichedAppointment[]): { date: string; count: number }[] {
    const byDay = new Map<string, number>();

    appointments.forEach(apt => {
      const date = format(apt.startTime, 'yyyy-MM-dd');
      byDay.set(date, (byDay.get(date) || 0) + 1);
    });

    return Array.from(byDay.entries()).map(([date, count]) => ({ date, count }));
  }

  /**
   * Fallback prediction usando média móvel
   */
  private fallbackDemandPrediction(
    appointments: EnrichedAppointment[],
    horizon: number
  ): DemandForecast[] {
    const dailyCounts = this.aggregateByDay(appointments);
    const avg = dailyCounts.reduce((sum, d) => sum + d.count, 0) / dailyCounts.length;

    const forecasts: DemandForecast[] = [];
    const today = new Date();

    for (let i = 0; i < horizon; i++) {
      const date = addDays(today, i);
      
      forecasts.push({
        date,
        predictedAppointments: Math.round(avg),
        confidence: 60,
        seasonalFactor: 1.0,
        trendFactor: 1.0
      });
    }

    return forecasts;
  }

  /**
   * Parse JSON seguro
   */
  private parseJSON(text: string): any {
    try {
      // Remove markdown code blocks if present
      let cleaned = text.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/```json\n?/, '').replace(/```\n?$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```\n?/, '').replace(/```\n?$/, '');
      }

      return JSON.parse(cleaned);
    } catch (error) {
      console.error('JSON parse failed:', error, 'Text:', text);
      throw new Error('Failed to parse AI response as JSON');
    }
  }
}

export const predictionService = new PredictionService();
