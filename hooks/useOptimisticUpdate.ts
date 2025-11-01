/**
 * useOptimisticUpdate Hook
 * Implementa updates otimistas com rollback automático
 */

import { useState, useCallback, useRef } from 'react';

interface OptimisticUpdate<T> {
  id: string;
  data: T;
  timestamp: number;
  promise: Promise<any>;
}

export function useOptimisticUpdate<T extends { id: string }>() {
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, OptimisticUpdate<T>>>(new Map());
  const rollbackTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  /**
   * Aplica update otimista
   */
  const applyOptimisticUpdate = useCallback(
    async <R,>(
      id: string,
      optimisticData: T,
      serverUpdate: () => Promise<R>,
      onSuccess?: (result: R) => void,
      onError?: (error: Error) => void
    ): Promise<R | null> => {
      // Add to optimistic updates map
      const updatePromise = serverUpdate();
      const update: OptimisticUpdate<T> = {
        id,
        data: optimisticData,
        timestamp: Date.now(),
        promise: updatePromise
      };

      setOptimisticUpdates(prev => new Map(prev).set(id, update));

      try {
        const result = await updatePromise;
        
        // Success - remove from optimistic updates
        setOptimisticUpdates(prev => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });

        // Clear rollback timeout if exists
        const timeout = rollbackTimeouts.current.get(id);
        if (timeout) {
          clearTimeout(timeout);
          rollbackTimeouts.current.delete(id);
        }

        onSuccess?.(result);
        return result;
      } catch (error) {
        console.error('Optimistic update failed:', error);
        
        // Rollback with animation delay
        const timeout = setTimeout(() => {
          setOptimisticUpdates(prev => {
            const next = new Map(prev);
            next.delete(id);
            return next;
          });
          rollbackTimeouts.current.delete(id);
        }, 300); // Short delay for smooth rollback

        rollbackTimeouts.current.set(id, timeout);

        onError?.(error as Error);
        return null;
      }
    },
    []
  );

  /**
   * Cancela update otimista (rollback manual)
   */
  const rollback = useCallback((id: string) => {
    setOptimisticUpdates(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });

    const timeout = rollbackTimeouts.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      rollbackTimeouts.current.delete(id);
    }
  }, []);

  /**
   * Retorna dados mesclados (original + optimistic updates)
   */
  const getMergedData = useCallback(
    (originalData: T[], updateKey: keyof T = 'id' as keyof T): T[] => {
      const updatesMap = new Map<string, T>();
      optimisticUpdates.forEach((update) => {
        updatesMap.set(update.id, update.data);
      });

      return originalData.map(item => {
        const update = updatesMap.get(String(item[updateKey]));
        return update || item;
      });
    },
    [optimisticUpdates]
  );

  /**
   * Verifica se um item tem update pendente
   */
  const isPending = useCallback(
    (id: string): boolean => {
      return optimisticUpdates.has(id);
    },
    [optimisticUpdates]
  );

  return {
    applyOptimisticUpdate,
    rollback,
    getMergedData,
    isPending,
    pendingCount: optimisticUpdates.size
  };
}

