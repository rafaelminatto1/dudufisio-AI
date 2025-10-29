// lib/cacheManager.ts
/**
 * Gerenciador de cache inteligente para otimização de performance
 * Suporta LocalStorage, SessionStorage e memória
 */

const CACHE_PREFIX = 'dudufisio_monitoring_';
const CACHE_VERSION = 'v1';
const CACHE_TTL = 1000 * 60 * 15; // 15 minutos

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

interface CacheOptions {
  ttl?: number; // Time to live em milissegundos
  storage?: 'local' | 'session' | 'memory';
}

// Cache em memória para dados temporários da sessão
const memoryCache = new Map<string, CacheEntry<any>>();

/**
 * Salva dados no cache
 */
export function setCache<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): void {
  const { storage = 'local', ttl = CACHE_TTL } = options;
  const cacheKey = `${CACHE_PREFIX}${key}`;
  
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    version: CACHE_VERSION,
  };

  try {
    if (storage === 'memory') {
      memoryCache.set(cacheKey, entry);
    } else if (storage === 'session') {
      sessionStorage.setItem(cacheKey, JSON.stringify(entry));
    } else {
      localStorage.setItem(cacheKey, JSON.stringify(entry));
    }
  } catch (error) {
    console.warn(`Failed to set cache for key: ${key}`, error);
  }
}

/**
 * Recupera dados do cache
 */
export function getCache<T>(
  key: string,
  options: CacheOptions = {}
): T | null {
  const { storage = 'local', ttl = CACHE_TTL } = options;
  const cacheKey = `${CACHE_PREFIX}${key}`;

  try {
    let entry: CacheEntry<T> | null = null;

    if (storage === 'memory') {
      entry = memoryCache.get(cacheKey) || null;
    } else if (storage === 'session') {
      const stored = sessionStorage.getItem(cacheKey);
      entry = stored ? JSON.parse(stored) : null;
    } else {
      const stored = localStorage.getItem(cacheKey);
      entry = stored ? JSON.parse(stored) : null;
    }

    if (!entry) return null;

    // Verificar versão
    if (entry.version !== CACHE_VERSION) {
      removeCache(key, { storage });
      return null;
    }

    // Verificar TTL
    const age = Date.now() - entry.timestamp;
    if (age > ttl) {
      removeCache(key, { storage });
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn(`Failed to get cache for key: ${key}`, error);
    return null;
  }
}

/**
 * Remove item do cache
 */
export function removeCache(
  key: string,
  options: CacheOptions = {}
): void {
  const { storage = 'local' } = options;
  const cacheKey = `${CACHE_PREFIX}${key}`;

  try {
    if (storage === 'memory') {
      memoryCache.delete(cacheKey);
    } else if (storage === 'session') {
      sessionStorage.removeItem(cacheKey);
    } else {
      localStorage.removeItem(cacheKey);
    }
  } catch (error) {
    console.warn(`Failed to remove cache for key: ${key}`, error);
  }
}

/**
 * Limpa todo o cache do aplicativo
 */
export function clearAllCache(): void {
  // Limpar memória
  memoryCache.clear();

  // Limpar localStorage
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Failed to clear localStorage cache', error);
  }

  // Limpar sessionStorage
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  } catch (error) {
    console.warn('Failed to clear sessionStorage cache', error);
  }
}

/**
 * Verifica se um cache existe e está válido
 */
export function hasCacheEntry(
  key: string,
  options: CacheOptions = {}
): boolean {
  return getCache(key, options) !== null;
}

/**
 * Chaves de cache pré-definidas para o monitoramento
 */
export const CacheKeys = {
  PATIENTS_METRICS: 'patients_metrics',
  KPI_SUMMARY: 'kpi_summary',
  PRESENCE_DATA: 'presence_data',
  PAIN_DISTRIBUTION: 'pain_distribution',
  FILTERS: 'filters_state',
  SORT_CONFIG: 'sort_config',
  PAGE_STATE: 'page_state',
} as const;

/**
 * Hook-like function para cache com invalidação automática
 */
export function useCacheWithInvalidation<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions & { invalidateOn?: string[] } = {}
): {
  getData: () => Promise<T>;
  invalidate: () => void;
  refresh: () => Promise<T>;
} {
  return {
    getData: async () => {
      const cached = getCache<T>(key, options);
      if (cached) return cached;

      const data = await fetcher();
      setCache(key, data, options);
      return data;
    },
    invalidate: () => {
      removeCache(key, options);
    },
    refresh: async () => {
      removeCache(key, options);
      const data = await fetcher();
      setCache(key, data, options);
      return data;
    },
  };
}

/**
 * Debounce para salvar no cache (evita salvar muito frequentemente)
 */
export function debouncedCacheSet<T>(
  key: string,
  data: T,
  options: CacheOptions = {},
  delay: number = 500
): void {
  const timeoutKey = `${key}_timeout`;
  const existingTimeout = (window as any)[timeoutKey];
  
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  (window as any)[timeoutKey] = setTimeout(() => {
    setCache(key, data, options);
    delete (window as any)[timeoutKey];
  }, delay);
}
