/**
 * 🔍 SENTRY SYNC INTEGRATION
 * 
 * Integração especializada do Sentry para tracking de sincronização offline.
 * 
 * @module sentrySync
 */

import * as Sentry from '@sentry/react';
import type { SyncQueueItem } from '../offline/syncQueue';
import { logger } from '../logger';

const LOG_CONTEXT = 'SentrySync';

/**
 * Capturar erro de sincronização com contexto rico
 */
export function captureSyncError(
  error: Error,
  item: SyncQueueItem,
  queueSize: number
): void {
  try {
    Sentry.captureException(error, {
      tags: {
        component: 'SafeOfflineContext',
        sync_action: item.type,
        queue_size: queueSize.toString(),
        retry_count: item.retryCount.toString(),
        status: item.status,
      },
      contexts: {
        sync: {
          item_id: item.id,
          retry_count: item.retryCount,
          max_retries: item.maxRetries,
          timestamp: item.timestamp.toISOString(),
          data_preview: JSON.stringify(item.data).substring(0, 200),
        },
        queue: {
          size: queueSize,
          has_pending: queueSize > 0,
        },
      },
      level: item.retryCount >= item.maxRetries ? 'error' : 'warning',
      fingerprint: ['sync-error', item.type, error.message],
    });

    logger.debug('Erro de sync enviado para Sentry', {
      context: LOG_CONTEXT,
      data: { itemId: item.id, error: error.message },
    });
  } catch (err) {
    logger.error('Erro ao enviar para Sentry', { context: LOG_CONTEXT, data: { error: err } });
  }
}

/**
 * Iniciar transaction de performance para sync
 */
export function startSyncTransaction(
  itemId: string,
  actionType: string
): Sentry.Span | null {
  try {
    const transaction = Sentry.startInactiveSpan({
      name: `sync.${actionType}`,
      op: 'sync.process',
      attributes: {
        item_id: itemId,
        action_type: actionType,
      },
    });

    return transaction;
  } catch (error) {
    logger.error('Erro ao iniciar transaction Sentry', {
      context: LOG_CONTEXT,
      data: { error },
    });
    return null;
  }
}

/**
 * Adicionar breadcrumb de ação offline
 */
export function addOfflineBreadcrumb(
  action: string,
  data: Record<string, any>
): void {
  try {
    Sentry.addBreadcrumb({
      category: 'offline',
      message: `Offline action: ${action}`,
      level: 'info',
      data,
      timestamp: Date.now() / 1000,
    });
  } catch (error) {
    logger.error('Erro ao adicionar breadcrumb', { context: LOG_CONTEXT, data: { error } });
  }
}

/**
 * Configurar contexto de usuário para sync
 */
export function setSyncContext(queueSize: number, isOnline: boolean): void {
  try {
    Sentry.setContext('sync_status', {
      queue_size: queueSize,
      is_online: isOnline,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Erro ao setar contexto Sentry', { context: LOG_CONTEXT, data: { error } });
  }
}

