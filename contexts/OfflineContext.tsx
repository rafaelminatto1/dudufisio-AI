/**
 * Offline Context
 * Gerencia estado de conectividade e sincronização
 */

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { syncQueue, SyncQueueItem } from '../lib/offline/syncQueue';

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  queueSize: number;
  pendingCount: number;
  failedCount: number;
  queueItems: SyncQueueItem[];
  sync: () => Promise<void>;
  retryFailed: () => Promise<void>;
  clearQueue: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueItems, setQueueItems] = useState<SyncQueueItem[]>([]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🟢 Voltou online - Sincronizando...');
      sync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('🔴 Ficou offline - Modo offline ativado');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Subscribe to queue changes
  useEffect(() => {
    const unsubscribe = syncQueue.subscribe((items) => {
      setQueueItems(items);
    });

    return unsubscribe;
  }, []);

  const sync = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      await syncQueue.processQueue();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);

  const retryFailed = useCallback(async () => {
    const failed = queueItems.filter(item => item.status === 'failed');
    
    for (const item of failed) {
      await syncQueue.retryItem(item.id);
    }
  }, [queueItems]);

  const clearQueue = useCallback(async () => {
    await syncQueue.cleanup();
  }, []);

  const pendingCount = queueItems.filter(i => i.status === 'pending').length;
  const failedCount = queueItems.filter(i => i.status === 'failed').length;

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSyncing,
        queueSize: queueItems.length,
        pendingCount,
        failedCount,
        queueItems,
        sync,
        retryFailed,
        clearQueue
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
};

