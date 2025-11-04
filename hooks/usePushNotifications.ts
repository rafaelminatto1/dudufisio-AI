/**
 * usePushNotifications Hook
 * MoocaFisio - React Hook para gerenciar push notifications
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { pushNotificationService } from '../services/push/PushNotificationService';

export interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  isInitialized: boolean;
  isLoading: boolean;
  hasActiveTokens: boolean;
  requestPermission: () => Promise<boolean>;
  disable: () => Promise<void>;
  enable: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasActiveTokens, setHasActiveTokens] = useState(false);

  // Check if notifications are supported
  useEffect(() => {
    const supported = pushNotificationService.isSupported();
    setIsSupported(supported);
    
    if (supported) {
      const currentPermission = pushNotificationService.getPermissionStatus();
      setPermission(currentPermission);
    }
  }, []);

  // Check if user has active tokens
  useEffect(() => {
    const checkActiveTokens = async () => {
      if (!user) {
        setHasActiveTokens(false);
        return;
      }

      try {
        const hasTokens = await pushNotificationService.hasActiveTokens(user.id);
        setHasActiveTokens(hasTokens);
        setIsInitialized(hasTokens);
      } catch (error) {
        console.error('[usePushNotifications] Error checking active tokens:', error);
      }
    };

    checkActiveTokens();
  }, [user]);

  // Request permission and initialize
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!user) {
      console.warn('[usePushNotifications] No user logged in');
      return false;
    }

    if (!isSupported) {
      console.warn('[usePushNotifications] Push notifications not supported');
      return false;
    }

    setIsLoading(true);

    try {
      const success = await pushNotificationService.initialize(user.id);
      
      if (success) {
        const newPermission = pushNotificationService.getPermissionStatus();
        setPermission(newPermission);
        setIsInitialized(true);
        setHasActiveTokens(true);
        console.log('[usePushNotifications] Successfully initialized');
      }

      return success;
    } catch (error) {
      console.error('[usePushNotifications] Error requesting permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, isSupported]);

  // Disable notifications
  const disable = useCallback(async (): Promise<void> => {
    if (!user) return;

    setIsLoading(true);

    try {
      await pushNotificationService.disableNotifications(user.id);
      setHasActiveTokens(false);
      console.log('[usePushNotifications] Notifications disabled');
    } catch (error) {
      console.error('[usePushNotifications] Error disabling:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Enable notifications
  const enable = useCallback(async (): Promise<void> => {
    if (!user) return;

    setIsLoading(true);

    try {
      await pushNotificationService.enableNotifications(user.id);
      setHasActiveTokens(true);
      console.log('[usePushNotifications] Notifications enabled');
    } catch (error) {
      console.error('[usePushNotifications] Error enabling:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Send test notification
  const sendTestNotification = useCallback(async (): Promise<void> => {
    if (!user) return;

    setIsLoading(true);

    try {
      await pushNotificationService.sendNotification({
        userId: user.id,
        title: '🎉 Notificação de Teste',
        body: 'Suas notificações estão funcionando perfeitamente!',
        url: '/dashboard',
        data: {
          type: 'test',
          timestamp: new Date().toISOString(),
        },
      });
      console.log('[usePushNotifications] Test notification sent');
    } catch (error) {
      console.error('[usePushNotifications] Error sending test:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Listen for permission changes
  useEffect(() => {
    if (!isSupported) return;

    const checkPermissionChange = () => {
      const currentPermission = pushNotificationService.getPermissionStatus();
      setPermission(currentPermission);
    };

    // Check every 2 seconds (user might change in browser settings)
    const interval = setInterval(checkPermissionChange, 2000);

    return () => clearInterval(interval);
  }, [isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pushNotificationService.cleanup();
    };
  }, []);

  return {
    isSupported,
    permission,
    isInitialized,
    isLoading,
    hasActiveTokens,
    requestPermission,
    disable,
    enable,
    sendTestNotification,
  };
};

