import React, { useState } from 'react';
import { Bell, X, AlertCircle, Info, CheckCircle } from 'lucide-react';
const NotificationBell = ({ unreadCount, isCollapsed }) => {
    const [isOpen, setIsOpen] = useState(false);
    // Mock notifications - em produção viria de um hook/context
    const notifications = [
        {
            id: '1',
            title: 'Nova consulta agendada',
            message: 'Paciente João Silva agendou consulta para amanhã às 14h',
            type: 'info',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
            read: false
        },
        {
            id: '2',
            title: 'Relatório gerado',
            message: 'Relatório mensal de performance foi gerado com sucesso',
            type: 'success',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
            read: false
        },
        {
            id: '3',
            title: 'Sistema de backup',
            message: 'Backup automático executado com sucesso',
            type: 'success',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4h ago
            read: true
        },
        {
            id: '4',
            title: 'Atualização disponível',
            message: 'Nova versão do sistema está disponível para download',
            type: 'warning',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            read: true
        }
    ];
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-500"/>;
            case 'warning':
                return <AlertCircle className="w-4 h-4 text-yellow-500"/>;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500"/>;
            default:
                return <Info className="w-4 h-4 text-blue-500"/>;
        }
    };
    const formatTimestamp = (timestamp) => {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (minutes < 60)
            return `${minutes}m atrás`;
        if (hours < 24)
            return `${hours}h atrás`;
        return `${days}d atrás`;
    };
    const unreadNotifications = notifications.filter(n => !n.read);
    if (isCollapsed) {
        return (<div className="relative">
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors relative" title="Notificações">
          <Bell className="w-5 h-5 text-slate-600"/>
          {unreadCount > 0 && (<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>)}
        </button>
      </div>);
    }
    return (<div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-1 p-2 rounded-lg hover:bg-slate-100 transition-colors relative" title="Notificações">
        <Bell className="w-4 h-4 text-slate-600"/>
        <span className="text-xs font-medium text-slate-700 truncate">Notificações</span>
        {unreadCount > 0 && (<span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-xs shrink-0">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>)}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (<div className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Notificações</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-500"/>
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (<div className="p-4 text-center text-slate-500">
                Nenhuma notificação
              </div>) : (notifications.map((notification) => (<div key={notification.id} className={`p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-slate-900">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-slate-500">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (<div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"/>)}
                  </div>
                </div>)))}
          </div>

          {notifications.length > 0 && (<div className="p-3 border-t border-slate-200">
              <button className="w-full text-sm text-sky-600 hover:text-sky-700 font-medium">
                Ver todas as notificações
              </button>
            </div>)}
        </div>)}
    </div>);
};
export default NotificationBell;
