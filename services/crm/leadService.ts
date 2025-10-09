/**
 * Lead Service - Gestão completa de leads e CRM
 * Integrado com WhatsApp e Supabase
 */

import { supabase } from '../supabase/client';

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost' | 'no_response';
  stage: string;
  lead_score: number;
  engagement_level: 'hot' | 'warm' | 'cold';
  source?: string;
  interested_in?: string;
  pain_points?: string[];
  urgency?: 'high' | 'medium' | 'low';
  assigned_to?: string;
  converted_patient_id?: string;
  next_followup_at?: Date;
  total_interactions: number;
  first_contact_at: Date;
  last_contact_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface LeadInteraction {
  id: string;
  lead_id: string;
  type: 'whatsapp_message' | 'email' | 'phone_call' | 'meeting' | 'note' | 'status_change';
  direction?: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  created_at: Date;
}

export interface CreateLeadParams {
  name: string;
  phone?: string;
  email?: string;
  source?: string;
  interested_in?: string;
  notes?: string;
  assigned_to?: string;
}

export interface UpdateLeadParams {
  name?: string;
  email?: string;
  phone?: string;
  status?: Lead['status'];
  interested_in?: string;
  pain_points?: string[];
  urgency?: 'high' | 'medium' | 'low';
  budget_range?: string;
  expected_start_date?: Date;
  next_followup_at?: Date;
  notes?: string;
  tags?: string[];
}

export const leadService = {
  /**
   * Criar novo lead (ex: de mensagem WhatsApp)
   */
  async createLead(params: CreateLeadParams): Promise<Lead> {
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

    return data as Lead;
  },

  /**
   * Criar lead automaticamente de mensagem WhatsApp
   */
  async createLeadFromWhatsApp(phone: string, name: string, message: string): Promise<Lead> {
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
      return existingLead as Lead;
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
  async updateLead(lead_id: string, params: UpdateLeadParams): Promise<Lead> {
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

    return data as Lead;
  },

  /**
   * Adicionar interação ao histórico do lead
   */
  async addInteraction(
    lead_id: string,
    interaction: Omit<LeadInteraction, 'id' | 'lead_id' | 'created_at'>
  ): Promise<void> {
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
  async getLeadsByStage(): Promise<Record<string, Lead[]>> {
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
    const grouped: Record<string, Lead[]> = {
      new: [],
      contacted: [],
      qualified: [],
      proposal_sent: [],
      negotiation: [],
      won: [],
      lost: []
    };

    (data as Lead[]).forEach((lead) => {
      if (grouped[lead.status]) {
        grouped[lead.status].push(lead);
      }
    });

    return grouped;
  },

  /**
   * Buscar lead por ID
   */
  async getLeadById(lead_id: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar lead:', error);
      throw error;
    }

    return data as Lead | null;
  },

  /**
   * Buscar histórico de interações do lead
   */
  async getLeadInteractions(lead_id: string): Promise<LeadInteraction[]> {
    const { data, error } = await supabase
      .from('lead_interactions')
      .select('*')
      .eq('lead_id', lead_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar interações:', error);
      throw error;
    }

    return data as LeadInteraction[];
  },

  /**
   * Calcular score do lead
   */
  async calculateLeadScore(lead_id: string): Promise<number> {
    const { data, error } = await supabase.rpc('calculate_lead_score', {
      lead_id_param: lead_id
    });

    if (error) {
      console.error('Erro ao calcular score:', error);
      throw error;
    }

    return data as number;
  },

  /**
   * Converter lead em paciente
   */
  async convertToPatient(lead_id: string): Promise<string> {
    const { data, error } = await supabase.rpc('convert_lead_to_patient', {
      lead_id_param: lead_id
    });

    if (error) {
      console.error('Erro ao converter lead:', error);
      throw error;
    }

    return data as string; // patient_id
  },

  /**
   * Buscar leads quentes (hot leads) - prioridade
   */
  async getHotLeads(limit: number = 10): Promise<Lead[]> {
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

    return data as Lead[];
  },

  /**
   * Buscar leads que precisam de follow-up
   */
  async getLeadsNeedingFollowup(): Promise<Lead[]> {
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

    return data as Lead[];
  },

  /**
   * Marcar lead como perdido
   */
  async markAsLost(lead_id: string, reason: string): Promise<void> {
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
  async getConversionMetrics(): Promise<any> {
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
  async searchLeads(filters: {
    search?: string;
    status?: string[];
    source?: string[];
    engagement_level?: string[];
    assigned_to?: string;
  }): Promise<Lead[]> {
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

    return data as Lead[];
  }
};
