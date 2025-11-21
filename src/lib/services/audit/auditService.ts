import { createServerComponentClient } from '~/lib/supabase/server';

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
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await ((supabase as any)
        .from('audit_logs')
        .insert({
          user_id: params.userId,
          action: params.action,
          entity_type: params.entityType,
          entity_id: params.entityId,
          description: params.description,
          metadata: params.metadata,
          ip_address: params.ipAddress,
          user_agent: params.userAgent,
        } as any)
        .select()
        .single() as any);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error logging audit action:', error);
      return { data: null, error };
    }
  }

  /**
   * Busca logs de auditoria com filtros
   */
  static async getAuditLogs(filters?: AuditFilters) {
    try {
      const supabase = await createServerComponentClient();
      const {
        userId,
        action,
        entityType,
        startDate,
        endDate,
        limit = 100,
        offset = 0,
      } = filters || {};

      let query = (supabase as any)
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1) as any;

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (action) {
        query = query.eq('action', action);
      }

      if (entityType) {
        query = query.eq('entity_type', entityType);
      }

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        data: {
          logs: data || [],
          total: count || 0,
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
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await (supabase as any)
        .from('audit_logs')
        .select('*, user:users(*)')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
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
    try {
      const supabase = await createServerComponentClient();
      let query = (supabase as any).from('audit_logs').select('action, created_at');

      if (params?.userId) {
        query = query.eq('user_id', params.userId);
      }

      if (params?.startDate) {
        query = query.gte('created_at', params.startDate);
      }

      if (params?.endDate) {
        query = query.lte('created_at', params.endDate);
      }

      const { data: logs } = await query;

      const uniqueUsersSet = new Set<string>();
      (logs || []).forEach((log: any) => {
        if (log.user_id) {
          uniqueUsersSet.add(log.user_id);
        }
      });

      const stats = {
        totalActions: logs?.length || 0,
        byAction: {} as Record<AuditAction, number>,
        byEntityType: {} as Record<string, number>,
        uniqueUsers: uniqueUsersSet.size,
      };

      (logs || []).forEach((log: any) => {
        // Contar por ação
        const action = log.action as AuditAction;
        if (action) {
          stats.byAction[action] = (stats.byAction[action] || 0) + 1;
        }

        // Contar por tipo de entidade
        const entityType = log.entity_type as string;
        if (entityType) {
          stats.byEntityType[entityType] =
            (stats.byEntityType[entityType] || 0) + 1;
        }
      });

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching audit stats:', error);
      return { data: null, error };
    }
  }
}

