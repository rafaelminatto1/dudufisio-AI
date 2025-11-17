import { createServerComponentClient } from '~/lib/supabase/server';

export class NotificationService {
  static async create(params: {
    userId: string;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
  }) {
    try {
      const supabase = createServerComponentClient();
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: params.userId,
          title: params.title,
          message: params.message,
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

  static async getUserNotifications(userId: string, unreadOnly: boolean = false) {
    try {
      const supabase = createServerComponentClient();
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId);

      if (unreadOnly) query = query.eq('read', false);

      query = query.order('created_at', { ascending: false }).limit(50);

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { data: null, error };
    }
  }

  static async markAsRead(notificationId: string) {
    try {
      const supabase = createServerComponentClient();
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
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
}

