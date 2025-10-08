/**
 * Metrics Service - Serviço de métricas e KPIs do CRM
 * Activity Fisioterapia Integration - Fase 1
 */

import { supabase } from '@/lib/supabase';
import {
  DashboardMetrics,
  ConversionFunnel,
  SourcePerformance,
  LeadStatus,
  LeadSource,
} from '@/types/crm';

export class MetricsService {
  /**
   * Obter métricas do dashboard principal
   */
  static async getDashboardMetrics(clinicId: string): Promise<DashboardMetrics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Query principal para buscar leads
    const { data: allLeads, error } = await supabase
      .from('leads')
      .select('status, source, created_at, urgency_level, next_follow_up_at')
      .eq('clinic_id', clinicId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Erro ao buscar métricas: ${error.message}`);
    }

    // Processar métricas
    const metrics: DashboardMetrics = {
      total_leads: allLeads.length,
      new_leads_today: 0,
      new_leads_week: 0,
      new_leads_month: 0,
      leads_by_status: {
        novo: 0,
        contatado: 0,
        qualificado: 0,
        agendado: 0,
        convertido: 0,
        perdido: 0,
      },
      conversion_rate: 0,
      converted_this_month: 0,
      avg_response_time_minutes: 0,
      urgent_leads: 0,
      high_urgency_leads: 0,
      leads_needing_followup: 0,
      leads_by_source: {
        whatsapp: 0,
        instagram: 0,
        google: 0,
        facebook: 0,
        indicacao: 0,
        website: 0,
        outros: 0,
      },
    };

    const now = new Date();

    allLeads.forEach((lead) => {
      const createdAt = new Date(lead.created_at);

      // Contar novos leads
      if (createdAt >= today) {
        metrics.new_leads_today++;
      }
      if (createdAt >= weekAgo) {
        metrics.new_leads_week++;
      }
      if (createdAt >= monthAgo) {
        metrics.new_leads_month++;
      }

      // Por status
      metrics.leads_by_status[lead.status as LeadStatus]++;

      // Convertidos este mês
      if (lead.status === 'convertido' && createdAt >= monthAgo) {
        metrics.converted_this_month++;
      }

      // Por urgência
      if (lead.urgency_level === 'urgente') {
        metrics.urgent_leads++;
      }
      if (lead.urgency_level === 'alta') {
        metrics.high_urgency_leads++;
      }

      // Precisam follow-up
      if (
        lead.next_follow_up_at &&
        new Date(lead.next_follow_up_at) <= now &&
        !['convertido', 'perdido'].includes(lead.status)
      ) {
        metrics.leads_needing_followup++;
      }

      // Por fonte
      if (lead.source in metrics.leads_by_source) {
        metrics.leads_by_source[lead.source as LeadSource]++;
      }
    });

    // Taxa de conversão
    if (metrics.total_leads > 0) {
      metrics.conversion_rate =
        (metrics.leads_by_status.convertido / metrics.total_leads) * 100;
    }

    // Tempo médio de resposta (buscar do serviço de interações)
    try {
      const { InteractionService } = await import('./interactionService');
      metrics.avg_response_time_minutes = await InteractionService.calculateAverageResponseTime(
        clinicId,
        monthAgo.toISOString(),
        now.toISOString()
      );
    } catch (err) {
      console.error('Erro ao calcular tempo de resposta:', err);
    }

    return metrics;
  }

  /**
   * Obter funil de conversão
   */
  static async getConversionFunnel(clinicId: string, dateFrom?: string, dateTo?: string): Promise<ConversionFunnel> {
    let query = supabase
      .from('leads')
      .select('status')
      .eq('clinic_id', clinicId)
      .is('deleted_at', null);

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar funil de conversão: ${error.message}`);
    }

    const funnel: ConversionFunnel = {
      total: data.length,
      contacted: 0,
      qualified: 0,
      scheduled: 0,
      converted: 0,
      contact_rate: 0,
      qualification_rate: 0,
      schedule_rate: 0,
      conversion_rate: 0,
    };

    data.forEach((lead) => {
      if (['contatado', 'qualificado', 'agendado', 'convertido'].includes(lead.status)) {
        funnel.contacted++;
      }
      if (['qualificado', 'agendado', 'convertido'].includes(lead.status)) {
        funnel.qualified++;
      }
      if (['agendado', 'convertido'].includes(lead.status)) {
        funnel.scheduled++;
      }
      if (lead.status === 'convertido') {
        funnel.converted++;
      }
    });

    // Calcular taxas
    if (funnel.total > 0) {
      funnel.contact_rate = (funnel.contacted / funnel.total) * 100;
      funnel.qualification_rate = (funnel.qualified / funnel.total) * 100;
      funnel.schedule_rate = (funnel.scheduled / funnel.total) * 100;
      funnel.conversion_rate = (funnel.converted / funnel.total) * 100;
    }

    return funnel;
  }

  /**
   * Obter performance por fonte
   */
  static async getSourcePerformance(clinicId: string, dateFrom?: string, dateTo?: string): Promise<SourcePerformance[]> {
    let query = supabase
      .from('leads')
      .select('source, status, estimated_value')
      .eq('clinic_id', clinicId)
      .is('deleted_at', null);

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar performance por fonte: ${error.message}`);
    }

    // Agrupar por fonte
    const sourceMap = new Map<LeadSource, {
      total: number;
      converted: number;
      totalValue: number;
    }>();

    data.forEach((lead) => {
      const source = lead.source as LeadSource;
      if (!sourceMap.has(source)) {
        sourceMap.set(source, { total: 0, converted: 0, totalValue: 0 });
      }

      const stats = sourceMap.get(source)!;
      stats.total++;
      if (lead.status === 'convertido') {
        stats.converted++;
        stats.totalValue += lead.estimated_value || 0;
      }
    });

    // Converter para array
    const performance: SourcePerformance[] = [];
    sourceMap.forEach((stats, source) => {
      performance.push({
        source,
        total_leads: stats.total,
        converted_leads: stats.converted,
        conversion_rate: stats.total > 0 ? (stats.converted / stats.total) * 100 : 0,
        avg_value: stats.converted > 0 ? stats.totalValue / stats.converted : 0,
        total_value: stats.totalValue,
      });
    });

    // Ordenar por total de leads
    performance.sort((a, b) => b.total_leads - a.total_leads);

    return performance;
  }

  /**
   * Obter leads por dia (para gráficos)
   */
  static async getLeadsByDay(clinicId: string, days = 30): Promise<Array<{ date: string; count: number }>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('leads')
      .select('created_at')
      .eq('clinic_id', clinicId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Erro ao buscar leads por dia: ${error.message}`);
    }

    // Agrupar por dia
    const dayMap = new Map<string, number>();

    // Inicializar todos os dias com 0
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dayMap.set(dateStr, 0);
    }

    // Contar leads por dia
    data.forEach((lead) => {
      const dateStr = lead.created_at.split('T')[0];
      dayMap.set(dateStr, (dayMap.get(dateStr) || 0) + 1);
    });

    // Converter para array
    const result: Array<{ date: string; count: number }> = [];
    dayMap.forEach((count, date) => {
      result.push({ date, count });
    });

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Obter estatísticas de agente/usuário
   */
  static async getAgentStats(clinicId: string, dateFrom?: string, dateTo?: string) {
    let query = supabase
      .from('leads')
      .select('assigned_to, status')
      .eq('clinic_id', clinicId)
      .is('deleted_at', null)
      .not('assigned_to', 'is', null);

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar estatísticas de agente: ${error.message}`);
    }

    // Agrupar por agente
    const agentMap = new Map<string, {
      total: number;
      converted: number;
      by_status: Record<LeadStatus, number>;
    }>();

    data.forEach((lead) => {
      const agentId = lead.assigned_to!;
      if (!agentMap.has(agentId)) {
        agentMap.set(agentId, {
          total: 0,
          converted: 0,
          by_status: {
            novo: 0,
            contatado: 0,
            qualificado: 0,
            agendado: 0,
            convertido: 0,
            perdido: 0,
          },
        });
      }

      const stats = agentMap.get(agentId)!;
      stats.total++;
      stats.by_status[lead.status as LeadStatus]++;
      if (lead.status === 'convertido') {
        stats.converted++;
      }
    });

    // Converter para array
    const result: Array<{
      agent_id: string;
      total_leads: number;
      converted_leads: number;
      conversion_rate: number;
      by_status: Record<LeadStatus, number>;
    }> = [];

    agentMap.forEach((stats, agentId) => {
      result.push({
        agent_id: agentId,
        total_leads: stats.total,
        converted_leads: stats.converted,
        conversion_rate: stats.total > 0 ? (stats.converted / stats.total) * 100 : 0,
        by_status: stats.by_status,
      });
    });

    // Ordenar por conversão
    result.sort((a, b) => b.conversion_rate - a.conversion_rate);

    return result;
  }

  /**
   * Obter resumo de ROI/receita
   */
  static async getRevenueMetrics(clinicId: string, dateFrom?: string, dateTo?: string) {
    let query = supabase
      .from('leads')
      .select('estimated_value, status, source')
      .eq('clinic_id', clinicId)
      .is('deleted_at', null);

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar métricas de receita: ${error.message}`);
    }

    const metrics = {
      total_estimated_value: 0,
      converted_value: 0,
      pipeline_value: 0, // Valor em pipeline (qualificado + agendado)
      lost_value: 0,
      by_source: {} as Record<LeadSource, number>,
    };

    data.forEach((lead) => {
      const value = lead.estimated_value || 0;
      metrics.total_estimated_value += value;

      if (lead.status === 'convertido') {
        metrics.converted_value += value;
        metrics.by_source[lead.source as LeadSource] =
          (metrics.by_source[lead.source as LeadSource] || 0) + value;
      } else if (['qualificado', 'agendado'].includes(lead.status)) {
        metrics.pipeline_value += value;
      } else if (lead.status === 'perdido') {
        metrics.lost_value += value;
      }
    });

    return metrics;
  }
}

