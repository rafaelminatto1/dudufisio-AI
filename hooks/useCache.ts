/**
 * useCache - Hook para gerenciamento de cache com TTL e invalidação
 * Fornece cache em memória para queries do Supabase
 */

import { useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Cache global compartilhado entre componentes
const globalCache = new Map<string, CacheEntry<any>>();

export interface UseCacheOptions {
  /**
   * Tempo de vida do cache em milissegundos
   * @default 5 * 60 * 1000 (5 minutos)
   */
  ttl?: number;

  /**
   * Usar cache global (compartilhado) ou local (por componente)
   * @default true
   */
  useGlobalCache?: boolean;

  /**
   * Prefixo para as keys do cache (útil para namespacing)
   */
  keyPrefix?: string;
}

export function useCache(
  baseKey: string,
  defaultTtl: number = 5 * 60 * 1000,
  options: UseCacheOptions = {}
) {
  const {
    ttl = defaultTtl,
    useGlobalCache = true,
    keyPrefix = '',
  } = options;

  // Cache local (por componente)
  const localCache = useRef<Map<string, CacheEntry<any>>>(new Map());

  // Escolher qual cache usar
  const cache = useGlobalCache ? globalCache : localCache.current;

  /**
   * Gera key completa com prefixo
   */
  const getFullKey = useCallback(
    (key: string) => {
      return keyPrefix ? `${keyPrefix}:${key}` : key;
    },
    [keyPrefix]
  );

  /**
   * Verifica se entrada do cache é válida
   */
  const isValid = useCallback((entry: CacheEntry<any>): boolean => {
    const now = Date.now();
    return now - entry.timestamp < entry.ttl;
  }, []);

  /**
   * Busca valor do cache
   */
  const get = useCallback(
    <T = any>(key?: string): T | null => {
      const fullKey = getFullKey(key || baseKey);
      const entry = cache.get(fullKey);

      if (!entry) {
        return null;
      }

      // Verificar se está expirado
      if (!isValid(entry)) {
        cache.delete(fullKey);
        return null;
      }

      return entry.data as T;
    },
    [baseKey, cache, getFullKey, isValid]
  );

  /**
   * Salva valor no cache
   */
  const set = useCallback(
    <T = any>(data: T, key?: string, customTtl?: number): void => {
      const fullKey = getFullKey(key || baseKey);
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: customTtl || ttl,
      };
      cache.set(fullKey, entry);
    },
    [baseKey, cache, getFullKey, ttl]
  );

  /**
   * Invalida entrada específica do cache
   */
  const invalidate = useCallback(
    (key?: string): void => {
      const fullKey = getFullKey(key || baseKey);
      cache.delete(fullKey);
    },
    [baseKey, cache, getFullKey]
  );

  /**
   * Invalida todas as entradas que começam com um prefixo
   */
  const invalidatePrefix = useCallback(
    (prefix: string): void => {
      const fullPrefix = getFullKey(prefix);
      const keysToDelete: string[] = [];

      cache.forEach((_, key) => {
        if (key.startsWith(fullPrefix)) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach(key => cache.delete(key));
    },
    [cache, getFullKey]
  );

  /**
   * Limpa todo o cache
   */
  const clear = useCallback((): void => {
    cache.clear();
  }, [cache]);

  /**
   * Busca do cache ou executa função
   */
  const getOrFetch = useCallback(
    async <T = any>(
      fetchFn: () => Promise<T>,
      key?: string,
      customTtl?: number
    ): Promise<T> => {
      const fullKey = getFullKey(key || baseKey);

      // Tentar buscar do cache
      const cached = get<T>(fullKey);
      if (cached !== null) {
        return cached;
      }

      // Buscar da fonte
      const data = await fetchFn();

      // Salvar no cache
      set(data, fullKey, customTtl);

      return data;
    },
    [baseKey, get, getFullKey, set]
  );

  /**
   * Retorna estatísticas do cache
   */
  const getStats = useCallback(() => {
    const allKeys = Array.from(cache.keys());
    const prefixKeys = allKeys.filter(key => 
      key.startsWith(getFullKey(''))
    );

    let validCount = 0;
    let expiredCount = 0;

    prefixKeys.forEach(key => {
      const entry = cache.get(key);
      if (entry) {
        if (isValid(entry)) {
          validCount++;
        } else {
          expiredCount++;
        }
      }
    });

    return {
      total: prefixKeys.length,
      valid: validCount,
      expired: expiredCount,
      keys: prefixKeys,
    };
  }, [cache, getFullKey, isValid]);

  /**
   * Limpa entradas expiradas
   */
  const cleanExpired = useCallback((): number => {
    let cleaned = 0;
    const keysToDelete: string[] = [];

    cache.forEach((entry, key) => {
      if (!isValid(entry)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      cache.delete(key);
      cleaned++;
    });

    return cleaned;
  }, [cache, isValid]);

  return {
    /**
     * Busca valor do cache (retorna null se não existir ou expirado)
     */
    get,
    
    /**
     * Salva valor no cache
     */
    set,
    
    /**
     * Invalida entrada do cache
     */
    invalidate,
    
    /**
     * Invalida todas as entradas com um prefixo
     */
    invalidatePrefix,
    
    /**
     * Limpa todo o cache
     */
    clear,
    
    /**
     * Busca do cache ou executa função
     */
    getOrFetch,
    
    /**
     * Retorna estatísticas do cache
     */
    getStats,
    
    /**
     * Limpa entradas expiradas
     */
    cleanExpired,
    
    /**
     * Alias para get (compatibilidade)
     */
    getCached: get,
    
    /**
     * Alias para set (compatibilidade)
     */
    setCached: set,
  };
}

/**
 * Hook simplificado que retorna apenas get/set/invalidate
 */
export function useSimpleCache<T = any>(
  key: string,
  ttl: number = 5 * 60 * 1000
) {
  const { get, set, invalidate } = useCache(key, ttl);

  return {
    get: () => get<T>(),
    set: (data: T) => set(data),
    invalidate,
  };
}

/**
 * Limpa cache global (útil para testes ou logout)
 */
export function clearGlobalCache(): void {
  globalCache.clear();
}

/**
 * Remove entradas expiradas do cache global
 */
export function cleanGlobalCache(): number {
  let cleaned = 0;
  const now = Date.now();
  const keysToDelete: string[] = [];

  globalCache.forEach((entry, key) => {
    if (now - entry.timestamp >= entry.ttl) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => {
    globalCache.delete(key);
    cleaned++;
  });

  return cleaned;
}

/**
 * Retorna estatísticas do cache global
 */
export function getGlobalCacheStats() {
  const now = Date.now();
  let valid = 0;
  let expired = 0;

  globalCache.forEach(entry => {
    if (now - entry.timestamp < entry.ttl) {
      valid++;
    } else {
      expired++;
    }
  });

  return {
    total: globalCache.size,
    valid,
    expired,
    keys: Array.from(globalCache.keys()),
  };
}

// Limpar cache expirado a cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    const cleaned = cleanGlobalCache();
    if (cleaned > 0) {
      console.log(`[Cache] Limpou ${cleaned} entradas expiradas`);
    }
  }, 5 * 60 * 1000);
}

