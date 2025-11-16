// packages/agenda-pacientes/src/lib/cache.ts
import { indexedDB } from '../../../../shared/services/indexedDB';

export interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt: Date;
}

const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutos

export async function getCache<T>(key: string): Promise<T | undefined> {
  try {
    const entry = await indexedDB.get('cache', key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    const isExpired = new Date(entry.expiresAt).getTime() < Date.now();
    if (isExpired) {
      // Expirado: remover do cache
      await indexedDB.delete('cache', key);
      return undefined;
    }
    return entry.value;
  } catch {
    return undefined;
  }
}

export async function setCache<T>(key: string, value: T, ttlMs: number = DEFAULT_TTL_MS): Promise<void> {
  try {
    const entry: CacheEntry<T> = {
      key,
      value,
      expiresAt: new Date(Date.now() + ttlMs),
    };
    await indexedDB.set('cache', entry as any);
  } catch {
    // silencioso: fallback interno do IndexedDBManager já cuida
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await indexedDB.delete('cache', key);
  } catch {
    // silencioso
  }
}

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<T> {
  const cached = await getCache<T>(key);
  if (cached !== undefined) return cached;
  const value = await fetcher();
  await setCache<T>(key, value, ttlMs);
  return value;
}

export const DEFAULT_CACHE_TTL_MS = DEFAULT_TTL_MS;