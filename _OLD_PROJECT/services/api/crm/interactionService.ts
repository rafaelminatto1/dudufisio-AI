/**
 * Interaction Service - Serviço de gerenciamento de interações com leads
 * Activity Fisioterapia Integration - Fase 1
 */

import { supabase } from '@/lib/supabaseClient';
import { LeadInteraction, InteractionType, InteractionDirection } from '@/types/crm';

export interface CreateInteractionInput {
  lead_id: string;
  clinic_id: string;
  interaction_type: InteractionType;
  direction: InteractionDirection;
  channel?: string;
  message_content?: string;
  message_template_id?: string;
  message_template_name?: string;
  status?: string;
  lead_response?: string;
  detected_intent?: string;
  detected_sentiment?: string;
  ai_confidence?: number;
  agent_id?: string;
  is_automated?: boolean;
  metadata?: Record<string, any>;
}

export class InteractionService {
  /**
   * Registrar nova interação
   */
  static async createInteraction(input: CreateInteractionInput): Promise<LeadInteraction> {
    const { data, error } = await supabase
      .from('lead_interactions')
      .insert({
        ...input,
        agent_id: input.agent_id || (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar interação: ${error.message}`);
    }

    return data as LeadInteraction;
  }

  /**
   * Buscar histórico de interações de um lead
   */
  static async getLeadInteractions(leadId: string, limit = 50): Promise<LeadInteraction[]> {
    const { data, error } = await supabase
      .from('lead_interactions')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar interações: ${error.message}`);
    }

    return data as LeadInteraction[];
  }

  /**
   * Buscar últimas interações da clínica
   */
  static async getClinicInteractions(
    clinicId: string,
    filters?: {
      interaction_type?: InteractionType;
      direction?: InteractionDirection;
      date_from?: string;
      date_to?: string;
    },
    limit = 100
  ): Promise<LeadInteraction[]> {
    let query = supabase
      .from('lead_interactions')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (filters?.interaction_type) {
      query = query.eq('interaction_type', filters.interaction_type);
    }

    if (filters?.direction) {
      query = query.eq('direction', filters.direction);
    }

    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar interações da clínica: ${error.message}`);
    }

    return data as LeadInteraction[];
  }

  /**
   * Atualizar status da interação (ex: delivered, read)
   */
  static async updateInteractionStatus(
    interactionId: string,
    status: string
  ): Promise<LeadInteraction> {
    const { data, error } = await supabase
      .from('lead_interactions')
      .update({
        status,
        status_updated_at: new Date().toISOString(),
      })
      .eq('id', interactionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar status da interação: ${error.message}`);
    }

    return data as LeadInteraction;
  }

  /**
   * Registrar resposta do lead
   */
  static async recordLeadResponse(
    interactionId: string,
    response: string,
    detectedIntent?: string,
    detectedSentiment?: string,
    aiConfidence?: number
  ): Promise<LeadInteraction> {
    const { data, error } = await supabase
      .from('lead_interactions')
      .update({
        lead_response: response,
        lead_responded_at: new Date().toISOString(),
        detected_intent: detectedIntent,
        detected_sentiment: detectedSentiment,
        ai_confidence: aiConfidence,
      })
      .eq('id', interactionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao registrar resposta: ${error.message}`);
    }

    return data as LeadInteraction;
  }

  /**
   * Buscar métricas de interações
   */
  static async getInteractionMetrics(clinicId: string, dateFrom: string, dateTo: string) {
    const { data, error } = await supabase
      .from('lead_interactions')
      .select('interaction_type, direction, status, detected_intent')
      .eq('clinic_id', clinicId)
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo);

    if (error) {
      throw new Error(`Erro ao buscar métricas: ${error.message}`);
    }

    // Processar métricas
    const metrics = {
      total: data.length,
      by_type: {} as Record<string, number>,
      by_direction: {} as Record<string, number>,
      by_status: {} as Record<string, number>,
      by_intent: {} as Record<string, number>,
      inbound: 0,
      outbound: 0,
      automated: 0,
      manual: 0,
    };

    data.forEach((interaction) => {
      // Por tipo
      metrics.by_type[interaction.interaction_type] =
        (metrics.by_type[interaction.interaction_type] || 0) + 1;

      // Por direção
      metrics.by_direction[interaction.direction] =
        (metrics.by_direction[interaction.direction] || 0) + 1;

      if (interaction.direction === 'inbound') {
        metrics.inbound++;
      } else {
        metrics.outbound++;
      }

      // Por status
      if (interaction.status) {
        metrics.by_status[interaction.status] =
          (metrics.by_status[interaction.status] || 0) + 1;
      }

      // Por intenção
      if (interaction.detected_intent) {
        metrics.by_intent[interaction.detected_intent] =
          (metrics.by_intent[interaction.detected_intent] || 0) + 1;
      }
    });

    return metrics;
  }

  /**
   * Calcular tempo médio de resposta
   */
  static async calculateAverageResponseTime(
    clinicId: string,
    dateFrom: string,
    dateTo: string
  ): Promise<number> {
    // Buscar pares de mensagens (inbound seguido de outbound)
    const { data, error } = await supabase
      .from('lead_interactions')
      .select('lead_id, direction, created_at')
      .eq('clinic_id', clinicId)
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo)
      .order('lead_id')
      .order('created_at');

    if (error || !data) {
      return 0;
    }

    const responseTimes: number[] = [];
    let lastInbound: Date | null = null;
    let currentLeadId: string | null = null;

    data.forEach((interaction) => {
      if (interaction.lead_id !== currentLeadId) {
        currentLeadId = interaction.lead_id;
        lastInbound = null;
      }

      if (interaction.direction === 'inbound') {
        lastInbound = new Date(interaction.created_at);
      } else if (interaction.direction === 'outbound' && lastInbound) {
        const outboundTime = new Date(interaction.created_at);
        const diffMinutes =
          (outboundTime.getTime() - lastInbound.getTime()) / (1000 * 60);
        responseTimes.push(diffMinutes);
        lastInbound = null;
      }
    });

    if (responseTimes.length === 0) {
      return 0;
    }

    const average =
      responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    return Math.round(average);
  }

  /**
   * Buscar conversas ativas (últimas 24h com interação)
   */
  static async getActiveConversations(clinicId: string): Promise<
    Array<{
      lead_id: string;
      last_interaction: string;
      interaction_count: number;
      last_message: string;
    }>
  > {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const { data, error } = await supabase
      .from('lead_interactions')
      .select('lead_id, created_at, message_content')
      .eq('clinic_id', clinicId)
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar conversas ativas: ${error.message}`);
    }

    // Agrupar por lead_id
    const grouped = data.reduce((acc, interaction) => {
      if (!acc[interaction.lead_id]) {
        acc[interaction.lead_id] = {
          lead_id: interaction.lead_id,
          last_interaction: interaction.created_at,
          interaction_count: 0,
          last_message: interaction.message_content || '',
        };
      }
      acc[interaction.lead_id].interaction_count++;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }
}

