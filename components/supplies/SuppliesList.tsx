// components/supplies/SuppliesList.tsx
import React, { useState } from 'react';
import { useSupplies } from '../../hooks/useSupplies';
import { Supply, SupplyFilters, SupplyCategory } from '../../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  AlertTriangle,
  Calendar,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal
} from 'lucide-react';

interface SuppliesListProps {
  onAddSupply?: () => void;
  onEditSupply?: (supply: Supply) => void;
  onViewSupply?: (supply: Supply) => void;
  onDeleteSupply?: (supply: Supply) => void;
}

const SuppliesList: React.FC<SuppliesListProps> = ({
  onAddSupply,
  onEditSupply,
  onViewSupply,
  onDeleteSupply
}) => {
  const [filters, setFilters] = useState<SupplyFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { supplies, loading, error, removeSupply } = useSupplies(filters);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters(prev => ({
      ...prev,
      search: term || undefined
    }));
  };

  const handleCategoryFilter = (category: SupplyCategory | '') => {
    setFilters(prev => ({
      ...prev,
      category: category || undefined
    }));
  };

  const handleStockFilter = (lowStock: boolean) => {
    setFilters(prev => ({
      ...prev,
      lowStock: lowStock || undefined
    }));
  };

  const handleExpiringFilter = (expiring: boolean) => {
    setFilters(prev => ({
      ...prev,
      expiring: expiring || undefined
    }));
  };

  const handleDeleteSupply = async (supply: Supply) => {
    if (window.confirm(`Tem certeza que deseja excluir o insumo "${supply.name}"?`)) {
      try {
        await removeSupply(supply.id);
        if (onDeleteSupply) {
          onDeleteSupply(supply);
        }
      } catch (error) {
        console.error('Erro ao excluir insumo:', error);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCategoryLabel = (category: SupplyCategory) => {
    const labels = {
      equipamentos: 'Equipamentos',
      materiais_descartaveis: 'Materiais Descartáveis',
      medicamentos_topicos: 'Medicamentos Tópicos',
      materiais_limpeza: 'Materiais de Limpeza',
      materiais_escritorio: 'Materiais de Escritório',
      equipamentos_protecao: 'Equipamentos de Proteção'
    };
    return labels[category] || category;
  };

  const getStockStatus = (supply: Supply) => {
    if (supply.currentStock === 0) {
      return { label: 'Sem estoque', color: 'text-red-600 bg-red-100' };
    } else if (supply.currentStock <= supply.minimumStock) {
      return { label: 'Estoque baixo', color: 'text-orange-600 bg-orange-100' };
    } else {
      return { label: 'Normal', color: 'text-green-600 bg-green-100' };
    }
  };

  const getExpirationStatus = (supply: Supply) => {
    if (!supply.expirationDate) return null;
    
    const expDate = new Date(supply.expirationDate);
    const today = new Date();
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { label: 'Vencido', color: 'text-red-600 bg-red-100' };
    } else if (diffDays <= 30) {
      return { label: `Vence em ${diffDays} dias`, color: 'text-orange-600 bg-orange-100' };
    } else {
      return null;
    }
  };

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
        <p className="text-red-700">Erro ao carregar insumos: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Insumos</h2>
          <p className="text-gray-600">Gerencie seu estoque de insumos</p>
        </div>
        
        <button
          onClick={onAddSupply}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Insumo
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar insumos..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtros Avançados */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </button>
          </div>
        </div>

        {/* Filtros Expandidos */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  onChange={(e) => handleCategoryFilter(e.target.value as SupplyCategory | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas as categorias</option>
                  <option value="equipamentos">Equipamentos</option>
                  <option value="materiais_descartaveis">Materiais Descartáveis</option>
                  <option value="medicamentos_topicos">Medicamentos Tópicos</option>
                  <option value="materiais_limpeza">Materiais de Limpeza</option>
                  <option value="materiais_escritorio">Materiais de Escritório</option>
                  <option value="equipamentos_protecao">Equipamentos de Proteção</option>
                </select>
              </div>

              {/* Status do Estoque */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status do Estoque
                </label>
                <select
                  onChange={(e) => handleStockFilter(e.target.value === 'low')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="normal">Estoque Normal</option>
                  <option value="low">Estoque Baixo</option>
                </select>
              </div>

              {/* Vencimento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vencimento
                </label>
                <select
                  onChange={(e) => handleExpiringFilter(e.target.value === 'expiring')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="normal">Normal</option>
                  <option value="expiring">Próximos ao Vencimento</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Insumos */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {supplies.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum insumo encontrado</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filters.category || filters.lowStock || filters.expiring
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando seu primeiro insumo'
              }
            </p>
            {!searchTerm && !filters.category && !filters.lowStock && !filters.expiring && (
              <button
                onClick={onAddSupply}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Adicionar Primeiro Insumo
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Insumo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Unit.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {supplies.map((supply) => {
                  const stockStatus = getStockStatus(supply);
                  const expStatus = getExpirationStatus(supply);
                  
                  return (
                    <tr key={supply.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{supply.name}</div>
                          {supply.description && (
                            <div className="text-sm text-gray-500">{supply.description}</div>
                          )}
                          {supply.brand && (
                            <div className="text-xs text-gray-400">Marca: {supply.brand}</div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getCategoryLabel(supply.category)}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {supply.currentStock} {supply.unitOfMeasure}
                        </div>
                        <div className="text-xs text-gray-500">
                          Mín: {supply.minimumStock}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {supply.unitCost ? formatCurrency(supply.unitCost) : '-'}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                          {expStatus && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${expStatus.color}`}>
                              <Calendar className="h-3 w-3 mr-1" />
                              {expStatus.label}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onViewSupply?.(supply)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => onEditSupply?.(supply)}
                            className="text-gray-400 hover:text-blue-600"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteSupply(supply)}
                            className="text-gray-400 hover:text-red-600"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resumo */}
      {supplies.length > 0 && (
        <div className="bg-gray-50 px-6 py-3 rounded-lg">
          <p className="text-sm text-gray-600">
            Mostrando {supplies.length} insumo(s)
            {filters.category && ` na categoria ${getCategoryLabel(filters.category)}`}
            {filters.lowStock && ' com estoque baixo'}
            {filters.expiring && ' próximos ao vencimento'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SuppliesList;
