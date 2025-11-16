/**
 * Automation Service - Serviço de automações e campanhas
 * Activity Fisioterapia Integration - Fase 2
 */

import { supabase } from '@/lib/supabaseClient';
import { getWhatsAppService } from '@/services/whatsapp/WhatsAppService';
import { LeadService } from '@/services/api/crm/leadService';

export interface CampaignSequence {
  step: number;
  delay_minutes: number;
  template_id: string;
  template_name: string;
  variables: string[];
  conditions?: Record<string, any>;
}

export class AutomationService {
  /**
   * Criar campanha de automação
   */
  static async createCampaign(data: {
    clinic_id: string;
    name: string;
    description?: string;
    type: string;
    trigger_event: string;
    sequence: CampaignSequence[];
    target_sources?: string[];
    target_services?: string[];
  }): Promise<any> {
    const { data: campaign, error } = await supabase
      .from('automation_campaigns')
      .insert({
        ...data,
        is_active: true,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar campanha: ${error.message}`);
    }

    return campaign;
  }

  /**
   * Processar gatilhos de campanhas
   * Esta função seria chamada por um cron job ou worker
   */
  static async processAutomationTriggers(clinicId: string): Promise<void> {
    try {
      // 1. Buscar campanhas ativas
      const { data: campaigns } = await supabase
        .from('automation_campaigns')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true);

      if (campaigns?.length === 0) {
        return;
      }

      // 2. Para cada campanha, verificar triggers
      for (const campaign of campaigns) {
        await this.processCampaignTrigger(campaign);
      }
    } catch (error) {
      console.error('Erro ao processar triggers:', error);
    }
  }

  /**
   * Processar trigger de uma campanha específica
   */
  private static async processCampaignTrigger(campaign: any): Promise<void> {
    try {
      const triggerEvent = campaign.trigger_event;

      // Diferentes tipos de triggers
      if (triggerEvent === 'no_response_24h') {
        await this.triggerNoResponse24h(campaign);
      } else if (triggerEvent === 'appointment_scheduled') {
        await this.triggerAppointmentScheduled(campaign);
      } else if (triggerEvent === 'appointment_completed') {
        await this.triggerAppointmentCompleted(campaign);
      } else if (triggerEvent === 'lead_created') {
        await this.triggerLeadCreated(campaign);
      }
    } catch (error) {
      console.error(`Erro ao processar trigger da campanha ${campaign.id}:`, error);
    }
  }

  /**
   * Trigger: Lead sem resposta há 24h
   */
  private static async triggerNoResponse24h(campaign: any): Promise<void> {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    // Buscar leads sem interação nas últimas 24h
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('clinic_id', campaign.clinic_id)
      .eq('status', 'novo')
      .lte('created_at', yesterday.toISOString())
      .is('last_contact_at', null);

    if (leads?.length === 0) return;

    // Adicionar leads à campanha
    for (const lead of leads) {
      await this.addLeadToCampaign(campaign.id, lead.id);
    }
  }

  /**
   * Trigger: Agendamento criado
   */
  private static async triggerAppointmentScheduled(campaign: any): Promise<void> {
    // Buscar agendamentos recentes (última hora)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { data: appointments } = await supabase
      .from('appointments')
      .select('patient_id')
      .eq('clinic_id', campaign.clinic_id)
      .gte('created_at', oneHourAgo.toISOString());

    if (appointments?.length === 0) return;

    // Adicionar à campanha
    for (const appointment of appointments) {
      // Encontrar lead correspondente
      const { data: lead } = await supabase
        .from('leads')
        .select('id')
        .eq('converted_to_patient_id', appointment.patient_id)
        .single();

      if (lead) {
        await this.addLeadToCampaign(campaign.id, lead.id);
      }
    }
  }

  /**
   * Trigger: Agendamento completado
   */
  private static async triggerAppointmentCompleted(campaign: any): Promise<void> {
    // Similar ao anterior, mas para status 'completed'
  }

  /**
   * Trigger: Lead criado
   */
  private static async triggerLeadCreated(campaign: any): Promise<void> {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { data: leads } = await supabase
      .from('leads')
      .select('id')
      .eq('clinic_id', campaign.clinic_id)
      .gte('created_at', oneHourAgo.toISOString());

    if (leads?.length === 0) return;

    for (const lead of leads) {
      await this.addLeadToCampaign(campaign.id, lead.id);
    }
  }

  /**
   * Adicionar lead a uma campanha
   */
  private static async addLeadToCampaign(
    campaignId: string,
    leadId: string
  ): Promise<void> {
    try {
      // Verificar se já está na campanha
      const { data: existing } = await supabase
        .from('campaign_leads')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('lead_id', leadId)
        .single();

      if (existing) {
        return; // Já está na campanha
      }

      // Adicionar
      await supabase.from('campaign_leads').insert({
        campaign_id: campaignId,
        lead_id: leadId,
        current_step: 0,
        status: 'active',
        next_action_at: new Date().toISOString(), // Imediatamente
      });

      
    } catch (error) {
      console.error('Erro ao adicionar lead à campanha:', error);
    }
  }

  /**
   * Processar ações pendentes de campanhas
   * Esta função seria executada a cada minuto por um cron job
   */
  static async processScheduledActions(): Promise<void> {
    try {
      // Buscar ações pendentes (next_action_at <= now)
      const { data: pendingActions } = await supabase
        .from('campaign_leads')
        .select(`
          *,
          campaigns:campaign_id(sequence, clinic_id),
          leads:lead_id(name, phone, email)
        `)
        .eq('status', 'active')
        .lte('next_action_at', new Date().toISOString())
        .limit(100);

      if (pendingActions?.length === 0) {
        return;
      }

      // Processar cada ação
      for (const action of pendingActions) {
        await this.executeNextStep(action);
      }
    } catch (error) {
      console.error('Erro ao processar ações agendadas:', error);
    }
  }

  /**
   * Executar próximo step de uma campanha
   */
  private static async executeNextStep(campaignLead: any): Promise<void> {
    try {
      const campaign = campaignLead.campaigns;
      const lead = campaignLead.leads;
      const currentStep = campaignLead.current_step;
      const sequence: CampaignSequence[] = campaign.sequence;

      // Buscar próximo step
      const nextStep = sequence.find((s) => s.step === currentStep + 1);

      if (!nextStep) {
        // Campanha concluída
        await supabase
          .from('campaign_leads')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', campaignLead.id);
        return;
      }

      // Enviar mensagem via WhatsApp
      const whatsapp = getWhatsAppService();
      
      if (whatsapp.isConfigured() && lead.phone) {
        await whatsapp.sendTemplateMessage(
          lead.phone,
          nextStep.template_name,
          nextStep.variables.map((v: string) => this.resolveVariable(v, lead)),
          campaign.clinic_id
        );

        // Atualizar status
        await supabase
          .from('campaign_leads')
          .update({
            current_step: currentStep + 1,
            next_action_at: this.calculateNextActionTime(nextStep.delay_minutes),
            messages_sent: campaignLead.messages_sent + 1,
          })
          .eq('id', campaignLead.id);
      }
    } catch (error) {
      console.error('Erro ao executar step:', error);

      // Marcar como failed
      await supabase
        .from('campaign_leads')
        .update({ status: 'failed' })
        .eq('id', campaignLead.id);
    }
  }

  /**
   * Resolver variável de template
   */
  private static resolveVariable(variable: string, lead: any): string {
    const mapping: Record<string, string> = {
      nome_lead: lead.name || 'Paciente',
      nome_paciente: lead.name || 'Paciente',
      telefone: lead.phone || '',
      email: lead.email || '',
    };

    return mapping[variable] || variable;
  }

  /**
   * Calcular próximo horário de ação
   */
  private static calculateNextActionTime(delayMinutes: number): string {
    const next = new Date();
    next.setMinutes(next.getMinutes() + delayMinutes);
    return next.toISOString();
  }

  /**
   * Criar campanhas pré-definidas
   */
  static async createDefaultCampaigns(clinicId: string): Promise<void> {
    // Campanha 1: Remarketing (leads sem resposta)
    await this.createCampaign({
      clinic_id: clinicId,
      name: 'Remarketing - Lead Inativo',
      description: 'Sequência de follow-up para leads sem resposta',
      type: 'remarketing',
      trigger_event: 'no_response_24h',
      sequence: [
        {
          step: 1,
          delay_minutes: 0,
          template_id: 'follow_up_24h',
          template_name: 'follow_up_24h',
          variables: ['nome_lead'],
        },
        {
          step: 2,
          delay_minutes: 4320, // 3 dias
          template_id: 'follow_up_3_dias',
          template_name: 'follow_up_3_dias',
          variables: ['nome_lead', 'servico_interesse'],
        },
        {
          step: 3,
          delay_minutes: 10080, // 7 dias
          template_id: 'follow_up_7_dias',
          template_name: 'follow_up_7_dias',
          variables: ['nome_lead'],
        },
      ],
    });

    // Campanha 2: Confirmação de agendamento
    await this.createCampaign({
      clinic_id: clinicId,
      name: 'Confirmação de Agendamento',
      description: 'Lembretes automáticos de consulta',
      type: 'confirmation',
      trigger_event: 'appointment_scheduled',
      sequence: [
        {
          step: 1,
          delay_minutes: 0,
          template_id: 'confirmacao_agendamento',
          template_name: 'confirmacao_agendamento',
          variables: ['data', 'horario', 'profissional'],
        },
        {
          step: 2,
          delay_minutes: -1440, // 1 dia antes (relativo ao agendamento)
          template_id: 'lembrete_1_dia',
          template_name: 'lembrete_1_dia',
          variables: ['nome_paciente', 'data', 'horario'],
        },
        {
          step: 3,
          delay_minutes: -120, // 2 horas antes
          template_id: 'lembrete_2_horas',
          template_name: 'lembrete_2_horas',
          variables: ['horario'],
        },
      ],
    });

    // Campanha 3: Pós-consulta
    await this.createCampaign({
      clinic_id: clinicId,
      name: 'Pós-Consulta',
      description: 'Follow-up após atendimento',
      type: 'follow_up',
      trigger_event: 'appointment_completed',
      sequence: [
        {
          step: 1,
          delay_minutes: 60, // 1 hora depois
          template_id: 'pos_consulta',
          template_name: 'pos_consulta',
          variables: ['link_orientacoes'],
        },
        {
          step: 2,
          delay_minutes: 10080, // 7 dias
          template_id: 'avaliacao_satisfacao',
          template_name: 'avaliacao_satisfacao',
          variables: ['nome_paciente'],
        },
      ],
    });

    
  }

  /**
   * Listar campanhas ativas
   */
  static async listCampaigns(clinicId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('automation_campaigns')
      .select('*')
      .eq('clinic_id', clinicId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao listar campanhas: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Pausar campanha
   */
  static async pauseCampaign(campaignId: string): Promise<void> {
    await supabase
      .from('automation_campaigns')
      .update({ is_active: false })
      .eq('id', campaignId);
  }

  /**
   * Reativar campanha
   */
  static async resumeCampaign(campaignId: string): Promise<void> {
    await supabase
      .from('automation_campaigns')
      .update({ is_active: true })
      .eq('id', campaignId);
  }

  /**
   * Obter métricas de uma campanha
   */
  static async getCampaignMetrics(campaignId: string): Promise<any> {
    const { data: campaign } = await supabase
      .from('automation_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    const { data: leads } = await supabase
      .from('campaign_leads')
      .select('*')
      .eq('campaign_id', campaignId);

    if (!campaign || !leads) {
      return null;
    }

    const metrics = {
      campaign_name: campaign.name,
      total_leads: leads.length,
      active: leads.filter((l) => l.status === 'active').length,
      completed: leads.filter((l) => l.status === 'completed').length,
      converted: leads.filter((l) => l.status === 'converted').length,
      opted_out: leads.filter((l) => l.status === 'opted_out').length,
      total_messages_sent: leads.reduce((sum, l) => sum + (l.messages_sent || 0), 0),
      conversion_rate:
        leads.length > 0
          ? (leads.filter((l) => l.status === 'converted').length / leads.length) * 100
          : 0,
    };

    return metrics;
  }
}

