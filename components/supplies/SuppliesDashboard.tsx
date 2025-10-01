// components/supplies/SuppliesDashboard.tsx
import React from 'react';
import { useSuppliesDashboard } from '../../hooks/useSupplies';
import { 
  Package, 
  AlertTriangle, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Clock,
  ShoppingCart,
  AlertCircle
} from 'lucide-react';

interface SuppliesDashboardProps {
  onNavigateToSupplies?: () => void;
  onNavigateToAlerts?: () => void;
  onNavigateToOrders?: () => void;
}

const SuppliesDashboard: React.FC<SuppliesDashboardProps> = ({
  onNavigateToSupplies,
  onNavigateToAlerts,
  onNavigateToOrders
}) => {
  const { dashboardData, loading, error } = useSuppliesDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-700">Erro ao carregar dados: {error}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum dado disponível</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Insumos</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.totalSupplies}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
          <button
            onClick={onNavigateToSupplies}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todos →
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
              <p className="text-2xl font-bold text-orange-600">{dashboardData.lowStockCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
          {dashboardData.lowStockCount > 0 && (
            <button
              onClick={onNavigateToAlerts}
              className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Ver alertas →
            </button>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Próximos ao Vencimento</p>
              <p className="text-2xl font-bold text-red-600">{dashboardData.expiringCount}</p>
            </div>
            <Calendar className="h-8 w-8 text-red-600" />
          </div>
          {dashboardData.expiringCount > 0 && (
            <button
              onClick={onNavigateToAlerts}
              className="mt-4 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Ver alertas →
            </button>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor do Estoque</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(dashboardData.totalValue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insumos Mais Consumidos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Insumos Consumidos</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          
          {dashboardData.topConsumedSupplies.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.topConsumedSupplies.map((item, index) => (
                <div key={item.supplyId} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium flex items-center justify-center mr-3">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.supplyName}</span>
                  </div>
                  <span className="text-sm text-gray-600">{item.quantityConsumed} unidades</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Nenhum consumo registrado no período</p>
          )}
        </div>

        {/* Movimentações Recentes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Movimentações Recentes</h3>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          
          {dashboardData.recentMovements.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentMovements.slice(0, 5).map((movement) => (
                <div key={movement.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      movement.movementType === 'entrada' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {movement.supply?.name || 'Insumo não encontrado'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(movement.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      movement.movementType === 'entrada' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movement.movementType === 'entrada' ? '+' : '-'}{movement.quantity}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {movement.movementType}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Nenhuma movimentação recente</p>
          )}
        </div>
      </div>

      {/* Alertas Críticos */}
      {dashboardData.alerts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Alertas Ativos</h3>
            <AlertCircle className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {dashboardData.alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium mr-3 ${getSeverityColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {alert.supply?.name || 'Insumo não encontrado'}
                    </p>
                    <p className="text-xs text-gray-600">{alert.message}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(alert.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
          
          {dashboardData.alerts.length > 5 && (
            <button
              onClick={onNavigateToAlerts}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todos os alertas ({dashboardData.alerts.length}) →
            </button>
          )}
        </div>
      )}

      {/* Ações Rápidas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={onNavigateToSupplies}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Package className="h-6 w-6 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-900">Gerenciar Insumos</span>
          </button>
          
          <button
            onClick={onNavigateToOrders}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShoppingCart className="h-6 w-6 text-green-600 mr-2" />
            <span className="text-sm font-medium text-gray-900">Pedidos de Compra</span>
          </button>
          
          <button
            onClick={onNavigateToAlerts}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <AlertTriangle className="h-6 w-6 text-orange-600 mr-2" />
            <span className="text-sm font-medium text-gray-900">Central de Alertas</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuppliesDashboard;
