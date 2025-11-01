/**
 * 🧪 Testes Unitários - SafeOfflineContext
 * 
 * Testa o provider offline robusto e seus hooks.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { 
  SafeOfflineProvider, 
  useSafeOffline, 
  useOfflineStrict 
} from '../../../contexts/SafeOfflineContext';
import type { SyncQueueItem } from '../../../lib/offline/syncQueue';

// Mocks
vi.mock('../../../lib/offline/syncQueue', () => ({
  syncQueue: {
    processQueue: vi.fn().mockResolvedValue(undefined),
    retryItem: vi.fn().mockResolvedValue(undefined),
    cleanup: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn((callback: (items: SyncQueueItem[]) => void) => {
      // Chamar callback imediatamente com array vazio
      callback([]);
      // Retornar função de unsubscribe
      return vi.fn();
    }),
  },
  SyncQueueItem: {},
}));

vi.mock('../../../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('SafeOfflineContext', () => {
  // Mock navigator.onLine
  let originalOnLine: boolean;

  beforeEach(() => {
    originalOnLine = navigator.onLine;
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: originalOnLine,
    });
  });

  describe('SafeOfflineProvider', () => {
    it('deve fornecer valores padrão quando montado', () => {
      const { result } = renderHook(() => useSafeOffline(), {
        wrapper: ({ children }) => (
          <SafeOfflineProvider>{children}</SafeOfflineProvider>
        ),
      });

      expect(result.current).toBeDefined();
      expect(result.current.isOnline).toBe(navigator.onLine);
      expect(result.current.isSyncing).toBe(false);
      expect(result.current.queueSize).toBe(0);
      expect(result.current.pendingCount).toBe(0);
      expect(result.current.failedCount).toBe(0);
      expect(result.current.hasError).toBe(false);
    });

    it('deve detectar mudança para offline', async () => {
      const { result } = renderHook(() => useSafeOffline(), {
        wrapper: ({ children }) => (
          <SafeOfflineProvider>{children}</SafeOfflineProvider>
        ),
      });

      // Simular evento offline
      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: false,
        });
        window.dispatchEvent(new Event('offline'));
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
      });
    });

    it('deve detectar mudança para online e sincronizar', async () => {
      // Começar offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const { result } = renderHook(() => useSafeOffline(), {
        wrapper: ({ children }) => (
          <SafeOfflineProvider>{children}</SafeOfflineProvider>
        ),
      });

      expect(result.current.isOnline).toBe(false);

      // Voltar online
      await act(async () => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: true,
        });
        window.dispatchEvent(new Event('online'));
        
        // Aguardar timeout interno (1s)
        await new Promise(resolve => setTimeout(resolve, 1100));
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(true);
      });
    });

    it('deve registrar e remover listeners de eventos', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useSafeOffline(), {
        wrapper: ({ children }) => (
          <SafeOfflineProvider>{children}</SafeOfflineProvider>
        ),
      });

      // Verificar que listeners foram adicionados
      expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

      // Desmontar
      unmount();

      // Verificar que listeners foram removidos
      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    });

    it('deve tratar erros sem quebrar (error handling)', async () => {
      const { syncQueue } = await import('../../../lib/offline/syncQueue');
      
      // Mock sync que falha
      vi.mocked(syncQueue.processQueue).mockRejectedValueOnce(new Error('Sync failed'));

      const { result } = renderHook(() => useSafeOffline(), {
        wrapper: ({ children }) => (
          <SafeOfflineProvider>{children}</SafeOfflineProvider>
        ),
      });

      // Tentar sincronizar
      await act(async () => {
        await result.current.sync();
      });

      // Não deve lançar erro, mas deve setar hasError
      await waitFor(() => {
        expect(result.current.hasError).toBe(true);
        expect(result.current.errorMessage).toBeDefined();
      });
    });

    it('deve executar sync quando método é chamado', async () => {
      const { syncQueue } = await import('../../../lib/offline/syncQueue');
      
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      const { result } = renderHook(() => useSafeOffline(), {
        wrapper: ({ children }) => (
          <SafeOfflineProvider>{children}</SafeOfflineProvider>
        ),
      });

      // Chamar sync
      await act(async () => {
        await result.current.sync();
      });

      // Verificar que processQueue foi chamado
      expect(syncQueue.processQueue).toHaveBeenCalled();
    });

    it('deve retentar itens falhos', async () => {
      const { syncQueue } = await import('../../../lib/offline/syncQueue');
      
      // Mock da fila com itens falhos
      const mockItems: SyncQueueItem[] = [
        {
          id: 'item-1',
          type: 'create-appointment',
          data: {},
          timestamp: new Date(),
          retryCount: 2,
          maxRetries: 3,
          status: 'failed',
          error: 'Network error',
        },
      ];

      vi.mocked(syncQueue.subscribe).mockImplementation((callback) => {
        callback(mockItems);
        return vi.fn();
      });

      const { result, rerender } = renderHook(() => useSafeOffline(), {
        wrapper: ({ children }) => (
          <SafeOfflineProvider>{children}</SafeOfflineProvider>
        ),
      });

      // Forçar re-render para pegar items
      rerender();

      await waitFor(() => {
        expect(result.current.queueItems.length).toBe(1);
        expect(result.current.failedCount).toBe(1);
      });

      // Retentar falhos
      await act(async () => {
        await result.current.retryFailed();
      });

      // Verificar que retryItem foi chamado
      expect(syncQueue.retryItem).toHaveBeenCalledWith('item-1');
    });

    it('deve limpar a fila quando clearQueue é chamado', async () => {
      const { syncQueue } = await import('../../../lib/offline/syncQueue');

      const { result } = renderHook(() => useSafeOffline(), {
        wrapper: ({ children }) => (
          <SafeOfflineProvider>{children}</SafeOfflineProvider>
        ),
      });

      // Chamar clearQueue
      await act(async () => {
        await result.current.clearQueue();
      });

      // Verificar que cleanup foi chamado
      expect(syncQueue.cleanup).toHaveBeenCalled();
    });
  });

  describe('useSafeOffline', () => {
    it('deve retornar valores padrão quando usado fora do provider', () => {
      const { logger } = require('../../../lib/logger');
      
      const { result } = renderHook(() => useSafeOffline());

      // Deve retornar valores padrão
      expect(result.current.isOnline).toBe(true);
      expect(result.current.isSyncing).toBe(false);
      expect(result.current.queueSize).toBe(0);
      expect(result.current.hasError).toBe(false);

      // Deve logar warning
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('usado fora do SafeOfflineProvider'),
        expect.any(Object)
      );
    });

    it('deve funcionar corretamente dentro do provider', () => {
      const { result } = renderHook(() => useSafeOffline(), {
        wrapper: ({ children }) => (
          <SafeOfflineProvider>{children}</SafeOfflineProvider>
        ),
      });

      expect(result.current).toBeDefined();
      expect(typeof result.current.sync).toBe('function');
      expect(typeof result.current.retryFailed).toBe('function');
      expect(typeof result.current.clearQueue).toBe('function');
    });
  });

  describe('useOfflineStrict', () => {
    it('deve lançar erro quando usado fora do provider', () => {
      expect(() => {
        renderHook(() => useOfflineStrict());
      }).toThrow('useOfflineStrict must be used within SafeOfflineProvider');
    });

    it('deve funcionar corretamente dentro do provider', () => {
      const { result } = renderHook(() => useOfflineStrict(), {
        wrapper: ({ children }) => (
          <SafeOfflineProvider>{children}</SafeOfflineProvider>
        ),
      });

      expect(result.current).toBeDefined();
      expect(typeof result.current.sync).toBe('function');
    });
  });

  describe('Queue Operations', () => {
    it('deve calcular pendingCount corretamente', async () => {
      const { syncQueue } = await import('../../../lib/offline/syncQueue');
      
      const mockItems: SyncQueueItem[] = [
        {
          id: 'item-1',
          type: 'create-appointment',
          data: {},
          timestamp: new Date(),
          retryCount: 0,
          maxRetries: 3,
          status: 'pending',
        },
        {
          id: 'item-2',
          type: 'update-appointment',
          data: {},
          timestamp: new Date(),
          retryCount: 0,
          maxRetries: 3,
          status: 'pending',
        },
      ];

      vi.mocked(syncQueue.subscribe).mockImplementation((callback) => {
        callback(mockItems);
        return vi.fn();
      });

      const { result, rerender } = renderHook(() => useSafeOffline(), {
        wrapper: ({ children }) => (
          <SafeOfflineProvider>{children}</SafeOfflineProvider>
        ),
      });

      rerender();

      await waitFor(() => {
        expect(result.current.pendingCount).toBe(2);
        expect(result.current.queueSize).toBe(2);
      });
    });

    it('deve calcular failedCount corretamente', async () => {
      const { syncQueue } = await import('../../../lib/offline/syncQueue');
      
      const mockItems: SyncQueueItem[] = [
        {
          id: 'item-1',
          type: 'create-appointment',
          data: {},
          timestamp: new Date(),
          retryCount: 3,
          maxRetries: 3,
          status: 'failed',
          error: 'Max retries exceeded',
        },
      ];

      vi.mocked(syncQueue.subscribe).mockImplementation((callback) => {
        callback(mockItems);
        return vi.fn();
      });

      const { result, rerender } = renderHook(() => useSafeOffline(), {
        wrapper: ({ children }) => (
          <SafeOfflineProvider>{children}</SafeOfflineProvider>
        ),
      });

      rerender();

      await waitFor(() => {
        expect(result.current.failedCount).toBe(1);
      });
    });
  });
});

