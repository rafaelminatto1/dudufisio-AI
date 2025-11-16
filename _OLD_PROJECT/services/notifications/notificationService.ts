/**
 * Notification Service
 * MoocaFisio - Serviço central para gerenciar notificações
 *
 * Funcionalidades:
 * - Criar notificações
 * - Listar notificações (com paginação)
 * - Marcar como lida
 * - Deletar notificações
 * - Buscar estatísticas
 */

import { supabase } from '../../lib/supabaseClient';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type:
    | 'appointment_confirmation'
    | 'appointment_reminder_24h'
    | 'appointment_reminder_2h'
    | 'appointment_cancellation'
    | 'appointment_update'
    | 'payment_due'
    | 'payment_received'
    | 'evolution_added'
    | 'message_received'
    | 'system'
    | 'other';
  icon?: string;
  url?: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: Date;
  sentVia?: ('push' | 'email' | 'whatsapp')[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationStats {
  userId: string;
  totalNotifications: number;
  unreadCount: number;
  readCount: number;
  reminder24hCount: number;
  reminder2hCount: number;
  urgentCount: number;
  lastNotificationAt?: Date;
}

export interface NotificationListOptions {
  limit?: number;
  offset?: number;
  onlyUnread?: boolean;
  type?: Notification['type'];
  orderBy?: 'created_at' | 'priority';
  orderDirection?: 'asc' | 'desc';
}

export class NotificationService {
  /**
   * Criar nova notificação
   */
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: notification.userId,
          title: notification.title,
          body: notification.body,
          type: notification.type,
          icon: notification.icon || '/logo.png',
          url: notification.url,
          data: notification.data || {},
          read: notification.read,
          read_at: notification.readAt?.toISOString(),
          sent_via: notification.sentVia || ['push'],
          priority: notification.priority,
          expires_at: notification.expiresAt?.toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('[NotificationService] Error creating notification:', error);
        return null;
      }

      return this.mapDatabaseToNotification(data);
    } catch (error) {
      console.error('[NotificationService] Error in createNotification:', error);
      return null;
    }
  }

  /**
   * Listar notificações do usuário
   */
  async listNotifications(userId: string, options: NotificationListOptions = {}): Promise<{
    notifications: Notification[];
    total: number;
  }> {
    try {
      const {
        limit = 20,
        offset = 0,
        onlyUnread = false,
        type,
        orderBy = 'created_at',
        orderDirection = 'desc'
      } = options;

      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      if (onlyUnread) {
        query = query.eq('read', false);
      }

      if (type) {
        query = query.eq('type', type);
      }

      query = query
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('[NotificationService] Error listing notifications:', error);
        return { notifications: [], total: 0 };
      }

      const notifications = (data || []).map(this.mapDatabaseToNotification);
      return { notifications, total: count || 0 };
    } catch (error) {
      console.error('[NotificationService] Error in listNotifications:', error);
      return { notifications: [], total: 0 };
    }
  }

  /**
   * Buscar notificação por ID
   */
  async getNotification(id: string): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('[NotificationService] Error getting notification:', error);
        return null;
      }

      return this.mapDatabaseToNotification(data);
    } catch (error) {
      console.error('[NotificationService] Error in getNotification:', error);
      return null;
    }
  }

  /**
   * Marcar notificação como lida
   */
  async markAsRead(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('[NotificationService] Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[NotificationService] Error in markAsRead:', error);
      return false;
    }
  }

  /**
   * Marcar múltiplas notificações como lidas
   */
  async markMultipleAsRead(ids: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          read: true,
          read_at: new Date().toISOString()
        })
        .in('id', ids);

      if (error) {
        console.error('[NotificationService] Error marking multiple notifications as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[NotificationService] Error in markMultipleAsRead:', error);
      return false;
    }
  }

  /**
   * Marcar todas as notificações do usuário como lidas
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('[NotificationService] Error marking all notifications as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[NotificationService] Error in markAllAsRead:', error);
      return false;
    }
  }

  /**
   * Marcar notificação como não lida
   */
  async markAsUnread(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          read: false,
          read_at: null
        })
        .eq('id', id);

      if (error) {
        console.error('[NotificationService] Error marking notification as unread:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[NotificationService] Error in markAsUnread:', error);
      return false;
    }
  }

  /**
   * Deletar notificação
   */
  async deleteNotification(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[NotificationService] Error deleting notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[NotificationService] Error in deleteNotification:', error);
      return false;
    }
  }

  /**
   * Deletar múltiplas notificações
   */
  async deleteMultiple(ids: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', ids);

      if (error) {
        console.error('[NotificationService] Error deleting multiple notifications:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[NotificationService] Error in deleteMultiple:', error);
      return false;
    }
  }

  /**
   * Deletar todas as notificações lidas do usuário
   */
  async deleteAllRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .eq('read', true);

      if (error) {
        console.error('[NotificationService] Error deleting all read notifications:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[NotificationService] Error in deleteAllRead:', error);
      return false;
    }
  }

  /**
   * Buscar estatísticas de notificações do usuário
   */
  async getStats(userId: string): Promise<NotificationStats | null> {
    try {
      const { data, error } = await supabase
        .from('notification_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('[NotificationService] Error getting stats:', error);
        return null;
      }

      return {
        userId: data.user_id,
        totalNotifications: data.total_notifications,
        unreadCount: data.unread_count,
        readCount: data.read_count,
        reminder24hCount: data.reminder_24h_count,
        reminder2hCount: data.reminder_2h_count,
        urgentCount: data.urgent_count,
        lastNotificationAt: data.last_notification_at ? new Date(data.last_notification_at) : undefined
      };
    } catch (error) {
      console.error('[NotificationService] Error in getStats:', error);
      return null;
    }
  }

  /**
   * Buscar contagem de não lidas
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('[NotificationService] Error getting unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('[NotificationService] Error in getUnreadCount:', error);
      return 0;
    }
  }

  /**
   * Subscrever a mudanças em notificações em tempo real
   */
  subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ): () => void {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const notification = this.mapDatabaseToNotification(payload.new);
          callback(notification);
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  }

  // ========== MÉTODOS AUXILIARES ==========

  /**
   * Mapeia dados do banco para o tipo Notification
   */
  private mapDatabaseToNotification(data: any): Notification {
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      body: data.body,
      type: data.type,
      icon: data.icon,
      url: data.url,
      data: data.data,
      read: data.read,
      readAt: data.read_at ? new Date(data.read_at) : undefined,
      sentVia: data.sent_via,
      priority: data.priority,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
