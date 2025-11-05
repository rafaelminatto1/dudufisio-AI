/**
 * NotificationsPage
 * MoocaFisio - Página completa de notificações
 *
 * Features:
 * - Lista completa de notificações
 * - Filtros por tipo e status
 * - Paginação infinita
 * - Ações em massa
 * - Pesquisa
 */

import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  X,
  Calendar,
  DollarSign,
  FileText,
  MessageCircle,
  Settings,
  Loader2
} from 'lucide-react';
import { useNotificationCenter } from '../hooks/useNotificationCenter';
import type { Notification } from '../services/notifications/notificationService';

type NotificationFilter = 'all' | 'unread' | 'read';
type NotificationType = Notification['type'] | 'all';

export const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const {
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
  } = useNotificationCenter({
    onlyUnread: filter === 'unread',
    type: typeFilter !== 'all' ? typeFilter : undefined
  });

  // Filter notifications by search query
  const filteredNotifications = notifications.filter((notif) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      notif.title.toLowerCase().includes(query) ||
      notif.body.toLowerCase().includes(query)
    );
  });

  // Apply read/unread filter if not already applied by hook
  const displayNotifications =
    filter === 'read'
      ? filteredNotifications.filter((n) => n.read)
      : filteredNotifications;

  const handleSelectAll = () => {
    if (selectedIds.size === displayNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayNotifications.map((n) => n.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkMarkAsRead = async () => {
    for (const id of selectedIds) {
      await markAsRead(id);
    }
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Deletar ${selectedIds.size} notificações?`)) return;

    for (const id of selectedIds) {
      await deleteNotification(id);
    }
    setSelectedIds(new Set());
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      appointment_confirmation: <Calendar className="w-5 h-5 text-green-500" />,
      appointment_reminder_24h: <Calendar className="w-5 h-5 text-blue-500" />,
      appointment_reminder_2h: <Calendar className="w-5 h-5 text-orange-500" />,
      appointment_cancellation: <Calendar className="w-5 h-5 text-red-500" />,
      appointment_update: <Calendar className="w-5 h-5 text-yellow-500" />,
      payment_due: <DollarSign className="w-5 h-5 text-red-500" />,
      payment_received: <DollarSign className="w-5 h-5 text-green-500" />,
      evolution_added: <FileText className="w-5 h-5 text-blue-500" />,
      message_received: <MessageCircle className="w-5 h-5 text-purple-500" />,
      system: <Settings className="w-5 h-5 text-gray-500" />
    };
    return iconMap[type] || <Bell className="w-5 h-5 text-gray-500" />;
  };

  const getTypeLabel = (type: NotificationType): string => {
    const labels: Record<NotificationType, string> = {
      all: 'Todas',
      appointment_confirmation: 'Confirmações',
      appointment_reminder_24h: 'Lembretes 24h',
      appointment_reminder_2h: 'Lembretes 2h',
      appointment_cancellation: 'Cancelamentos',
      appointment_update: 'Atualizações',
      payment_due: 'Pagamentos pendentes',
      payment_received: 'Pagamentos recebidos',
      evolution_added: 'Evoluções',
      message_received: 'Mensagens',
      system: 'Sistema',
      other: 'Outras'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Notificações
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : 'Todas lidas'}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar notificações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Não lidas {unreadCount > 0 && `(${unreadCount})`}
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'read'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Lidas
              </button>
            </div>
          </div>

          {/* Type Filter */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto">
            <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as NotificationType)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Todos os tipos</option>
              <option value="appointment_confirmation">Confirmações</option>
              <option value="appointment_reminder_24h">Lembretes 24h</option>
              <option value="appointment_reminder_2h">Lembretes 2h</option>
              <option value="appointment_cancellation">Cancelamentos</option>
              <option value="payment_due">Pagamentos</option>
              <option value="evolution_added">Evoluções</option>
              <option value="system">Sistema</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {selectedIds.size} notificação{selectedIds.size > 1 ? 'ões' : ''} selecionada
              {selectedIds.size > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkMarkAsRead}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1 text-sm"
              >
                <CheckCheck className="w-4 h-4" />
                Marcar como lidas
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Deletar
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {selectedIds.size === displayNotifications.length
                ? 'Desmarcar todas'
                : 'Selecionar todas'}
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-1"
              >
                <CheckCheck className="w-4 h-4" />
                Marcar todas como lidas
              </button>
            )}
            <button
              onClick={deleteAllRead}
              className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Deletar todas lidas
            </button>
            <button
              onClick={refresh}
              className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ml-auto"
            >
              Atualizar
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {loading && displayNotifications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Carregando notificações...</p>
            </div>
          ) : displayNotifications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhuma notificação
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? 'Nenhuma notificação corresponde à sua pesquisa'
                  : 'Você não tem notificações no momento'}
              </p>
            </div>
          ) : (
            <>
              {displayNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition-all hover:shadow-md ${
                    !notification.read
                      ? 'border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedIds.has(notification.id)}
                      onChange={() => handleSelectOne(notification.id)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />

                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDateTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {notification.body}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                          {getTypeLabel(notification.type)}
                        </span>
                        {notification.priority === 'urgent' && (
                          <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded font-medium">
                            Urgente
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!notification.read ? (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Marcar como lida"
                        >
                          <CheckCheck className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      ) : (
                        <button
                          onClick={() => markAsUnread(notification.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Marcar como não lida"
                        >
                          <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load More */}
              {hasMore && (
                <div className="text-center py-4">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      'Carregar mais'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
