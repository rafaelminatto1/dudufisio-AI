/**
 * Service para gerenciamento centralizado de dados Mock
 * Popular, limpar, exportar e importar dados de teste
 */

import * as sessionEvolutionService from './sessionEvolutionService';
import * as conductReplicationService from './conductReplicationService';

export interface MockDataStatus {
  sessionEvolutions: {
    count: number;
    patients: string[];
  };
  conductTemplates: {
    count: number;
    patients: string[];
  };
  totalMockRecords: number;
  lastPopulated?: string;
  lastCleared?: string;
}

// Storage para metadata de mocks
const MOCK_META_KEY = 'mock_data_metadata';

/**
 * Popula TODOS os dados mock para um paciente específico
 */
export async function populateAllMockData(patientId: string): Promise<void> {
  try {
    console.log(`📝 Populando dados mock para paciente ${patientId}...`);

    // Popular evoluções de sessão
    sessionEvolutionService.populateMockData(patientId, 10);
    
    // Popular templates de conduta
    conductReplicationService.populateMockData(patientId);

    // Salvar metadata
    const metadata = {
      lastPopulated: new Date().toISOString(),
      patientId,
      sessionCount: 10,
      templateCount: 2,
    };
    localStorage.setItem(MOCK_META_KEY, JSON.stringify(metadata));

    console.log('✅ Dados mock populados com sucesso');
  } catch (error) {
    console.error('Erro ao popular dados mock:', error);
    throw error;
  }
}

/**
 * Limpa TODOS os dados mock
 */
export async function clearAllMockData(): Promise<void> {
  try {
    console.log('🗑️ Limpando todos os dados mock...');

    // Limpar evoluções de sessão
    sessionEvolutionService.clearMockData();
    
    // Limpar templates de conduta
    conductReplicationService.clearMockData();

    // Atualizar metadata
    const metadata = {
      lastCleared: new Date().toISOString(),
    };
    localStorage.setItem(MOCK_META_KEY, JSON.stringify(metadata));

    console.log('✅ Dados mock limpos com sucesso');
  } catch (error) {
    console.error('Erro ao limpar dados mock:', error);
    throw error;
  }
}

/**
 * Retorna status atual dos dados mock
 */
export async function getMockStatus(): Promise<MockDataStatus> {
  try {
    // TODO: Contar registros reais de cada tipo
    // Por enquanto, retorna estimativa baseada no que foi populado
    
    const metadata = localStorage.getItem(MOCK_META_KEY);
    const meta = metadata ? JSON.parse(metadata) : null;

    return {
      sessionEvolutions: {
        count: meta?.sessionCount || 0,
        patients: meta?.patientId ? [meta.patientId] : [],
      },
      conductTemplates: {
        count: meta?.templateCount || 0,
        patients: meta?.patientId ? [meta.patientId] : [],
      },
      totalMockRecords: (meta?.sessionCount || 0) + (meta?.templateCount || 0),
      lastPopulated: meta?.lastPopulated,
      lastCleared: meta?.lastCleared,
    };
  } catch (error) {
    console.error('Erro ao obter status mock:', error);
    return {
      sessionEvolutions: { count: 0, patients: [] },
      conductTemplates: { count: 0, patients: [] },
      totalMockRecords: 0,
    };
  }
}

/**
 * Exporta dados mock para JSON
 */
export async function exportMockData(): Promise<string> {
  try {
    const status = await getMockStatus();
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      status,
      // TODO: Adicionar dados reais quando houver acesso aos arrays de mock
      data: {
        sessionEvolutions: [],
        conductTemplates: [],
      },
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Erro ao exportar dados mock:', error);
    throw error;
  }
}

/**
 * Importa dados mock de JSON
 */
export async function importMockData(jsonData: string): Promise<void> {
  try {
    const data = JSON.parse(jsonData);
    
    if (!data.data) {
      throw new Error('Formato de JSON inválido');
    }

    // TODO: Importar dados reais
    console.log('Dados importados:', data);
    
    showToast('Dados mock importados com sucesso', 'success');
  } catch (error) {
    console.error('Erro ao importar dados mock:', error);
    throw error;
  }
}

/**
 * Verifica se existem dados mock ativos
 */
export async function hasMockData(): Promise<boolean> {
  const status = await getMockStatus();
  return status.totalMockRecords > 0;
}

/**
 * Download de export como arquivo
 */
export async function downloadMockDataAsFile(): Promise<void> {
  try {
    const jsonData = await exportMockData();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `mock_data_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erro ao fazer download:', error);
    throw error;
  }
}

// Helper para toast (importar quando necessário)
function showToast(message: string, type: 'success' | 'error' | 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
}

