// pages/SuppliesPage.tsx
import React, { useState } from 'react';
import { Supply } from '../types';
import SuppliesDashboard from '../components/supplies/SuppliesDashboard';
import SuppliesList from '../components/supplies/SuppliesList';
import SupplyForm from '../components/supplies/SupplyForm';
import { useSupplies } from '../hooks/useSupplies';

type ViewMode = 'dashboard' | 'list' | 'add' | 'edit' | 'view';

const SuppliesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  
  const { addSupply, editSupply } = useSupplies();

  const handleAddSupply = () => {
    setSelectedSupply(null);
    setViewMode('add');
  };

  const handleEditSupply = (supply: Supply) => {
    setSelectedSupply(supply);
    setViewMode('edit');
  };

  const handleViewSupply = (supply: Supply) => {
    setSelectedSupply(supply);
    setViewMode('view');
  };

  const handleDeleteSupply = (supply: Supply) => {
    
    // Implementar lógica de exclusão
  };

  const handleSaveSupply = async (data: any) => {
    setIsFormLoading(true);
    try {
      if (selectedSupply) {
        await editSupply(selectedSupply.id, data);
      } else {
        await addSupply(data);
      }
      setViewMode('dashboard');
      setSelectedSupply(null);
    } catch (error) {
      console.error('Erro ao salvar insumo:', error);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setViewMode('dashboard');
    setSelectedSupply(null);
  };

  const handleNavigateToSupplies = () => {
    setViewMode('list');
  };

  const handleNavigateToAlerts = () => {
    // Implementar navegação para alertas
    
  };

  const handleNavigateToOrders = () => {
    // Implementar navegação para pedidos
    
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'dashboard':
        return (
          <SuppliesDashboard
            onNavigateToSupplies={handleNavigateToSupplies}
            onNavigateToAlerts={handleNavigateToAlerts}
            onNavigateToOrders={handleNavigateToOrders}
          />
        );
      
      case 'list':
        return (
          <SuppliesList
            onAddSupply={handleAddSupply}
            onEditSupply={handleEditSupply}
            onViewSupply={handleViewSupply}
            onDeleteSupply={handleDeleteSupply}
          />
        );
      
      case 'add':
      case 'edit':
        return (
          <SupplyForm
            supply={selectedSupply || undefined}
            onSave={handleSaveSupply}
            onCancel={handleCancelForm}
            isLoading={isFormLoading}
          />
        );
      
      case 'view':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedSupply?.name}</h1>
                  <p className="text-gray-600">{selectedSupply?.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('edit')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setViewMode('dashboard')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Voltar
                  </button>
                </div>
              </div>
              
              {selectedSupply && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Categoria:</span>
                        <p className="text-gray-900">{selectedSupply.category}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Marca:</span>
                        <p className="text-gray-900">{selectedSupply.brand || '-'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Modelo:</span>
                        <p className="text-gray-900">{selectedSupply.model || '-'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Código de Barras:</span>
                        <p className="text-gray-900">{selectedSupply.barcode || '-'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Estoque</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Estoque Atual:</span>
                        <p className="text-gray-900">{selectedSupply.currentStock} {selectedSupply.unitOfMeasure}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Estoque Mínimo:</span>
                        <p className="text-gray-900">{selectedSupply.minimumStock} {selectedSupply.unitOfMeasure}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Estoque Máximo:</span>
                        <p className="text-gray-900">{selectedSupply.maximumStock || '-'} {selectedSupply.maximumStock ? selectedSupply.unitOfMeasure : ''}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Local de Armazenamento:</span>
                        <p className="text-gray-900">{selectedSupply.storageLocation || '-'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Informações Financeiras</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Custo Unitário:</span>
                        <p className="text-gray-900">
                          {selectedSupply.unitCost 
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedSupply.unitCost)
                            : '-'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Valor Total do Estoque:</span>
                        <p className="text-gray-900">
                          {selectedSupply.unitCost 
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedSupply.currentStock * selectedSupply.unitCost)
                            : '-'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Fornecedor:</span>
                        <p className="text-gray-900">{selectedSupply.supplier?.name || '-'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Data de Vencimento:</span>
                        <p className="text-gray-900">
                          {selectedSupply.expirationDate 
                            ? new Date(selectedSupply.expirationDate).toLocaleDateString('pt-BR')
                            : '-'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode('dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Lista de Insumos
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAddSupply}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Insumo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default SuppliesPage;
