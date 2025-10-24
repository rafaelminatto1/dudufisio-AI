import { Surgery } from '../types';
import * as patientService from './patientService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { shouldUseSupabase, shouldFallbackToMock, logDataSource } from '../config/supabaseTablesConfig';

/**
 * Service para gerenciamento de cirurgias de pacientes
 * CRUD completo para histórico cirúrgico
 * MODO HÍBRIDO: Tenta Supabase primeiro, fallback para Mock
 */

// ============================================================================
// SUPABASE FUNCTIONS
// ============================================================================

/**
 * Busca cirurgias do Supabase (campo JSONB em patients.surgeries)
 */
async function getSurgeriesFromSupabase(patientId: string): Promise<Surgery[]> {
  try {
    logDataSource('supabase', `getSurgeries(${patientId})`);
    const patient = await patientService.getPatientById(patientId);
    if (!patient) return [];
    return patient.surgeries || [];
  } catch (error) {
    console.error('Erro ao buscar cirurgias do Supabase:', error);
    throw error;
  }
}

/**
 * Busca cirurgias do Mock (dados locais)
 */
async function getSurgeriesFromMock(patientId: string): Promise<Surgery[]> {
  logDataSource('mock', `getSurgeries(${patientId})`);
  // Mock data vazio por padrão
  // Será populado por mockDataManagerService
  return [];
}

// ============================================================================
// CRUD OPERATIONS (Dual Mode)
// ============================================================================

/**
 * Busca todas as cirurgias de um paciente
 * Tenta Supabase primeiro, fallback para Mock
 */
export async function getSurgeriesByPatientId(patientId: string): Promise<Surgery[]> {
  try {
    // Tentar Supabase primeiro
    if (shouldUseSupabase()) {
      try {
        return await getSurgeriesFromSupabase(patientId);
      } catch (error) {
        console.warn('Supabase falhou, tentando Mock...', error);
        if (shouldFallbackToMock()) {
          return await getSurgeriesFromMock(patientId);
        }
        throw error;
      }
    }
    
    // Usar Mock direto
    return await getSurgeriesFromMock(patientId);
  } catch (error) {
    console.error('Erro ao buscar cirurgias:', error);
    throw error;
  }
}

/**
 * Adiciona nova cirurgia ao histórico do paciente
 */
export async function addSurgery(
  patientId: string,
  surgery: Omit<Surgery, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>
): Promise<Surgery> {
  try {
    const patient = await patientService.getPatientById(patientId);
    if (!patient) {
      throw new Error(`Paciente ${patientId} não encontrado`);
    }

    // Validar data da cirurgia
    const surgeryDate = new Date(surgery.date);
    if (surgeryDate > new Date()) {
      throw new Error('Data da cirurgia não pode ser no futuro');
    }

    const newSurgery: Surgery = {
      ...surgery,
      id: `surgery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedSurgeries = [...(patient.surgeries || []), newSurgery];
    
    await patientService.updatePatient({
      ...patient,
      surgeries: updatedSurgeries,
    });

    return newSurgery;
  } catch (error) {
    console.error('Erro ao adicionar cirurgia:', error);
    throw error;
  }
}

/**
 * Atualiza dados de uma cirurgia existente
 */
export async function updateSurgery(
  surgeryId: string,
  data: Partial<Omit<Surgery, 'id' | 'patientId' | 'createdAt'>>
): Promise<Surgery> {
  try {
    // Encontrar paciente que possui esta cirurgia
    const allPatients = await patientService.getAllPatients();
    const patient = allPatients.find(p => 
      p.surgeries?.some(s => s.id === surgeryId)
    );

    if (!patient) {
      throw new Error(`Cirurgia ${surgeryId} não encontrada`);
    }

    const surgery = patient.surgeries?.find(s => s.id === surgeryId);
    if (!surgery) {
      throw new Error(`Cirurgia ${surgeryId} não encontrada`);
    }

    // Validar data se estiver sendo atualizada
    if (data.date) {
      const surgeryDate = new Date(data.date);
      if (surgeryDate > new Date()) {
        throw new Error('Data da cirurgia não pode ser no futuro');
      }
    }

    const updatedSurgery: Surgery = {
      ...surgery,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const updatedSurgeries = patient.surgeries?.map(s =>
      s.id === surgeryId ? updatedSurgery : s
    ) || [];

    await patientService.updatePatient({
      ...patient,
      surgeries: updatedSurgeries,
    });

    return updatedSurgery;
  } catch (error) {
    console.error('Erro ao atualizar cirurgia:', error);
    throw error;
  }
}

/**
 * Remove uma cirurgia do histórico
 */
export async function deleteSurgery(surgeryId: string): Promise<void> {
  try {
    // Encontrar paciente que possui esta cirurgia
    const allPatients = await patientService.getAllPatients();
    const patient = allPatients.find(p =>
      p.surgeries?.some(s => s.id === surgeryId)
    );

    if (!patient) {
      throw new Error(`Cirurgia ${surgeryId} não encontrada`);
    }

    const updatedSurgeries = patient.surgeries?.filter(s => s.id !== surgeryId) || [];

    await patientService.updatePatient({
      ...patient,
      surgeries: updatedSurgeries,
    });
  } catch (error) {
    console.error('Erro ao deletar cirurgia:', error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calcula tempo decorrido desde a cirurgia em formato legível
 */
export function calculateTimeSinceSurgery(surgeryDate: string): string {
  try {
    const date = new Date(surgeryDate);
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: ptBR,
    });
  } catch (error) {
    console.error('Erro ao calcular tempo desde cirurgia:', error);
    return 'Data inválida';
  }
}

/**
 * Calcula dias desde a cirurgia
 */
export function calculateDaysSinceSurgery(surgeryDate: string): number {
  try {
    const date = new Date(surgeryDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    console.error('Erro ao calcular dias desde cirurgia:', error);
    return 0;
  }
}

/**
 * Formata informações da cirurgia para exibição
 */
export function formatSurgeryInfo(surgery: Surgery): {
  timeSince: string;
  daysSince: number;
  isRecent: boolean; // < 90 dias
  isCritical: boolean; // < 30 dias (período mais crítico)
} {
  const daysSince = calculateDaysSinceSurgery(surgery.date);
  
  return {
    timeSince: calculateTimeSinceSurgery(surgery.date),
    daysSince,
    isRecent: daysSince < 90,
    isCritical: daysSince < 30,
  };
}

/**
 * Busca cirurgias recentes (últimos 6 meses)
 */
export async function getRecentSurgeries(patientId: string): Promise<Surgery[]> {
  try {
    const surgeries = await getSurgeriesByPatientId(patientId);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return surgeries.filter(s => new Date(s.date) >= sixMonthsAgo);
  } catch (error) {
    console.error('Erro ao buscar cirurgias recentes:', error);
    return [];
  }
}

/**
 * Verifica se paciente tem cirurgia em período de recuperação crítico
 */
export async function hasCriticalRecoverySurgery(patientId: string): Promise<boolean> {
  try {
    const surgeries = await getSurgeriesByPatientId(patientId);
    return surgeries.some(s => {
      const days = calculateDaysSinceSurgery(s.date);
      return days < 30;
    });
  } catch (error) {
    console.error('Erro ao verificar cirurgia em recuperação crítica:', error);
    return false;
  }
}

/**
 * Ordena cirurgias por data (mais recente primeiro)
 */
export function sortSurgeriesByDate(surgeries: Surgery[], ascending = false): Surgery[] {
  return [...surgeries].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

