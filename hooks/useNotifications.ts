// hooks/useNotifications.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Notification } from '../types';
import * as notificationService from '../services/notificationService';
import { enhancedNotificationService } from '../services/notificationService';
import type {
  NotificationPreferences,
  PushNotificationConfig,
  NotificationStatus
} from '../services/notificationService';
import { useAuth } from '../contexts/AppContext';

export const useNotifications = (userId?: string) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
    const [pushStatus, setPushStatus] = useState<NotificationStatus>({
        isServiceWorkerRegistered: false,
        isPushSupported: false,
        hasPermission: false,
        isSubscribed: false,
        endpoint: null
    });
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const fetchNotifications = useCallback(async () => {
        if (!userId) {
            setIsLoading(false);
            setNotifications([]);
            return;
        }
        setIsLoading(true);
        try {
            // Initialize enhanced notification service
            await enhancedNotificationService.initialize();

            // Get push notification status
            const status = enhancedNotificationService.getStatus();
            setPushStatus(status);

            // Load user preferences
            const userPrefs = enhancedNotificationService.getUserPreferences(userId);
            setPreferences(userPrefs);

            // Fetch regular notifications
            await notificationService.generateRemindersIfNeeded(user);
            const data = await notificationService.getNotifications(userId);
            setNotifications(data);

            setError(null);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            setError(error instanceof Error ? error.message : 'Failed to load notifications');
        } finally {
            setIsLoading(false);
        }
    }, [userId, user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = useCallback(async (notificationId: string) => {
        if (!userId) return;
        setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
        await notificationService.markAsRead(notificationId, userId);
    }, [userId]);

    const markAllAsRead = useCallback(async () => {
        if (!userId) return;
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        await notificationService.markAllAsRead(userId);
    }, [userId]);
    
    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.isRead).length;
    }, [notifications]);

    // Push notification functions
    const updatePreferences = useCallback(async (
        newPreferences: Partial<NotificationPreferences>
    ): Promise<boolean> => {
        if (!userId || !preferences) return false;

        try {
            setError(null);
            const updatedPreferences = { ...preferences, ...newPreferences };

            const success = enhancedNotificationService.updateUserPreferences(userId, updatedPreferences);

            if (success) {
                setPreferences(updatedPreferences);

                // If push notifications were enabled, ensure we have permission and subscription
                if (updatedPreferences.push && !pushStatus.isSubscribed) {
                    await requestPushPermission();
                }

                return true;
            }

            return false;
        } catch (err) {
            console.error('❌ Failed to update preferences:', err);
            setError('Failed to update notification preferences');
            return false;
        }
    }, [userId, preferences, pushStatus.isSubscribed]);

    const sendPushNotification = useCallback(async (
        config: PushNotificationConfig
    ): Promise<boolean> => {
        if (!userId) {
            setError('User ID is required to send notifications');
            return false;
        }

        try {
            setError(null);
            return await enhancedNotificationService.sendPushNotification(userId, config);
        } catch (err) {
            console.error('❌ Failed to send notification:', err);
            setError('Failed to send notification');
            return false;
        }
    }, [userId]);

    const requestPushPermission = useCallback(async (): Promise<NotificationPermission> => {
        try {
            setError(null);
            const permission = await enhancedNotificationService.requestPermission();

            if (permission === 'granted' && userId) {
                // Subscribe to push notifications
                const subscription = await enhancedNotificationService.subscribeToPush(userId);

                if (subscription) {
                    // Update status
                    const newStatus = enhancedNotificationService.getStatus();
                    setPushStatus(newStatus);
                }
            }

            return permission;
        } catch (err) {
            console.error('❌ Failed to request permission:', err);
            setError('Failed to request notification permission');
            return 'denied';
        }
    }, [userId]);

    const testNotification = useCallback(async (): Promise<void> => {
        if (!userId) {
            setError('User ID is required for test notifications');
            return;
        }

        try {
            setError(null);

            const testConfig: PushNotificationConfig = {
                title: '🧪 Teste de Notificação - DuduFisio-AI',
                body: 'Esta é uma notificação de teste. Se você está vendo isso, as notificações estão funcionando perfeitamente!',
                icon: '/icon-192x192.png',
                badge: '/badge-72x72.png',
                data: {
                    type: 'test',
                    timestamp: Date.now(),
                    actionUrl: '/dashboard'
                },
                actions: [
                    {
                        action: 'open',
                        title: '✅ Funcionando!',
                        icon: '/icon-open.png'
                    },
                    {
                        action: 'dismiss',
                        title: '❌ Fechar',
                        icon: '/icon-close.png'
                    }
                ],
                requireInteraction: true,
                tag: 'test-notification'
            };

            const success = await enhancedNotificationService.sendPushNotification(userId, testConfig);

            if (!success) {
                // Fallback to in-app notification if push fails
                enhancedNotificationService.sendInAppNotification(userId, testConfig);
            }

        } catch (err) {
            console.error('❌ Failed to send test notification:', err);
            setError('Failed to send test notification');
        }
    }, [userId]);

    return {
        // Original functionality
        notifications,
        isLoading,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refetch: fetchNotifications,

        // Push notification functionality
        preferences,
        pushStatus,
        error,
        updatePreferences,
        sendPushNotification,
        requestPushPermission,
        testNotification,

        // Computed status flags
        isPushEnabled: preferences?.push ?? false,
        hasPermission: pushStatus.hasPermission,
        isServiceWorkerReady: pushStatus.isServiceWorkerRegistered
    };
};