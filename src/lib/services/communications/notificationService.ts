import { createServerComponentClient } from '~/lib/supabase/server';

export type NotificationType =
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

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationCreateParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  icon?: string;
  url?: string;
  data?: Record<string, any>;
  priority?: NotificationPriority;
  expiresAt?: string;
}

export interface NotificationListOptions {
  limit?: number;
  offset?: number;
  onlyUnread?: boolean;
  type?: NotificationType;
  orderBy?: 'created_at' | 'priority';
  orderDirection?: 'asc' | 'desc';
}

/**
 * Service avançado para gerenciar notificações
 * Adaptado para Next.js App Router
 */
export class NotificationService {
  /**
   * Cria uma nova notificação
   */
  static async create(params: NotificationCreateParams) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: params.userId,
          title: params.title,
          message: params.message,
          type: params.type || 'other',
          icon: params.icon,
          url: params.url,
          data: params.data,
          priority: params.priority || 'normal',
          expires_at: params.expiresAt,
          read: false,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { data: null, error };
    }
  }

  /**
   * Lista notificações do usuário com opções avançadas
   */
  static async getUserNotifications(userId: string, options: NotificationListOptions = {}) {
    try {
      const supabase = await createServerComponentClient();
      const {
        limit = 50,
        offset = 0,
        onlyUnread = false,
        type,
        orderBy = 'created_at',
        orderDirection = 'desc',
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
      if (error) throw error;

      return {
        data: {
          notifications: data || [],
          total: count || 0,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { data: null, error };
    }
  }

  /**
   * Busca uma notificação por ID
   */
  static async getNotification(notificationId: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching notification:', error);
      return { data: null, error };
    }
  }

  /**
   * Marca notificação como lida
   */
  static async markAsRead(notificationId: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { data: null, error };
    }
  }

  /**
   * Marca múltiplas notificações como lidas
   */
  static async markAllAsRead(userId: string) {
    try {
      const supabase = await createServerComponentClient();
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { data: null, error };
    }
  }

  /**
   * Deleta uma notificação
   */
  static async deleteNotification(notificationId: string) {
    try {
      const supabase = await createServerComponentClient();
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtém estatísticas de notificações do usuário
   */
  static async getNotificationStats(userId: string) {
    try {
      const supabase = await createServerComponentClient();
      
      const { data: allNotifications } = await supabase
        .from('notifications')
        .select('read, type, priority')
        .eq('user_id', userId);

      const total = allNotifications?.length || 0;
      const unread = (allNotifications || []).filter(n => !n.read).length;
      const urgent = (allNotifications || []).filter(n => n.priority === 'urgent' && !n.read).length;

      return {
        data: {
          totalNotifications: total,
          unreadCount: unread,
          readCount: total - unread,
          urgentCount: urgent,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      return { data: null, error };
    }
  }

  /**
   * Envia notificação por email (integração futura)
   */
  static async sendEmailNotification(params: {
    userId: string;
    email: string;
    subject: string;
    body: string;
    htmlBody?: string;
  }) {
    try {
      // Criar notificação no banco
      const notification = await this.create({
        userId: params.userId,
        title: params.subject,
        message: params.body,
        type: 'system',
        priority: 'normal',
      });

      // Aqui integraria com serviço de email (Resend, SendGrid, etc.)
      // Por enquanto, apenas log
      console.log('Email notification queued:', {
        to: params.email,
        subject: params.subject,
        notificationId: notification.data?.id,
      });

      return { data: { notificationId: notification.data?.id, sent: true }, error: null };
    } catch (error) {
      console.error('Error sending email notification:', error);
      return { data: null, error };
    }
  }

  /**
   * Envia notificação por SMS (integração futura)
   */
  static async sendSMSNotification(params: {
    userId: string;
    phone: string;
    message: string;
  }) {
    try {
      // Criar notificação no banco
      const notification = await this.create({
        userId: params.userId,
        title: 'SMS',
        message: params.message,
        type: 'system',
        priority: 'high',
      });

      // Aqui integraria com serviço de SMS (Twilio, etc.)
      // Por enquanto, apenas log
      console.log('SMS notification queued:', {
        to: params.phone,
        message: params.message,
        notificationId: notification.data?.id,
      });

      return { data: { notificationId: notification.data?.id, sent: true }, error: null };
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      return { data: null, error };
    }
  }

  /**
   * Envia notificação push (integração futura)
   */
  static async sendPushNotification(params: {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, any>;
  }) {
    try {
      // Criar notificação no banco
      const notification = await this.create({
        userId: params.userId,
        title: params.title,
        message: params.body,
        type: 'system',
        priority: 'normal',
        data: params.data,
      });

      // Aqui integraria com serviço de push (Firebase Cloud Messaging, etc.)
      // Por enquanto, apenas log
      console.log('Push notification queued:', {
        userId: params.userId,
        title: params.title,
        notificationId: notification.data?.id,
      });

      return { data: { notificationId: notification.data?.id, sent: true }, error: null };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return { data: null, error };
    }
  }

  /**
   * Cria notificação de lembrete de agendamento
   */
  static async createAppointmentReminder(params: {
    userId: string;
    appointmentId: string;
    appointmentDate: string;
    hoursBefore: number;
  }) {
    try {
      const reminderTime = new Date(params.appointmentDate);
      reminderTime.setHours(reminderTime.getHours() - params.hoursBefore);

      const notification = await this.create({
        userId: params.userId,
        title: `Lembrete: Consulta em ${params.hoursBefore}h`,
        message: `Você tem uma consulta agendada para ${new Date(params.appointmentDate).toLocaleString('pt-BR')}`,
        type: params.hoursBefore === 24 ? 'appointment_reminder_24h' : 'appointment_reminder_2h',
        priority: params.hoursBefore === 2 ? 'high' : 'normal',
        url: `/appointments/${params.appointmentId}`,
        data: { appointmentId: params.appointmentId },
        expiresAt: params.appointmentDate,
      });

      return { data: notification.data, error: null };
    } catch (error) {
      console.error('Error creating appointment reminder:', error);
      return { data: null, error };
    }
  }

  /**
   * Cria notificação de confirmação de pagamento
   */
  static async createPaymentNotification(params: {
    userId: string;
    transactionId: string;
    amount: number;
    status: 'received' | 'due' | 'overdue';
  }) {
    try {
      const titles = {
        received: 'Pagamento Recebido',
        due: 'Pagamento Pendente',
        overdue: 'Pagamento Atrasado',
      };

      const messages = {
        received: `Pagamento de R$ ${params.amount.toFixed(2)} foi confirmado`,
        due: `Você tem um pagamento de R$ ${params.amount.toFixed(2)} pendente`,
        overdue: `ATENÇÃO: Pagamento de R$ ${params.amount.toFixed(2)} está atrasado`,
      };

      const notification = await this.create({
        userId: params.userId,
        title: titles[params.status],
        message: messages[params.status],
        type: params.status === 'received' ? 'payment_received' : 'payment_due',
        priority: params.status === 'overdue' ? 'urgent' : params.status === 'due' ? 'high' : 'normal',
        url: `/financial/transactions/${params.transactionId}`,
        data: { transactionId: params.transactionId, amount: params.amount },
      });

      return { data: notification.data, error: null };
    } catch (error) {
      console.error('Error creating payment notification:', error);
      return { data: null, error };
    }
  }
}

