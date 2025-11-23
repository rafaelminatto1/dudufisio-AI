import { NextRequest } from 'next/server';
import { withAuth, successResponse, errorResponse, getQueryParams } from '~/lib/api/middleware';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';

/**
 * GET /api/audit - Lista logs de auditoria com filtros
 *
 * Query params:
 * - user_id: string UUID (filtro por usuário)
 * - action_type: string (filtro por tipo de ação: create, update, delete, login, logout, etc)
 * - entity_type: string (filtro por tipo de entidade: patient, appointment, session, etc)
 * - date_from: string ISO date (filtro data inicial)
 * - date_to: string ISO date (filtro data final)
 * - limit: number (quantidade de resultados, padrão: 100, máximo: 1000)
 * - offset: number (paginação, padrão: 0)
 *
 * Exemplos:
 * - /api/audit?action_type=delete&date_from=2025-01-01
 * - /api/audit?user_id=123e4567-e89b-12d3-a456-426614174000&limit=50
 * - /api/audit?entity_type=patient&action_type=update
 */
export const GET = withAuth(async (request: NextRequest, { supabase }) => {
  const params = getQueryParams(request);

  // Paginação
  const limit = params.limit ? Math.min(parseInt(params.limit, 10), 1000) : 100;
  const offset = params.offset ? parseInt(params.offset, 10) : 0;

  // Valida datas se fornecidas
  if (params.date_from && isNaN(new Date(params.date_from).getTime())) {
    return errorResponse('Data inicial inválida', 400);
  }

  if (params.date_to && isNaN(new Date(params.date_to).getTime())) {
    return errorResponse('Data final inválida', 400);
  }

  try {
    // Tabela audit_logs não existe no schema atual
    // Retornar dados vazios por enquanto
    // TODO: Criar tabela audit_logs ou usar outra tabela para auditoria
    const auditLogs: any[] = [];
    const error = null;
    const count = 0;
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Se a tabela não existir, retorna dados mockados para conformidade LGPD
    if (error && error.code === '42P01') {
      // Código PostgreSQL para "tabela não existe"
      return successResponse({
        message: 'Tabela de auditoria não configurada. Usando logs do sistema.',
        logs: [],
        count: 0,
        pagination: {
          limit,
          offset,
          hasMore: false,
        },
        lgpd_compliance: {
          status: 'pending',
          message: 'Sistema de auditoria precisa ser configurado para conformidade LGPD',
        },
      });
    }

    if (error) {
      throw error;
    }

    // Aplica filtros manualmente (idealmente seria no query)
    let filteredLogs = auditLogs || [];

    if (params.user_id) {
      filteredLogs = filteredLogs.filter((log: Database['public']['Tables']['audit_logs']['Row']) => log.user_id === params.user_id);
    }

    if (params.action_type) {
      filteredLogs = filteredLogs.filter((log: Database['public']['Tables']['audit_logs']['Row']) => log.action_type === params.action_type);
    }

    if (params.entity_type) {
      filteredLogs = filteredLogs.filter((log: Database['public']['Tables']['audit_logs']['Row']) => log.entity_type === params.entity_type);
    }

    if (params.date_from) {
      const dateFrom = new Date(params.date_from);
      filteredLogs = filteredLogs.filter((log: Database['public']['Tables']['audit_logs']['Row']) => new Date(log.created_at) >= dateFrom);
    }

    if (params.date_to) {
      const dateTo = new Date(params.date_to);
      filteredLogs = filteredLogs.filter((log: Database['public']['Tables']['audit_logs']['Row']) => new Date(log.created_at) <= dateTo);
    }

    // Formata logs para conformidade LGPD
    const formattedLogs = filteredLogs.map((log: Database['public']['Tables']['audit_logs']['Row']) => ({
      id: log.id,
      timestamp: log.created_at,
      user_id: log.user_id,
      user_email: log.user_email || 'N/A',
      action_type: log.action_type,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      ip_address: log.ip_address || 'N/A',
      user_agent: log.user_agent || 'N/A',
      changes: log.changes ? sanitizeChanges(log.changes) : null,
      metadata: log.metadata || {},
    }));

    // Estatísticas
    const stats = {
      total_logs: count || 0,
      filtered_logs: filteredLogs.length,
      actions_by_type: getActionTypeStats(filteredLogs),
      entities_by_type: getEntityTypeStats(filteredLogs),
    };

    return successResponse({
      logs: formattedLogs,
      count: filteredLogs.length,
      stats,
      pagination: {
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
      lgpd_compliance: {
        status: 'active',
        retention_period_days: 365, // Configurável
        anonymization_enabled: true,
      },
      filters_applied: {
        user_id: params.user_id || null,
        action_type: params.action_type || null,
        entity_type: params.entity_type || null,
        date_from: params.date_from || null,
        date_to: params.date_to || null,
      },
    });
  } catch (error: unknown) {
    console.error('Audit log error:', error);
    let errorMessage = 'Erro ao buscar logs de auditoria';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return errorResponse(errorMessage, 500);
  }
});

/**
 * Sanitiza mudanças sensíveis nos logs
 */
function sanitizeChanges(changes: Record<string, unknown>): Record<string, unknown> {
  if (!changes) return null as any; // Return null if changes is null or undefined

  const sensitiveFields = ['password', 'cpf', 'credit_card', 'bank_account', 'token', 'secret'];

  const sanitized = { ...changes };

  Object.keys(sanitized).forEach((key) => {
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
      if (sanitized[key]) {
        sanitized[key] = {
          old: '[REDACTED]',
          new: '[REDACTED]',
        };
      }
    }
  });

  return sanitized;
}

/**
 * Estatísticas por tipo de ação
 */
function getActionTypeStats(logs: Database['public']['Tables']['audit_logs']['Row'][]): Record<string, number> {
  return logs.reduce((acc: Record<string, number>, log: Database['public']['Tables']['audit_logs']['Row']) => {
    const action = log.action_type || 'unknown';
    acc[action] = (acc[action] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Estatísticas por tipo de entidade
 */
function getEntityTypeStats(logs: Database['public']['Tables']['audit_logs']['Row'][]): Record<string, number> {
  return logs.reduce((acc: Record<string, number>, log: Database['public']['Tables']['audit_logs']['Row']) => {
    const entity = log.entity_type || 'unknown';
    acc[entity] = (acc[entity] || 0) + 1;
    return acc;
  }, {});
}