import React, { useState, useEffect } from 'react';
import { Bell, X, AlertCircle, Clock, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';
import { notificationService, Notification } from '../../services/notificationService';
import { eventService } from '../../services/eventService';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();

    // Escutar eventos de notificações
    eventService.on('notifications:new', loadNotifications);
    eventService.on('notifications:updated', loadNotifications);

    return () => {
      eventService.off('notifications:new', loadNotifications);
      eventService.off('notifications:updated', loadNotifications);
    };
  }, []);

  const loadNotifications = () => {
    const allNotifications = notificationService.getNotifications();
    const unread = notificationService.getUnreadCount();
    setNotifications(allNotifications);
    setUnreadCount(unread);
  };

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const handleDelete = (notificationId: string) => {
    notificationService.deleteNotification(notificationId);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reminder':
        return Clock;
      case 'delay':
        return AlertTriangle;
      case 'conflict':
        return AlertCircle;
      case 'confirmation_needed':
        return CheckCircle;
      default:
        return Info;
    }
  };

  const getNotificationColor = (severity: Notification['severity']) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-[500px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Notificações</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs"
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map(notification => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClass = getNotificationColor(notification.severity);

                  return (
                    <Card
                      key={notification.id}
                      className={cn(
                        "p-3 border transition cursor-pointer",
                        !notification.read && "bg-blue-50/50",
                        colorClass
                      )}
                      onClick={() => {
                        if (!notification.read) {
                          handleMarkAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("p-2 rounded-lg", colorClass)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm">{notification.title}</h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs mt-1 opacity-90">{notification.message}</p>
                          <p className="text-xs mt-2 opacity-70">
                            {format(notification.createdAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className="p-1 hover:bg-white/50 rounded transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>{notifications.length} notificação(ões)</span>
                {unreadCount > 0 && (
                  <span className="font-semibold text-blue-600">{unreadCount} não lida(s)</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
