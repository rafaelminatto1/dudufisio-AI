import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, XCircle, Filter, Search, Bell, Eye, RefreshCw, Download } from 'lucide-react';
import { InventoryAlertType } from '../../types';
const AlertsTab = ({ alerts, unreadAlertsCount, isLoading = false, onRefresh, onMarkAsRead, onMarkAllAsRead, onDismissAlert, onExportAlerts }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    // Filtrar alertas
    const filteredAlerts = alerts.filter(alert => {
        // Filtro por texto
        if (searchQuery && !alert.itemName.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !alert.message.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        // Filtro por tipo
        switch (filter) {
            case 'critical':
                return alert.severity === 'critical';
            case 'high':
                return alert.severity === 'high';
            case 'unread':
                return !alert.isRead;
            case 'read':
                return alert.isRead;
            default:
                return true;
        }
    });
    // Ordenar alertas
    const sortedAlerts = [...filteredAlerts].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'oldest':
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case 'severity':
                const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
                return severityOrder[b.severity] - severityOrder[a.severity];
            case 'type':
                return a.type.localeCompare(b.type);
            default:
                return 0;
        }
    });
    const getAlertIcon = (type, severity) => {
        const iconClass = `w-5 h-5 ${severity === 'critical' ? 'text-red-600' : 'text-orange-600'}`;
        switch (type) {
            case InventoryAlertType.OutOfStock:
                return <XCircle className={iconClass}/>;
            case InventoryAlertType.LowStock:
                return <AlertTriangle className={iconClass}/>;
            case InventoryAlertType.Expired:
                return <XCircle className={iconClass}/>;
            case InventoryAlertType.Expiring:
                return <Clock className={iconClass}/>;
            default:
                return <AlertTriangle className={iconClass}/>;
        }
    };
    const getSeverityBadge = (severity) => {
        const configs = {
            critical: { bg: 'bg-red-100', text: 'text-red-800', label: 'Crítico' },
            high: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Alto' },
            medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Médio' },
            low: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Baixo' }
        };
        const config = configs[severity] || configs.low;
        return (<span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>);
    };
    const getTypeLabel = (type) => {
        const labels = {
            [InventoryAlertType.OutOfStock]: 'Sem Estoque',
            [InventoryAlertType.LowStock]: 'Estoque Baixo',
            [InventoryAlertType.Expired]: 'Vencido',
            [InventoryAlertType.Expiring]: 'Vencendo',
            [InventoryAlertType.OverdueOrder]: 'Pedido Atrasado',
            [InventoryAlertType.HighConsumption]: 'Alto Consumo',
            [InventoryAlertType.LowTurnover]: 'Baixa Rotatividade',
            [InventoryAlertType.PriceChange]: 'Mudança de Preço',
            [InventoryAlertType.SupplierDelay]: 'Atraso do Fornecedor'
        };
        return labels[type] || 'Alerta';
    };
    const getTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        if (diffInMinutes < 60) {
            return `${diffInMinutes}m atrás`;
        }
        else if (diffInMinutes < 1440) {
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours}h atrás`;
        }
        else {
            const days = Math.floor(diffInMinutes / 1440);
            return `${days}d atrás`;
        }
    };
    if (alerts.length === 0) {
        return (<div className="text-center py-12">
        <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600"/>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum alerta ativo</h3>
        <p className="text-slate-500 mb-4">Todos os itens estão com estoque adequado</p>
        <button onClick={onRefresh} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto">
          <RefreshCw className="w-4 h-4"/>
          Atualizar
        </button>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Central de Alertas</h2>
            <p className="text-slate-600">Monitoramento em tempo real do inventário</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onRefresh} disabled={isLoading} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}/>
              Atualizar
            </button>
            <button onClick={onExportAlerts} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
              <Download className="w-4 h-4"/>
              Exportar
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600"/>
              <div>
                <p className="text-sm text-red-700">Críticos</p>
                <p className="text-2xl font-bold text-red-900">
                  {alerts.filter(a => a.severity === 'critical').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600"/>
              <div>
                <p className="text-sm text-orange-700">Altos</p>
                <p className="text-2xl font-bold text-orange-900">
                  {alerts.filter(a => a.severity === 'high').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600"/>
              <div>
                <p className="text-sm text-blue-700">Não Lidos</p>
                <p className="text-2xl font-bold text-blue-900">{unreadAlertsCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-slate-600"/>
              <div>
                <p className="text-sm text-slate-700">Total</p>
                <p className="text-2xl font-bold text-slate-900">{alerts.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e busca */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5"/>
            <input type="text" placeholder="Buscar por item ou mensagem..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Filtrar alertas" title="Filtrar alertas">
            <option value="all">Todos os alertas</option>
            <option value="critical">Críticos</option>
            <option value="high">Altos</option>
            <option value="unread">Não lidos</option>
            <option value="read">Lidos</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Ordenar alertas" title="Ordenar alertas">
            <option value="newest">Mais recentes</option>
            <option value="oldest">Mais antigos</option>
            <option value="severity">Por severidade</option>
            <option value="type">Por tipo</option>
          </select>
          {unreadAlertsCount > 0 && (<button onClick={onMarkAllAsRead} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4"/>
              Marcar todos como lidos
            </button>)}
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            Alertas ({filteredAlerts.length})
          </h3>
        </div>
        <div className="divide-y divide-slate-200">
          {sortedAlerts.map((alert) => (<div key={alert.id} className={`p-6 hover:bg-slate-50 transition-colors ${!alert.isRead ? 'bg-blue-50/50' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getAlertIcon(alert.type, alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 mb-1">
                        {alert.itemName}
                      </h4>
                      <p className="text-slate-700 mb-2">{alert.message}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4"/>
                          {getTimeAgo(alert.createdAt)}
                        </span>
                        <span>{getTypeLabel(alert.type)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {getSeverityBadge(alert.severity)}
                      {!alert.isRead && (<div className="w-2 h-2 bg-blue-600 rounded-full"/>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {!alert.isRead && (<button onClick={() => onMarkAsRead?.(alert.id)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 flex items-center gap-1">
                        <Eye className="w-4 h-4"/>
                        Marcar como lido
                      </button>)}
                    <button onClick={() => onDismissAlert?.(alert.id)} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm hover:bg-slate-200 flex items-center gap-1">
                      <XCircle className="w-4 h-4"/>
                      Dispensar
                    </button>
                  </div>
                </div>
              </div>
            </div>))}
        </div>
      </div>

      {filteredAlerts.length === 0 && (<div className="text-center py-12">
          <Filter className="w-12 h-12 text-slate-400 mx-auto mb-4"/>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum alerta encontrado</h3>
          <p className="text-slate-500">Tente ajustar os filtros de busca</p>
        </div>)}
    </div>);
};
export default AlertsTab;
