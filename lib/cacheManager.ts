/**
 * 🚀 Cache Manager - Sistema de Cache Global Otimizado
 * 
 * Gerencia cache de dados com estratégias inteligentes:
 * - TTL (Time To Live) configurável
 * - Invalidação automática
 * - Cache por chave hierárquica
 * - Limpeza automática de memória
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  enableLRU?: boolean; // Enable Least Recently Used eviction
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private options: Required<CacheOptions>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl ?? 5 * 60 * 1000, // 5 minutos
      maxSize: options.maxSize ?? 1000,
      enableLRU: options.enableLRU ?? true
    };

    // Inicia limpeza automática a cada minuto
    this.startCleanup();
  }

  /**
   * Armazena dados no cache
   */
  set<T>(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl ?? this.options.ttl;
    
    // Verifica se precisa fazer eviction
    if (this.cache.size >= this.options.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    });
  }

  /**
   * Recupera dados do cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verifica se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Atualiza estatísticas de acesso
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.data as T;
  }

  /**
   * Verifica se uma chave existe no cache e não expirou
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove uma entrada específica do cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Invalida entradas que correspondem a um padrão
   */
  invalidatePattern(pattern: string | RegExp): number {
    let deletedCount = 0;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Invalida todas as entradas relacionadas a um domínio
   */
  invalidateDomain(domain: string): number {
    return this.invalidatePattern(`^${domain}:`);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats() {
    const entries = Array.from(this.cache.values());
    const now = Date.now();

    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate: entries.reduce((acc, entry) => acc + entry.accessCount, 0) / Math.max(entries.length, 1),
      expiredEntries: entries.filter(entry => now - entry.timestamp > entry.ttl).length,
      oldestEntry: Math.min(...entries.map(entry => entry.timestamp)),
      newestEntry: Math.max(...entries.map(entry => entry.timestamp))
    };
  }

  /**
   * Remove entradas menos recentemente usadas
   */
  private evictLeastRecentlyUsed(): void {
    if (!this.options.enableLRU) return;

    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    // Remove 10% das entradas menos usadas
    const toRemove = Math.ceil(entries.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Inicia limpeza automática de entradas expiradas
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const expiredKeys: string[] = [];

      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          expiredKeys.push(key);
        }
      }

      expiredKeys.forEach(key => this.cache.delete(key));

      if (expiredKeys.length > 0) {
        logger.debug(`Cache cleanup removeu ${expiredKeys.length} entradas expiradas.`, { context: 'cacheManager.cleanup', data: { count: expiredKeys.length } });
      }
    }, 60000); // Limpeza a cada minuto
  }

  /**
   * Para a limpeza automática
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Instância global do cache
export const globalCache = new CacheManager({
  ttl: 5 * 60 * 1000, // 5 minutos
  maxSize: 2000,
  enableLRU: true
});

// Cache especializados por domínio
export const therapistsCache = new CacheManager({
  ttl: 10 * 60 * 1000, // 10 minutos para terapeutas
  maxSize: 100
});

export const patientsCache = new CacheManager({
  ttl: 2 * 60 * 1000, // 2 minutos para pacientes
  maxSize: 500
});

export const appointmentsCache = new CacheManager({
  ttl: 1 * 60 * 1000, // 1 minuto para agendamentos
  maxSize: 1000
});

/**
 * Utilitários para cache com prefixos
 */
export const cacheKeys = {
  therapists: 'therapists:all',
  therapist: (id: string) => `therapist:${id}`,
  patients: 'patients:all',
  patient: (id: string) => `patient:${id}`,
  appointments: (startDate?: Date, endDate?: Date) => 
    startDate && endDate 
      ? `appointments:${startDate.toISOString()}:${endDate.toISOString()}`
      : 'appointments:all',
  appointment: (id: string) => `appointment:${id}`,
  user: (id: string) => `user:${id}`,
  notifications: (userId: string) => `notifications:${userId}`,
} as const;

/**
 * Helper para cache com fallback
 */
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  cacheManager: CacheManager = globalCache,
  customTtl?: number
): Promise<T> {
  // Tenta recuperar do cache primeiro
  const cached = cacheManager.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Se não estiver no cache, busca e armazena
  try {
    const data = await fetchFn();
    cacheManager.set(key, data, customTtl);
    return data;
  } catch (error) {
    logger.error('Falha ao buscar item no cache.', { context: 'cacheManager.getOrFetch', data: { key, error } });
    throw error;
  }
}

export default CacheManager;
