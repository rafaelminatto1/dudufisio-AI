import { EnrichedAppointment, Therapist, Patient } from '../types';
import { genAIService } from './geminiService';
import { format, addMinutes, isBefore, isAfter, isSameDay, addDays, startOfDay, endOfDay } from 'date-fns';

export interface SchedulingSuggestion {
  date: Date;
  time: string;
  therapistId: string;
  therapistName: string;
  score: number; // 0-100
  reason: string;
  conflicts: string[];
  benefits: string[];
}

export interface OptimizationInsight {
  type: 'gap' | 'overload' | 'underutilized' | 'conflict' | 'opportunity';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  suggestion: string;
  affectedDate?: Date;
  affectedTherapist?: string;
}

class AISchedulingService {
  /**
   * Sugere os melhores horários para um novo agendamento
   */
  async suggestBestSlots(
    appointments: EnrichedAppointment[],
    therapists: Therapist[],
    patient: Patient,
    preferredDuration: number = 50,
    preferredType: string = 'Fisioterapia',
    daysAhead: number = 7
  ): Promise<SchedulingSuggestion[]> {
    const suggestions: SchedulingSuggestion[] = [];
    const startDate = startOfDay(new Date());

    // Analisar cada dia nos próximos N dias
    for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
      const targetDate = addDays(startDate, dayOffset);
      
      // Analisar cada terapeuta
      for (const therapist of therapists) {
        const therapistAppointments = appointments.filter(
          apt => apt.therapistId === therapist.id && isSameDay(apt.startTime, targetDate)
        );

        // Horários de trabalho: 8h às 18h
        for (let hour = 8; hour < 18; hour++) {
          for (let minute of [0, 30]) {
            const slotStart = new Date(targetDate);
            slotStart.setHours(hour, minute, 0, 0);
            const slotEnd = addMinutes(slotStart, preferredDuration);

            // Verificar se o slot está disponível
            const hasConflict = therapistAppointments.some(apt => {
              const aptStart = new Date(apt.startTime);
              const aptEnd = new Date(apt.endTime);
              return (
                (isAfter(slotStart, aptStart) && isBefore(slotStart, aptEnd)) ||
                (isAfter(slotEnd, aptStart) && isBefore(slotEnd, aptEnd)) ||
                (isBefore(slotStart, aptStart) && isAfter(slotEnd, aptEnd))
              );
            });

            if (!hasConflict) {
              const score = this.calculateSlotScore(
                slotStart,
                therapist,
                therapistAppointments,
                patient,
                dayOffset
              );

              const reason = this.generateReasonForSlot(
                slotStart,
                therapist,
                therapistAppointments,
                score
              );

              suggestions.push({
                date: targetDate,
                time: format(slotStart, 'HH:mm'),
                therapistId: therapist.id,
                therapistName: therapist.name,
                score,
                reason,
                conflicts: [],
                benefits: this.generateBenefits(slotStart, therapistAppointments)
              });
            }
          }
        }
      }
    }

    // Ordenar por score e retornar top 10
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  /**
   * Calcula um score para um slot de horário (0-100)
   */
  private calculateSlotScore(
    slotStart: Date,
    therapist: Therapist,
    therapistAppointments: EnrichedAppointment[],
    patient: Patient,
    dayOffset: number
  ): number {
    let score = 70; // Base score

    // Preferência por manhã (8h-12h)
    const hour = slotStart.getHours();
    if (hour >= 8 && hour < 12) {
      score += 10;
    } else if (hour >= 14 && hour < 16) {
      score += 5;
    }

    // Evitar horários muito tarde
    if (hour >= 17) {
      score -= 10;
    }

    // Preferência por dias mais próximos
    score -= dayOffset * 2;

    // Balanceamento de carga do terapeuta
    const dayLoad = therapistAppointments.length;
    if (dayLoad === 0) {
      score += 5; // Primeiro do dia
    } else if (dayLoad < 4) {
      score += 3; // Carga leve
    } else if (dayLoad > 6) {
      score -= 5; // Sobrecarga
    }

    // Evitar gaps muito pequenos
    const prevAppointment = therapistAppointments
      .filter(apt => isBefore(apt.endTime, slotStart))
      .sort((a, b) => b.endTime.getTime() - a.endTime.getTime())[0];

    if (prevAppointment) {
      const gapMinutes = (slotStart.getTime() - new Date(prevAppointment.endTime).getTime()) / 60000;
      if (gapMinutes < 15) {
        score -= 10; // Gap muito pequeno
      } else if (gapMinutes >= 30 && gapMinutes <= 60) {
        score += 5; // Gap ideal para descanso
      }
    }

    // Normalizar score entre 0-100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Gera uma razão human-readable para o score
   */
  private generateReasonForSlot(
    slotStart: Date,
    therapist: Therapist,
    therapistAppointments: EnrichedAppointment[],
    score: number
  ): string {
    const hour = slotStart.getHours();
    const dayLoad = therapistAppointments.length;
    const reasons: string[] = [];

    if (score >= 80) {
      reasons.push('Horário ideal');
    } else if (score >= 60) {
      reasons.push('Bom horário');
    } else {
      reasons.push('Horário disponível');
    }

    if (hour >= 8 && hour < 12) {
      reasons.push('período da manhã (melhor para recuperação)');
    } else if (hour >= 14 && hour < 16) {
      reasons.push('começo da tarde');
    } else if (hour >= 17) {
      reasons.push('final do dia');
    }

    if (dayLoad === 0) {
      reasons.push('primeira consulta do dia');
    } else if (dayLoad < 3) {
      reasons.push('agenda leve');
    } else if (dayLoad > 6) {
      reasons.push('agenda cheia (mas disponível)');
    }

    return reasons.join(', ');
  }

  /**
   * Gera lista de benefícios para um slot
   */
  private generateBenefits(
    slotStart: Date,
    therapistAppointments: EnrichedAppointment[]
  ): string[] {
    const benefits: string[] = [];
    const hour = slotStart.getHours();

    if (therapistAppointments.length === 0) {
      benefits.push('Terapeuta descansado - início do dia');
    }

    if (hour >= 8 && hour < 10) {
      benefits.push('Horário matinal - menos trânsito');
    }

    if (hour >= 9 && hour < 11) {
      benefits.push('Período de melhor performance');
    }

    const prevAppointment = therapistAppointments
      .filter(apt => isBefore(apt.endTime, slotStart))
      .sort((a, b) => b.endTime.getTime() - a.endTime.getTime())[0];

    if (prevAppointment) {
      const gapMinutes = (slotStart.getTime() - new Date(prevAppointment.endTime).getTime()) / 60000;
      if (gapMinutes >= 30) {
        benefits.push('Terapeuta com tempo de descanso adequado');
      }
    }

    return benefits;
  }

  /**
   * Analisa a agenda e fornece insights de otimização
   */
  async analyzeScheduleOptimization(
    appointments: EnrichedAppointment[],
    therapists: Therapist[],
    dateRange: { start: Date; end: Date }
  ): Promise<OptimizationInsight[]> {
    const insights: OptimizationInsight[] = [];

    // Analisar cada dia no range
    let currentDate = startOfDay(dateRange.start);
    while (isBefore(currentDate, dateRange.end) || isSameDay(currentDate, dateRange.end)) {
      const dayAppointments = appointments.filter(apt => 
        isSameDay(apt.startTime, currentDate)
      );

      // Analisar cada terapeuta
      for (const therapist of therapists) {
        const therapistDayAppts = dayAppointments.filter(apt => 
          apt.therapistId === therapist.id
        );

        // Detectar gaps grandes
        if (therapistDayAppts.length > 1) {
          const sorted = [...therapistDayAppts].sort((a, b) => 
            a.startTime.getTime() - b.startTime.getTime()
          );

          for (let i = 0; i < sorted.length - 1; i++) {
            const gap = (sorted[i + 1].startTime.getTime() - new Date(sorted[i].endTime).getTime()) / 60000;
            if (gap > 90) {
              insights.push({
                type: 'gap',
                severity: 'medium',
                title: 'Gap grande detectado na agenda',
                description: `${therapist.name} tem um gap de ${gap.toFixed(0)} minutos entre consultas`,
                suggestion: 'Considere preencher com consultas de retorno ou reavaliações',
                affectedDate: currentDate,
                affectedTherapist: therapist.name
              });
            }
          }
        }

        // Detectar sobrecarga
        if (therapistDayAppts.length > 8) {
          insights.push({
            type: 'overload',
            severity: 'high',
            title: 'Possível sobrecarga',
            description: `${therapist.name} tem ${therapistDayAppts.length} consultas agendadas`,
            suggestion: 'Considere redistribuir algumas consultas ou adicionar pausas',
            affectedDate: currentDate,
            affectedTherapist: therapist.name
          });
        }

        // Detectar subutilização
        if (therapistDayAppts.length < 3 && therapistDayAppts.length > 0) {
          insights.push({
            type: 'underutilized',
            severity: 'low',
            title: 'Agenda com baixa ocupação',
            description: `${therapist.name} tem apenas ${therapistDayAppts.length} consultas`,
            suggestion: 'Oportunidade para agendar mais pacientes ou oferecer horários promocionais',
            affectedDate: currentDate,
            affectedTherapist: therapist.name
          });
        }
      }

      // Detectar conflitos
      const conflicts = dayAppointments.filter(apt => apt.hasConflict);
      if (conflicts.length > 0) {
        insights.push({
          type: 'conflict',
          severity: 'high',
          title: `${conflicts.length} conflito(s) detectado(s)`,
          description: 'Há agendamentos conflitantes que precisam ser resolvidos',
          suggestion: 'Revise e resolva os conflitos de horário imediatamente',
          affectedDate: currentDate
        });
      }

      currentDate = addDays(currentDate, 1);
    }

    return insights.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Usa IA (Gemini) para sugestões mais avançadas
   */
  async getAISchedulingRecommendations(
    appointments: EnrichedAppointment[],
    patient: Patient,
    context: string
  ): Promise<string> {
    try {
      const prompt = `
Como especialista em gestão de agendas de fisioterapia, analise a seguinte situação:

Paciente: ${patient.name}
Idade: ${patient.age || 'Não informada'}
Condição: ${patient.diagnosis || 'Não informada'}
Histórico: ${patient.medicalHistory || 'Não informado'}

Contexto adicional: ${context}

Agendamentos existentes: ${appointments.length} consultas

Baseado nessas informações, forneça:
1. Recomendações de frequência de consultas
2. Melhor período do dia para agendamento considerando a condição do paciente
3. Duração ideal das sessões
4. Observações especiais para o agendamento

Seja específico e prático nas recomendações.
      `.trim();

      const response = await genAIService.generateSchedulingGuidance(prompt);
      return response;
    } catch (error) {
      console.error('Erro ao obter recomendações de IA:', error);
      return 'Não foi possível obter recomendações de IA no momento. Por favor, use as sugestões automáticas.';
    }
  }
}

export const aiSchedulingService = new AISchedulingService();


