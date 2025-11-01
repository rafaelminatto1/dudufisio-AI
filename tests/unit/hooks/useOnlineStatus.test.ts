/**
 * 🧪 Testes Unitários - useOnlineStatus Hooks
 * 
 * Testa os hooks unificados de status online/offline.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOnlineStatus, useServiceWorker, usePushNotifications } from '../../../hooks/useOnlineStatus';
import type { OfflineContextType } from '../../../contexts/SafeOfflineContext';

// Mocks
vi.mock('../../../contexts/SafeOfflineContext', () => ({
  useSafeOffline: vi.fn(),
}));

vi.mock('../../../lib/serviceWorker', () => ({
  getServiceWorkerStatus: vi.fn(),
  updateServiceWorker: vi.fn(),
}));

vi.mock('../../../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('useOnlineStatus', () => {
  const mockDefaultContext: OfflineContextType = {
    isOnline: true,
    isSyncing: false,
    queueSize: 0,
    pendingCount: 0,
    failedCount: 0,
    queueItems: [],
    sync: vi.fn().mockResolvedValue(undefined),
    retryFailed: vi.fn().mockResolvedValue(undefined),
    clearQueue: vi.fn().mockResolvedValue(undefined),
    hasError: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const { useSafeOffline } = require('../../../contexts/SafeOfflineContext');
    vi.mocked(useSafeOffline).mockReturnValue(mockDefaultContext);
  });

  it('deve integrar com SafeOfflineContext corretamente', () => {
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
    expect(result.current.isSyncing).toBe(false);
    expect(result.current.queueSize).toBe(0);
  });

  it('deve usar fallback local quando context tem erro', () => {
    const { useSafeOffline } = require('../../../contexts/SafeOfflineContext');
    
    vi.mocked(useSafeOffline).mockReturnValue({
      ...mockDefaultContext,
      hasError: true,
    });

    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
      configurable: true,
    });

    const { result } = renderHook(() => useOnlineStatus());

    // Deve usar valor local do navigator
    expect(result.current.hasError).toBe(true);
  });

  it('deve setar wasOffline quando volta online', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
      configurable: true,
    });

    const { useSafeOffline } = require('../../../contexts/SafeOfflineContext');
    
    // Começar offline
    vi.mocked(useSafeOffline).mockReturnValue({
      ...mockDefaultContext,
      isOnline: false,
      hasError: true,
    });

    const { result, rerender } = renderHook(() => useOnlineStatus());

    expect(result.current.isOnline).toBe(false);

    // Simular volta online
    await act(async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
        configurable: true,
      });
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(result.current.wasOffline).toBe(true);
    });

    // Após 3 segundos, deve resetar
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 3100));
    });

    await waitFor(() => {
      expect(result.current.wasOffline).toBe(false);
    });
  });

  it('deve disparar eventos customizados', async () => {
    const { useSafeOffline } = require('../../../contexts/SafeOfflineContext');
    
    vi.mocked(useSafeOffline).mockReturnValue({
      ...mockDefaultContext,
      hasError: true, // Usar listeners locais
    });

    const onlineListener = vi.fn();
    const offlineListener = vi.fn();

    window.addEventListener('app:online', onlineListener);
    window.addEventListener('app:offline', offlineListener);

    renderHook(() => useOnlineStatus());

    // Simular offline
    await act(async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
        configurable: true,
      });
      window.dispatchEvent(new Event('offline'));
    });

    expect(offlineListener).toHaveBeenCalled();

    // Simular online
    await act(async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
        configurable: true,
      });
      window.dispatchEvent(new Event('online'));
    });

    expect(onlineListener).toHaveBeenCalled();

    window.removeEventListener('app:online', onlineListener);
    window.removeEventListener('app:offline', offlineListener);
  });
});

describe('useServiceWorker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    const { getServiceWorkerStatus } = require('../../../lib/serviceWorker');
    vi.mocked(getServiceWorkerStatus).mockResolvedValue({
      registered: false,
      active: false,
      waiting: false,
      installing: false,
      updateAvailable: false,
    });
  });

  it('deve carregar status inicial do service worker', async () => {
    const { getServiceWorkerStatus } = require('../../../lib/serviceWorker');
    
    vi.mocked(getServiceWorkerStatus).mockResolvedValue({
      registered: true,
      active: true,
      waiting: false,
      installing: false,
      updateAvailable: false,
    });

    const { result } = renderHook(() => useServiceWorker());

    await waitFor(() => {
      expect(result.current.registered).toBe(true);
      expect(result.current.active).toBe(true);
    });
  });

  it('deve detectar quando há atualização disponível', async () => {
    const { getServiceWorkerStatus } = require('../../../lib/serviceWorker');
    
    const { result, rerender } = renderHook(() => useServiceWorker());

    // Inicialmente sem atualização
    expect(result.current.updateAvailable).toBe(false);

    // Simular atualização disponível
    await act(async () => {
      vi.mocked(getServiceWorkerStatus).mockResolvedValue({
        registered: true,
        active: true,
        waiting: true,
        installing: false,
        updateAvailable: true,
      });

      // Simular mensagem do SW
      if ('serviceWorker' in navigator) {
        const event = new MessageEvent('message', {
          data: { type: 'SW_UPDATE_AVAILABLE' },
        });
        navigator.serviceWorker.dispatchEvent(event);
      }
    });

    await waitFor(() => {
      expect(result.current.showUpdatePrompt).toBe(true);
    });
  });

  it('deve chamar updateServiceWorker quando update é chamado', async () => {
    const { updateServiceWorker } = require('../../../lib/serviceWorker');

    const { result } = renderHook(() => useServiceWorker());

    await act(async () => {
      await result.current.update();
    });

    expect(updateServiceWorker).toHaveBeenCalledWith(true, true);
  });

  it('deve ocultar prompt quando dismissUpdate é chamado', async () => {
    const { result } = renderHook(() => useServiceWorker());

    // Simular prompt visível
    await act(async () => {
      if ('serviceWorker' in navigator) {
        const event = new MessageEvent('message', {
          data: { type: 'SW_UPDATE_AVAILABLE' },
        });
        navigator.serviceWorker.dispatchEvent(event);
      }
    });

    await waitFor(() => {
      expect(result.current.showUpdatePrompt).toBe(true);
    });

    // Dispensar
    act(() => {
      result.current.dismissUpdate();
    });

    expect(result.current.showUpdatePrompt).toBe(false);
  });
});

describe('usePushNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar denied quando Notification não é suportado', () => {
    // Mock window sem Notification
    const originalNotification = (global as any).Notification;
    delete (global as any).Notification;

    const { result } = renderHook(() => usePushNotifications());

    expect(result.current.permission).toBe('denied');
    expect(result.current.isSupported).toBe(false);

    // Restaurar
    (global as any).Notification = originalNotification;
  });

  it('deve retornar permissão atual quando Notification é suportado', () => {
    // Mock Notification API
    (global as any).Notification = {
      permission: 'granted',
      requestPermission: vi.fn().mockResolvedValue('granted'),
    };

    (global as any).PushManager = class {};

    const { result } = renderHook(() => usePushNotifications());

    expect(result.current.permission).toBe('granted');
    expect(result.current.isSupported).toBe(true);
  });

  it('deve solicitar permissão quando requestPermission é chamado', async () => {
    const mockRequestPermission = vi.fn().mockResolvedValue('granted');
    
    (global as any).Notification = {
      permission: 'default',
      requestPermission: mockRequestPermission,
    };

    (global as any).PushManager = class {};

    const { result } = renderHook(() => usePushNotifications());

    let permission: NotificationPermission = 'default';
    
    await act(async () => {
      permission = await result.current.requestPermission();
    });

    expect(mockRequestPermission).toHaveBeenCalled();
    expect(permission).toBe('granted');
  });

  it('deve retornar granted se permissão já foi concedida', async () => {
    (global as any).Notification = {
      permission: 'granted',
      requestPermission: vi.fn(),
    };

    (global as any).PushManager = class {};

    const { result } = renderHook(() => usePushNotifications());

    const permission = await act(async () => {
      return await result.current.requestPermission();
    });

    expect(permission).toBe('granted');
    // Não deve chamar requestPermission se já concedido
    expect((global as any).Notification.requestPermission).not.toHaveBeenCalled();
  });
});

