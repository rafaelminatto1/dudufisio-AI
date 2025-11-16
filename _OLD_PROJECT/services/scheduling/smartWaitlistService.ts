/**
 * services/scheduling/smartWaitlistService.ts
 * 
 * Serviço inteligente para lista de espera com sugestão automática de horários
 */

import { WaitlistEntry, Appointment, ScheduleBlock } from '../../types';
import { waitlistService } from './waitlistService';
import { conflictDetectionService } from './conflictDetectionService';

export interface SuggestedSlot {
  startTime: Date;
  endTime: Date;
  duration: number;
  score: number;
  reason: string;
}

export interface WaitlistMatch {
  entry: WaitlistEntry;
  suggestedSlots: SuggestedSlot[];
  bestMatch?: SuggestedSlot;
}

export const smartWaitlistService = {
  /**
   * Encontrar horários disponíveis para uma entrada da lista de espera
   */
  async findAvailableSlots(
    entry: WaitlistEntry,
    allAppointments: Appointment[],
    scheduleBlocks: ScheduleBlock[] = [],
    daysToCheck: number = 14
  ): Promise<SuggestedSlot[]> {
    const suggestions: SuggestedSlot[] = [];
    const now = new Date();
    const endDate = new Date(now.getTime() + daysToCheck * 24 * 60 * 60 * 1000);

    // Duração padrão de 60 minutos
    const duration = 60;

    // Iterar pelos próximos dias
    for (let i = 0; i < daysToCheck; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() + i);
      checkDate.setHours(8, 0, 0, 0); // Começar às 8h

      // Verificar se o dia está nas preferências
      if (entry.preferredDays && entry.preferredDays.length > 0) {
        if (!entry.preferredDays.includes(checkDate.getDay())) {
          continue;
        }
      }

      // Verificar horários do dia
      for (let hour = 8; hour <= 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotStart = new Date(checkDate);
          slotStart.setHours(hour, minute, 0, 0);
          const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);

          // Verificar se está dentro das preferências de horário
          if (entry.preferredTimeRanges && entry.preferredTimeRanges.length > 0) {
            const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const inRange = entry.preferredTimeRanges.some(range => {
              return slotTime >= range.start && slotTime <= range.end;
            });
            if (!inRange) continue;
          }

          // Verificar se está dentro das preferências de data
          if (entry.preferredStartFrom && slotStart < entry.preferredStartFrom) {
            continue;
          }
          if (entry.preferredStartTo && slotStart > entry.preferredStartTo) {
            continue;
          }

          // Verificar disponibilidade
          const isAvailable = this.isSlotAvailable(
            slotStart,
            slotEnd,
            entry.therapistId,
            allAppointments,
            scheduleBlocks
          );

          if (isAvailable) {
            const score = this.calculateSlotScore(slotStart, entry);
            suggestions.push({
              startTime: slotStart,
              endTime: slotEnd,
              duration,
              score,
              reason: this.getSlotReason(slotStart, score)
            });
          }
        }
      }
    }

    // Ordenar por score (melhores primeiro)
    return suggestions.sort((a, b) => b.score - a.score).slice(0, 10);
  },

  /**
   * Verificar se um slot está disponível
   */
  isSlotAvailable(
    startTime: Date,
    endTime: Date,
    therapistId: string,
    allAppointments: Appointment[],
    scheduleBlocks: ScheduleBlock[]
  ): boolean {
    // Verificar conflitos com agendamentos
    const hasAppointmentConflict = allAppointments.some(app =>
      app.therapistId === therapistId &&
      app.startTime < endTime &&
      app.endTime > startTime &&
      app.status !== 'canceled'
    );

    if (hasAppointmentConflict) return false;

    // Verificar conflitos com bloqueios
    const hasBlockConflict = scheduleBlocks.some(block =>
      block.therapistId === therapistId &&
      block.startTime < endTime &&
      block.endTime > startTime
    );

    return !hasBlockConflict;
  },

  /**
   * Calcular score de um slot baseado em preferências
   */
  calculateSlotScore(slotStart: Date, entry: WaitlistEntry): number {
    let score = 100;

    // Penalizar slots muito no futuro
    const daysFromNow = Math.floor((slotStart.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    score -= daysFromNow * 2;

    // Penalizar horários muito cedo ou muito tarde
    const hour = slotStart.getHours();
    if (hour < 9 || hour > 17) {
      score -= 10;
    }

    // Bônus para horários preferidos
    if (entry.preferredTimeRanges && entry.preferredTimeRanges.length > 0) {
      const slotTime = `${hour.toString().padStart(2, '0')}:${slotStart.getMinutes().toString().padStart(2, '0')}`;
      const inPreferredRange = entry.preferredTimeRanges.some(range => {
        return slotTime >= range.start && slotTime <= range.end;
      });
      if (inPreferredRange) {
        score += 20;
      }
    }

    // Bônus para dias preferidos
    if (entry.preferredDays && entry.preferredDays.includes(slotStart.getDay())) {
      score += 15;
    }

    // Bônus para urgência alta
    if (entry.urgency >= 4) {
      score += 30;
    }

    return Math.max(0, score);
  },

  /**
   * Obter razão para sugestão do slot
   */
  getSlotReason(slotStart: Date, score: number): string {
    const hour = slotStart.getHours();
    
    if (score >= 100) return 'Horário ideal';
    if (score >= 80) return 'Boa opção';
    if (score >= 60) return 'Disponível';
    return 'Alternativa';
  },

  /**
   * Encontrar melhor match para todas as entradas da lista de espera
   */
  async findBestMatchesForAll(
    entries: WaitlistEntry[],
    allAppointments: Appointment[],
    scheduleBlocks: ScheduleBlock[] = []
  ): Promise<WaitlistMatch[]> {
    const matches: WaitlistMatch[] = [];

    for (const entry of entries) {
      const suggestedSlots = await this.findAvailableSlots(
        entry,
        allAppointments,
        scheduleBlocks
      );

      matches.push({
        entry,
        suggestedSlots,
        bestMatch: suggestedSlots[0]
      });
    }

    return matches;
  },

  /**
   * Agendar automaticamente a melhor opção para uma entrada
   */
  async autoSchedule(
    entry: WaitlistEntry,
    allAppointments: Appointment[],
    scheduleBlocks: ScheduleBlock[] = []
  ): Promise<SuggestedSlot | null> {
    const suggestions = await this.findAvailableSlots(
      entry,
      allAppointments,
      scheduleBlocks
    );

    if (suggestions.length === 0) {
      return null;
    }

    return suggestions[0]; // Melhor opção
  }
};

