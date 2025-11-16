// components/alerts/AlertCenter.tsx
import React, { useState, useEffect } from 'react';
import { SupplyAlert, AlertSeverity, AlertType } from '../../types';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  X, 
  RefreshCw,
  Filter,
  Search,
  Clock,
  Package,
  Calendar,
  Truck,
  Settings,
  Bell,
  BellOff
} from 'lucide-react';

interface AlertCenterProps {
  onNavigateToSupply?: (supplyId: string) => void;
  onNavigateToOrder?: (orderId: string) => void;
  compact?: boolean;
}

const AlertCenter: React.FC<AlertCenterProps> = ({
  onNavigateToSupply,
  onNavigateToOrder,
  compact = false
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | ''>('');
  const [selectedType, setSelectedType] = useState<AlertType | ''>('');
  const [showResolved, setShowResolved] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { 
    alerts, 
    loading, 
    error, 
    markAsRead, 
    resolveAlert, 
    escalateAlert,
    refetch 
  } = useSupplyAlerts({
    unreadOnly: !showResolved,
    severity: selectedSeverity || undefined,
    alertType: selectedType || undefined
  });

  const { summary, refetch: refetchSummary } = useAlertSummary();
  const { isRunning, runChecks, lastRun } = useAlertChecks();

  // Filtrar alertas por termo de busca
  const filteredAlerts = alerts.filter(alert => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      alert.supply?.name.toLowerCase().includes(searchLower) ||
      alert.message.toLowerCase().includes(searchLower) ||
      alert.alertType.toLowerCase().includes(searchLower)
    );
  });

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'medium': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'low': return <AlertTriangle className="h-5 w-5 text-blue-600" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-200 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-200 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-200 text-blue-800';
      default: return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getTypeIcon = (type: AlertType) => {
    switch (type) {
      case 'low_stock':
      case 'critical_stock': return <Package className="h-4 w-4" />;
      case 'expiring':
      case 'expired': return <Calendar className="h-4 w-4" />;
      case 'overdue_order': return <Truck className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: AlertType) => {
    const labels = {
      low_stock: 'Estoque Baixo',
      critical_stock: 'Estoque Crítico',
      expiring: 'Próximo ao Vencimento',
      expired: 'Vencido',
      overdue_order: 'Pedido em Atraso'
    };
    return labels[type] || type;
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await markAsRead(alertId);
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await resolveAlert(alertId);
    } catch (error) {
      console.error('Erro ao resolver alerta:', error);
    }
  };

  const handleEscalate = async (alertId: string) => {
    const reason = prompt('Motivo da escalação:');
    if (reason) {
      try {
        await escalateAlert(alertId, reason);
      } catch (error) {
        console.error('Erro ao escalar alerta:', error);
      }
    }
  };

  const handleRunChecks = async () => {
    try {
      await runChecks();
      await refetch();
      await refetchSummary();
    } catch (error) {
      console.error('Erro ao executar verificações:', error);
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Alertas</h3>
            {summary.unread > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {summary.unread}
              </span>
            )}
          </div>
          <button
            onClick={handleRunChecks}
            disabled={isRunning}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-2">
          {filteredAlerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    {getSeverityIcon(alert.severity)}
                    <span className="ml-2 text-sm font-medium">
                      {getTypeLabel(alert.alertType)}
                    </span>
                  </div>
                  <p className="text-sm opacity-90">{alert.message}</p>
                </div>
                {!alert.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(alert.id)}
                    className="ml-2 p-1 hover:bg-white hover:bg-opacity-50 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {filteredAlerts.length === 0 && (
            <div className="text-center py-4">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Nenhum alerta ativo</p>
            </div>
          )}
        </div>

        {filteredAlerts.length > 3 && (
          <button className="w-full mt-3 text-sm text-blue-600 hover:text-blue-700">
            Ver todos os alertas ({filteredAlerts.length})
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Central de Alertas</h2>
          <p className="text-gray-600">Gerencie alertas e notificações do sistema</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunChecks}
            disabled={isRunning}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Verificando...' : 'Verificar Agora'}
          </button>
          
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </button>
        </div>
      </div>

      {/* Resumo de Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-gray-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Críticos</p>
              <p className="text-2xl font-bold text-red-600">{summary.bySeverity.critical}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Não Lidos</p>
              <p className="text-2xl font-bold text-orange-600">{summary.unread}</p>
            </div>
            <Bell className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Última Verificação</p>
              <p className="text-sm font-bold text-gray-900">
                {lastRun ? lastRun.toLocaleTimeString('pt-BR') : 'Nunca'}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar alertas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as AlertSeverity | '')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as severidades</option>
              <option value="critical">Crítico</option>
              <option value="high">Alto</option>
              <option value="medium">Médio</option>
              <option value="low">Baixo</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as AlertType | '')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os tipos</option>
              <option value="low_stock">Estoque Baixo</option>
              <option value="critical_stock">Estoque Crítico</option>
              <option value="expiring">Próximo ao Vencimento</option>
              <option value="expired">Vencido</option>
              <option value="overdue_order">Pedido em Atraso</option>
            </select>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showResolved}
                onChange={(e) => setShowResolved(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Incluir resolvidos</span>
            </label>
          </div>
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-700">Erro ao carregar alertas: {error}</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum alerta encontrado</h3>
            <p className="text-gray-500">
              {searchTerm || selectedSeverity || selectedType
                ? 'Tente ajustar os filtros de busca'
                : 'Todos os alertas estão resolvidos!'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className={`p-6 ${alert.isRead ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {getTypeIcon(alert.alertType)}
                          <span className="ml-1">{getTypeLabel(alert.alertType)}</span>
                        </span>
                        
                        {!alert.isRead && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Não lido
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-900 mb-2">{alert.message}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{new Date(alert.createdAt).toLocaleString('pt-BR')}</span>
                        {alert.supply && (
                          <button
                            onClick={() => onNavigateToSupply?.(alert.supplyId)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Ver insumo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!alert.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(alert.id)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="Marcar como lido"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="p-2 text-gray-400 hover:text-green-600"
                      title="Resolver alerta"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    
                    {alert.severity !== 'critical' && (
                      <button
                        onClick={() => handleEscalate(alert.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Escalar alerta"
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertCenter;
