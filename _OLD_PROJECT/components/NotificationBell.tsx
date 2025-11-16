import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  read_at: string | null;
  data: any;
  action_url: string | null;
  action_label: string | null;
  created_at: string;
}

interface NotificationBellProps {
  isCollapsed?: boolean;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ isCollapsed = false }) => {
  const { user } = useSupabaseAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Carregar notificações iniciais
  useEffect(() => {
    if (!user) return;
    loadNotifications();
    loadUnreadCount();
  }, [user]);

  // Subscription realtime
  useEffect(() => {
    if (!user) return;

    async function setupRealtime() {
      // Skip Supabase query for mock users
      if (user.id.startsWith('mock-')) {
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) return;

      const channel = supabase
        .channel('notifications-channel')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userData.id}`,
        }, (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
          setUnreadCount((prev) => prev + 1);

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotif.title, {
              body: newNotif.message,
              icon: '/logo.png',
            });
          }
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userData.id}`,
        }, (payload) => {
          const updated = payload.new as Notification;
          setNotifications((prev) => prev.map((n) => n.id === updated.id ? updated : n));
          if (updated.read) setUnreadCount((prev) => Math.max(0, prev - 1));
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }

    setupRealtime();
  }, [user]);

  // Solicitar permissão de notificações
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  async function loadNotifications() {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadUnreadCount() {
    if (!user) return;
    
    // Skip Supabase query for mock users
    if (user.id.startsWith('mock-')) {
      return;
    }
    
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) return;

      const { data } = await supabase
        .rpc('get_unread_count', { p_user_id: userData.id });
      setUnreadCount(data || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }

  async function markAsRead(notificationId: string) {
    if (!user) return;
    
    // Skip Supabase query for mock users
    if (user.id.startsWith('mock-')) {
      return;
    }
    
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) return;

      await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId,
        p_user_id: userData.id,
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }

  function getNotificationIcon(type: string): string {
    if (type.includes('appointment')) return '📅';
    if (type.includes('payment')) return '💰';
    if (type.includes('exercise')) return '💪';
    if (type.includes('message')) return '💬';
    if (type.includes('achievement')) return '🏆';
    return '🔔';
  }

  function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Notificações"
      >
        <Bell className={isCollapsed ? "w-5 h-5" : "w-6 h-6"} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-900">Notificações</h3>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Bell className="w-12 h-12 mb-2 text-slate-300" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      if (!notification.read) markAsRead(notification.id);
                      if (notification.action_url) window.location.href = notification.action_url;
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-900 line-clamp-1">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-500">
                            {formatRelativeTime(notification.created_at)}
                          </span>
                          {notification.action_label && (
                            <span className="text-xs text-blue-600 font-medium">
                              {notification.action_label} →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-200 bg-slate-50">
              <a
                href="/notifications"
                className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todas as notificações
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
