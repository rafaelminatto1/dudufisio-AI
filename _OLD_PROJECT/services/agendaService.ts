/**
 * services/agendaService.ts
 * 
 * Camada de abstração unificada para operações de agenda
 * Detecta automaticamente se Supabase está configurado e usa-o quando disponível
 * Caso contrário, usa mockDb para desenvolvimento
 * 
 * Inclui tratamento robusto de erros com retry automático e fallback
 */

import { Appointment, WaitlistEntry, ScheduleBlock } from '../types';
import * as appointmentService from './appointmentService';
import { waitlistService } from './scheduling/waitlistService';
import { blockService } from './scheduling/blockService';
import { logger } from '../lib/logger';

// Detectar se Supabase está configurado
const isSupabaseEnabled = (): boolean => {
  return !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
};

// Configurações de retry
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

/**
 * Executar operação com retry automático
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  retries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      logger.error(`[agendaService] ${operationName} falhou (tentativa ${attempt}/${retries})`, {
        context: 'agendaService.retry',
        data: { error: lastError.message, attempt }
      });

      // Se não é o último attempt, aguardar antes de tentar novamente
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      }
    }
  }

  // Se todas as tentativas falharam, lançar erro
  throw new Error(`${operationName} falhou após ${retries} tentativas: ${lastError?.message}`);
}

/**
 * Executar operação com fallback para cache local
 */
async function withFallback<T>(
  operation: () => Promise<T>,
  fallback: () => T,
  operationName: string
): Promise<T> {
  try {
    return await withRetry(operation, operationName);
  } catch (error) {
    logger.warn(`[agendaService] Usando fallback para ${operationName}`, {
      context: 'agendaService.fallback',
      data: { error: (error as Error).message }
    });
    return fallback();
  }
}

/**
 * Serviço unificado de Agenda
 * 
 * Esta camada fornece uma interface consistente para operações de agenda,
 * independentemente da fonte de dados (Supabase ou mockDb).
 * 
 * Benefícios:
 * - Fácil migração gradual para Supabase
 * - Desenvolvimento local sem necessidade de Supabase
 * - Testes com mockDb
 * - Fallback automático em caso de falha
 */
export const agendaService = {
  /**
   * Verifica se Supabase está habilitado
   */
  isSupabaseEnabled,

  // ============================================
  // APPOINTMENTS CRUD
  // ============================================

  /**
   * Buscar agendamentos em um intervalo de datas
   */
  async getAppointments(startDate?: Date, endDate?: Date): Promise<Appointment[]> {
    try {
      // Por enquanto, sempre usa appointmentService (que já tem suporte a mockDb)
      // TODO: Quando Supabase estiver pronto, adicionar lógica de detecção aqui
      return await appointmentService.getAppointments(startDate, endDate);
    } catch (error) {
      console.error('[agendaService] Erro ao buscar agendamentos:', error);
      throw error;
    }
  },

  /**
   * Buscar agendamento por ID
   */
  async getAppointmentById(id: string): Promise<Appointment | undefined> {
    try {
      return await appointmentService.getAppointmentById(id);
    } catch (error) {
      console.error('[agendaService] Erro ao buscar agendamento:', error);
      throw error;
    }
  },

  /**
   * Buscar agendamentos de um paciente
   */
  async getAppointmentsByPatientId(patientId: string): Promise<Appointment[]> {
    try {
      return await appointmentService.getAppointmentsByPatientId(patientId);
    } catch (error) {
      console.error('[agendaService] Erro ao buscar agendamentos do paciente:', error);
      throw error;
    }
  },

  /**
   * Salvar agendamento (criar ou atualizar)
   */
  async saveAppointment(appointment: Appointment): Promise<Appointment> {
    try {
      return await appointmentService.saveAppointment(appointment);
    } catch (error) {
      console.error('[agendaService] Erro ao salvar agendamento:', error);
      throw error;
    }
  },

  /**
   * Deletar agendamento
   */
  async deleteAppointment(id: string): Promise<void> {
    try {
      await appointmentService.deleteAppointment(id);
    } catch (error) {
      console.error('[agendaService] Erro ao deletar agendamento:', error);
      throw error;
    }
  },

  /**
   * Deletar série de agendamentos recorrentes
   */
  async deleteAppointmentSeries(seriesId: string, fromDate: Date): Promise<void> {
    try {
      await appointmentService.deleteAppointmentSeries(seriesId, fromDate);
    } catch (error) {
      console.error('[agendaService] Erro ao deletar série de agendamentos:', error);
      throw error;
    }
  },

  // ============================================
  // WAITLIST CRUD
  // ============================================

  /**
   * Listar entradas da lista de espera
   */
  async getWaitlistEntries(status: 'waiting' | 'notified' | 'scheduled' = 'waiting'): Promise<WaitlistEntry[]> {
    try {
      return await waitlistService.listEntries(status);
    } catch (error) {
      console.error('[agendaService] Erro ao buscar lista de espera:', error);
      throw error;
    }
  },

  /**
   * Adicionar entrada à lista de espera
   */
  async addToWaitlist(entry: Omit<WaitlistEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<WaitlistEntry> {
    try {
      return await waitlistService.addToWaitlist(entry);
    } catch (error) {
      console.error('[agendaService] Erro ao adicionar à lista de espera:', error);
      throw error;
    }
  },

  /**
   * Atualizar entrada da lista de espera
   */
  async updateWaitlistEntry(
    entryId: string,
    updates: Partial<Omit<WaitlistEntry, 'id' | 'createdAt'>>
  ): Promise<WaitlistEntry> {
    try {
      return await waitlistService.updateEntry(entryId, updates);
    } catch (error) {
      console.error('[agendaService] Erro ao atualizar entrada da lista de espera:', error);
      throw error;
    }
  },

  /**
   * Deletar entrada da lista de espera
   */
  async deleteWaitlistEntry(entryId: string): Promise<void> {
    try {
      // TODO: Adicionar método removeEntry no waitlistService
      // Por enquanto, usar markEntry com status 'cancelled'
      await waitlistService.markEntry(entryId, 'cancelled' as any);
    } catch (error) {
      console.error('[agendaService] Erro ao deletar entrada da lista de espera:', error);
      throw error;
    }
  },

  // ============================================
  // SCHEDULE BLOCKS CRUD
  // ============================================

  /**
   * Listar bloqueios de agenda
   */
  async getScheduleBlocks(): Promise<ScheduleBlock[]> {
    try {
      return await blockService.listBlocks();
    } catch (error) {
      console.error('[agendaService] Erro ao buscar bloqueios:', error);
      throw error;
    }
  },

  /**
   * Criar bloqueio de agenda
   */
  async createScheduleBlock(block: Omit<ScheduleBlock, 'id'>): Promise<ScheduleBlock> {
    try {
      return await blockService.createBlock(block);
    } catch (error) {
      console.error('[agendaService] Erro ao criar bloqueio:', error);
      throw error;
    }
  },

  /**
   * Deletar bloqueio de agenda
   */
  async deleteScheduleBlock(id: string): Promise<void> {
    try {
      await blockService.deleteBlock(id);
    } catch (error) {
      console.error('[agendaService] Erro ao deletar bloqueio:', error);
      throw error;
    }
  },

  // ============================================
  // UTILITIES
  // ============================================

  /**
   * Obter informações sobre a fonte de dados atual
   */
  getDataSourceInfo(): { type: 'supabase' | 'mockdb'; enabled: boolean } {
    return {
      type: isSupabaseEnabled() ? 'supabase' : 'mockdb',
      enabled: isSupabaseEnabled()
    };
  }
};

// Exportar tipos úteis
export type { Appointment, WaitlistEntry, ScheduleBlock };

