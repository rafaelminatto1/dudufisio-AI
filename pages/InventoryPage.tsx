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
import { InventoryItem, MovementType } from '../types';
import ItemFormModal from '../components/inventory/ItemFormModal';
import StockMovementModal from '../components/inventory/StockMovementModal';

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
  const { alerts, unreadAlertsCount } = useInventoryAlerts();
  const { lowStockItems } = useLowStockItems();
  const { expiringItems } = useExpiringItems();

  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'movements' | 'alerts'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>(undefined);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementType, setMovementType] = useState<MovementType>(MovementType.In);

  const filteredItems = React.useMemo(() => {
    let result = searchQuery ? searchItems(searchQuery) : items;
    if (selectedCategory) {
      result = result.filter(item => item.categoryId === selectedCategory);
    }
    return result;
  }, [items, searchQuery, selectedCategory, searchItems]);

  const handleAddMovement = useCallback(async (
    itemId: string,
    type: MovementType,
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

  const openMovementModal = useCallback((item: InventoryItem, type: MovementType) => {
    setSelectedItem(item);
    setMovementType(type);
    setShowMovementModal(true);
  }, []);

  const MetricCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }: any) => (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-slate-900">
                Alertas Críticos ({unreadAlertsCount})
              </h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-red-900">{alert.message}</p>
                    <p className="text-sm text-red-700">{alert.itemName}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Estoque Baixo</h3>
          </div>
          <div className="p-6">
            {lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-600">
                        Estoque: {item.currentStock} | Mínimo: {item.minStock}
                      </p>
                    </div>
                    <button
                      onClick={() => openMovementModal(item, MovementType.In as any)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                      Repor
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">Nenhum item com estoque baixo</p>
            )}
          </div>
        </div>

        {/* Expiring Items */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Próximos ao Vencimento</h3>
          </div>
          <div className="p-6">
            {expiringItems.length > 0 ? (
              <div className="space-y-3">
                {expiringItems.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-600">
                        Vence em: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('pt-BR') : 'N/A'}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      Atenção
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">Nenhum item próximo ao vencimento</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const ItemsTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar itens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Item
          </button>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 font-medium text-slate-700">Item</th>
                <th className="text-left p-4 font-medium text-slate-700">Categoria</th>
                <th className="text-left p-4 font-medium text-slate-700">Estoque</th>
                <th className="text-left p-4 font-medium text-slate-700">Valor Unit.</th>
                <th className="text-left p-4 font-medium text-slate-700">Status</th>
                <th className="text-left p-4 font-medium text-slate-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item: any) => {
                const category = categories.find(c => c.id === item.categoryId);
                const isLowStock = item.currentStock <= item.minStock;
                const isExpiring = item.expiryDate && new Date(item.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                return (
                  <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-600">{item.description}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{category?.name || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-slate-900'}`}>
                        {item.currentStock}
                      </span>
                      <span className="text-slate-500 ml-1">/ {item.minStock} mín</span>
                    </td>
                    <td className="p-4 text-slate-600">
                      R$ {(item.unitPrice || 0).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {isLowStock && (
                          <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            Estoque Baixo
                          </span>
                        )}
                        {isExpiring && (
                          <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            Vencendo
                          </span>
                        )}
                        {!isLowStock && !isExpiring && (
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Normal
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openMovementModal(item, MovementType.In as any)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title="Entrada de estoque"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openMovementModal(item, MovementType.Out as any)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Saída de estoque"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowCreateModal(true);
                          }}
                          className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Inventário</h1>
          <p className="text-slate-600 mt-1">Controle completo do estoque da clínica</p>
        </div>
        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
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
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {badge && badge > 0 && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
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
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">Histórico de movimentações será implementado em breve</p>
        </div>
      )}
      {activeTab === 'alerts' && (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">Central de alertas será implementada em breve</p>
        </div>
      )}

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
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