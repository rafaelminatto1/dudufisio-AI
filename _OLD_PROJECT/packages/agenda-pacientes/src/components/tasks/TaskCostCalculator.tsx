// components/tasks/TaskCostCalculator.tsx
import React, { useEffect, useState } from 'react';
import { TaskSupplyUsed } from '../../types';
import { DollarSign, Calculator, TrendingUp, Package } from 'lucide-react';

interface TaskCostCalculatorProps {
  taskId: string;
  taskSupplies?: TaskSupplyUsed[];
  showDetails?: boolean;
  compact?: boolean;
}

const TaskCostCalculator: React.FC<TaskCostCalculatorProps> = ({
  taskId,
  taskSupplies = [],
  showDetails = true,
  compact = false
}) => {
  const { taskCost, loading, error, calculateCost } = useTaskCost(taskId);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calcular custo baseado nos insumos fornecidos
  const calculateSuppliesCost = () => {
    return taskSupplies.reduce((total, supply) => total + (supply.totalCost || 0), 0);
  };

  const handleRecalculate = async () => {
    setIsCalculating(true);
    try {
      await calculateCost();
    } catch (error) {
      console.error('Erro ao recalcular custo:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const supplyCost = calculateSuppliesCost();
  const laborCost = taskCost?.laborCost || 0;
  const overheadCost = taskCost?.overheadCost || 0;
  const totalCost = taskCost?.totalCost || supplyCost + laborCost + overheadCost;

  if (compact) {
    return (
      <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
        <DollarSign className="h-4 w-4 mr-1" />
        {formatCurrency(totalCost)}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <p className="text-red-700 text-sm">Erro ao carregar custos: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Calculator className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Custo da Tarefa</h3>
        </div>
        
        <button
          onClick={handleRecalculate}
          disabled={isCalculating}
          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 text-sm"
        >
          {isCalculating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Calculando...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4 mr-2" />
              Recalcular
            </>
          )}
        </button>
      </div>

      {/* Resumo dos Custos */}
      <div className="space-y-3">
        {/* Custo dos Insumos */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <Package className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">Insumos</span>
          </div>
          <span className="text-sm font-semibold text-blue-900">
            {formatCurrency(supplyCost)}
          </span>
        </div>

        {/* Custo de Mão de Obra */}
        {laborCost > 0 && (
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-900">Mão de Obra</span>
            </div>
            <span className="text-sm font-semibold text-green-900">
              {formatCurrency(laborCost)}
            </span>
          </div>
        )}

        {/* Custos Indiretos */}
        {overheadCost > 0 && (
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-900">Custos Indiretos</span>
            </div>
            <span className="text-sm font-semibold text-yellow-900">
              {formatCurrency(overheadCost)}
            </span>
          </div>
        )}

        {/* Total */}
        <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border-t-2 border-gray-300">
          <div className="flex items-center">
            <Calculator className="h-5 w-5 text-gray-700 mr-2" />
            <span className="text-base font-semibold text-gray-900">Total</span>
          </div>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(totalCost)}
          </span>
        </div>
      </div>

      {/* Detalhes dos Insumos */}
      {showDetails && taskSupplies.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Detalhamento dos Insumos</h4>
          <div className="space-y-2">
            {taskSupplies.map((supply) => (
              <div key={supply.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{supply.supply?.name}</p>
                  <p className="text-xs text-gray-500">
                    {supply.quantityUsed} {supply.supply?.unitOfMeasure}
                    {supply.unitCost && ` • ${formatCurrency(supply.unitCost)}/un`}
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(supply.totalCost || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informações Adicionais */}
      {taskCost && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Última atualização:</span>
            <span>
              {new Date(taskCost.calculatedAt).toLocaleDateString('pt-BR')} às{' '}
              {new Date(taskCost.calculatedAt).toLocaleTimeString('pt-BR')}
            </span>
          </div>
        </div>
      )}

      {/* Indicadores de Economia */}
      {supplyCost > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">
              Custo médio por insumo: {formatCurrency(supplyCost / taskSupplies.length)}
            </span>
          </div>
          {taskSupplies.length > 0 && (
            <p className="text-xs text-green-600 mt-1">
              {taskSupplies.length} insumo(s) utilizado(s) nesta tarefa
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCostCalculator;
