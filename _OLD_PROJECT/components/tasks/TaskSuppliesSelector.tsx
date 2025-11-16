// components/tasks/TaskSuppliesSelector.tsx
import React, { useState, useEffect } from 'react';
import { 
  TaskTypeSupplyTemplate, 
  Supply, 
  CreateTaskSupplyUsedData 
} from '../../types';
import { 
  getTaskTypeSupplyTemplates, 
  validateSupplyAvailability,
  suggestAlternativeSupplies 
} from '../../services/taskSupplyIntegrationService';
import { useSupplies } from '../../hooks/useSupplies';
import {
  Package,
  Plus,
  Minus,
  AlertTriangle,
  Check,
  X,
  Search,
  Info
} from 'lucide-react';

interface TaskSuppliesSelectorProps {
  taskType: string;
  taskId?: string;
  patientId?: string;
  onSuppliesChange: (supplies: CreateTaskSupplyUsedData[]) => void;
  onCostChange?: (totalCost: number) => void;
  readOnly?: boolean;
}

interface SupplySelection extends CreateTaskSupplyUsedData {
  supply?: Supply;
  hasError?: boolean;
  errorMessage?: string;
  alternatives?: Supply[];
}

const TaskSuppliesSelector: React.FC<TaskSuppliesSelectorProps> = ({
  taskType,
  taskId,
  patientId,
  onSuppliesChange,
  onCostChange,
  readOnly = false
}) => {
  const [selectedSupplies, setSelectedSupplies] = useState<SupplySelection[]>([]);
  const [templates, setTemplates] = useState<TaskTypeSupplyTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [showAddSupply, setShowAddSupply] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { supplies, loading: loadingSupplies } = useSupplies();

  // Carregar templates ao montar ou quando o tipo de tarefa mudar
  useEffect(() => {
    const loadTemplates = async () => {
      if (!taskType) return;
      
      setLoadingTemplates(true);
      try {
        const data = await getTaskTypeSupplyTemplates(taskType);
        setTemplates(data);
        
        // Inicializar seleção baseada nos templates
        if (data.length > 0) {
          const initialSelection: SupplySelection[] = data.map(template => ({
            taskId: taskId || '',
            supplyId: template.supplyId,
            supply: template.supply,
            quantityUsed: template.defaultQuantity,
            unitCost: template.supply?.unitCost,
            patientId,
            notes: template.notes
          }));
          
          setSelectedSupplies(initialSelection);
          validateAndUpdateSupplies(initialSelection);
        }
      } catch (error) {
        console.error('Erro ao carregar templates:', error);
      } finally {
        setLoadingTemplates(false);
      }
    };

    loadTemplates();
  }, [taskType, taskId, patientId]);

  // Validar e atualizar insumos selecionados
  const validateAndUpdateSupplies = async (supplies: SupplySelection[]) => {
    const suppliesForValidation = supplies.map(s => ({
      supplyId: s.supplyId,
      quantity: s.quantityUsed
    }));

    try {
      const validation = await validateSupplyAvailability(suppliesForValidation);
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        
        // Marcar insumos com erro e buscar alternativas
        const updatedSupplies = await Promise.all(
          supplies.map(async (supply) => {
            const hasError = validation.errors.some(e => e.includes(supply.supply?.name || ''));
            
            if (hasError) {
              const alternatives = await suggestAlternativeSupplies(supply.supplyId);
              return { ...supply, hasError: true, alternatives };
            }
            
            return { ...supply, hasError: false };
          })
        );
        
        setSelectedSupplies(updatedSupplies);
      } else {
        setValidationErrors([]);
        setSelectedSupplies(supplies.map(s => ({ ...s, hasError: false })));
      }
    } catch (error) {
      console.error('Erro na validação:', error);
    }

    // Calcular custo total
    const totalCost = supplies.reduce((sum, item) => {
      const cost = (item.unitCost || 0) * item.quantityUsed;
      return sum + cost;
    }, 0);

    onCostChange?.(totalCost);
    onSuppliesChange(supplies.map(({ supply, hasError, errorMessage, alternatives, ...data }) => data));
  };

  // Adicionar novo insumo
  const handleAddSupply = (supply: Supply) => {
    const exists = selectedSupplies.find(s => s.supplyId === supply.id);
    if (exists) return;

    const newSelection: SupplySelection = {
      taskId: taskId || '',
      supplyId: supply.id,
      supply,
      quantityUsed: 1,
      unitCost: supply.unitCost,
      patientId
    };

    const updatedSupplies = [...selectedSupplies, newSelection];
    setSelectedSupplies(updatedSupplies);
    validateAndUpdateSupplies(updatedSupplies);
    setShowAddSupply(false);
    setSearchTerm('');
  };

  // Remover insumo
  const handleRemoveSupply = (supplyId: string) => {
    const updatedSupplies = selectedSupplies.filter(s => s.supplyId !== supplyId);
    setSelectedSupplies(updatedSupplies);
    validateAndUpdateSupplies(updatedSupplies);
  };

  // Atualizar quantidade
  const handleQuantityChange = (supplyId: string, delta: number) => {
    const updatedSupplies = selectedSupplies.map(s => {
      if (s.supplyId === supplyId) {
        const newQuantity = Math.max(1, s.quantityUsed + delta);
        return { ...s, quantityUsed: newQuantity };
      }
      return s;
    });

    setSelectedSupplies(updatedSupplies);
    validateAndUpdateSupplies(updatedSupplies);
  };

  // Substituir por alternativa
  const handleReplaceWithAlternative = (originalId: string, alternative: Supply) => {
    const updatedSupplies = selectedSupplies.map(s => {
      if (s.supplyId === originalId) {
        return {
          ...s,
          supplyId: alternative.id,
          supply: alternative,
          unitCost: alternative.unitCost,
          hasError: false,
          alternatives: undefined
        };
      }
      return s;
    });

    setSelectedSupplies(updatedSupplies);
    validateAndUpdateSupplies(updatedSupplies);
  };

  // Filtrar insumos disponíveis para adicionar
  const availableSupplies = supplies.filter(supply => {
    const isSelected = selectedSupplies.some(s => s.supplyId === supply.id);
    const matchesSearch = supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supply.category.toLowerCase().includes(searchTerm.toLowerCase());
    return !isSelected && matchesSearch && supply.isActive;
  });

  // Calcular custo total
  const totalCost = selectedSupplies.reduce((sum, item) => {
    const cost = (item.unitCost || 0) * item.quantityUsed;
    return sum + cost;
  }, 0);

  if (loadingTemplates || loadingSupplies) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Package className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Insumos Utilizados</h3>
        </div>
        
        {!readOnly && (
          <button
            onClick={() => setShowAddSupply(!showAddSupply)}
            className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Insumo
          </button>
        )}
      </div>

      {/* Alertas de validação */}
      {validationErrors.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Atenção: Verificar disponibilidade</p>
              <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modal de adicionar insumo */}
      {showAddSupply && !readOnly && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar insumo..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto space-y-2">
            {availableSupplies.map(supply => (
              <button
                key={supply.id}
                onClick={() => handleAddSupply(supply)}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{supply.name}</p>
                    <p className="text-xs text-gray-500">
                      {supply.category} • Estoque: {supply.currentStock} {supply.unitOfMeasure}
                    </p>
                  </div>
                  <Plus className="h-4 w-4 text-gray-400" />
                </div>
              </button>
            ))}
            
            {availableSupplies.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhum insumo disponível
              </p>
            )}
          </div>
        </div>
      )}

      {/* Lista de insumos selecionados */}
      <div className="space-y-2">
        {selectedSupplies.map((item) => (
          <div
            key={item.supplyId}
            className={`p-4 bg-white border rounded-lg ${
              item.hasError ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-900">
                    {item.supply?.name || 'Insumo não encontrado'}
                  </p>
                  {item.hasError && (
                    <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                      Estoque baixo
                    </span>
                  )}
                  {templates.find(t => t.supplyId === item.supplyId)?.isRequired && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Obrigatório
                    </span>
                  )}
                </div>
                
                <div className="mt-1 flex items-center text-xs text-gray-500">
                  <span>{item.supply?.category}</span>
                  <span className="mx-2">•</span>
                  <span>Estoque: {item.supply?.currentStock} {item.supply?.unitOfMeasure}</span>
                  {item.unitCost && (
                    <>
                      <span className="mx-2">•</span>
                      <span>Custo unit.: R$ {item.unitCost.toFixed(2)}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Controle de quantidade */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(item.supplyId, -1)}
                    disabled={readOnly || item.quantityUsed <= 1}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-4 w-4 text-gray-600" />
                  </button>
                  
                  <span className="text-sm font-medium text-gray-900 w-12 text-center">
                    {item.quantityUsed}
                  </span>
                  
                  <button
                    onClick={() => handleQuantityChange(item.supplyId, 1)}
                    disabled={readOnly}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                {/* Custo total do item */}
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    R$ {((item.unitCost || 0) * item.quantityUsed).toFixed(2)}
                  </p>
                </div>

                {/* Botão remover */}
                {!readOnly && (
                  <button
                    onClick={() => handleRemoveSupply(item.supplyId)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Alternativas sugeridas */}
            {item.hasError && item.alternatives && item.alternatives.length > 0 && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-orange-200">
                <p className="text-xs font-medium text-orange-800 mb-2">
                  Alternativas disponíveis:
                </p>
                <div className="space-y-1">
                  {item.alternatives.slice(0, 3).map(alt => (
                    <button
                      key={alt.id}
                      onClick={() => handleReplaceWithAlternative(item.supplyId, alt)}
                      disabled={readOnly}
                      className="w-full text-left p-2 text-xs bg-orange-50 hover:bg-orange-100 rounded transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{alt.name}</span>
                        <span className="text-orange-600">
                          Estoque: {alt.currentStock} • Substituir →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {selectedSupplies.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Nenhum insumo selecionado</p>
            {templates.length === 0 && (
              <p className="text-gray-400 text-xs mt-1">
                Não há template configurado para este tipo de tarefa
              </p>
            )}
          </div>
        )}
      </div>

      {/* Resumo de custo */}
      {selectedSupplies.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Info className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Custo Total dos Insumos</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              R$ {totalCost.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskSuppliesSelector;