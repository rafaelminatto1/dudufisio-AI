/**
 * AI Recommendation Service
 * Recomendações inteligentes usando Gemini
 */

import { Recommendation, PricingRecommendation, OptimizationSuggestion } from '../../types/analytics';
import { EnrichedAppointment, Therapist } from '../../types';
import { generateText } from '../geminiService';

class RecommendationService {
  /**
   * Sugere melhores horários para agendar paciente específico
   */
  async recommendBestTimeSlots(
    patientHistory: EnrichedAppointment[],
    availableSlots: { date: Date; time: string }[]
  ): Promise<Recommendation> {
    const preferredDays = this.analyzePreferredDays(patientHistory);
    const preferredTimes = this.analyzePreferredTimes(patientHistory);

    const rankedSlots = availableSlots
      .map(slot => ({
        ...slot,
        score: this.scoreTimeSlot(slot, preferredDays, preferredTimes)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return {
      id: `rec-timeslots-${Date.now()}`,
      type: 'scheduling',
      title: 'Melhores Horários para Este Paciente',
      description: `Com base no histórico, recomendamos: ${rankedSlots.map(s => format(s.date, 'dd/MM') + ' às ' + s.time).join(', ')}`,
      priority: 'medium',
      impact: {
        metric: 'attendance_rate',
        estimatedChange: 15,
        confidence: 75
      },
      actions: rankedSlots.map(slot => ({
        id: `slot-${slot.date}-${slot.time}`,
        label: `Agendar ${format(slot.date, 'dd/MM')} às ${slot.time}`,
        actionType: 'execute' as const,
        actionData: { date: slot.date, time: slot.time }
      })),
      createdAt: new Date(),
      status: 'active'
    };
  }

  /**
   * Sugere preços dinâmicos baseados em demanda
   */
  async recommendDynamicPricing(
    serviceType: string,
    currentPrice: number,
    demandData: { date: Date; count: number }[]
  ): Promise<PricingRecommendation> {
    // Calcula demanda média
    const avgDemand = demandData.reduce((sum, d) => sum + d.count, 0) / demandData.length;
    const maxDemand = Math.max(...demandData.map(d => d.count));
    const currentDemand = demandData[demandData.length - 1]?.count || avgDemand;

    let recommendedPrice = currentPrice;
    const reasoning: string[] = [];

    // Alta demanda -> aumentar preço
    if (currentDemand > avgDemand * 1.2) {
      recommendedPrice = currentPrice * 1.15;
      reasoning.push('Demanda 20% acima da média');
      reasoning.push('Oportunidade de aumentar receita');
    }
    // Baixa demanda -> reduzir preço
    else if (currentDemand < avgDemand * 0.8) {
      recommendedPrice = currentPrice * 0.9;
      reasoning.push('Demanda 20% abaixo da média');
      reasoning.push('Promoção pode aumentar ocupação');
    }
    // Demanda normal
    else {
      reasoning.push('Demanda estável');
      reasoning.push('Manter preço atual');
    }

    return {
      serviceType,
      currentPrice,
      recommendedPrice: Math.round(recommendedPrice),
      reasoning,
      expectedImpact: {
        revenue: (recommendedPrice - currentPrice) * currentDemand,
        demand: recommendedPrice < currentPrice ? 10 : -5 // % change
      }
    };
  }

  /**
   * Sugere otimizações de agenda
   */
  async suggestScheduleOptimizations(
    appointments: EnrichedAppointment[],
    therapists: Therapist[]
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    // 1. Detectar gaps grandes entre consultas
    const gaps = this.findLargeGaps(appointments);
    if (gaps.length > 5) {
      suggestions.push({
        type: 'schedule',
        title: 'Reduzir Intervalos Vazios',
        description: `Detectamos ${gaps.length} intervalos de 2+ horas entre consultas`,
        estimatedBenefit: 'Aumentar ocupação em 15-20%',
        difficulty: 'medium',
        steps: [
          'Reagrupar consultas próximas',
          'Oferecer horários de gap com desconto',
          'Usar IA para sugerir reagendamentos'
        ]
      });
    }

    // 2. Desbalanceamento entre terapeutas
    const balanceScore = this.calculateTherapistBalance(appointments, therapists);
    if (balanceScore < 0.7) {
      suggestions.push({
        type: 'resource',
        title: 'Balancear Carga entre Terapeutas',
        description: 'Alguns terapeutas estão sobrecarregados enquanto outros têm capacidade ociosa',
        estimatedBenefit: 'Melhorar satisfação da equipe',
        difficulty: 'easy',
        steps: [
          'Redistribuir novos pacientes',
          'Oferecer transferências quando apropriado',
          'Ajustar horários de atendimento'
        ]
      });
    }

    // 3. Horários de pico subutilizados
    const peakUtilization = this.analyzePeakUtilization(appointments);
    if (peakUtilization < 0.8) {
      suggestions.push({
        type: 'schedule',
        title: 'Otimizar Horários de Pico',
        description: 'Horários nobres (10h-16h) com apenas 75% de ocupação',
        estimatedBenefit: 'Aumentar receita em 10-15%',
        difficulty: 'medium',
        steps: [
          'Priorizar horários nobres para novos agendamentos',
          'Oferecer desconto em horários fora de pico',
          'Campanhas de incentivo para horários específicos'
        ]
      });
    }

    return suggestions;
  }

  /**
   * Helper: Analisa dias preferidos do paciente
   */
  private analyzePreferredDays(history: EnrichedAppointment[]): number[] {
    const dayCounts = new Map<number, number>();
    
    history.forEach(apt => {
      const day = apt.startTime.getDay();
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    });

    return Array.from(dayCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([day]) => day);
  }

  /**
   * Helper: Analisa horários preferidos do paciente
   */
  private analyzePreferredTimes(history: EnrichedAppointment[]): number[] {
    const hourCounts = new Map<number, number>();
    
    history.forEach(apt => {
      const hour = apt.startTime.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    return Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([hour]) => hour);
  }

  /**
   * Helper: Pontua time slot
   */
  private scoreTimeSlot(
    slot: { date: Date; time: string },
    preferredDays: number[],
    preferredTimes: number[]
  ): number {
    let score = 0;

    const day = slot.date.getDay();
    const hour = parseInt(slot.time.split(':')[0]);

    // Score based on day preference
    const dayIndex = preferredDays.indexOf(day);
    if (dayIndex !== -1) {
      score += (preferredDays.length - dayIndex) * 10;
    }

    // Score based on time preference
    const timeIndex = preferredTimes.indexOf(hour);
    if (timeIndex !== -1) {
      score += (preferredTimes.length - timeIndex) * 10;
    }

    return score;
  }

  /**
   * Helper: Encontra gaps grandes
   */
  private findLargeGaps(appointments: EnrichedAppointment[]): any[] {
    const gaps: any[] = [];
    const sorted = [...appointments].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = (sorted[i + 1].startTime.getTime() - sorted[i].endTime.getTime()) / (1000 * 60 * 60);
      if (gap >= 2) {
        gaps.push({ start: sorted[i].endTime, end: sorted[i + 1].startTime, hours: gap });
      }
    }

    return gaps;
  }

  /**
   * Helper: Calcula balanceamento entre terapeutas
   */
  private calculateTherapistBalance(appointments: EnrichedAppointment[], therapists: Therapist[]): number {
    const countsByTherapist = therapists.map(t => ({
      id: t.id,
      count: appointments.filter(apt => apt.therapistId === t.id).length
    }));

    const counts = countsByTherapist.map(c => c.count);
    const avg = counts.reduce((sum, c) => sum + c, 0) / counts.length;
    const variance = counts.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / counts.length;
    const stdDev = Math.sqrt(variance);

    // Balance score (1 = perfect, 0 = completely unbalanced)
    return Math.max(0, 1 - (stdDev / avg));
  }

  /**
   * Helper: Analisa utilização em horários de pico
   */
  private analyzePeakUtilization(appointments: EnrichedAppointment[]): number {
    const peakHours = [10, 11, 12, 13, 14, 15, 16];
    const peakAppointments = appointments.filter(apt =>
      peakHours.includes(apt.startTime.getHours())
    );

    // Simplified: assume 7 therapists * 7 peak hours = 49 possible slots per day
    const possibleSlots = 49;
    return Math.min(1, peakAppointments.length / possibleSlots);
  }
}

export const recommendationService = new RecommendationService();

