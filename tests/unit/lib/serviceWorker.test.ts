/**
 * 🧪 Testes Unitários - Service Worker
 * 
 * Testa o sistema unificado de gerenciamento de service worker.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  registerServiceWorker,
  unregisterServiceWorker,
  updateServiceWorker,
  getServiceWorkerStatus,
  clearServiceWorkerCache,
  isPWA,
  setupInstallPrompt,
  requestNotificationPermission,
} from '../../../lib/serviceWorker';

// Mocks
vi.mock('../../../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock global para import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: {
      DEV: false,
      PROD: true,
    },
  },
});

describe('registerServiceWorker', () => {
  let mockRegistration: Partial<ServiceWorkerRegistration>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockRegistration = {
      scope: '/',
      active: {
        state: 'activated',
      } as ServiceWorker,
      installing: null,
      waiting: null,
      addEventListener: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
      unregister: vi.fn().mockResolvedValue(true),
    };

    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      value: {
        register: vi.fn().mockResolvedValue(mockRegistration),
        getRegistration: vi.fn().mockResolvedValue(mockRegistration),
        ready: Promise.resolve(mockRegistration),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        controller: null,
      },
      configurable: true,
    });

    // Mock document.readyState
    Object.defineProperty(document, 'readyState', {
      writable: true,
      value: 'complete',
      configurable: true,
    });
  });

  it('deve registrar service worker com sucesso', async () => {
    const onSuccess = vi.fn();
    
    const registration = await registerServiceWorker({ onSuccess });

    expect(navigator.serviceWorker.register).toHaveBeenCalledWith(
      '/service-worker.js',
      expect.objectContaining({
        scope: '/',
        updateViaCache: 'none',
      })
    );
    
    expect(registration).toBeDefined();
    expect(onSuccess).toHaveBeenCalledWith(mockRegistration);
  });

  it('não deve registrar em ambiente de desenvolvimento', async () => {
    // Mock DEV environment
    vi.stubGlobal('import', {
      meta: {
        env: {
          DEV: true,
          PROD: false,
        },
      },
    });

    const result = await registerServiceWorker();

    expect(result).toBeNull();
    expect(navigator.serviceWorker.register).not.toHaveBeenCalled();
  });

  it('deve retornar null quando serviceWorker não é suportado', async () => {
    // Remover suporte a SW
    const originalSW = navigator.serviceWorker;
    Object.defineProperty(navigator, 'serviceWorker', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const result = await registerServiceWorker();

    expect(result).toBeNull();

    // Restaurar
    Object.defineProperty(navigator, 'serviceWorker', {
      value: originalSW,
      writable: true,
      configurable: true,
    });
  });

  it('deve chamar onError quando registro falha', async () => {
    const error = new Error('Registration failed');
    const onError = vi.fn();
    
    vi.mocked(navigator.serviceWorker.register).mockRejectedValueOnce(error);

    const result = await registerServiceWorker({ onError });

    expect(result).toBeNull();
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('deve configurar verificação periódica de atualizações quando habilitado', async () => {
    vi.useFakeTimers();
    
    await registerServiceWorker({
      enablePeriodicUpdates: true,
      updateInterval: 1000, // 1 segundo para teste
    });

    // Avançar tempo
    vi.advanceTimersByTime(1100);

    await vi.waitFor(() => {
      expect(mockRegistration.update).toHaveBeenCalled();
    });

    vi.useRealTimers();
  });
});

describe('unregisterServiceWorker', () => {
  beforeEach(() => {
    const mockRegistration = {
      unregister: vi.fn().mockResolvedValue(true),
    };

    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      value: {
        getRegistration: vi.fn().mockResolvedValue(mockRegistration),
      },
      configurable: true,
    });
  });

  it('deve desregistrar service worker com sucesso', async () => {
    const result = await unregisterServiceWorker();

    expect(result).toBe(true);
  });

  it('deve retornar false quando não há registration', async () => {
    vi.mocked(navigator.serviceWorker.getRegistration).mockResolvedValueOnce(undefined);

    const result = await unregisterServiceWorker();

    expect(result).toBe(false);
  });
});

describe('updateServiceWorker', () => {
  it('deve enviar mensagem SKIP_WAITING para waiting worker', async () => {
    const mockWaiting = {
      postMessage: vi.fn(),
      state: 'installed',
    } as unknown as ServiceWorker;

    const mockRegistration = {
      waiting: mockWaiting,
    } as ServiceWorkerRegistration;

    vi.mocked(navigator.serviceWorker.getRegistration).mockResolvedValueOnce(mockRegistration);

    await updateServiceWorker(true, false);

    expect(mockWaiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
  });

  it('não deve fazer nada se não há waiting worker', async () => {
    const mockRegistration = {
      waiting: null,
    } as ServiceWorkerRegistration;

    vi.mocked(navigator.serviceWorker.getRegistration).mockResolvedValueOnce(mockRegistration);

    await updateServiceWorker();

    // Não deve lançar erro
    expect(true).toBe(true);
  });
});

describe('getServiceWorkerStatus', () => {
  it('deve retornar status correto quando SW está ativo', async () => {
    const mockRegistration = {
      active: {} as ServiceWorker,
      waiting: null,
      installing: null,
    } as ServiceWorkerRegistration;

    vi.mocked(navigator.serviceWorker.getRegistration).mockResolvedValueOnce(mockRegistration);

    const status = await getServiceWorkerStatus();

    expect(status).toEqual({
      registered: true,
      active: true,
      waiting: false,
      installing: false,
      updateAvailable: false,
    });
  });

  it('deve retornar updateAvailable quando há waiting worker', async () => {
    const mockRegistration = {
      active: {} as ServiceWorker,
      waiting: {} as ServiceWorker,
      installing: null,
    } as ServiceWorkerRegistration;

    vi.mocked(navigator.serviceWorker.getRegistration).mockResolvedValueOnce(mockRegistration);

    const status = await getServiceWorkerStatus();

    expect(status.updateAvailable).toBe(true);
    expect(status.waiting).toBe(true);
  });
});

describe('clearServiceWorkerCache', () => {
  it('deve limpar todos os caches com sucesso', async () => {
    const mockCaches = {
      keys: vi.fn().mockResolvedValue(['cache-1', 'cache-2']),
      delete: vi.fn().mockResolvedValue(true),
    };

    (global as any).caches = mockCaches;

    const result = await clearServiceWorkerCache();

    expect(result).toBe(true);
    expect(mockCaches.delete).toHaveBeenCalledWith('cache-1');
    expect(mockCaches.delete).toHaveBeenCalledWith('cache-2');
  });

  it('deve retornar false quando Cache API não é suportada', async () => {
    const originalCaches = (global as any).caches;
    delete (global as any).caches;

    const result = await clearServiceWorkerCache();

    expect(result).toBe(false);

    (global as any).caches = originalCaches;
  });
});

describe('isPWA', () => {
  it('deve retornar true quando em modo standalone', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });

    expect(isPWA()).toBe(true);
  });

  it('deve retornar true para iOS standalone', () => {
    (window.navigator as any).standalone = true;

    expect(isPWA()).toBe(true);

    delete (window.navigator as any).standalone;
  });

  it('deve retornar false quando não é PWA', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });

    expect(isPWA()).toBe(false);
  });
});

describe('setupInstallPrompt', () => {
  it('deve capturar evento beforeinstallprompt', () => {
    const onInstallable = vi.fn();
    
    setupInstallPrompt(onInstallable);

    const mockPrompt = {
      preventDefault: vi.fn(),
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    };

    window.dispatchEvent(
      new Event('beforeinstallprompt') as any
    );

    // Evento deve ter sido capturado
    expect(window.addEventListener).toHaveBeenCalledWith(
      'beforeinstallprompt',
      expect.any(Function)
    );
  });

  it('deve chamar onInstalled quando app é instalado', () => {
    const onInstalled = vi.fn();
    
    setupInstallPrompt(undefined, onInstalled);

    window.dispatchEvent(new Event('appinstalled'));

    expect(window.addEventListener).toHaveBeenCalledWith(
      'appinstalled',
      expect.any(Function)
    );
  });
});

describe('requestNotificationPermission', () => {
  it('deve retornar denied quando Notification não é suportado', async () => {
    const originalNotification = (global as any).Notification;
    delete (global as any).Notification;

    const permission = await requestNotificationPermission();

    expect(permission).toBe('denied');

    (global as any).Notification = originalNotification;
  });

  it('deve retornar granted se permissão já foi concedida', async () => {
    (global as any).Notification = {
      permission: 'granted',
      requestPermission: vi.fn(),
    };

    const permission = await requestNotificationPermission();

    expect(permission).toBe('granted');
    expect((global as any).Notification.requestPermission).not.toHaveBeenCalled();
  });

  it('deve solicitar permissão quando ainda não foi concedida', async () => {
    const mockRequestPermission = vi.fn().mockResolvedValue('granted');
    
    (global as any).Notification = {
      permission: 'default',
      requestPermission: mockRequestPermission,
    };

    const permission = await requestNotificationPermission();

    expect(mockRequestPermission).toHaveBeenCalled();
    expect(permission).toBe('granted');
  });
});

