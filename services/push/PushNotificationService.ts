/**
 * Push Notification Service
 * MoocaFisio - Gerenciamento de notificações push
 */

import { supabase } from '../supabase/client';
import {
  requestNotificationPermission,
  getFCMToken,
  onForegroundMessage,
  isNotificationSupported,
  getNotificationPermission,
} from './firebaseConfig';

export interface PushNotificationToken {
  id?: string;
  user_id: string;
  token: string;
  device_type?: string;
  browser?: string;
  os?: string;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
  last_used_at?: string;
}

export interface SendNotificationPayload {
  userId?: string;
  userIds?: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  url?: string;
}

class PushNotificationService {
  private unsubscribeForeground: (() => void) | null = null;
  private currentUserId: string | null = null;

  /**
   * Initialize push notifications for current user
   */
  async initialize(userId: string): Promise<boolean> {
    try {
      console.log('[PushService] Initializing for user:', userId);

      if (!isNotificationSupported()) {
        console.warn('[PushService] Push notifications not supported');
        return false;
      }

      // Check if already denied
      if (getNotificationPermission() === 'denied') {
        console.warn('[PushService] Notification permission denied');
        return false;
      }

      // Request permission and get token
      const token = await requestNotificationPermission();
      if (!token) {
        console.warn('[PushService] Failed to get FCM token');
        return false;
      }

      // Save token to Supabase
      await this.saveToken(userId, token);

      // Setup foreground message listener
      this.setupForegroundListener();

      // Store current user ID
      this.currentUserId = userId;

      console.log('[PushService] Successfully initialized');
      return true;
    } catch (error) {
      console.error('[PushService] Error initializing:', error);
      return false;
    }
  }

  /**
   * Save FCM token to Supabase
   */
  async saveToken(userId: string, token: string): Promise<void> {
    try {
      console.log('[PushService] Saving token to database...');
      const deviceInfo = this.getDeviceInfo();

      const { error } = await supabase
        .from('push_notification_tokens')
        .upsert(
          {
            user_id: userId,
            token,
            ...deviceInfo,
            enabled: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'token' }
        );

      if (error) throw error;

      console.log('[PushService] Token saved successfully');
    } catch (error) {
      console.error('[PushService] Error saving token:', error);
      throw error;
    }
  }

  /**
   * Remove FCM token from Supabase
   */
  async removeToken(token: string): Promise<void> {
    try {
      console.log('[PushService] Removing token from database...');
      
      const { error } = await supabase
        .from('push_notification_tokens')
        .delete()
        .eq('token', token);

      if (error) throw error;

      console.log('[PushService] Token removed successfully');
    } catch (error) {
      console.error('[PushService] Error removing token:', error);
      throw error;
    }
  }

  /**
   * Disable notifications for user
   */
  async disableNotifications(userId: string): Promise<void> {
    try {
      console.log('[PushService] Disabling notifications for user:', userId);
      
      const { error } = await supabase
        .from('push_notification_tokens')
        .update({ enabled: false })
        .eq('user_id', userId);

      if (error) throw error;

      console.log('[PushService] Notifications disabled');
    } catch (error) {
      console.error('[PushService] Error disabling notifications:', error);
      throw error;
    }
  }

  /**
   * Enable notifications for user
   */
  async enableNotifications(userId: string): Promise<void> {
    try {
      console.log('[PushService] Enabling notifications for user:', userId);
      
      const { error } = await supabase
        .from('push_notification_tokens')
        .update({ enabled: true })
        .eq('user_id', userId);

      if (error) throw error;

      console.log('[PushService] Notifications enabled');
    } catch (error) {
      console.error('[PushService] Error enabling notifications:', error);
      throw error;
    }
  }

  /**
   * Get user's notification tokens
   */
  async getUserTokens(userId: string): Promise<PushNotificationToken[]> {
    try {
      const { data, error } = await supabase
        .from('push_notification_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('enabled', true);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[PushService] Error getting user tokens:', error);
      return [];
    }
  }

  /**
   * Send push notification via Supabase Edge Function
   */
  async sendNotification(payload: SendNotificationPayload): Promise<any> {
    try {
      console.log('[PushService] Sending notification:', payload);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: payload,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      console.log('[PushService] Notification sent:', data);
      return data;
    } catch (error) {
      console.error('[PushService] Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Setup listener for foreground messages
   */
  private setupForegroundListener(): void {
    if (this.unsubscribeForeground) {
      this.unsubscribeForeground();
    }

    this.unsubscribeForeground = onForegroundMessage((payload) => {
      console.log('[PushService] Foreground message received:', payload);

      // Show notification
      if (payload.notification) {
        this.showNotification(
          payload.notification.title || 'MoocaFisio',
          {
            body: payload.notification.body,
            icon: '/logo.png',
            badge: '/badge.png',
            data: payload.data,
            tag: payload.data?.tag || 'default',
            requireInteraction: true,
          }
        );
      }

      // Emit custom event for app to handle
      window.dispatchEvent(
        new CustomEvent('push-notification', {
          detail: payload,
        })
      );
    });
  }

  /**
   * Show browser notification
   */
  private showNotification(title: string, options?: NotificationOptions): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, options);
      
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        // Navigate to URL if provided
        const url = (options?.data as any)?.url;
        if (url) {
          window.location.href = url;
        }
        
        notification.close();
      };
    }
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): {
    device_type: string;
    browser: string;
    os: string;
  } {
    const ua = navigator.userAgent;

    return {
      device_type: /Mobile|Android|iPhone/i.test(ua) ? 'mobile' : 'desktop',
      browser: this.getBrowser(),
      os: this.getOS(),
    };
  }

  /**
   * Detect browser
   */
  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    return 'Unknown';
  }

  /**
   * Detect operating system
   */
  private getOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'MacOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
  }

  /**
   * Check if user has active tokens
   */
  async hasActiveTokens(userId: string): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('push_notification_tokens')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('enabled', true);

      if (error) throw error;

      return (count || 0) > 0;
    } catch (error) {
      console.error('[PushService] Error checking active tokens:', error);
      return false;
    }
  }

  /**
   * Get notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    return getNotificationPermission();
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return isNotificationSupported();
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    console.log('[PushService] Cleaning up...');
    
    if (this.unsubscribeForeground) {
      this.unsubscribeForeground();
      this.unsubscribeForeground = null;
    }

    this.currentUserId = null;
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

