import React, { useState, useEffect } from 'react';
import { Database, Trash2, Download, Upload, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../contexts/ToastContext';
import * as mockDataManagerService from '../../services/mockDataManagerService';
import { MockDataStatus } from '../../services/mockDataManagerService';

/**
 * Painel de Gerenciamento de Dados Mock
 * Visualização de status, popular, limpar, export/import
 * Apenas para Admin ou modo desenvolvimento
 */

interface MockDataManagerProps {
  className?: string;
}

export const MockDataManager: React.FC<MockDataManagerProps> = ({ className = '' }) => {
  const { showToast } = useToast();
  const [status, setStatus] = useState<MockDataStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [defaultPatientId, setDefaultPatientId] = useState('patient_1');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const currentStatus = await mockDataManagerService.getMockStatus();
      setStatus(currentStatus);
    } catch (error) {
      console.error('Erro ao carregar status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopulate = async () => {
    try {
      await mockDataManagerService.populateAllMockData(defaultPatientId);
      showToast('Dados mock populados com sucesso!', 'success');
      await loadStatus();
    } catch (error) {
      showToast('Erro ao popular dados mock', 'error');
    }
  };

  const handleClear = async () => {
    if (!showConfirmClear) {
      setShowConfirmClear(true);
      return;
    }

    try {
      await mockDataManagerService.clearAllMockData();
      showToast('Dados mock limpos com sucesso!', 'success');
      setShowConfirmClear(false);
      await loadStatus();
    } catch (error) {
      showToast('Erro ao limpar dados mock', 'error');
    }
  };

  const handleExport = async () => {
    try {
      await mockDataManagerService.downloadMockDataAsFile();
      showToast('Dados exportados com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao exportar dados', 'error');
    }
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        await mockDataManagerService.importMockData(text);
        showToast('Dados importados com sucesso!', 'success');
        await loadStatus();
      } catch (error) {
        showToast('Erro ao importar dados', 'error');
      }
    };
    input.click();
  };

  if (isLoading) {
    return (
      <div className="animate-pulse bg-slate-100 rounded-lg p-6 h-64"></div>
    );
  }

  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Database className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Gerenciamento de Dados Mock
          </h3>
          <p className="text-xs text-slate-600">
            Para desenvolvimento e testes
          </p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-600 font-medium mb-1">Evoluções de Sessão</p>
          <p className="text-2xl font-bold text-blue-900">
            {status?.sessionEvolutions.count || 0}
          </p>
          <p className="text-xs text-blue-700 mt-1">
            {status?.sessionEvolutions.patients.length || 0} paciente(s)
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-xs text-purple-600 font-medium mb-1">Templates de Conduta</p>
          <p className="text-2xl font-bold text-purple-900">
            {status?.conductTemplates.count || 0}
          </p>
          <p className="text-xs text-purple-700 mt-1">
            {status?.conductTemplates.patients.length || 0} paciente(s)
          </p>
        </div>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 mb-1">Total de Registros Mock</p>
            <p className="text-3xl font-bold text-slate-900">
              {status?.totalMockRecords || 0}
            </p>
          </div>
          {status && status.totalMockRecords > 0 && (
            <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              Dados Mock Ativos
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      {(status?.lastPopulated || status?.lastCleared) && (
        <div className="text-xs text-slate-600 mb-6 space-y-1">
          {status.lastPopulated && (
            <p>
              Última população: {new Date(status.lastPopulated).toLocaleString('pt-BR')}
            </p>
          )}
          {status.lastCleared && (
            <p>
              Última limpeza: {new Date(status.lastCleared).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
      )}

      {/* Patient ID Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          ID do Paciente para Popular Dados
        </label>
        <input
          type="text"
          value={defaultPatientId}
          onChange={(e) => setDefaultPatientId(e.target.value)}
          placeholder="Ex: patient_1"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <p className="text-xs text-slate-500 mt-1">
          Os dados mock serão criados para este paciente
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {/* Populate */}
        <Button
          onClick={handlePopulate}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Popular Dados Mock</span>
        </Button>

        {/* Export/Import */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleImportClick}
            className="flex items-center justify-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Importar</span>
          </Button>
        </div>

        {/* Clear - Com confirmação */}
        {!showConfirmClear ? (
          <Button
            variant="outline"
            onClick={() => setShowConfirmClear(true)}
            disabled={!status || status.totalMockRecords === 0}
            className="w-full flex items-center justify-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpar Todos os Mocks</span>
          </Button>
        ) : (
          <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4">
            <div className="flex items-start space-x-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 text-sm mb-1">
                  ⚠️ Confirmação Necessária
                </p>
                <p className="text-xs text-red-700">
                  Isso irá deletar permanentemente TODOS os dados mock.
                  Esta ação não pode ser desfeita!
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmClear(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleClear}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Sim, Limpar Tudo
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Warning */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-800">
          <strong>⚠️ Atenção:</strong> Os dados mock são apenas para desenvolvimento.
          Em produção, o sistema usará dados do Supabase automaticamente.
        </p>
      </div>
    </div>
  );
};

export default MockDataManager;

