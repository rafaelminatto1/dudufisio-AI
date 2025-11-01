/**
 * Offline Sync Queue
 * Gerencia fila de sincronização para ações offline
 */

import { indexedDB } from '../indexedDB';

export type SyncAction = 
  | 'create-appointment'
  | 'update-appointment'
  | 'delete-appointment'
  | 'create-comment'
  | 'update-comment'
  | 'delete-comment'
  | 'update-resource'
  | 'allocate-resource';

export interface SyncQueueItem {
  id: string;
  type: SyncAction;
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
  error?: string;
}

class SyncQueue {
  private processing = false;
  private listeners: Array<(items: SyncQueueItem[]) => void> = [];

  /**
   * Adiciona item à fila
   */
  async enqueue(type: SyncAction, data: any, maxRetries = 3): Promise<string> {
    const item: SyncQueueItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries,
      status: 'pending'
    };

    await indexedDB.set('offlineQueue', item);
    this.notifyListeners();

    // Tentar processar imediatamente se online
    if (navigator.onLine) {
      this.processQueue().catch(console.error);
    }

    return item.id;
  }

  /**
   * Processa toda a fila
   */
  async processQueue(): Promise<void> {
    if (this.processing || !navigator.onLine) return;

    this.processing = true;

    try {
      const items = await this.getPendingItems();

      for (const item of items) {
        await this.processItem(item);
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Processa um item individual
   */
  private async processItem(item: SyncQueueItem): Promise<void> {
    try {
      // Update status to processing
      await indexedDB.set('offlineQueue', {
        ...item,
        status: 'processing'
      });

      // Execute sync action
      await this.executeAction(item);

      // Mark as completed
      await indexedDB.delete('offlineQueue', item.id);
      this.notifyListeners();
    } catch (error) {
      const updatedItem: SyncQueueItem = {
        ...item,
        retryCount: item.retryCount + 1,
        status: item.retryCount + 1 >= item.maxRetries ? 'failed' : 'pending',
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      await indexedDB.set('offlineQueue', updatedItem);
      this.notifyListeners();

      // Retry with exponential backoff
      if (updatedItem.status === 'pending') {
        const delay = Math.min(1000 * Math.pow(2, updatedItem.retryCount), 30000);
        setTimeout(() => this.processQueue(), delay);
      }
    }
  }

  /**
   * Executa ação de sincronização
   */
  private async executeAction(item: SyncQueueItem): Promise<void> {
    const { type, data } = item;

    // Dynamic import para evitar dependências circulares
    switch (type) {
      case 'create-appointment':
      case 'update-appointment':
      case 'delete-appointment': {
        const { supabaseAppointmentService } = await import('../../services/supabase/appointmentServiceSupabase');
        
        if (type === 'create-appointment') {
          await supabaseAppointmentService.createAppointment(data);
        } else if (type === 'update-appointment') {
          await supabaseAppointmentService.updateAppointment(data.id, data.updates);
        } else {
          await supabaseAppointmentService.deleteAppointment(data.id);
        }
        break;
      }

      case 'create-comment':
      case 'update-comment':
      case 'delete-comment': {
        const { commentService } = await import('../../services/commentService');
        
        if (type === 'create-comment') {
          await commentService.addComment(data);
        } else if (type === 'update-comment') {
          await commentService.updateComment(data.id, data.content);
        } else {
          await commentService.deleteComment(data.id);
        }
        break;
      }

      case 'update-resource':
      case 'allocate-resource': {
        const { resourceService } = await import('../../services/resourceService');
        
        if (type === 'update-resource') {
          await resourceService.updateResource(data.id, data.updates);
        } else {
          await resourceService.allocateResource(data);
        }
        break;
      }

      default:
        throw new Error(`Unknown sync action type: ${type}`);
    }
  }

  /**
   * Retorna items pendentes
   */
  async getPendingItems(): Promise<SyncQueueItem[]> {
    const all = await indexedDB.getAll('offlineQueue');
    return all
      .filter(item => item.status === 'pending' || item.status === 'processing')
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Retorna todos os items (incluindo falhos)
   */
  async getAllItems(): Promise<SyncQueueItem[]> {
    const all = await indexedDB.getAll('offlineQueue');
    return all.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Limpa items completados/antigos
   */
  async cleanup(): Promise<void> {
    const items = await indexedDB.getAll('offlineQueue');
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    for (const item of items) {
      if (item.status === 'completed' || item.timestamp < weekAgo) {
        await indexedDB.delete('offlineQueue', item.id);
      }
    }

    this.notifyListeners();
  }

  /**
   * Retenta item falho
   */
  async retryItem(id: string): Promise<void> {
    const items = await indexedDB.getAll('offlineQueue');
    const item = items.find(i => i.id === id);

    if (!item) throw new Error('Item not found');

    await indexedDB.set('offlineQueue', {
      ...item,
      status: 'pending',
      retryCount: 0,
      error: undefined
    });

    this.notifyListeners();
    this.processQueue().catch(console.error);
  }

  /**
   * Remove item da fila
   */
  async removeItem(id: string): Promise<void> {
    await indexedDB.delete('offlineQueue', id);
    this.notifyListeners();
  }

  /**
   * Subscreve a mudanças na fila
   */
  subscribe(listener: (items: SyncQueueItem[]) => void): () => void {
    this.listeners.push(listener);
    
    // Initial call
    this.getAllItems().then(listener).catch(console.error);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notifica listeners
   */
  private async notifyListeners(): Promise<void> {
    const items = await this.getAllItems();
    this.listeners.forEach(listener => listener(items));
  }

  /**
   * Retorna estatísticas da fila
   */
  async getStats(): Promise<{
    pending: number;
    processing: number;
    failed: number;
    total: number;
  }> {
    const items = await indexedDB.getAll('offlineQueue');

    return {
      pending: items.filter(i => i.status === 'pending').length,
      processing: items.filter(i => i.status === 'processing').length,
      failed: items.filter(i => i.status === 'failed').length,
      total: items.length
    };
  }
}

export const syncQueue = new SyncQueue();

// Auto-process on online
window.addEventListener('online', () => {
  console.log('🟢 Online - Processando fila de sincronização...');
  syncQueue.processQueue().catch(console.error);
});

// Cleanup periodically
setInterval(() => {
  syncQueue.cleanup().catch(console.error);
}, 24 * 60 * 60 * 1000); // Daily

