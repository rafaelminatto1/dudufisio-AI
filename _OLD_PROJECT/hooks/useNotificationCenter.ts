/**
 * useNotificationCenter Hook
 * MoocaFisio - Hook para gerenciar centro de notificações (versão atualizada)
 *
 * Uso:
 * const {
 *   notifications,
 *   unreadCount,
 *   loading,
 *   markAsRead,
 *   markAllAsRead,
 *   deleteNotification,
 *   loadMore
 * } = useNotificationCenter();
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../services/notifications/notificationService';
import type { Notification, NotificationListOptions } from '../services/notifications/notificationService';

interface UseNotificationCenterReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  hasMore: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllRead: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useNotificationCenter = (options: NotificationListOptions = {}): UseNotificationCenterReturn => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const limit = options.limit || 20;

  /**
   * Load notifications
   */
  const loadNotifications = useCallback(
    async (reset = false) => {
      if (!user) return;

      try {
        setLoading(true);

        const currentOffset = reset ? 0 : offset;

        const { notifications: newNotifications, total } = await notificationService.listNotifications(
          user.id,
          {
            ...options,
            limit,
            offset: currentOffset
          }
        );

        if (reset) {
          setNotifications(newNotifications);
          setOffset(limit);
        } else {
          setNotifications((prev) => [...prev, ...newNotifications]);
          setOffset((prev) => prev + limit);
        }

        setHasMore(currentOffset + newNotifications.length < total);
      } catch (error) {
        console.error('[useNotificationCenter] Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    },
    [user, offset, limit, options]
  );

  /**
   * Load unread count
   */
  const loadUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const count = await notificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('[useNotificationCenter] Error loading unread count:', error);
    }
  }, [user]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(
    async (id: string) => {
      try {
        const success = await notificationService.markAsRead(id);
        if (success) {
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === id ? { ...notif, read: true, readAt: new Date() } : notif
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error('[useNotificationCenter] Error marking as read:', error);
      }
    },
    []
  );

  /**
   * Mark notification as unread
   */
  const markAsUnread = useCallback(
    async (id: string) => {
      try {
        const success = await notificationService.markAsUnread(id);
        if (success) {
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === id ? { ...notif, read: false, readAt: undefined } : notif
            )
          );
          setUnreadCount((prev) => prev + 1);
        }
      } catch (error) {
        console.error('[useNotificationCenter] Error marking as unread:', error);
      }
    },
    []
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const success = await notificationService.markAllAsRead(user.id);
      if (success) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, read: true, readAt: new Date() }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('[useNotificationCenter] Error marking all as read:', error);
    }
  }, [user]);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        const success = await notificationService.deleteNotification(id);
        if (success) {
          const notif = notifications.find((n) => n.id === id);
          setNotifications((prev) => prev.filter((n) => n.id !== id));
          if (notif && !notif.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      } catch (error) {
        console.error('[useNotificationCenter] Error deleting notification:', error);
      }
    },
    [notifications]
  );

  /**
   * Delete all read notifications
   */
  const deleteAllRead = useCallback(async () => {
    if (!user) return;

    try {
      const success = await notificationService.deleteAllRead(user.id);
      if (success) {
        setNotifications((prev) => prev.filter((n) => !n.read));
      }
    } catch (error) {
      console.error('[useNotificationCenter] Error deleting all read:', error);
    }
  }, [user]);

  /**
   * Load more notifications
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await loadNotifications(false);
  }, [hasMore, loading, loadNotifications]);

  /**
   * Refresh notifications
   */
  const refresh = useCallback(async () => {
    setOffset(0);
    await loadNotifications(true);
    await loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  // Initial load
  useEffect(() => {
    if (user) {
      loadNotifications(true);
      loadUnreadCount();
    }
  }, [user]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    console.log('[useNotificationCenter] Subscribing to real-time notifications');

    const unsubscribe = notificationService.subscribeToNotifications(user.id, (newNotification) => {
      console.log('[useNotificationCenter] New notification received:', newNotification);

      // Add to beginning of list
      setNotifications((prev) => [newNotification, ...prev]);

      // Increment unread count if notification is unread
      if (!newNotification.read) {
        setUnreadCount((prev) => prev + 1);
      }

      // Show browser notification if supported and permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.body,
          icon: newNotification.icon,
          tag: newNotification.id,
          requireInteraction: newNotification.priority === 'urgent'
        });
      }
    });

    return () => {
      console.log('[useNotificationCenter] Unsubscribing from real-time notifications');
      unsubscribe();
    };
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    hasMore,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    loadMore,
    refresh
  };
};
