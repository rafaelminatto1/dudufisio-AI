// components/alerts/AlertBadge.tsx
import React, { useState, useEffect } from 'react';
import { useNotifications, useAlertSummary } from '../../hooks/useAlerts';
import { Bell, AlertTriangle, CheckCircle } from 'lucide-react';

interface AlertBadgeProps {
  userId: string;
  onClick?: () => void;
  showCount?: boolean;
  className?: string;
}

const AlertBadge: React.FC<AlertBadgeProps> = ({
  userId,
  onClick,
  showCount = true,
  className = ''
}) => {
  const { unreadCount } = useNotifications(userId, true);
  const { summary } = useAlertSummary();
  const [isVisible, setIsVisible] = useState(false);

  // Mostrar badge apenas se houver alertas não lidos
  useEffect(() => {
    setIsVisible(unreadCount > 0 || summary.unread > 0);
  }, [unreadCount, summary.unread]);

  const totalUnread = unreadCount + summary.unread;

  if (!isVisible) {
    return (
      <button
        onClick={onClick}
        className={`p-2 text-gray-400 hover:text-gray-600 transition-colors ${className}`}
        title="Notificações"
      >
        <Bell className="h-6 w-6" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 hover:text-blue-600 transition-colors ${className}`}
      title={`${totalUnread} notificação${totalUnread > 1 ? 'ões' : ''} não lida${totalUnread > 1 ? 's' : ''}`}
    >
      <Bell className="h-6 w-6" />
      
      {showCount && totalUnread > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[20px] h-5">
          {totalUnread > 99 ? '99+' : totalUnread}
        </span>
      )}
      
      {/* Indicador pulsante para alertas críticos */}
      {summary.bySeverity.critical > 0 && (
        <span className="absolute top-1 right-1 inline-flex items-center justify-center w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
      )}
    </button>
  );
};

export default AlertBadge;
