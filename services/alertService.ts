// services/alertService.ts
import { supabase } from '../lib/supabase';
import { 
  SupplyAlert, 
  AlertType, 
  AlertSeverity,
  Supply
} from '../types';

// ============================================================================
// TIPOS PARA SISTEMA DE ALERTAS AVANÇADO
// ============================================================================

export interface AutoAlertRule {
  id: string;
  ruleName: string;
  ruleType: string;
  conditions: Record<string, any>;
  severity: AlertSeverity;
  isActive: boolean;
  notificationChannels: string[];
  escalationRules?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'alert' | 'reminder' | 'system' | 'task' | 'supply' | 'order';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: 'in_app' | 'email' | 'sms' | 'push' | 'slack';
  isRead: boolean;
  isSent: boolean;
  sentAt?: string;
  readAt?: string;
  expiresAt?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface UserNotificationSettings {
  id: string;
  userId: string;
  notificationType: string;
  channel: string;
  isEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  createdAt: string;
  updatedAt: string;
}

export interface AlertHistory {
  id: string;
  alertId: string;
  action: 'created' | 'read' | 'resolved' | 'escalated' | 'dismissed' | 'reopened';
  performedBy?: string;
  performedAt: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface ScheduledAlert {
  id: string;
  ruleId: string;
  supplyId?: string;
  scheduledFor: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface AlertCheckResult {
  checkType: string;
  alertsCreated: number;
  executionTime: string;
}

// ============================================================================
// SERVIÇO DE ALERTAS AUTOMÁTICOS
// ============================================================================

export const getAutoAlertRules = async (): Promise<AutoAlertRule[]> => {
  try {
    const { data, error } = await supabase
      .from('auto_alert_rules')
      .select('*')
      .eq('is_active', true)
      .order('severity', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar regras de alerta:', error);
    throw error;
  }
};

export const createAutoAlertRule = async (ruleData: Omit<AutoAlertRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AutoAlertRule> => {
  try {
    const { data, error } = await supabase
      .from('auto_alert_rules')
      .insert([{
        ...ruleData,
        created_by: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar regra de alerta:', error);
    throw error;
  }
};

export const updateAutoAlertRule = async (id: string, ruleData: Partial<AutoAlertRule>): Promise<AutoAlertRule> => {
  try {
    const { data, error } = await supabase
      .from('auto_alert_rules')
      .update({
        ...ruleData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar regra de alerta:', error);
    throw error;
  }
};

// ============================================================================
// SERVIÇO DE VERIFICAÇÕES AUTOMÁTICAS
// ============================================================================

export const runAlertChecks = async (): Promise<AlertCheckResult[]> => {
  try {
    const { data, error } = await supabase.rpc('run_alert_checks');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao executar verificações de alertas:', error);
    throw error;
  }
};

export const checkLowStock = async (): Promise<SupplyAlert[]> => {
  try {
    const { data, error } = await supabase.rpc('check_low_stock_alerts');
    
    if (error) throw error;
    
    // Buscar alertas criados
    const { data: alerts, error: alertsError } = await supabase
      .from('supply_alerts')
      .select(`
        *,
        supply:supplies(*)
      `)
      .eq('alert_type', 'low_stock')
      .eq('is_resolved', false)
      .order('created_at', { ascending: false });

    if (alertsError) throw alertsError;
    return alerts || [];
  } catch (error) {
    console.error('Erro ao verificar estoque baixo:', error);
    throw error;
  }
};

export const checkExpiringItems = async (): Promise<SupplyAlert[]> => {
  try {
    const { data, error } = await supabase.rpc('check_expiration_alerts');
    
    if (error) throw error;
    
    // Buscar alertas criados
    const { data: alerts, error: alertsError } = await supabase
      .from('supply_alerts')
      .select(`
        *,
        supply:supplies(*)
      `)
      .in('alert_type', ['expiring', 'expired'])
      .eq('is_resolved', false)
      .order('created_at', { ascending: false });

    if (alertsError) throw alertsError;
    return alerts || [];
  } catch (error) {
    console.error('Erro ao verificar vencimentos:', error);
    throw error;
  }
};

export const checkOverdueOrders = async (): Promise<SupplyAlert[]> => {
  try {
    const { data, error } = await supabase.rpc('check_overdue_orders');
    
    if (error) throw error;
    
    // Buscar alertas criados
    const { data: alerts, error: alertsError } = await supabase
      .from('supply_alerts')
      .select(`
        *,
        supply:supplies(*)
      `)
      .eq('alert_type', 'overdue_order')
      .eq('is_resolved', false)
      .order('created_at', { ascending: false });

    if (alertsError) throw alertsError;
    return alerts || [];
  } catch (error) {
    console.error('Erro ao verificar pedidos em atraso:', error);
    throw error;
  }
};

// ============================================================================
// SERVIÇO DE NOTIFICAÇÕES
// ============================================================================

export const getNotifications = async (userId?: string, unreadOnly: boolean = false): Promise<Notification[]> => {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    throw error;
  }
};

export const createNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao excluir notificação:', error);
    throw error;
  }
};

// ============================================================================
// SERVIÇO DE CONFIGURAÇÕES DE NOTIFICAÇÃO
// ============================================================================

export const getUserNotificationSettings = async (userId: string): Promise<UserNotificationSettings[]> => {
  try {
    const { data, error } = await supabase
      .from('user_notification_settings')
      .select('*')
      .eq('user_id', userId)
      .order('notification_type');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar configurações de notificação:', error);
    throw error;
  }
};

export const updateUserNotificationSettings = async (
  userId: string, 
  settings: Partial<UserNotificationSettings>[]
): Promise<UserNotificationSettings[]> => {
  try {
    const results: UserNotificationSettings[] = [];
    
    for (const setting of settings) {
      if (setting.id) {
        // Atualizar configuração existente
        const { data, error } = await supabase
          .from('user_notification_settings')
          .update({
            ...setting,
            updated_at: new Date().toISOString()
          })
          .eq('id', setting.id)
          .select()
          .single();

        if (error) throw error;
        results.push(data);
      } else {
        // Criar nova configuração
        const { data, error } = await supabase
          .from('user_notification_settings')
          .insert([{
            ...setting,
            user_id: userId
          }])
          .select()
          .single();

        if (error) throw error;
        results.push(data);
      }
    }

    return results;
  } catch (error) {
    console.error('Erro ao atualizar configurações de notificação:', error);
    throw error;
  }
};

// ============================================================================
// SERVIÇO DE HISTÓRICO DE ALERTAS
// ============================================================================

export const getAlertHistory = async (alertId: string): Promise<AlertHistory[]> => {
  try {
    const { data, error } = await supabase
      .from('alert_history')
      .select('*')
      .eq('alert_id', alertId)
      .order('performed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar histórico do alerta:', error);
    throw error;
  }
};

export const addAlertHistory = async (historyData: Omit<AlertHistory, 'id' | 'performedAt'>): Promise<AlertHistory> => {
  try {
    const { data, error } = await supabase
      .from('alert_history')
      .insert([{
        ...historyData,
        performed_by: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao adicionar histórico do alerta:', error);
    throw error;
  }
};

// ============================================================================
// SERVIÇO DE ALERTAS AGENDADOS
// ============================================================================

export const getScheduledAlerts = async (status?: string): Promise<ScheduledAlert[]> => {
  try {
    let query = supabase
      .from('scheduled_alerts')
      .select('*')
      .order('scheduled_for');

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar alertas agendados:', error);
    throw error;
  }
};

export const createScheduledAlert = async (alertData: Omit<ScheduledAlert, 'id' | 'createdAt'>): Promise<ScheduledAlert> => {
  try {
    const { data, error } = await supabase
      .from('scheduled_alerts')
      .insert([alertData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar alerta agendado:', error);
    throw error;
  }
};

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Erro ao contar notificações não lidas:', error);
    return 0;
  }
};

export const getAlertSummary = async (): Promise<{
  total: number;
  bySeverity: Record<AlertSeverity, number>;
  byType: Record<AlertType, number>;
  unread: number;
}> => {
  try {
    // Buscar todos os alertas não resolvidos
    const { data: alerts, error: alertsError } = await supabase
      .from('supply_alerts')
      .select('alert_type, severity, is_read')
      .eq('is_resolved', false);

    if (alertsError) throw alertsError;

    const summary = {
      total: alerts?.length || 0,
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      } as Record<AlertSeverity, number>,
      byType: {
        low_stock: 0,
        critical_stock: 0,
        expiring: 0,
        expired: 0,
        overdue_order: 0
      } as Record<AlertType, number>,
      unread: 0
    };

    alerts?.forEach(alert => {
      summary.bySeverity[alert.severity as AlertSeverity]++;
      summary.byType[alert.alert_type as AlertType]++;
      if (!alert.is_read) {
        summary.unread++;
      }
    });

    return summary;
  } catch (error) {
    console.error('Erro ao gerar resumo de alertas:', error);
    return {
      total: 0,
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      byType: { low_stock: 0, critical_stock: 0, expiring: 0, expired: 0, overdue_order: 0 },
      unread: 0
    };
  }
};

// ============================================================================
// SERVIÇO DE ESCALAÇÃO DE ALERTAS
// ============================================================================

export const escalateAlert = async (alertId: string, reason: string): Promise<void> => {
  try {
    // Marcar alerta como escalado
    const { error: alertError } = await supabase
      .from('supply_alerts')
      .update({ 
        severity: 'critical',
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (alertError) throw alertError;

    // Adicionar histórico
    await addAlertHistory({
      alertId,
      action: 'escalated',
      notes: reason
    });

    // Criar notificação de escalação
    const { data: alert } = await supabase
      .from('supply_alerts')
      .select('*')
      .eq('id', alertId)
      .single();

    if (alert) {
      await createNotification({
        userId: (await supabase.auth.getUser()).data.user?.id || '',
        title: 'Alerta Escalado',
        message: `Alerta escalado: ${alert.message}`,
        type: 'alert',
        priority: 'critical',
        channel: 'in_app',
        isRead: false,
        isSent: false,
        relatedEntityType: 'alert',
        relatedEntityId: alertId,
        metadata: { reason, escalated_at: new Date().toISOString() }
      });
    }
  } catch (error) {
    console.error('Erro ao escalar alerta:', error);
    throw error;
  }
};
