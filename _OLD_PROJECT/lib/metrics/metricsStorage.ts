/**
 * 💾 METRICS STORAGE
 * 
 * Sistema de persistência de métricas de sincronização.
 * 
 * Features:
 * - Persistência em IndexedDB localmente
 * - Envio batch para Supabase
 * - Agregação temporal (diário, semanal, mensal)
 * - Retry automático de envios falhados
 * 
 * @module metricsStorage
 */

import { logger } from '../logger';
import { indexedDB } from '../indexedDB';
import type { SyncMetrics } from './syncMetrics';

const LOG_CONTEXT = 'MetricsStorage';
const METRICS_STORE = 'syncMetrics';
const BATCH_SIZE = 50;
const BATCH_INTERVAL = 60 * 60 * 1000; // 1 hora

/**
 * Registro de métrica para storage
 */
export interface MetricsSnapshot {
  id: string;
  timestamp: Date;
  metrics: SyncMetrics;
  uploaded: boolean;
  uploadAttempts: number;
}

/**
 * 💾 MetricsStorage
 * 
 * Gerencia persistência e sincronização de métricas.
 */
class MetricsStorage {
  private batchTimer: NodeJS.Timeout | null = null;

  /**
   * Salvar snapshot de métricas localmente
   */
  async saveSnapshot(metrics: SyncMetrics): Promise<string> {
    try {
      const snapshot: MetricsSnapshot = {
        id: `metrics-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        metrics,
        uploaded: false,
        uploadAttempts: 0,
      };

      await indexedDB.set(METRICS_STORE, snapshot);
      
      logger.debug('Snapshot de métricas salvo', { context: LOG_CONTEXT, data: { id: snapshot.id } });
      
      return snapshot.id;
    } catch (error) {
      logger.error('Erro ao salvar snapshot', { context: LOG_CONTEXT, data: { error } });
      throw error;
    }
  }

  /**
   * Enviar métricas para Supabase em batch
   */
  async uploadBatch(): Promise<{ success: number; failed: number }> {
    try {
      // Obter snapshots não enviados
      const allSnapshots = await indexedDB.getAll(METRICS_STORE);
      const pending = allSnapshots
        .filter((s: MetricsSnapshot) => !s.uploaded && s.uploadAttempts < 3)
        .slice(0, BATCH_SIZE);

      if (pending.length === 0) {
        logger.debug('Nenhuma métrica pendente para enviar', { context: LOG_CONTEXT });
        return { success: 0, failed: 0 };
      }

      logger.info(`Enviando ${pending.length} métricas para Supabase...`, { context: LOG_CONTEXT });

      let success = 0;
      let failed = 0;

      for (const snapshot of pending) {
        try {
          await this.uploadSnapshot(snapshot);
          
          // Marcar como uploaded
          await indexedDB.set(METRICS_STORE, {
            ...snapshot,
            uploaded: true,
          });
          
          success++;
        } catch (error) {
          logger.error(`Erro ao enviar snapshot ${snapshot.id}`, {
            context: LOG_CONTEXT,
            data: { error },
          });
          
          // Incrementar tentativas
          await indexedDB.set(METRICS_STORE, {
            ...snapshot,
            uploadAttempts: snapshot.uploadAttempts + 1,
          });
          
          failed++;
        }
      }

      logger.info(`Upload batch completo: ${success} sucesso, ${failed} falhas`, {
        context: LOG_CONTEXT,
      });

      return { success, failed };
    } catch (error) {
      logger.error('Erro no upload batch', { context: LOG_CONTEXT, data: { error } });
      return { success: 0, failed: 0 };
    }
  }

  /**
   * Enviar snapshot individual para Supabase
   */
  private async uploadSnapshot(snapshot: MetricsSnapshot): Promise<void> {
    // TODO: Implementar chamada real à API Supabase
    // Por enquanto, apenas simular
    
    const payload = {
      date: snapshot.timestamp.toISOString().split('T')[0],
      total_syncs: snapshot.metrics.totalSyncs,
      successful_syncs: snapshot.metrics.successfulSyncs,
      failed_syncs: snapshot.metrics.failedSyncs,
      average_sync_time: snapshot.metrics.averageSyncTime,
      metrics_data: {
        itemsByType: snapshot.metrics.itemsByType,
        successRate: snapshot.metrics.successRate,
        queueSize: snapshot.metrics.queueSize,
      },
    };

    logger.debug('Payload de métricas preparado', { context: LOG_CONTEXT, data: payload });

    // Em produção, fazer:
    // const { data, error } = await supabase.from('sync_metrics').insert(payload);
    // if (error) throw error;
  }

  /**
   * Iniciar envio automático em batch
   */
  startAutomaticUpload(interval: number = BATCH_INTERVAL): void {
    if (this.batchTimer) {
      logger.warn('Upload automático já está ativo', { context: LOG_CONTEXT });
      return;
    }

    logger.info(`Iniciando upload automático (intervalo: ${interval}ms)`, { context: LOG_CONTEXT });

    this.batchTimer = setInterval(async () => {
      try {
        await this.uploadBatch();
      } catch (error) {
        logger.error('Erro no upload automático', { context: LOG_CONTEXT, data: { error } });
      }
    }, interval);
  }

  /**
   * Parar envio automático
   */
  stopAutomaticUpload(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
      logger.info('Upload automático parado', { context: LOG_CONTEXT });
    }
  }

  /**
   * Limpar métricas antigas
   */
  async cleanup(daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const allSnapshots = await indexedDB.getAll(METRICS_STORE);
      let deleted = 0;

      for (const snapshot of allSnapshots) {
        if (snapshot.timestamp < cutoffDate && snapshot.uploaded) {
          await indexedDB.delete(METRICS_STORE, snapshot.id);
          deleted++;
        }
      }

      logger.info(`Cleanup de métricas: ${deleted} snapshots removidos`, { context: LOG_CONTEXT });
      
      return deleted;
    } catch (error) {
      logger.error('Erro no cleanup de métricas', { context: LOG_CONTEXT, data: { error } });
      return 0;
    }
  }

  /**
   * Obter métricas agregadas por período
   */
  async getAggregatedMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<SyncMetrics | null> {
    try {
      const allSnapshots = await indexedDB.getAll(METRICS_STORE);
      const filtered = allSnapshots.filter((s: MetricsSnapshot) => {
        const timestamp = new Date(s.timestamp);
        return timestamp >= startDate && timestamp <= endDate;
      });

      if (filtered.length === 0) {
        return null;
      }

      // Agregar métricas
      const aggregated: SyncMetrics = filtered.reduce(
        (acc, snapshot) => ({
          totalSyncs: acc.totalSyncs + snapshot.metrics.totalSyncs,
          successfulSyncs: acc.successfulSyncs + snapshot.metrics.successfulSyncs,
          failedSyncs: acc.failedSyncs + snapshot.metrics.failedSyncs,
          averageSyncTime: acc.averageSyncTime + snapshot.metrics.averageSyncTime,
          queueSize: Math.max(acc.queueSize, snapshot.metrics.queueSize),
          itemsByType: this.mergeItemsByType(acc.itemsByType, snapshot.metrics.itemsByType),
          successRate: 0, // Calculado depois
        }),
        {
          totalSyncs: 0,
          successfulSyncs: 0,
          failedSyncs: 0,
          averageSyncTime: 0,
          queueSize: 0,
          itemsByType: {},
          successRate: 0,
        } as SyncMetrics
      );

      // Calcular média de tempo
      aggregated.averageSyncTime = Math.round(aggregated.averageSyncTime / filtered.length);

      // Calcular taxa de sucesso
      if (aggregated.totalSyncs > 0) {
        aggregated.successRate = Math.round(
          (aggregated.successfulSyncs / aggregated.totalSyncs) * 10000
        ) / 100;
      }

      return aggregated;
    } catch (error) {
      logger.error('Erro ao agregar métricas', { context: LOG_CONTEXT, data: { error } });
      return null;
    }
  }

  /**
   * Merge itemsByType de múltiplas métricas
   */
  private mergeItemsByType(
    a: Record<string, number>,
    b: Record<string, number>
  ): Record<string, number> {
    const result = { ...a };
    
    for (const [key, value] of Object.entries(b)) {
      result[key] = (result[key] || 0) + value;
    }
    
    return result;
  }

  /**
   * Exportar todas as métricas como JSON
   */
  async exportAll(): Promise<string> {
    try {
      const allSnapshots = await indexedDB.getAll(METRICS_STORE);
      return JSON.stringify(allSnapshots, null, 2);
    } catch (error) {
      logger.error('Erro ao exportar métricas', { context: LOG_CONTEXT, data: { error } });
      return '[]';
    }
  }
}

/**
 * Instância singleton
 */
export const metricsStorage = new MetricsStorage();

/**
 * Export types
 */
export type { MetricsSnapshot };

