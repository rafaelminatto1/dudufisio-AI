/**
 * Lead Service - Gestão completa de leads e CRM
 * Integrado com WhatsApp e Supabase
 */
import { supabase } from '../supabase/client';
export const leadService = {
    /**
     * Criar novo lead (ex: de mensagem WhatsApp)
     */
    async createLead(params) {
        const { data, error } = await supabase
            .from('leads')
            .insert({
            name: params.name,
            phone: params.phone,
            email: params.email,
            source: params.source || 'manual',
            interested_in: params.interested_in,
            notes: params.notes,
            assigned_to: params.assigned_to,
            status: 'new',
            stage: 'lead',
            lead_score: 50, // Score inicial padrão
            engagement_level: 'warm',
            first_contact_at: new Date().toISOString(),
            total_interactions: 0
        })
            .select()
            .single();
        if (error) {
            console.error('Erro ao criar lead:', error);
            throw error;
        }
        // Criar recipient de comunicação
        if (params.phone || params.email) {
            await supabase.from('communication_recipients').insert({
                name: params.name,
                phone: params.phone,
                email: params.email,
                preferred_channel: params.phone ? 'whatsapp' : 'email',
                metadata: { lead_id: data.id, source: params.source }
            });
        }
        // Calcular score inicial
        await this.calculateLeadScore(data.id);
        return data;
    },
    /**
     * Criar lead automaticamente de mensagem WhatsApp
     */
    async createLeadFromWhatsApp(phone, name, message) {
        // Verificar se já existe lead ou paciente com esse telefone
        const { data: existingLead } = await supabase
            .from('leads')
            .select('*')
            .eq('phone', phone)
            .maybeSingle();
        if (existingLead) {
            // Adicionar interação ao lead existente
            await this.addInteraction(existingLead.id, {
                type: 'whatsapp_message',
                direction: 'inbound',
                content: message
            });
            return existingLead;
        }
        // Verificar se é paciente existente
        const { data: existingPatient } = await supabase
            .from('patients')
            .select('id, name')
            .eq('phone', phone)
            .maybeSingle();
        if (existingPatient) {
            // Já é paciente, apenas registrar mensagem
            throw new Error('ALREADY_PATIENT');
        }
        // Criar novo lead
        const lead = await this.createLead({
            name,
            phone,
            source: 'whatsapp',
            interested_in: 'Consulta inicial',
            notes: `Primeira mensagem: "${message}"`
        });
        // Registrar primeira interação
        await this.addInteraction(lead.id, {
            type: 'whatsapp_message',
            direction: 'inbound',
            content: message
        });
        return lead;
    },
    /**
     * Atualizar dados do lead
     */
    async updateLead(lead_id, params) {
        const { data, error } = await supabase
            .from('leads')
            .update({
            ...params,
            updated_at: new Date().toISOString()
        })
            .eq('id', lead_id)
            .select()
            .single();
        if (error) {
            console.error('Erro ao atualizar lead:', error);
            throw error;
        }
        // Recalcular score se houve mudanças relevantes
        if (params.status || params.urgency || params.interested_in) {
            await this.calculateLeadScore(lead_id);
        }
        return data;
    },
    /**
     * Adicionar interação ao histórico do lead
     */
    async addInteraction(lead_id, interaction) {
        const { error } = await supabase.from('lead_interactions').insert({
            lead_id,
            type: interaction.type,
            direction: interaction.direction,
            subject: interaction.subject,
            content: interaction.content
        });
        if (error) {
            console.error('Erro ao adicionar interação:', error);
            throw error;
        }
        // O trigger automático vai atualizar counters e score
    },
    /**
     * Buscar leads por status (para Kanban)
     */
    async getLeadsByStage() {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('lead_score', { ascending: false })
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Erro ao buscar leads:', error);
            throw error;
        }
        // Agrupar por status
        const grouped = {
            new: [],
            contacted: [],
            qualified: [],
            proposal_sent: [],
            negotiation: [],
            won: [],
            lost: []
        };
        data.forEach((lead) => {
            if (grouped[lead.status]) {
                grouped[lead.status].push(lead);
            }
        });
        return grouped;
    },
    /**
     * Buscar lead por ID
     */
    async getLeadById(lead_id) {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('id', lead_id)
            .maybeSingle();
        if (error) {
            console.error('Erro ao buscar lead:', error);
            throw error;
        }
        return data;
    },
    /**
     * Buscar histórico de interações do lead
     */
    async getLeadInteractions(lead_id) {
        const { data, error } = await supabase
            .from('lead_interactions')
            .select('*')
            .eq('lead_id', lead_id)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Erro ao buscar interações:', error);
            throw error;
        }
        return data;
    },
    /**
     * Calcular score do lead
     */
    async calculateLeadScore(lead_id) {
        const { data, error } = await supabase.rpc('calculate_lead_score', {
            lead_id_param: lead_id
        });
        if (error) {
            console.error('Erro ao calcular score:', error);
            throw error;
        }
        return data;
    },
    /**
     * Converter lead em paciente
     */
    async convertToPatient(lead_id) {
        const { data, error } = await supabase.rpc('convert_lead_to_patient', {
            lead_id_param: lead_id
        });
        if (error) {
            console.error('Erro ao converter lead:', error);
            throw error;
        }
        return data; // patient_id
    },
    /**
     * Buscar leads quentes (hot leads) - prioridade
     */
    async getHotLeads(limit = 10) {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('engagement_level', 'hot')
            .in('status', ['new', 'contacted', 'qualified', 'negotiation'])
            .order('lead_score', { ascending: false })
            .limit(limit);
        if (error) {
            console.error('Erro ao buscar hot leads:', error);
            throw error;
        }
        return data;
    },
    /**
     * Buscar leads que precisam de follow-up
     */
    async getLeadsNeedingFollowup() {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .not('next_followup_at', 'is', null)
            .lte('next_followup_at', new Date().toISOString())
            .in('status', ['contacted', 'qualified', 'proposal_sent', 'negotiation'])
            .order('next_followup_at', { ascending: true });
        if (error) {
            console.error('Erro ao buscar leads para follow-up:', error);
            throw error;
        }
        return data;
    },
    /**
     * Marcar lead como perdido
     */
    async markAsLost(lead_id, reason) {
        const { error } = await supabase
            .from('leads')
            .update({
            status: 'lost',
            lost_reason: reason,
            lost_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
            .eq('id', lead_id);
        if (error) {
            console.error('Erro ao marcar como perdido:', error);
            throw error;
        }
        // Adicionar interação
        await this.addInteraction(lead_id, {
            type: 'status_change',
            content: `Lead marcado como perdido. Motivo: ${reason}`
        });
    },
    /**
     * Buscar métricas de conversão
     */
    async getConversionMetrics() {
        const { data, error } = await supabase
            .from('lead_conversion_metrics')
            .select('*');
        if (error) {
            console.error('Erro ao buscar métricas:', error);
            throw error;
        }
        return data;
    },
    /**
     * Buscar leads por filtros
     */
    async searchLeads(filters) {
        let query = supabase.from('leads').select('*');
        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
        }
        if (filters.status && filters.status.length > 0) {
            query = query.in('status', filters.status);
        }
        if (filters.source && filters.source.length > 0) {
            query = query.in('source', filters.source);
        }
        if (filters.engagement_level && filters.engagement_level.length > 0) {
            query = query.in('engagement_level', filters.engagement_level);
        }
        if (filters.assigned_to) {
            query = query.eq('assigned_to', filters.assigned_to);
        }
        query = query.order('lead_score', { ascending: false });
        const { data, error } = await query;
        if (error) {
            console.error('Erro ao buscar leads:', error);
            throw error;
        }
        return data;
    }
};
