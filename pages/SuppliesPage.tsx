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
            <div className="bg-white rounded-lg shadow-card border p-lg">
              <div className="flex items-center justify-between mb-xl">
                <div>
                  <h1 className="text-2xl font-bold text-neutral-text">{selectedSupply?.name}</h1>
                  <p className="text-neutral-textSecondary">{selectedSupply?.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('edit')}
                    className="px-md py-sm bg-primary text-white rounded-lg hover:bg-primary-hover"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setViewMode('dashboard')}
                    className="px-md py-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-neutral-bgAlt"
                  >
                    Voltar
                  </button>
                </div>
              </div>
              
              {selectedSupply && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                  <div className="space-y-md">
                    <h3 className="text-lg font-semibold text-neutral-text">Informações Básicas</h3>
                    <div className="space-y-sm">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Categoria:</span>
                        <p className="text-neutral-text">{selectedSupply.category}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Marca:</span>
                        <p className="text-neutral-text">{selectedSupply.brand || '-'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Modelo:</span>
                        <p className="text-neutral-text">{selectedSupply.model || '-'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Código de Barras:</span>
                        <p className="text-neutral-text">{selectedSupply.barcode || '-'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-md">
                    <h3 className="text-lg font-semibold text-neutral-text">Estoque</h3>
                    <div className="space-y-sm">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Estoque Atual:</span>
                        <p className="text-neutral-text">{selectedSupply.currentStock} {selectedSupply.unitOfMeasure}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Estoque Mínimo:</span>
                        <p className="text-neutral-text">{selectedSupply.minimumStock} {selectedSupply.unitOfMeasure}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Estoque Máximo:</span>
                        <p className="text-neutral-text">{selectedSupply.maximumStock || '-'} {selectedSupply.maximumStock ? selectedSupply.unitOfMeasure : ''}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Local de Armazenamento:</span>
                        <p className="text-neutral-text">{selectedSupply.storageLocation || '-'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-md">
                    <h3 className="text-lg font-semibold text-neutral-text">Informações Financeiras</h3>
                    <div className="space-y-sm">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Custo Unitário:</span>
                        <p className="text-neutral-text">
                          {selectedSupply.unitCost 
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedSupply.unitCost)
                            : '-'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Valor Total do Estoque:</span>
                        <p className="text-neutral-text">
                          {selectedSupply.unitCost 
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedSupply.currentStock * selectedSupply.unitCost)
                            : '-'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Fornecedor:</span>
                        <p className="text-neutral-text">{selectedSupply.supplier?.name || '-'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Data de Vencimento:</span>
                        <p className="text-neutral-text">
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
    <div className="min-h-screen bg-neutral-bgAlt">
      {/* Header */}
      <div className="bg-white border-b border-neutral-border">
        <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode('dashboard')}
                className={`px-md py-sm rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'dashboard'
                    ? 'bg-primary-light text-primary'
                    : 'text-neutral-textSecondary hover:text-neutral-text hover:bg-neutral-bgDark'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-md py-sm rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-light text-primary'
                    : 'text-neutral-textSecondary hover:text-neutral-text hover:bg-neutral-bgDark'
                }`}
              >
                Lista de Insumos
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAddSupply}
                className="inline-flex items-center px-md py-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                <svg className="h-4 w-4 mr-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Insumo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl py-3xl">
        {renderContent()}
      </div>
    </div>
  );
};

export default SuppliesPage;
