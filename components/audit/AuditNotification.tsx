import React, { useState, useEffect } from 'react';
import { Shield, X, Eye, Clock } from 'lucide-react';
import { AuditLogEntry } from '../../types';
import { auditService } from '../../services/auditService';

/**
 * 🔔 COMPONENTE DE NOTIFICAÇÃO DE AUDITORIA EM TEMPO REAL
 *
 * Exibe notificações discretas para ações importantes de auditoria
 */

interface AuditNotificationProps {
  maxNotifications?: number;
  autoHideDelay?: number;
  showSecurityOnly?: boolean;
}

interface NotificationItem extends AuditLogEntry {
  id: string;
  isVisible: boolean;
}

const getActionIcon = (action: string) => {
  if (action.includes('SECURITY') || action.includes('FAILED')) {
    return <Shield className="w-4 h-4 text-red-500" />;
  }
  if (action.includes('VIEW')) {
    return <Eye className="w-4 h-4 text-blue-500" />;
  }
  return <Clock className="w-4 h-4 text-gray-500" />;
};

const getNotificationStyle = (action: string) => {
  if (action.includes('SECURITY') || action.includes('FAILED')) {
    return 'border-red-200 bg-red-50 text-red-800';
  }
  if (action.includes('DELETE')) {
    return 'border-orange-200 bg-orange-50 text-orange-800';
  }
  if (action.includes('CREATE')) {
    return 'border-green-200 bg-green-50 text-green-800';
  }
  if (action.includes('UPDATE')) {
    return 'border-blue-200 bg-blue-50 text-blue-800';
  }
  return 'border-gray-200 bg-gray-50 text-gray-800';
};

const AuditNotification: React.FC<AuditNotificationProps> = ({
  maxNotifications = 3,
  autoHideDelay = 5000,
  showSecurityOnly = false
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const handleNewLog = (log: AuditLogEntry) => {
      // Filter security-only notifications if enabled
      if (showSecurityOnly && !log.action.includes('SECURITY') && !log.action.includes('FAILED')) {
        return;
      }

      const notificationItem: NotificationItem = {
        ...log,
        isVisible: true
      };

      setNotifications(prev => {
        const updated = [notificationItem, ...prev.slice(0, maxNotifications - 1)];
        return updated;
      });

      // Auto-hide after delay
      if (autoHideDelay > 0) {
        setTimeout(() => {
          setNotifications(prev =>
            prev.map(n => n.id === log.id ? { ...n, isVisible: false } : n)
          );

          // Remove after fade out animation
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== log.id));
          }, 300);
        }, autoHideDelay);
      }
    };

    auditService.addListener(handleNewLog);

    return () => {
      auditService.removeListener(handleNewLog);
    };
  }, [maxNotifications, autoHideDelay, showSecurityOnly]);

  const dismissNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isVisible: false } : n)
    );

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 300);
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            border rounded-lg p-3 shadow-sm transition-all duration-300
            ${notification.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
            ${getNotificationStyle(notification.action)}
          `}
        >
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0 mt-0.5">
              {getActionIcon(notification.action)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide">
                  {notification.action.replace(/_/g, ' ')}
                </p>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <p className="text-sm mt-1 line-clamp-2">
                {notification.details}
              </p>

              <div className="flex items-center justify-between mt-2 text-xs opacity-75">
                <span>{notification.user}</span>
                <span>{notification.timestamp.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuditNotification;