/**
 * Interaction Service - Serviço de gerenciamento de interações com leads
 * Activity Fisioterapia Integration - Fase 1
 */
import { supabase } from '@/lib/supabaseClient';
export class InteractionService {
    /**
     * Registrar nova interação
     */
    static async createInteraction(input) {
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
        return data;
    }
    /**
     * Buscar histórico de interações de um lead
     */
    static async getLeadInteractions(leadId, limit = 50) {
        const { data, error } = await supabase
            .from('lead_interactions')
            .select('*')
            .eq('lead_id', leadId)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) {
            throw new Error(`Erro ao buscar interações: ${error.message}`);
        }
        return data;
    }
    /**
     * Buscar últimas interações da clínica
     */
    static async getClinicInteractions(clinicId, filters, limit = 100) {
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
        return data;
    }
    /**
     * Atualizar status da interação (ex: delivered, read)
     */
    static async updateInteractionStatus(interactionId, status) {
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
        return data;
    }
    /**
     * Registrar resposta do lead
     */
    static async recordLeadResponse(interactionId, response, detectedIntent, detectedSentiment, aiConfidence) {
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
        return data;
    }
    /**
     * Buscar métricas de interações
     */
    static async getInteractionMetrics(clinicId, dateFrom, dateTo) {
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
            by_type: {},
            by_direction: {},
            by_status: {},
            by_intent: {},
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
            }
            else {
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
    static async calculateAverageResponseTime(clinicId, dateFrom, dateTo) {
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
        const responseTimes = [];
        let lastInbound = null;
        let currentLeadId = null;
        data.forEach((interaction) => {
            if (interaction.lead_id !== currentLeadId) {
                currentLeadId = interaction.lead_id;
                lastInbound = null;
            }
            if (interaction.direction === 'inbound') {
                lastInbound = new Date(interaction.created_at);
            }
            else if (interaction.direction === 'outbound' && lastInbound) {
                const outboundTime = new Date(interaction.created_at);
                const diffMinutes = (outboundTime.getTime() - lastInbound.getTime()) / (1000 * 60);
                responseTimes.push(diffMinutes);
                lastInbound = null;
            }
        });
        if (responseTimes.length === 0) {
            return 0;
        }
        const average = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
        return Math.round(average);
    }
    /**
     * Buscar conversas ativas (últimas 24h com interação)
     */
    static async getActiveConversations(clinicId) {
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
        }, {});
        return Object.values(grouped);
    }
}
