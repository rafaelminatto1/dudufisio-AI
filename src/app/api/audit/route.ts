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
    const count = 0;

    // Retorna dados mockados para conformidade LGPD
    return successResponse({
      message: 'Tabela de auditoria não configurada. Usando logs do sistema.',
      logs: [],
      count: 0,
      stats: {
        total_logs: 0,
        filtered_logs: 0,
        actions_by_type: {},
        entities_by_type: {},
      },
      pagination: {
        limit,
        offset,
        hasMore: false,
      },
      lgpd_compliance: {
        status: 'pending',
        message: 'Sistema de auditoria precisa ser configurado para conformidade LGPD',
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
function getActionTypeStats(logs: any[]): Record<string, number> {
  return logs.reduce((acc: Record<string, number>, log: any) => {
    const action = log.action_type || 'unknown';
    acc[action] = (acc[action] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Estatísticas por tipo de entidade
 */
function getEntityTypeStats(logs: any[]): Record<string, number> {
  return logs.reduce((acc: Record<string, number>, log: any) => {
    const entity = log.entity_type || 'unknown';
    acc[entity] = (acc[entity] || 0) + 1;
    return acc;
  }, {});
}