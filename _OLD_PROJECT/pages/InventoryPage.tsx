import React, { useState, useCallback } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  AlertTriangle,
  TrendingDown,
  Calendar,
  BarChart3,
  Edit,
  Trash2,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useInventory, useInventoryMetrics, useInventoryAlerts, useLowStockItems, useExpiringItems } from '../hooks/useInventory';
import { InventoryItem, InventoryMovementType } from '../types';
import ItemFormModal from '../components/inventory/ItemFormModal';
import StockMovementModal from '../components/inventory/StockMovementModal';
import AlertsTab from '../components/inventory/AlertsTab';

const InventoryPage: React.FC = () => {
  const {
    items,
    suppliers,
    categories,
    isLoading,
    isUpdating,
    error,
    createItem,
    updateItem,
    addMovement,
    getItemsByCategory,
    searchItems,
    refreshData,
    clearError
  } = useInventory();

  const { metrics } = useInventoryMetrics();
  const { 
    alerts, 
    unreadAlertsCount, 
    markAsRead, 
    markAllAsRead, 
    dismissAlert, 
    exportAlerts,
    refresh: refreshAlerts 
  } = useInventoryAlerts();
  const { lowStockItems } = useLowStockItems();
  const { expiringItems } = useExpiringItems();

  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'movements' | 'alerts'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>(undefined);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementType, setMovementType] = useState<InventoryMovementType>('entrada');

  const filteredItems = React.useMemo(() => {
    let result = searchQuery ? searchItems(searchQuery) : items;
    if (selectedCategory) {
      result = result.filter(item => item.categoryId === selectedCategory);
    }
    return result;
  }, [items, searchQuery, selectedCategory, searchItems]);

  const handleAddMovement = useCallback(async (
    itemId: string,
    type: InventoryMovementType,
    quantity: number,
    reason: string
  ) => {
    try {
      await addMovement(itemId, type, quantity, reason);
      setShowMovementModal(false);
      setSelectedItem(undefined);
    } catch (error) {
      console.error('Error adding movement:', error);
    }
  }, [addMovement]);

  const handleSaveItem = useCallback(async (itemData: any) => {
    try {
      if (itemData.id) {
        await updateItem(itemData);
      } else {
        await createItem(itemData);
      }
      setShowCreateModal(false);
      setSelectedItem(undefined);
    } catch (error) {
      console.error('Error saving item:', error);
    }
  }, [createItem, updateItem]);

  const openMovementModal = useCallback((item: InventoryItem, type: InventoryMovementType) => {
    setSelectedItem(item);
    setMovementType(type);
    setShowMovementModal(true);
  }, []);

  const MetricCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }: any) => (
    <div className="bg-white rounded-lg shadow-card border border-neutral-border p-lg">
      <div className="flex items-center">
        <div className={`p-md bg-${color}-100 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-neutral-textSecondary">{title}</p>
          <p className="text-2xl font-bold text-neutral-text">{value}</p>
          {subtitle && <p className="text-sm text-neutral-textSecondary">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-xl">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
        <MetricCard
          icon={Package}
          title="Total de Itens"
          value={metrics?.totalItems || 0}
          subtitle="Produtos cadastrados"
          color="blue"
        />
        <MetricCard
          icon={TrendingDown}
          title="Estoque Baixo"
          value={metrics?.lowStockItems || 0}
          subtitle="Requer atenção"
          color="red"
        />
        <MetricCard
          icon={Calendar}
          title="Próximo ao Vencimento"
          value={expiringItems.length}
          subtitle="Próximos 30 dias"
          color="yellow"
        />
        <MetricCard
          icon={BarChart3}
          title="Valor Total"
          value={`R$ ${(metrics?.totalValue || 0).toLocaleString('pt-BR')}`}
          subtitle="Valor do estoque"
          color="green"
        />
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-card border border-neutral-border">
          <div className="p-lg border-b border-neutral-border">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-sm" />
              <h3 className="text-lg font-semibold text-neutral-text">
                Alertas Críticos ({unreadAlertsCount})
              </h3>
            </div>
          </div>
          <div className="p-lg">
            <div className="space-y-sm">
              {alerts.slice(0, 5).map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-md bg-error-light rounded-lg border border-error">
                  <div>
                    <p className="font-medium text-red-900">{alert.message}</p>
                    <p className="text-sm text-error">{alert.itemName}</p>
                  </div>
                  <span className={`px-sm py-1 rounded-full text-xs font-medium ${
                    alert.severity === 'critical' ? 'bg-error-light text-error' : 'bg-warning-light text-yellow-800'
                  }`}>
                    {alert.severity === 'critical' ? 'Crítico' : 'Atenção'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Low Stock Items */}
        <div className="bg-white rounded-lg shadow-card border border-neutral-border">
          <div className="p-lg border-b border-neutral-border">
            <h3 className="text-lg font-semibold text-neutral-text">Estoque Baixo</h3>
          </div>
          <div className="p-lg">
            {lowStockItems.length > 0 ? (
              <div className="space-y-sm">
                {lowStockItems.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-text">{item.name}</p>
                      <p className="text-sm text-neutral-textSecondary">
                        Estoque: {item.currentStock} | Mínimo: {item.minStock}
                      </p>
                    </div>
                    <button
                      onClick={() => openMovementModal(item, 'entrada')}
                      className="px-md py-1 bg-primary text-white rounded-md text-sm hover:bg-primary-hover"
                    >
                      Repor
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-textSecondary">Nenhum item com estoque baixo</p>
            )}
          </div>
        </div>

        {/* Expiring Items */}
        <div className="bg-white rounded-lg shadow-card border border-neutral-border">
          <div className="p-lg border-b border-neutral-border">
            <h3 className="text-lg font-semibold text-neutral-text">Próximos ao Vencimento</h3>
          </div>
          <div className="p-lg">
            {expiringItems.length > 0 ? (
              <div className="space-y-sm">
                {expiringItems.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-text">{item.name}</p>
                      <p className="text-sm text-neutral-textSecondary">
                        Vence em: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('pt-BR') : 'N/A'}
                      </p>
                    </div>
                    <span className="px-sm py-1 bg-warning-light text-yellow-800 rounded-full text-xs">
                      Atenção
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-textSecondary">Nenhum item próximo ao vencimento</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const ItemsTab = () => (
    <div className="space-y-xl">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-card border border-neutral-border p-lg">
        <div className="flex flex-col lg:flex-row gap-md">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-textTertiary w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar itens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-sm border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-md py-sm border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filtrar por categoria"
            title="Filtrar por categoria"
          >
            <option value="">Todas as categorias</option>
            {categories.map((category: any) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-md py-sm bg-primary text-white rounded-lg hover:bg-primary-hover flex items-center gap-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Item
          </button>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow-card border border-neutral-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-bgAlt border-b border-neutral-border">
              <tr>
                <th className="text-left p-md font-medium text-neutral-text">Item</th>
                <th className="text-left p-md font-medium text-neutral-text">Categoria</th>
                <th className="text-left p-md font-medium text-neutral-text">Estoque</th>
                <th className="text-left p-md font-medium text-neutral-text">Valor Unit.</th>
                <th className="text-left p-md font-medium text-neutral-text">Status</th>
                <th className="text-left p-md font-medium text-neutral-text">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item: any) => {
                const category = categories.find(c => c.id === item.categoryId);
                const isLowStock = item.currentStock <= item.minStock;
                const isExpiring = item.expiryDate && new Date(item.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                return (
                  <tr key={item.id} className="border-b border-neutral-border hover:bg-neutral-bgAlt">
                    <td className="p-md">
                      <div>
                        <p className="font-medium text-neutral-text">{item.name}</p>
                        <p className="text-sm text-neutral-textSecondary">{item.description}</p>
                      </div>
                    </td>
                    <td className="p-md text-neutral-textSecondary">{category?.name || 'N/A'}</td>
                    <td className="p-md">
                      <span className={`font-medium ${isLowStock ? 'text-error' : 'text-neutral-text'}`}>
                        {item.currentStock}
                      </span>
                      <span className="text-neutral-textSecondary ml-xs">/ {item.minStock} mín</span>
                    </td>
                    <td className="p-md text-neutral-textSecondary">
                      R$ {(item.unitPrice || 0).toFixed(2)}
                    </td>
                    <td className="p-md">
                      <div className="space-y-1">
                        {isLowStock && (
                          <span className="inline-block px-sm py-1 bg-error-light text-error rounded-full text-xs">
                            Estoque Baixo
                          </span>
                        )}
                        {isExpiring && (
                          <span className="inline-block px-sm py-1 bg-warning-light text-yellow-800 rounded-full text-xs">
                            Vencendo
                          </span>
                        )}
                        {!isLowStock && !isExpiring && (
                          <span className="inline-block px-sm py-1 bg-success-light text-success rounded-full text-xs">
                            Normal
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-md">
                      <div className="flex items-center gap-sm">
                        <button
                          onClick={() => openMovementModal(item, 'entrada')}
                          className="p-1 text-success hover:bg-success-light rounded"
                          title="Entrada de estoque"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openMovementModal(item, 'saida')}
                          className="p-1 text-error hover:bg-error-light rounded"
                          title="Saída de estoque"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowCreateModal(true);
                          }}
                          className="p-1 text-neutral-textSecondary hover:bg-neutral-bgDark rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-error hover:bg-error-light rounded"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-lg space-y-xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-text">Gestão de Inventário</h1>
          <p className="text-neutral-textSecondary mt-xs">Controle completo do estoque da clínica</p>
        </div>
        <div className="flex items-center gap-md mt-md lg:mt-0">
          <button
            onClick={refreshData}
            className="px-md py-sm bg-neutral-bgDark text-neutral-text rounded-lg hover:bg-neutral-bgDark flex items-center gap-sm"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button className="px-md py-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-sm">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-error-light border border-error rounded-lg p-md flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-sm" />
            <span className="text-error">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-error"
          >
            ×
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-neutral-border">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { id: 'items', label: 'Itens', icon: Package },
            { id: 'movements', label: 'Movimentações', icon: Upload },
            { id: 'alerts', label: 'Alertas', icon: AlertTriangle, badge: unreadAlertsCount }
          ].map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-sm ${
                activeTab === id
                  ? 'border-blue-500 text-primary'
                  : 'border-transparent text-neutral-textSecondary hover:text-neutral-text'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {badge && badge > 0 && (
                <span className="bg-error-light text-error text-xs px-sm py-1 rounded-full">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'items' && <ItemsTab />}
      {activeTab === 'movements' && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-neutral-textTertiary mx-auto mb-md" />
          <p className="text-neutral-textSecondary">Histórico de movimentações será implementado em breve</p>
        </div>
      )}
      {activeTab === 'alerts' && (
        <AlertsTab
          alerts={alerts}
          unreadAlertsCount={unreadAlertsCount}
          isLoading={isLoading}
          onRefresh={refreshAlerts}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDismissAlert={dismissAlert}
          onExportAlerts={exportAlerts}
        />
      )}

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-lg flex items-center gap-md">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Atualizando...</span>
          </div>
        </div>
      )}

      {/* Item Form Modal */}
      <ItemFormModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedItem(undefined);
        }}
        onSave={handleSaveItem}
        itemToEdit={selectedItem}
        suppliers={suppliers}
        categories={categories}
      />

      {/* Stock Movement Modal */}
      <StockMovementModal
        isOpen={showMovementModal}
        onClose={() => {
          setShowMovementModal(false);
          setSelectedItem(undefined);
        }}
        onSave={handleAddMovement}
        item={selectedItem || null}
        movementType={movementType}
      />
    </div>
  );
};

export default InventoryPage;