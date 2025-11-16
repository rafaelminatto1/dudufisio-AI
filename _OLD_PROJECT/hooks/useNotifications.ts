// hooks/useNotifications.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Notification } from '../types';
import { notificationService } from '../services/notificationService';
import { useApp } from '../contexts/AppContext';

export const useNotifications = (userId?: string) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useApp();

    const fetchNotifications = useCallback(async () => {
        if (!userId) {
            setIsLoading(false);
            setNotifications([]);
            return;
        }
        setIsLoading(true);
        try {
            // Generate reminders if needed
            await notificationService.generateRemindersIfNeeded(user);
            
            // Fetch notifications for user
            const data = await notificationService.getNotificationsForUser(userId);
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
        await notificationService.markAsReadForUser(notificationId, userId);
    }, [userId]);

    const markAllAsRead = useCallback(async () => {
        if (!userId) return;
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        await notificationService.markAllAsReadForUser(userId);
    }, [userId]);
    
    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.isRead).length;
    }, [notifications]);

    return {
        notifications,
        isLoading,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refetch: fetchNotifications,
        error
    };
};