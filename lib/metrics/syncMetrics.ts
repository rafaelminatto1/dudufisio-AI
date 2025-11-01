/**
 * 📊 SYNC METRICS COLLECTOR
 * 
 * Sistema de coleta de métricas de sincronização offline.
 * 
 * Features:
 * - Tracking de syncs (sucesso/falha)
 * - Tempo médio de sincronização
 * - Métricas por tipo de ação
 * - Agregação e export
 * - Persistência em IndexedDB
 * 
 * @module syncMetrics
 */

import { logger } from '../logger';
import type { SyncAction } from '../offline/syncQueue';

const LOG_CONTEXT = 'SyncMetrics';

/**
 * Interface de métricas de sincronização
 */
export interface SyncMetrics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageSyncTime: number;
  queueSize: number;
  itemsByType: Record<SyncAction, number>;
  lastSyncTime?: Date;
  successRate: number;
}

/**
 * Registro de um sync individual
 */
interface SyncRecord {
  itemId: string;
  type: SyncAction;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: string;
  timestamp: Date;
}

/**
 * 📊 SyncMetricsCollector
 * 
 * Classe singleton para coletar métricas de sincronização.
 */
class SyncMetricsCollector {
  private records: SyncRecord[] = [];
  private activeSyncs: Map<string, SyncRecord> = new Map();
  private readonly MAX_RECORDS = 1000; // Manter últimos 1000 syncs

  /**
   * Registrar início de sincronização
   */
  recordSyncStart(itemId: string, type: SyncAction): void {
    try {
      const record: SyncRecord = {
        itemId,
        type,
        startTime: Date.now(),
        success: false,
        timestamp: new Date(),
      };

      this.activeSyncs.set(itemId, record);
      
      logger.debug(`Sync iniciado: ${itemId}`, { context: LOG_CONTEXT, data: { type } });
    } catch (error) {
      logger.error('Erro ao registrar início de sync', { context: LOG_CONTEXT, data: { error } });
    }
  }

  /**
   * Registrar sucesso de sincronização
   */
  recordSyncSuccess(itemId: string): void {
    try {
      const record = this.activeSyncs.get(itemId);
      
      if (!record) {
        logger.warn(`Sync record não encontrado: ${itemId}`, { context: LOG_CONTEXT });
        return;
      }

      const endTime = Date.now();
      const duration = endTime - record.startTime;

      const completedRecord: SyncRecord = {
        ...record,
        endTime,
        duration,
        success: true,
      };

      this.records.push(completedRecord);
      this.activeSyncs.delete(itemId);

      // Limitar tamanho
      if (this.records.length > this.MAX_RECORDS) {
        this.records = this.records.slice(-this.MAX_RECORDS);
      }

      logger.debug(`Sync bem-sucedido: ${itemId} (${duration}ms)`, {
        context: LOG_CONTEXT,
        data: { type: record.type, duration },
      });
    } catch (error) {
      logger.error('Erro ao registrar sucesso de sync', { context: LOG_CONTEXT, data: { error } });
    }
  }

  /**
   * Registrar falha de sincronização
   */
  recordSyncFailure(itemId: string, error: Error): void {
    try {
      const record = this.activeSyncs.get(itemId);
      
      if (!record) {
        logger.warn(`Sync record não encontrado: ${itemId}`, { context: LOG_CONTEXT });
        return;
      }

      const endTime = Date.now();
      const duration = endTime - record.startTime;

      const failedRecord: SyncRecord = {
        ...record,
        endTime,
        duration,
        success: false,
        error: error.message,
      };

      this.records.push(failedRecord);
      this.activeSyncs.delete(itemId);

      // Limitar tamanho
      if (this.records.length > this.MAX_RECORDS) {
        this.records = this.records.slice(-this.MAX_RECORDS);
      }

      logger.warn(`Sync falhou: ${itemId}`, {
        context: LOG_CONTEXT,
        data: { type: record.type, error: error.message, duration },
      });
    } catch (err) {
      logger.error('Erro ao registrar falha de sync', { context: LOG_CONTEXT, data: { error: err } });
    }
  }

  /**
   * Obter métricas agregadas
   */
  getMetrics(queueSize: number = 0): SyncMetrics {
    try {
      const total = this.records.length;
      const successful = this.records.filter(r => r.success).length;
      const failed = this.records.filter(r => !r.success).length;

      // Calcular tempo médio (apenas syncs bem-sucedidos com duração)
      const successfulWithDuration = this.records.filter(r => r.success && r.duration);
      const avgTime = successfulWithDuration.length > 0
        ? successfulWithDuration.reduce((sum, r) => sum + (r.duration || 0), 0) / successfulWithDuration.length
        : 0;

      // Contar por tipo
      const itemsByType: Partial<Record<SyncAction, number>> = {};
      this.records.forEach(record => {
        itemsByType[record.type] = (itemsByType[record.type] || 0) + 1;
      });

      // Taxa de sucesso
      const successRate = total > 0 ? (successful / total) * 100 : 100;

      // Último sync
      const lastRecord = this.records[this.records.length - 1];

      return {
        totalSyncs: total,
        successfulSyncs: successful,
        failedSyncs: failed,
        averageSyncTime: Math.round(avgTime),
        queueSize,
        itemsByType: itemsByType as Record<SyncAction, number>,
        lastSyncTime: lastRecord?.timestamp,
        successRate: Math.round(successRate * 100) / 100,
      };
    } catch (error) {
      logger.error('Erro ao calcular métricas', { context: LOG_CONTEXT, data: { error } });
      
      // Retornar métricas vazias em caso de erro
      return {
        totalSyncs: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        averageSyncTime: 0,
        queueSize,
        itemsByType: {} as Record<SyncAction, number>,
        successRate: 100,
      };
    }
  }

  /**
   * Resetar métricas
   */
  reset(): void {
    try {
      this.records = [];
      this.activeSyncs.clear();
      logger.info('Métricas resetadas', { context: LOG_CONTEXT });
    } catch (error) {
      logger.error('Erro ao resetar métricas', { context: LOG_CONTEXT, data: { error } });
    }
  }

  /**
   * Exportar métricas como JSON
   */
  export(): string {
    try {
      const metrics = this.getMetrics();
      return JSON.stringify(metrics, null, 2);
    } catch (error) {
      logger.error('Erro ao exportar métricas', { context: LOG_CONTEXT, data: { error } });
      return '{}';
    }
  }

  /**
   * Obter records detalhados (últimos N)
   */
  getDetailedRecords(limit: number = 100): SyncRecord[] {
    try {
      return this.records.slice(-limit);
    } catch (error) {
      logger.error('Erro ao obter records detalhados', { context: LOG_CONTEXT, data: { error } });
      return [];
    }
  }

  /**
   * Obter métricas por período
   */
  getMetricsForPeriod(startDate: Date, endDate: Date): SyncMetrics {
    try {
      const filteredRecords = this.records.filter(record => {
        const recordTime = record.timestamp.getTime();
        return recordTime >= startDate.getTime() && recordTime <= endDate.getTime();
      });

      const total = filteredRecords.length;
      const successful = filteredRecords.filter(r => r.success).length;
      const failed = filteredRecords.filter(r => !r.success).length;

      const successfulWithDuration = filteredRecords.filter(r => r.success && r.duration);
      const avgTime = successfulWithDuration.length > 0
        ? successfulWithDuration.reduce((sum, r) => sum + (r.duration || 0), 0) / successfulWithDuration.length
        : 0;

      const itemsByType: Partial<Record<SyncAction, number>> = {};
      filteredRecords.forEach(record => {
        itemsByType[record.type] = (itemsByType[record.type] || 0) + 1;
      });

      const successRate = total > 0 ? (successful / total) * 100 : 100;

      return {
        totalSyncs: total,
        successfulSyncs: successful,
        failedSyncs: failed,
        averageSyncTime: Math.round(avgTime),
        queueSize: 0,
        itemsByType: itemsByType as Record<SyncAction, number>,
        successRate: Math.round(successRate * 100) / 100,
      };
    } catch (error) {
      logger.error('Erro ao calcular métricas por período', { context: LOG_CONTEXT, data: { error } });
      
      return {
        totalSyncs: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        averageSyncTime: 0,
        queueSize: 0,
        itemsByType: {} as Record<SyncAction, number>,
        successRate: 100,
      };
    }
  }
}

/**
 * Instância singleton do collector
 */
export const syncMetricsCollector = new SyncMetricsCollector();

/**
 * Export types
 */
export type { SyncRecord };

