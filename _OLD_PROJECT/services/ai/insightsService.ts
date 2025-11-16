/**
 * AI Insights Service
 * Gera insights automáticos a partir dos dados
 */

import { Insight } from '../../types/analytics';
import { EnrichedAppointment } from '../../types';
import { generateText } from '../geminiService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

class InsightsService {
  /**
   * Analisa padrões de no-show
   */
  async analyzeNoShowPatterns(appointments: EnrichedAppointment[]): Promise<Insight[]> {
    const insights: Insight[] = [];
    const noShows = appointments.filter(apt => apt.status === 'no-show' || apt.status === 'canceled');

    if (noShows.length === 0) return insights;

    // Padrão por dia da semana
    const byDayOfWeek = new Map<number, number>();
    noShows.forEach(apt => {
      const day = apt.startTime.getDay();
      byDayOfWeek.set(day, (byDayOfWeek.get(day) || 0) + 1);
    });

    const maxDay = Array.from(byDayOfWeek.entries()).sort((a, b) => b[1] - a[1])[0];
    if (maxDay && maxDay[1] > noShows.length * 0.3) {
      const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      
      insights.push({
        id: `insight-noshow-day-${Date.now()}`,
        category: 'pattern',
        title: `Alto índice de faltas às ${dayNames[maxDay[0]]}`,
        description: `${maxDay[1]} faltas (${((maxDay[1] / noShows.length) * 100).toFixed(0)}%) ocorrem às ${dayNames[maxDay[0]]}. Considere lembretes extras ou ajustar política de confirmação.`,
        severity: 'warning',
        data: {
          metric: 'no_show_rate',
          currentValue: maxDay[1],
          changePercent: 0
        },
        createdAt: new Date(),
        isRead: false
      });
    }

    // Padrão por horário
    const byHour = new Map<number, number>();
    noShows.forEach(apt => {
      const hour = apt.startTime.getHours();
      byHour.set(hour, (byHour.get(hour) || 0) + 1);
    });

    const maxHour = Array.from(byHour.entries()).sort((a, b) => b[1] - a[1])[0];
    if (maxHour && maxHour[1] > noShows.length * 0.25) {
      insights.push({
        id: `insight-noshow-hour-${Date.now()}`,
        category: 'pattern',
        title: `Faltas concentradas no horário ${maxHour[0]}:00`,
        description: `${maxHour[1]} faltas ocorrem neste horário. Verifique se há problemas de transporte ou conflitos de horário.`,
        severity: 'warning',
        data: {
          metric: 'no_show_by_hour',
          currentValue: maxHour[1]
        },
        createdAt: new Date(),
        isRead: false
      });
    }

    return insights;
  }

  /**
   * Identifica tendências de crescimento/declínio
   */
  async analyzeTrends(
    currentPeriodAppointments: EnrichedAppointment[],
    previousPeriodAppointments: EnrichedAppointment[]
  ): Promise<Insight[]> {
    const insights: Insight[] = [];

    const currentCount = currentPeriodAppointments.length;
    const previousCount = previousPeriodAppointments.length;
    const changePercent = previousCount > 0
      ? ((currentCount - previousCount) / previousCount) * 100
      : 0;

    if (Math.abs(changePercent) > 20) {
      insights.push({
        id: `insight-trend-${Date.now()}`,
        category: 'trend',
        title: changePercent > 0 ? 'Crescimento Acelerado!' : 'Queda na Demanda',
        description: `${changePercent > 0 ? 'Aumento' : 'Redução'} de ${Math.abs(changePercent).toFixed(0)}% em relação ao período anterior (${previousCount} → ${currentCount} consultas).`,
        severity: changePercent > 0 ? 'success' : 'warning',
        data: {
          metric: 'appointment_count',
          currentValue: currentCount,
          previousValue: previousCount,
          changePercent
        },
        createdAt: new Date(),
        isRead: false
      });
    }

    // Tendência de receita
    const currentRevenue = currentPeriodAppointments.reduce((sum, apt) => sum + apt.value, 0);
    const previousRevenue = previousPeriodAppointments.reduce((sum, apt) => sum + apt.value, 0);
    const revenueChange = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    if (Math.abs(revenueChange) > 15) {
      insights.push({
        id: `insight-revenue-trend-${Date.now()}`,
        category: 'trend',
        title: revenueChange > 0 ? 'Receita em Alta!' : 'Receita em Baixa',
        description: `Faturamento ${revenueChange > 0 ? 'cresceu' : 'diminuiu'} ${Math.abs(revenueChange).toFixed(0)}%`,
        severity: revenueChange > 0 ? 'success' : 'warning',
        data: {
          metric: 'revenue',
          currentValue: currentRevenue,
          previousValue: previousRevenue,
          changePercent: revenueChange
        },
        createdAt: new Date(),
        isRead: false
      });
    }

    return insights;
  }

  /**
   * Identifica oportunidades de upsell/cross-sell
   */
  async identifyOpportunities(
    patients: any[],
    appointments: EnrichedAppointment[]
  ): Promise<Insight[]> {
    const insights: Insight[] = [];

    // Pacientes com alta frequência mas um único tipo de serviço
    const patientServices = new Map<string, Set<string>>();

    appointments.forEach(apt => {
      if (!patientServices.has(apt.patientId)) {
        patientServices.set(apt.patientId, new Set());
      }
      patientServices.get(apt.patientId)!.add(apt.type);
    });

    let crossSellCount = 0;
    patientServices.forEach((services, patientId) => {
      const patientApts = appointments.filter(apt => apt.patientId === patientId);
      
      if (services.size === 1 && patientApts.length > 5) {
        crossSellCount++;
      }
    });

    if (crossSellCount > 3) {
      insights.push({
        id: `insight-crosssell-${Date.now()}`,
        category: 'opportunity',
        title: 'Oportunidade de Cross-sell',
        description: `${crossSellCount} pacientes frequentes usam apenas 1 tipo de serviço. Considere oferecer pilates, RPG ou outros tratamentos.`,
        severity: 'info',
        data: {
          metric: 'cross_sell_opportunities',
          currentValue: crossSellCount
        },
        createdAt: new Date(),
        isRead: false
      });
    }

    return insights;
  }

  /**
   * Detecta anomalias nos dados
   */
  async detectAnomalies(appointments: EnrichedAppointment[]): Promise<Insight[]> {
    const insights: Insight[] = [];

    // Calcular média e desvio padrão de consultas por dia
    const byDay = this.groupByDay(appointments);
    const counts = Array.from(byDay.values());
    const avg = counts.reduce((sum, c) => sum + c, 0) / counts.length;
    const stdDev = Math.sqrt(
      counts.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / counts.length
    );

    // Detectar dias anormalmente altos ou baixos
    byDay.forEach((count, date) => {
      if (count > avg + 2 * stdDev) {
        insights.push({
          id: `insight-anomaly-high-${date}`,
          category: 'anomaly',
          title: `Pico Incomum em ${date}`,
          description: `${count} consultas (${((count - avg) / avg * 100).toFixed(0)}% acima da média). Verifique se houve algum evento especial.`,
          severity: 'info',
          data: {
            metric: 'daily_appointments',
            currentValue: count,
            previousValue: avg
          },
          createdAt: new Date(),
          isRead: false
        });
      } else if (count < avg - 2 * stdDev && count > 0) {
        insights.push({
          id: `insight-anomaly-low-${date}`,
          category: 'anomaly',
          title: `Baixa Incomum em ${date}`,
          description: `Apenas ${count} consultas (${((avg - count) / avg * 100).toFixed(0)}% abaixo da média). Investigar causa.`,
          severity: 'warning',
          data: {
            metric: 'daily_appointments',
            currentValue: count,
            previousValue: avg
          },
          createdAt: new Date(),
          isRead: false
        });
      }
    });

    return insights;
  }

  /**
   * Gera insights usando IA (Gemini)
   */
  async generateAIInsights(
    appointments: EnrichedAppointment[],
    context: {
      therapistsCount: number;
      patientsCount: number;
      avgRevenue: number;
    }
  ): Promise<Insight[]> {
    try {
      const summary = `
Total de consultas: ${appointments.length}
Terapeutas: ${context.therapistsCount}
Pacientes únicos: ${context.patientsCount}
Receita média: R$ ${context.avgRevenue.toFixed(2)}

Consultas por tipo:
${this.summarizeByType(appointments)}
      `.trim();

      const prompt = `
Você é um consultor de gestão em fisioterapia. Analise estes dados:

${summary}

Identifique até 3 insights ACIONÁVEIS e relevantes para melhorar a clínica.
Retorne APENAS JSON válido:
{
  "insights": [
    {
      "title": "título curto",
      "description": "descrição detalhada com ações sugeridas",
      "category": "pattern|opportunity|risk",
      "severity": "info|warning|success|critical"
    }
  ]
}
`;

      const response = await generateText(prompt);
      const parsed = this.parseJSON(response);

      return parsed.insights.map((ins: any, index: number) => ({
        id: `ai-insight-${Date.now()}-${index}`,
        category: ins.category || 'pattern',
        title: ins.title,
        description: ins.description,
        severity: ins.severity || 'info',
        data: {
          metric: 'ai_generated',
          currentValue: 0
        },
        createdAt: new Date(),
        isRead: false
      }));
    } catch (error) {
      console.error('AI insights generation failed:', error);
      return [];
    }
  }

  /**
   * Helper: Agrupa por dia
   */
  private groupByDay(appointments: EnrichedAppointment[]): Map<string, number> {
    const byDay = new Map<string, number>();
    
    appointments.forEach(apt => {
      const date = format(apt.startTime, 'dd/MM/yyyy', { locale: ptBR });
      byDay.set(date, (byDay.get(date) || 0) + 1);
    });

    return byDay;
  }

  /**
   * Helper: Resume por tipo
   */
  private summarizeByType(appointments: EnrichedAppointment[]): string {
    const byType = new Map<string, number>();
    
    appointments.forEach(apt => {
      byType.set(apt.type, (byType.get(apt.type) || 0) + 1);
    });

    return Array.from(byType.entries())
      .map(([type, count]) => `- ${type}: ${count}`)
      .join('\n');
  }

  /**
   * Parse JSON seguro
   */
  private parseJSON(text: string): any {
    try {
      let cleaned = text.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/```json\n?/, '').replace(/```\n?$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```\n?/, '').replace(/```\n?$/, '');
      }

      return JSON.parse(cleaned);
    } catch (error) {
      console.error('JSON parse failed:', error);
      throw new Error('Failed to parse AI response');
    }
  }
}

export const insightsService = new InsightsService();

