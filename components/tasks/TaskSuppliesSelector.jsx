// components/tasks/TaskSuppliesSelector.tsx
import React, { useState, useEffect } from 'react';
import { useSupplies } from '../../hooks/useSupplies';
import { getTaskTypeSupplyTemplates, validateSupplyAvailability, TASK_SUPPLY_TEMPLATES } from '../../services/taskSupplyService';
import { Package, Plus, AlertTriangle, CheckCircle, X, Search, Info } from 'lucide-react';
const TaskSuppliesSelector = ({ taskId, taskType, patientId, onSuppliesChange, onCostChange, initialSupplies = [], readOnly = false }) => {
    const { supplies } = useSupplies({ isActive: true });
    const [selectedSupplies, setSelectedSupplies] = useState([]);
    const [suggestedSupplies, setSuggestedSupplies] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    // Carregar sugestões baseadas no tipo de tarefa
    useEffect(() => {
        if (taskType && supplies.length > 0) {
            loadSuggestedSupplies();
        }
    }, [taskType, supplies]);
    // Inicializar com insumos existentes
    useEffect(() => {
        if (initialSupplies.length > 0) {
            const supplyItems = initialSupplies.map(item => ({
                supplyId: item.supplyId,
                supply: item.supply,
                quantity: item.quantityUsed,
                unitCost: item.unitCost,
                totalCost: item.totalCost || 0,
                batchNumber: item.batchNumber,
                expirationDate: item.expirationDate,
                isFromTemplate: false,
                isRequired: false
            }));
            setSelectedSupplies(supplyItems);
        }
    }, [initialSupplies]);
    const loadSuggestedSupplies = async () => {
        if (!taskType)
            return;
        try {
            // Buscar templates do banco
            const templates = await getTaskTypeSupplyTemplates(taskType);
            // Mapear para supplies
            const suggested = templates.map(template => template.supply).filter(Boolean);
            // Adicionar sugestões dos templates pré-definidos
            const predefinedTemplate = TASK_SUPPLY_TEMPLATES[taskType];
            if (predefinedTemplate) {
                predefinedTemplate.forEach(item => {
                    const supply = supplies.find(s => s.name.toLowerCase().includes(item.supply.toLowerCase()));
                    if (supply && !suggested.find(s => s.id === supply.id)) {
                        suggested.push(supply);
                    }
                });
            }
            setSuggestedSupplies(suggested);
        }
        catch (error) {
            console.error('Erro ao carregar sugestões:', error);
        }
    };
    const handleAddSupply = (supply) => {
        const existingIndex = selectedSupplies.findIndex(item => item.supplyId === supply.id);
        if (existingIndex >= 0) {
            // Incrementar quantidade se já existir
            updateSupplyQuantity(supply.id, selectedSupplies[existingIndex].quantity + 1);
        }
        else {
            // Adicionar novo insumo
            const newSupply = {
                supplyId: supply.id,
                supply,
                quantity: 1,
                unitCost: supply.unitCost,
                totalCost: supply.unitCost || 0,
                isFromTemplate: suggestedSupplies.some(s => s.id === supply.id),
                isRequired: false
            };
            setSelectedSupplies(prev => [...prev, newSupply]);
        }
        setShowAddModal(false);
        setSearchTerm('');
    };
    const updateSupplyQuantity = (supplyId, quantity) => {
        if (quantity <= 0) {
            removeSupply(supplyId);
            return;
        }
        setSelectedSupplies(prev => prev.map(item => {
            if (item.supplyId === supplyId) {
                const updatedItem = {
                    ...item,
                    quantity,
                    totalCost: quantity * (item.unitCost || 0)
                };
                // Validar disponibilidade
                validateSupplyAvailability(supplyId, quantity).then(validation => {
                    if (!validation.available) {
                        setValidationErrors(prev => ({
                            ...prev,
                            [supplyId]: validation.message
                        }));
                    }
                    else {
                        setValidationErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors[supplyId];
                            return newErrors;
                        });
                    }
                });
                return updatedItem;
            }
            return item;
        }));
    };
    const updateSupplyCost = (supplyId, unitCost) => {
        setSelectedSupplies(prev => prev.map(item => {
            if (item.supplyId === supplyId) {
                return {
                    ...item,
                    unitCost,
                    totalCost: item.quantity * unitCost
                };
            }
            return item;
        }));
    };
    const removeSupply = (supplyId) => {
        setSelectedSupplies(prev => prev.filter(item => item.supplyId !== supplyId));
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[supplyId];
            return newErrors;
        });
    };
    const getTotalCost = () => {
        return selectedSupplies.reduce((total, item) => total + item.totalCost, 0);
    };
    const filteredSupplies = supplies.filter(supply => supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supply.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supply.brand?.toLowerCase().includes(searchTerm.toLowerCase()));
    // Notificar mudanças
    useEffect(() => {
        const taskSupplies = selectedSupplies.map(item => ({
            id: '', // Será preenchido quando salvar
            taskId: taskId || '',
            supplyId: item.supplyId,
            supply: item.supply,
            quantityUsed: item.quantity,
            unitCost: item.unitCost,
            totalCost: item.totalCost,
            patientId,
            usageDate: new Date().toISOString(),
            batchNumber: item.batchNumber,
            expirationDate: item.expirationDate,
            createdAt: new Date().toISOString()
        }));
        onSuppliesChange?.(taskSupplies);
        onCostChange?.(getTotalCost());
    }, [selectedSupplies, taskId, patientId, onSuppliesChange, onCostChange]);
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    return (<div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Insumos Utilizados</h3>
          <p className="text-sm text-gray-600">
            {selectedSupplies.length} insumo(s) selecionado(s) • Total: {formatCurrency(getTotalCost())}
          </p>
        </div>
        
        {!readOnly && (<button onClick={() => setShowAddModal(true)} className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2"/>
            Adicionar Insumo
          </button>)}
      </div>

      {/* Sugestões baseadas no tipo de tarefa */}
      {suggestedSupplies.length > 0 && selectedSupplies.length === 0 && !readOnly && (<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Info className="h-5 w-5 text-blue-600 mr-2"/>
            <h4 className="text-sm font-medium text-blue-900">
              Insumos sugeridos para {taskType}
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedSupplies.map(supply => (<button key={supply.id} onClick={() => handleAddSupply(supply)} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors">
                <Package className="h-3 w-3 mr-1"/>
                {supply.name}
              </button>))}
          </div>
        </div>)}

      {/* Lista de insumos selecionados */}
      {selectedSupplies.length > 0 ? (<div className="space-y-3">
          {selectedSupplies.map(item => (<div key={item.supplyId} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 text-gray-400 mr-2"/>
                    <h4 className="text-sm font-medium text-gray-900">{item.supply.name}</h4>
                    {item.isFromTemplate && (<span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Sugerido
                      </span>)}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    {item.supply.brand && `${item.supply.brand} • `}
                    {item.supply.unitOfMeasure}
                  </p>

                  {validationErrors[item.supplyId] && (<div className="flex items-center mt-2 text-sm text-red-600">
                      <AlertTriangle className="h-4 w-4 mr-1"/>
                      {validationErrors[item.supplyId]}
                    </div>)}
                </div>

                {!readOnly && (<button onClick={() => removeSupply(item.supplyId)} className="text-gray-400 hover:text-red-600 ml-2">
                    <X className="h-4 w-4"/>
                  </button>)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* Quantidade */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Quantidade
                  </label>
                  {readOnly ? (<p className="text-sm text-gray-900">{item.quantity}</p>) : (<input type="number" min="1" value={item.quantity} onChange={(e) => updateSupplyQuantity(item.supplyId, parseInt(e.target.value) || 1)} className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"/>)}
                </div>

                {/* Custo Unitário */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Custo Unitário
                  </label>
                  {readOnly ? (<p className="text-sm text-gray-900">
                      {item.unitCost ? formatCurrency(item.unitCost) : '-'}
                    </p>) : (<input type="number" min="0" step="0.01" value={item.unitCost || ''} onChange={(e) => updateSupplyCost(item.supplyId, parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"/>)}
                </div>

                {/* Total */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Total
                  </label>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.totalCost)}
                  </p>
                </div>
              </div>
            </div>))}
        </div>) : (<div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Nenhum insumo selecionado</h3>
          <p className="text-sm text-gray-500 mb-4">
            {taskType
                ? 'Use as sugestões acima ou adicione insumos manualmente'
                : 'Adicione insumos utilizados nesta tarefa'}
          </p>
          {!readOnly && (<button onClick={() => setShowAddModal(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2"/>
              Adicionar Insumo
            </button>)}
        </div>)}

      {/* Modal para adicionar insumos */}
      {showAddModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Adicionar Insumo</h3>
              <button onClick={() => {
                setShowAddModal(false);
                setSearchTerm('');
            }} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6"/>
              </button>
            </div>

            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                <input type="text" placeholder="Buscar insumos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredSupplies.map(supply => (<button key={supply.id} onClick={() => handleAddSupply(supply)} className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{supply.name}</h4>
                        <p className="text-xs text-gray-500">
                          {supply.brand && `${supply.brand} • `}
                          Estoque: {supply.currentStock} {supply.unitOfMeasure}
                          {supply.unitCost && ` • ${formatCurrency(supply.unitCost)}`}
                        </p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500"/>
                    </div>
                  </button>))}
              </div>
            </div>
          </div>
        </div>)}
    </div>);
};
export default TaskSuppliesSelector;
