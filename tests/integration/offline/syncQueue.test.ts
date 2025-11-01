/**
 * 🧪 Testes de Integração - syncQueue
 * 
 * Testa o sistema de fila de sincronização com mock de IndexedDB.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { syncQueue, type SyncQueueItem } from '../../../lib/offline/syncQueue';

// Mock do IndexedDB
vi.mock('../../../lib/indexedDB', () => {
  const store = new Map<string, any>();
  
  return {
    indexedDB: {
      get: vi.fn(async (storeName: string, key: string) => {
        const storeData = store.get(storeName) || new Map();
        return storeData.get(key);
      }),
      set: vi.fn(async (storeName: string, value: any) => {
        const storeData = store.get(storeName) || new Map();
        storeData.set(value.id, value);
        store.set(storeName, storeData);
      }),
      delete: vi.fn(async (storeName: string, key: string) => {
        const storeData = store.get(storeName) || new Map();
        storeData.delete(key);
      }),
      getAll: vi.fn(async (storeName: string) => {
        const storeData = store.get(storeName) || new Map();
        return Array.from(storeData.values());
      }),
      clear: vi.fn(async (storeName: string) => {
        store.set(storeName, new Map());
      }),
      _store: store, // Para testes
    },
  };
});

// Mock de serviços
vi.mock('../../../services/supabase/appointmentServiceSupabase', () => ({
  supabaseAppointmentService: {
    createAppointment: vi.fn().mockResolvedValue({ id: 'appt-1' }),
    updateAppointment: vi.fn().mockResolvedValue({ id: 'appt-1' }),
    deleteAppointment: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('../../../services/commentService', () => ({
  commentService: {
    addComment: vi.fn().mockResolvedValue({ id: 'comment-1' }),
    updateComment: vi.fn().mockResolvedValue({ id: 'comment-1' }),
    deleteComment: vi.fn().mockResolvedValue(true),
  },
}));

describe('SyncQueue - Enfileiramento', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { indexedDB } = await import('../../../lib/indexedDB');
    await indexedDB.clear('offlineQueue');
  });

  it('deve enfileirar uma ação offline', async () => {
    const data = { patientId: 'patient-1', therapistId: 'therapist-1' };
    
    const itemId = await syncQueue.enqueue('create-appointment', data);

    expect(itemId).toBeDefined();
    expect(itemId).toMatch(/^sync-/);

    const items = await syncQueue.getAllItems();
    expect(items.length).toBe(1);
    expect(items[0].type).toBe('create-appointment');
    expect(items[0].status).toBe('pending');
  });

  it('deve criar item com propriedades corretas', async () => {
    const data = { test: 'data' };
    
    await syncQueue.enqueue('update-appointment', data, 5);

    const items = await syncQueue.getAllItems();
    const item = items[0];

    expect(item.id).toBeDefined();
    expect(item.type).toBe('update-appointment');
    expect(item.data).toEqual(data);
    expect(item.timestamp).toBeInstanceOf(Date);
    expect(item.retryCount).toBe(0);
    expect(item.maxRetries).toBe(5);
    expect(item.status).toBe('pending');
  });
});

describe('SyncQueue - Processamento', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { indexedDB } = await import('../../../lib/indexedDB');
    await indexedDB.clear('offlineQueue');
    
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
      configurable: true,
    });
  });

  it('deve processar fila quando online', async () => {
    const { supabaseAppointmentService } = await import('../../../services/supabase/appointmentServiceSupabase');
    
    // Adicionar item
    const data = { patientId: 'patient-1' };
    await syncQueue.enqueue('create-appointment', data);

    // Processar
    await syncQueue.processQueue();

    // Verificar que serviço foi chamado
    expect(supabaseAppointmentService.createAppointment).toHaveBeenCalledWith(data);

    // Item deve ter sido removido da fila
    const items = await syncQueue.getAllItems();
    expect(items.length).toBe(0);
  });

  it('não deve processar quando offline', async () => {
    const { supabaseAppointmentService } = await import('../../../services/supabase/appointmentServiceSupabase');
    
    // Ficar offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
      configurable: true,
    });

    // Adicionar item
    await syncQueue.enqueue('create-appointment', {});

    // Tentar processar
    await syncQueue.processQueue();

    // Serviço NÃO deve ter sido chamado
    expect(supabaseAppointmentService.createAppointment).not.toHaveBeenCalled();

    // Item ainda deve estar na fila
    const items = await syncQueue.getAllItems();
    expect(items.length).toBe(1);
  });

  it('deve marcar item como failed após max retries', async () => {
    const { supabaseAppointmentService } = await import('../../../services/supabase/appointmentServiceSupabase');
    
    // Mock erro no serviço
    vi.mocked(supabaseAppointmentService.createAppointment).mockRejectedValue(
      new Error('Network error')
    );

    // Adicionar item com maxRetries = 1
    await syncQueue.enqueue('create-appointment', {}, 1);

    // Processar (vai falhar)
    await syncQueue.processQueue();

    // Verificar que item está failed
    const items = await syncQueue.getAllItems();
    expect(items.length).toBe(1);
    expect(items[0].status).toBe('failed');
    expect(items[0].error).toBe('Network error');
  });

  it('deve fazer retry com backoff exponencial', async () => {
    vi.useFakeTimers();
    
    const { supabaseAppointmentService } = await import('../../../services/supabase/appointmentServiceSupabase');
    
    // Mock que falha na primeira vez, sucede na segunda
    let callCount = 0;
    vi.mocked(supabaseAppointmentService.createAppointment).mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        throw new Error('First attempt failed');
      }
      return { id: 'appt-1' };
    });

    // Adicionar item
    await syncQueue.enqueue('create-appointment', {}, 3);

    // Primeira tentativa (vai falhar)
    await syncQueue.processQueue();

    // Item deve estar pending com retryCount = 1
    let items = await syncQueue.getAllItems();
    expect(items[0].retryCount).toBe(1);
    expect(items[0].status).toBe('pending');

    // Avançar tempo para backoff (2^1 * 1000 = 2000ms)
    await vi.advanceTimersByTimeAsync(2100);

    // Aguardar processamento
    await vi.waitFor(async () => {
      items = await syncQueue.getAllItems();
      return items.length === 0;
    }, { timeout: 5000 });

    // Item deve ter sido removido (sucesso)
    expect(items.length).toBe(0);
    expect(callCount).toBe(2);

    vi.useRealTimers();
  });
});

describe('SyncQueue - Operações', () => {
  beforeEach(async () => {
    const { indexedDB } = await import('../../../lib/indexedDB');
    await indexedDB.clear('offlineQueue');
  });

  it('deve retentar item falho', async () => {
    const { supabaseAppointmentService } = await import('../../../services/supabase/appointmentServiceSupabase');
    
    // Mock que retorna sucesso
    vi.mocked(supabaseAppointmentService.createAppointment).mockResolvedValue({ id: 'appt-1' });

    // Adicionar item falho manualmente
    const { indexedDB } = await import('../../../lib/indexedDB');
    const failedItem: SyncQueueItem = {
      id: 'item-failed',
      type: 'create-appointment',
      data: {},
      timestamp: new Date(),
      retryCount: 3,
      maxRetries: 3,
      status: 'failed',
      error: 'Previous error',
    };

    await indexedDB.set('offlineQueue', failedItem);

    // Retentar
    await syncQueue.retryItem('item-failed');

    // Item deve estar pending novamente com retryCount resetado
    const items = await syncQueue.getAllItems();
    expect(items[0].status).toBe('pending');
    expect(items[0].retryCount).toBe(0);
    expect(items[0].error).toBeUndefined();
  });

  it('deve limpar itens completados e antigos', async () => {
    const { indexedDB } = await import('../../../lib/indexedDB');
    
    // Adicionar item completado
    const completedItem: SyncQueueItem = {
      id: 'item-1',
      type: 'create-appointment',
      data: {},
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3,
      status: 'completed',
    };

    // Adicionar item antigo (8 dias atrás)
    const oldItem: SyncQueueItem = {
      id: 'item-2',
      type: 'update-appointment',
      data: {},
      timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      retryCount: 0,
      maxRetries: 3,
      status: 'pending',
    };

    // Adicionar item recente pending
    const recentItem: SyncQueueItem = {
      id: 'item-3',
      type: 'delete-appointment',
      data: {},
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3,
      status: 'pending',
    };

    await indexedDB.set('offlineQueue', completedItem);
    await indexedDB.set('offlineQueue', oldItem);
    await indexedDB.set('offlineQueue', recentItem);

    // Cleanup
    await syncQueue.cleanup();

    // Apenas item recente deve permanecer
    const items = await syncQueue.getAllItems();
    expect(items.length).toBe(1);
    expect(items[0].id).toBe('item-3');
  });

  it('deve notificar listeners quando fila muda', async () => {
    const listener = vi.fn();
    
    // Inscrever
    const unsubscribe = syncQueue.subscribe(listener);

    // Listener deve ser chamado imediatamente
    expect(listener).toHaveBeenCalledWith([]);

    // Adicionar item
    await syncQueue.enqueue('create-appointment', {});

    // Aguardar notificação
    await vi.waitFor(() => {
      expect(listener).toHaveBeenCalledTimes(2);
    });

    const callArgs = listener.mock.calls[1][0];
    expect(callArgs.length).toBe(1);
    expect(callArgs[0].type).toBe('create-appointment');

    // Desinscrever
    unsubscribe();
  });

  it('deve retornar apenas itens pendentes em getPendingItems', async () => {
    const { indexedDB } = await import('../../../lib/indexedDB');
    
    // Adicionar vários itens com status diferentes
    await indexedDB.set('offlineQueue', {
      id: 'item-1',
      type: 'create-appointment',
      data: {},
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3,
      status: 'pending',
    });

    await indexedDB.set('offlineQueue', {
      id: 'item-2',
      type: 'update-appointment',
      data: {},
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3,
      status: 'failed',
    });

    await indexedDB.set('offlineQueue', {
      id: 'item-3',
      type: 'delete-appointment',
      data: {},
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3,
      status: 'processing',
    });

    const pendingItems = await syncQueue.getPendingItems();

    // Apenas pending e processing devem ser retornados
    expect(pendingItems.length).toBe(2);
    expect(pendingItems.some(i => i.status === 'failed')).toBe(false);
  });
});

