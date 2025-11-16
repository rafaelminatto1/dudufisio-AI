/**
 * 🤖 Automation Service - Gerenciamento de Automações CRM
 * Regras automáticas, templates e follow-ups
 */

import { supabase } from '../../lib/supabaseClient';
import { whatsappCrmService } from './whatsappCrmService';

// =====================================================
// TYPES
// =====================================================

export interface MessageTemplate {
  id: string;
  name: string;
  category: 'follow_up' | 'welcome' | 'reminder' | 'closing';
  subject?: string;
  content: string;
  variables: string[];
  channel: 'whatsapp' | 'email' | 'sms';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_conditions: Record<string, any>;
  action_type: string;
  action_config: Record<string, any>;
  template_id?: string;
  delay_minutes: number;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
  last_executed_at?: string;
}

export interface AutomationExecution {
  id: string;
  rule_id: string;
  lead_id?: string;
  patient_id?: string;
  execution_status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  trigger_data: Record<string, any>;
  action_result: Record<string, any>;
  error_message?: string;
  executed_at: string;
  completed_at?: string;
}

export interface ScheduledFollowup {
  id: string;
  lead_id: string;
  rule_id?: string;
  scheduled_for: string;
  status: 'pending' | 'completed' | 'cancelled';
  message?: string;
  channel: string;
  created_at: string;
  completed_at?: string;
}

// =====================================================
// AUTOMATION SERVICE
// =====================================================

export const automationService = {
  // ===== TEMPLATES =====

  /**
   * Listar todos os templates
   */
  async listTemplates(category?: string): Promise<MessageTemplate[]> {
    let query = supabase
      .from('message_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Buscar template por ID
   */
  async getTemplateById(id: string): Promise<MessageTemplate | null> {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Criar template
   */
  async createTemplate(template: Partial<MessageTemplate>): Promise<MessageTemplate> {
    const { data, error } = await supabase
      .from('message_templates')
      .insert(template)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Atualizar template
   */
  async updateTemplate(id: string, updates: Partial<MessageTemplate>): Promise<MessageTemplate> {
    const { data, error } = await supabase
      .from('message_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Aplicar template com variáveis
   */
  async applyTemplate(
    template_id: string,
    variables: Record<string, string>
  ): Promise<string> {
    const { data, error } = await supabase.rpc('apply_message_template', {
      template_id_param: template_id,
      variables_param: variables
    });

    if (error) throw error;
    return data;
  },

  // ===== REGRAS DE AUTOMAÇÃO =====

  /**
   * Listar regras de automação
   */
  async listRules(active_only = false): Promise<AutomationRule[]> {
    let query = supabase
      .from('automation_rules')
      .select('*')
      .order('priority', { ascending: false });

    if (active_only) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Buscar regra por ID
   */
  async getRuleById(id: string): Promise<AutomationRule | null> {
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Criar regra de automação
   */
  async createRule(rule: Partial<AutomationRule>): Promise<AutomationRule> {
    const { data, error } = await supabase
      .from('automation_rules')
      .insert(rule)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Atualizar regra
   */
  async updateRule(id: string, updates: Partial<AutomationRule>): Promise<AutomationRule> {
    const { data, error } = await supabase
      .from('automation_rules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Ativar/Desativar regra
   */
  async toggleRule(id: string, is_active: boolean): Promise<AutomationRule> {
    return this.updateRule(id, { is_active });
  },

  /**
   * Deletar regra
   */
  async deleteRule(id: string): Promise<void> {
    const { error } = await supabase
      .from('automation_rules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ===== EXECUÇÕES =====

  /**
   * Processar todas as regras ativas
   */
  async processAutomationRules(): Promise<{
    processed_rules: number;
    total_executions: number;
  }> {
    const { data, error } = await supabase.rpc('process_automation_rules');

    if (error) throw error;

    const processed_rules = data?.length || 0;
    const total_executions = data?.reduce((sum: number, rule: any) =>
      sum + (rule.executions_created || 0), 0
    ) || 0;

    return { processed_rules, total_executions };
  },

  /**
   * Listar execuções
   */
  async listExecutions(
    filters?: {
      rule_id?: string;
      lead_id?: string;
      status?: string;
      limit?: number;
    }
  ): Promise<AutomationExecution[]> {
    let query = supabase
      .from('automation_executions')
      .select('*')
      .order('executed_at', { ascending: false });

    if (filters?.rule_id) {
      query = query.eq('rule_id', filters.rule_id);
    }
    if (filters?.lead_id) {
      query = query.eq('lead_id', filters.lead_id);
    }
    if (filters?.status) {
      query = query.eq('execution_status', filters.status);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Executar uma regra específica manualmente
   */
  async executeRule(rule_id: string, lead_id: string): Promise<AutomationExecution> {
    // Buscar regra
    const rule = await this.getRuleById(rule_id);
    if (!rule) throw new Error('Rule not found');

    // Criar execução
    const { data: execution, error: execError } = await supabase
      .from('automation_executions')
      .insert({
        rule_id,
        lead_id,
        execution_status: 'pending',
        trigger_data: { manual: true }
      })
      .select()
      .single();

    if (execError) throw execError;

    // Processar ação
    try {
      await this.executeAction(execution.id, rule, lead_id);
      return execution;
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      throw error;
    }
  },

  /**
   * Executar ação de uma automação
   */
  async executeAction(
    execution_id: string,
    rule: AutomationRule,
    lead_id: string
  ): Promise<void> {
    try {
      // Atualizar status para running
      await supabase
        .from('automation_executions')
        .update({ execution_status: 'running' })
        .eq('id', execution_id);

      let result: any = {};

      // Executar ação baseada no tipo
      switch (rule.action_type) {
        case 'send_message':
          result = await this.executeSendMessage(rule, lead_id);
          break;

        case 'update_status':
          result = await this.executeUpdateStatus(rule, lead_id);
          break;

        case 'schedule_followup':
          result = await this.executeScheduleFollowup(rule, lead_id);
          break;

        default:
          throw new Error(`Unknown action type: ${rule.action_type}`);
      }

      // Atualizar execução como sucesso
      await supabase
        .from('automation_executions')
        .update({
          execution_status: 'success',
          action_result: result,
          completed_at: new Date().toISOString()
        })
        .eq('id', execution_id);

    } catch (error: any) {
      // Atualizar execução como falha
      await supabase
        .from('automation_executions')
        .update({
          execution_status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString()
        })
        .eq('id', execution_id);

      throw error;
    }
  },

  /**
   * Ação: Enviar mensagem
   */
  async executeSendMessage(rule: AutomationRule, lead_id: string): Promise<any> {
    // Buscar lead
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single();

    if (!lead) throw new Error('Lead not found');

    // Se tem template, aplicar
    let message = '';
    if (rule.template_id) {
      message = await this.applyTemplate(rule.template_id, {
        name: lead.name,
        phone: lead.phone,
        service: lead.interested_in || 'fisioterapia'
      });
    } else if (rule.action_config.message) {
      message = rule.action_config.message;
    } else {
      throw new Error('No message or template configured');
    }

    // Enviar via canal configurado
    const channel = rule.action_config.channel || 'whatsapp';
    if (channel === 'whatsapp') {
      await whatsappCrmService.sendMessage({
        to: lead.phone,
        message,
        lead_id
      });
    }

    // Atualizar status do lead se configurado
    if (rule.action_config.mark_as_contacted) {
      await supabase
        .from('leads')
        .update({ status: 'contacted' })
        .eq('id', lead_id);
    }

    return { sent: true, channel, message_length: message.length };
  },

  /**
   * Ação: Atualizar status
   */
  async executeUpdateStatus(rule: AutomationRule, lead_id: string): Promise<any> {
    const new_status = rule.action_config.new_status;
    if (!new_status) throw new Error('No status configured');

    await supabase
      .from('leads')
      .update({ status: new_status })
      .eq('id', lead_id);

    return { updated_status: new_status };
  },

  /**
   * Ação: Agendar follow-up
   */
  async executeScheduleFollowup(rule: AutomationRule, lead_id: string): Promise<any> {
    const hours = rule.action_config.followup_hours || 24;
    const message = rule.action_config.message || null;
    const channel = rule.action_config.channel || 'whatsapp';

    const { data, error } = await supabase.rpc('schedule_followup', {
      lead_id_param: lead_id,
      hours_delay: hours,
      message_param: message,
      channel_param: channel
    });

    if (error) throw error;

    return { followup_id: data, scheduled_hours: hours };
  },

  // ===== FOLLOW-UPS AGENDADOS =====

  /**
   * Buscar follow-ups pendentes
   */
  async getPendingFollowups(): Promise<any[]> {
    const { data, error } = await supabase.rpc('get_pending_followups');

    if (error) throw error;
    return data || [];
  },

  /**
   * Agendar follow-up manual
   */
  async scheduleFollowup(
    lead_id: string,
    hours_delay: number,
    message?: string,
    channel = 'whatsapp'
  ): Promise<string> {
    const { data, error } = await supabase.rpc('schedule_followup', {
      lead_id_param: lead_id,
      hours_delay,
      message_param: message || null,
      channel_param: channel
    });

    if (error) throw error;
    return data;
  },

  /**
   * Marcar follow-up como completado
   */
  async completeFollowup(followup_id: string): Promise<void> {
    const { error } = await supabase
      .from('scheduled_followups')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', followup_id);

    if (error) throw error;
  },

  /**
   * Cancelar follow-up
   */
  async cancelFollowup(followup_id: string): Promise<void> {
    const { error } = await supabase
      .from('scheduled_followups')
      .update({ status: 'cancelled' })
      .eq('id', followup_id);

    if (error) throw error;
  },

  // ===== ESTATÍSTICAS =====

  /**
   * Buscar estatísticas de automações
   */
  async getAutomationStatistics(): Promise<any[]> {
    const { data, error } = await supabase
      .from('automation_statistics')
      .select('*');

    if (error) throw error;
    return data || [];
  }
};

export default automationService;
