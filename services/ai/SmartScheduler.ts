/**
 * Smart Scheduler - Agendamento Inteligente com IA
 * Activity Fisioterapia Integration - Fase 3
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Lead } from '@/types/crm';
import { supabase } from '@/lib/supabase';

export interface AppointmentSlot {
  date: Date;
  time: string;
  therapist_id?: string;
  therapist_name?: string;
  score: number; // 0-100, maior = melhor
  reasons: string[]; // Por que este slot é recomendado
}

export interface SchedulePreferences {
  serviceType: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  preferredDays?: string[]; // ['monday', 'tuesday', ...]
  preferredTimes?: string[]; // ['morning', 'afternoon', 'evening']
  therapistId?: string;
}

export type UrgencyLevel = 'baixa' | 'media' | 'alta' | 'urgente';

export class SmartScheduler {
  private gemini: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    this.gemini = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Sugerir melhores horários para um lead
   */
  async suggestAppointmentSlots(
    leadId: string,
    preferences: SchedulePreferences,
    limit = 3
  ): Promise<AppointmentSlot[]> {
    try {
      // 1. Buscar dados do lead
      const lead = await this.getLeadData(leadId);
      if (!lead) {
        throw new Error('Lead não encontrado');
      }

      // 2. Buscar slots disponíveis
      const availableSlots = await this.getAvailableSlots(
        preferences.serviceType,
        preferences.dateRange || {
          from: new Date(),
          to: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
        }
      );

      // 3. Detectar urgência do caso
      const urgency = await this.detectUrgency(lead);

      // 4. Ranquear slots baseado em múltiplos fatores
      const rankedSlots = await this.rankSlots(
        availableSlots,
        lead,
        urgency,
        preferences
      );

      // 5. Retornar top N slots
      return rankedSlots.slice(0, limit);
    } catch (error) {
      console.error('Erro ao sugerir horários:', error);
      return [];
    }
  }

  /**
   * Detectar urgência do caso usando IA
   */
  async detectUrgency(lead: Partial<Lead>): Promise<UrgencyLevel> {
    // Se já tem urgência definida, usar
    if (lead.urgency_level) {
      return lead.urgency_level as UrgencyLevel;
    }

    // Usar IA para detectar
    try {
      const prompt = `
Analise o seguinte caso e classifique a urgência:

Nome: ${lead.name}
Descrição da dor: ${lead.pain_description || 'Não informado'}
Duração: ${lead.pain_duration || 'Não informado'}
Localização: ${lead.pain_location || 'Não informado'}
Atividade: ${lead.sport_activity || 'Não informado'}

Classifique como: baixa, media, alta, urgente

Critérios:
- urgente: Dor aguda intensa, limitação severa, risco de lesão grave
- alta: Dor moderada a forte, impacta atividades diárias significativamente
- media: Desconforto, impacta performance esportiva
- baixa: Preventivo, otimização de performance, sem dor significativa

Responda APENAS com o nível (baixa, media, alta ou urgente).
`;

      const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = result.response.text().trim().toLowerCase();

      if (['baixa', 'media', 'alta', 'urgente'].includes(response)) {
        return response as UrgencyLevel;
      }

      return 'media'; // Default
    } catch (error) {
      console.error('Erro ao detectar urgência:', error);
      return 'media';
    }
  }

  /**
   * Buscar slots disponíveis
   */
  private async getAvailableSlots(
    serviceType: string,
    dateRange: { from: Date; to: Date }
  ): Promise<AppointmentSlot[]> {
    try {
      // Buscar agendamentos existentes
      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('scheduled_at, therapist_id')
        .gte('scheduled_at', dateRange.from.toISOString())
        .lte('scheduled_at', dateRange.to.toISOString())
        .not('status', 'eq', 'cancelled');

      // Gerar slots disponíveis (horário comercial)
      const slots: AppointmentSlot[] = [];
      const currentDate = new Date(dateRange.from);

      while (currentDate <= dateRange.to) {
        // Pular domingos
        if (currentDate.getDay() === 0) {
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        // Horários de atendimento
        const isWeekday = currentDate.getDay() >= 1 && currentDate.getDay() <= 5;
        const hours = isWeekday
          ? ['07:00', '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00']
          : ['08:00', '09:00', '10:00', '11:00']; // Sábado

        for (const time of hours) {
          const slotDate = new Date(currentDate);
          const [hour, minute] = time.split(':');
          slotDate.setHours(parseInt(hour), parseInt(minute), 0, 0);

          // Verificar se slot está ocupado
          const isOccupied = existingAppointments?.some((apt) => {
            const aptDate = new Date(apt.scheduled_at);
            return aptDate.getTime() === slotDate.getTime();
          });

          if (!isOccupied) {
            slots.push({
              date: new Date(currentDate),
              time,
              score: 50, // Score base, será ajustado
              reasons: [],
            });
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return slots;
    } catch (error) {
      console.error('Erro ao buscar slots:', error);
      return [];
    }
  }

  /**
   * Ranquear slots baseado em múltiplos fatores
   */
  private async rankSlots(
    slots: AppointmentSlot[],
    lead: Partial<Lead>,
    urgency: UrgencyLevel,
    preferences: SchedulePreferences
  ): Promise<AppointmentSlot[]> {
    const rankedSlots = slots.map((slot) => {
      let score = slot.score;
      const reasons: string[] = [];

      // Fator 1: Urgência (quanto maior, mais cedo melhor)
      const daysFromNow = Math.floor(
        (slot.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (urgency === 'urgente' && daysFromNow <= 1) {
        score += 40;
        reasons.push('Disponível urgentemente');
      } else if (urgency === 'alta' && daysFromNow <= 3) {
        score += 30;
        reasons.push('Disponível em breve');
      } else if (urgency === 'media' && daysFromNow <= 7) {
        score += 20;
        reasons.push('Boa disponibilidade');
      }

      // Fator 2: Horário preferencial
      const hour = parseInt(slot.time.split(':')[0]);
      if (hour >= 7 && hour <= 9) {
        score += 10;
        reasons.push('Horário matinal');
      } else if (hour >= 14 && hour <= 16) {
        score += 15;
        reasons.push('Horário da tarde popular');
      } else if (hour >= 17 && hour <= 19) {
        score += 10;
        reasons.push('Horário pós-trabalho');
      }

      // Fator 3: Dia da semana
      const dayOfWeek = slot.date.getDay();
      if (dayOfWeek >= 2 && dayOfWeek <= 4) {
        // Terça a Quinta
        score += 10;
        reasons.push('Dia da semana ideal');
      }

      // Fator 4: Taxa de conversão histórica (simulado)
      // Em produção, buscar do histórico real
      if (Math.random() > 0.5) {
        score += 5;
        reasons.push('Alta taxa de confirmação');
      }

      return {
        ...slot,
        score,
        reasons,
      };
    });

    // Ordenar por score (maior primeiro)
    return rankedSlots.sort((a, b) => b.score - a.score);
  }

  /**
   * Buscar dados do lead
   */
  private async getLeadData(leadId: string): Promise<Partial<Lead> | null> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (error) {
        throw error;
      }

      return data as Lead;
    } catch (error) {
      console.error('Erro ao buscar lead:', error);
      return null;
    }
  }

  /**
   * Auto-agendar (quando lead aceita sugestão)
   */
  async autoSchedule(
    leadId: string,
    slot: AppointmentSlot,
    clinicId: string
  ): Promise<{ success: boolean; appointmentId?: string }> {
    try {
      // 1. Criar agendamento
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert({
          clinic_id: clinicId,
          patient_id: leadId, // Será lead_id na prática
          scheduled_at: new Date(
            slot.date.toDateString() + ' ' + slot.time
          ).toISOString(),
          therapist_id: slot.therapist_id,
          status: 'scheduled',
          service_type: 'fisioterapia', // Ajustar conforme necessário
          created_by: 'system',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // 2. Atualizar lead
      await supabase
        .from('leads')
        .update({
          status: 'agendado',
        })
        .eq('id', leadId);

      // 3. Enviar confirmação por WhatsApp (se configurado)
      try {
        const { getWhatsAppService } = await import('@/services/whatsapp/WhatsAppService');
        const whatsapp = getWhatsAppService();
        
        if (whatsapp.isConfigured()) {
          const lead = await this.getLeadData(leadId);
          if (lead?.phone) {
            await whatsapp.sendTemplateMessage(
              lead.phone,
              'confirmacao_agendamento',
              [
                slot.date.toLocaleDateString('pt-BR'),
                slot.time,
                slot.therapist_name || 'Especialista',
              ],
              clinicId
            );
          }
        }
      } catch (err) {
        console.error('Erro ao enviar confirmação:', err);
      }

      return {
        success: true,
        appointmentId: appointment.id,
      };
    } catch (error) {
      console.error('Erro ao auto-agendar:', error);
      return {
        success: false,
      };
    }
  }

  /**
   * Sugerir reagendamento inteligente
   */
  async suggestReschedule(
    appointmentId: string,
    reason?: string
  ): Promise<AppointmentSlot[]> {
    try {
      // Buscar agendamento atual
      const { data: appointment } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (!appointment) {
        return [];
      }

      // Sugerir novos horários próximos ao original
      const originalDate = new Date(appointment.scheduled_at);
      const preferences: SchedulePreferences = {
        serviceType: appointment.service_type,
        dateRange: {
          from: new Date(), // A partir de agora
          to: new Date(originalDate.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 dias do original
        },
        therapistId: appointment.therapist_id,
      };

      return this.suggestAppointmentSlots(
        appointment.patient_id,
        preferences,
        5 // Top 5 opções
      );
    } catch (error) {
      console.error('Erro ao sugerir reagendamento:', error);
      return [];
    }
  }
}

// Singleton
let smartSchedulerInstance: SmartScheduler | null = null;

export const getSmartScheduler = (): SmartScheduler => {
  if (!smartSchedulerInstance) {
    smartSchedulerInstance = new SmartScheduler();
  }
  return smartSchedulerInstance;
};

