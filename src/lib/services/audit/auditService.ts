// import { createServerComponentClient } from '~/lib/supabase/server';
// Tabela audit_logs não existe no schema, então não precisamos do Supabase por enquanto

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'export'
  | 'login'
  | 'logout'
  | 'permission_change'
  | 'data_access'
  | 'other';

export interface AuditLog {
  id: string;
  user_id: string;
  action: AuditAction;
  entity_type: string;
  entity_id?: string;
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AuditFilters {
  userId?: string;
  action?: AuditAction;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * Service para gerenciar auditoria e logs de ações
 * Adaptado para Next.js App Router
 */
export class AuditService {
  /**
   * Registra uma ação de auditoria
   */
  static async logAction(params: {
    userId: string;
    action: AuditAction;
    entityType: string;
    entityId?: string;
    description: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    // Tabela audit_logs não existe no schema atual
    // Apenas logar no console por enquanto
    // TODO: Criar tabela audit_logs ou usar outra tabela para auditoria
    try {
      console.log('[AUDIT]', {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        description: params.description,
        metadata: params.metadata,
        timestamp: new Date().toISOString(),
      });
      return { data: { id: 'console-log', ...params }, error: null };
    } catch (error) {
      console.error('Error logging audit action:', error);
      return { data: null, error };
    }
  }

  /**
   * Busca logs de auditoria com filtros
   */
  static async getAuditLogs(filters?: AuditFilters) {
    // Tabela audit_logs não existe no schema atual
    // Retornar vazio por enquanto
    // TODO: Criar tabela audit_logs ou usar outra tabela para auditoria
    try {
      return {
        data: {
          logs: [],
          total: 0,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return { data: null, error };
    }
  }

  /**
   * Busca logs de um usuário específico
   */
  static async getUserAuditLogs(userId: string, limit: number = 50) {
    try {
      return await this.getAuditLogs({ userId, limit });
    } catch (error) {
      console.error('Error fetching user audit logs:', error);
      return { data: null, error };
    }
  }

  /**
   * Busca logs de uma entidade específica
   */
  static async getEntityAuditLogs(entityType: string, entityId: string) {
    // Tabela audit_logs não existe no schema atual
    // Retornar vazio por enquanto
    // TODO: Criar tabela audit_logs ou usar outra tabela para auditoria
    try {
      return { data: [], error: null };
    } catch (error) {
      console.error('Error fetching entity audit logs:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtém estatísticas de auditoria
   */
  static async getAuditStats(params?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
  }) {
    // Tabela audit_logs não existe no schema atual
    // Retornar stats vazios por enquanto
    // TODO: Criar tabela audit_logs ou usar outra tabela para auditoria
    try {
      const stats = {
        totalActions: 0,
        byAction: {} as Record<AuditAction, number>,
        byEntityType: {} as Record<string, number>,
        uniqueUsers: 0,
      };
      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching audit stats:', error);
      return { data: null, error };
    }
  }
}

