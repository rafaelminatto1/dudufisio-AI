/**
 * WhatsApp CRM Service - Serviço unificado de integração
 * Conecta WhatsApp Business API com sistema de CRM/Leads
 */

import { leadService } from './leadService';
import { supabase } from '../../lib/supabaseClient';

export interface WhatsAppMessage {
  from: string;
  name?: string;
  text: string;
  timestamp: number;
  message_id?: string;
}

export interface SendMessageParams {
  to: string;
  message: string;
  template_id?: string;
  lead_id?: string;
  patient_id?: string;
}

export const whatsappCrmService = {
  /**
   * Processar mensagem recebida do WhatsApp
   * Cria lead automaticamente se não for paciente
   */
  async processIncomingMessage(message: WhatsAppMessage): Promise<{
    type: 'patient' | 'lead';
    id: string;
    isNew: boolean;
  }> {
    const phone = message.from.replace(/\D/g, ''); // Remover formatação

    // 1. Verificar se já é paciente
    const { data: patient } = await supabase
      .from('patients')
      .select('id, name')
      .eq('phone', phone)
      .maybeSingle();

    if (patient) {
      // Já é paciente, registrar mensagem
      await supabase.from('messages').insert({
        patient_id: patient.id,
        channel: 'whatsapp',
        type: 'generic',
        status: 'delivered',
        body: message.text,
        external_message_id: message.message_id,
        delivered_at: new Date(message.timestamp * 1000),
        metadata: {
          direction: 'inbound',
          from: message.from,
          name: message.name
        }
      });

      return {
        type: 'patient',
        id: patient.id,
        isNew: false
      };
    }

    // 2. Verificar se já existe lead
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (existingLead) {
      // Lead já existe, adicionar interação
      await leadService.addInteraction(existingLead.id, {
        type: 'whatsapp_message',
        direction: 'inbound',
        content: message.text
      });

      return {
        type: 'lead',
        id: existingLead.id,
        isNew: false
      };
    }

    // 3. Criar novo lead
    const lead = await leadService.createLeadFromWhatsApp(
      phone,
      message.name || `WhatsApp ${phone.slice(-4)}`,
      message.text
    );

    return {
      type: 'lead',
      id: lead.id,
      isNew: true
    };
  },

  /**
   * Enviar mensagem via WhatsApp Business API
   */
  async sendMessage(params: SendMessageParams): Promise<{
    success: boolean;
    message_id?: string;
    error?: string;
  }> {
    try {
      const accessToken = import.meta.env.VITE_WHATSAPP_BUSINESS_API_TOKEN;
      const phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;

      if (!accessToken || !phoneNumberId) {
        throw new Error('WhatsApp Business API não configurado');
      }

      // Enviar via API do WhatsApp
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: params.to.replace(/\D/g, ''),
            type: 'text',
            text: { body: params.message }
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erro ao enviar mensagem');
      }

      const data = await response.json();
      const whatsappMessageId = data.messages?.[0]?.id;

      // Salvar mensagem no banco
      const { data: savedMessage } = await supabase
        .from('messages')
        .insert({
          patient_id: params.patient_id,
          template_id: params.template_id,
          channel: 'whatsapp',
          type: 'generic',
          status: 'sent',
          body: params.message,
          external_message_id: whatsappMessageId,
          sent_at: new Date(),
          metadata: {
            direction: 'outbound',
            to: params.to,
            lead_id: params.lead_id
          }
        })
        .select()
        .single();

      // Se for lead, adicionar interação
      if (params.lead_id) {
        await leadService.addInteraction(params.lead_id, {
          type: 'whatsapp_message',
          direction: 'outbound',
          content: params.message,
          message_id: savedMessage?.id
        });
      }

      return {
        success: true,
        message_id: whatsappMessageId
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  },

  /**
   * Buscar histórico de conversa (lead ou paciente)
   */
  async getConversationHistory(identifier: {
    lead_id?: string;
    patient_id?: string;
    phone?: string;
  }): Promise<any[]> {
    let query = supabase
      .from('messages')
      .select('*')
      .eq('channel', 'whatsapp')
      .order('created_at', { ascending: true });

    if (identifier.patient_id) {
      query = query.eq('patient_id', identifier.patient_id);
    } else if (identifier.lead_id) {
      query = query.eq('metadata->lead_id', identifier.lead_id);
    } else if (identifier.phone) {
      // Buscar por recipient
      const { data: recipient } = await supabase
        .from('communication_recipients')
        .select('id')
        .eq('phone', identifier.phone)
        .maybeSingle();

      if (recipient) {
        query = query.eq('recipient_id', recipient.id);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Converter lead em paciente quando agenda primeira consulta
   */
  async convertLeadOnAppointment(
    lead_id: string,
    appointment_data: {
      date: Date;
      therapist_id: string;
      service_type: string;
    }
  ): Promise<string> {
    // 1. Converter lead em paciente
    const patient_id = await leadService.convertToPatient(lead_id);

    // 2. Criar agendamento
    const { error } = await supabase.from('appointments').insert({
      patient_id,
      therapist_id: appointment_data.therapist_id,
      scheduled_at: appointment_data.date,
      service_type: appointment_data.service_type,
      status: 'scheduled',
      source: 'crm_conversion'
    });

    if (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }

    // 3. Enviar confirmação via WhatsApp
    const { data: lead } = await supabase
      .from('leads')
      .select('phone, name')
      .eq('id', lead_id)
      .single();

    if (lead?.phone) {
      await this.sendMessage({
        to: lead.phone,
        patient_id,
        message: `Olá ${lead.name}! 🎉

Sua consulta foi agendada com sucesso!

📅 Data: ${new Date(appointment_data.date).toLocaleDateString('pt-BR')}
🕐 Horário: ${new Date(appointment_data.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}

Estamos ansiosos para atendê-lo(a)!

Qualquer dúvida, estamos à disposição. 😊`
      });
    }

    return patient_id;
  },

  /**
   * Buscar leads que precisam de follow-up
   */
  async getLeadsNeedingFollowup(limit: number = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .not('next_followup_at', 'is', null)
      .lte('next_followup_at', new Date().toISOString())
      .in('status', ['contacted', 'qualified', 'proposal_sent', 'negotiation'])
      .order('next_followup_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar leads para follow-up:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Enviar mensagem de follow-up automática
   */
  async sendFollowupMessage(lead_id: string): Promise<void> {
    const lead = await leadService.getLeadById(lead_id);

    if (!lead?.phone) {
      throw new Error('Lead não encontrado ou sem telefone');
    }

    const message = `Olá ${lead.name}! 👋

Passando aqui para saber se você teve a oportunidade de pensar sobre nossa conversa.

Como posso te ajudar? Tem alguma dúvida?

Estou à disposição! 😊`;

    await this.sendMessage({
      to: lead.phone,
      lead_id: lead.id,
      message
    });

    // Atualizar próximo follow-up para daqui 3 dias
    const nextFollowup = new Date();
    nextFollowup.setDate(nextFollowup.getDate() + 3);

    await leadService.updateLead(lead_id, {
      next_followup_at: nextFollowup
    });
  },

  /**
   * Marcar mensagem como lida
   */
  async markMessageAsRead(message_id: string): Promise<void> {
    await supabase
      .from('messages')
      .update({
        status: 'read',
        read_at: new Date()
      })
      .eq('id', message_id);
  },

  /**
   * Buscar conversas ativas (últimas 24h)
   */
  async getActiveConversations(limit: number = 50): Promise<any[]> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        patient:patients(id, name, phone),
        recipient:communication_recipients(id, name, phone)
      `)
      .eq('channel', 'whatsapp')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar conversas ativas:', error);
      return [];
    }

    // Agrupar por contato (último de cada)
    const grouped = new Map();
    (data || []).forEach((msg: any) => {
      const key = msg.patient?.phone || msg.recipient?.phone || msg.metadata?.from;
      if (key && !grouped.has(key)) {
        grouped.set(key, msg);
      }
    });

    return Array.from(grouped.values());
  },

  /**
   * Estatísticas de conversão
   */
  async getConversionStats(period_days: number = 30): Promise<{
    total_leads: number;
    converted_leads: number;
    conversion_rate: number;
    avg_days_to_convert: number;
    leads_by_source: Record<string, number>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period_days);

    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .gte('created_at', startDate.toISOString());

    const total_leads = leads?.length || 0;
    const converted_leads = leads?.filter(l => l.status === 'won').length || 0;
    const conversion_rate = total_leads > 0 ? (converted_leads / total_leads) * 100 : 0;

    // Calcular tempo médio de conversão
    const conversions = leads?.filter(l => l.converted_at) || [];
    const totalDays = conversions.reduce((sum, l) => {
      const days = Math.floor(
        (new Date(l.converted_at).getTime() - new Date(l.created_at).getTime()) /
        (1000 * 60 * 60 * 24)
      );
      return sum + days;
    }, 0);
    const avg_days_to_convert = conversions.length > 0 ? totalDays / conversions.length : 0;

    // Agrupar por source
    const leads_by_source: Record<string, number> = {};
    leads?.forEach(l => {
      const source = l.source || 'unknown';
      leads_by_source[source] = (leads_by_source[source] || 0) + 1;
    });

    return {
      total_leads,
      converted_leads,
      conversion_rate: Math.round(conversion_rate * 100) / 100,
      avg_days_to_convert: Math.round(avg_days_to_convert * 10) / 10,
      leads_by_source
    };
  }
};
