import { AIResponse } from '../../types';
import { AIConsultationCategory } from './types';

interface CacheEntry {
  response: AIResponse;
  expiry: number;
  createdAt: number;
  category: AIConsultationCategory;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY_PREFIX = 'fisioflow_ai_cache::';

const CATEGORY_TTL: Record<AIConsultationCategory, number> = {
  exercise_suggestion: 15 * 60 * 1000, // 15 minutes
  patient_progress: 10 * 60 * 1000, // 10 minutes
  differential_diagnosis: 2 * 60 * 1000, // 2 minutes (force fresher answers)
  discharge_report: 60 * 60 * 1000, // 1 hour
  patient_question: 3 * 60 * 1000, // 3 minutes to avoid stale clarifications
  knowledge_update: 24 * 60 * 60 * 1000, // 24 hours
  other: DEFAULT_TTL_MS,
};

const isBrowser = typeof window !== 'undefined';

function normalisePrompt(prompt: string): string {
  return prompt.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 200);
}

function cloneResponse(response: AIResponse): AIResponse {
  return {
    ...response,
    metadata: response.metadata ? { ...response.metadata } : undefined,
  };
}

class CacheService {
  private readonly storage: Storage | null;
  private readonly memoryCache = new Map<string, CacheEntry>();

  constructor() {
    this.storage = this.resolveStorage();
  }

  get(category: AIConsultationCategory, prompt: string): AIResponse | null {
    const key = this.buildKey(category, prompt);
    const entry = this.readEntry(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.deleteKey(key);
      return null;
    }

    const response = cloneResponse(entry.response);
    response.metadata = {
      ...response.metadata,
      cached: true,
      strategy: response.metadata?.strategy ?? 'cache',
    };

    return response;
  }

  set(
    category: AIConsultationCategory,
    prompt: string,
    response: AIResponse,
    ttlOverride?: number,
  ): void {
    const key = this.buildKey(category, prompt);
    const ttl = ttlOverride ?? CATEGORY_TTL[category] ?? DEFAULT_TTL_MS;
    const entry: CacheEntry = {
      response: cloneResponse(response),
      expiry: Date.now() + ttl,
      createdAt: Date.now(),
      category,
    };

    this.persistEntry(key, entry);
  }

  clear(): void {
    this.memoryCache.clear();
    if (this.storage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < this.storage.length; i += 1) {
        const key = this.storage.key(i);
        if (key?.startsWith(CACHE_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => this.storage!.removeItem(key));
    }
  }

  invalidateCategory(category: AIConsultationCategory): void {
    const prefix = `${CACHE_KEY_PREFIX}${category}::`;
    this.memoryCache.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    });

    if (this.storage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < this.storage.length; i += 1) {
        const key = this.storage.key(i);
        if (key?.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => this.storage!.removeItem(key));
    }
  }

  private buildKey(category: AIConsultationCategory, prompt: string): string {
    return `${CACHE_KEY_PREFIX}${category}::${normalisePrompt(prompt)}`;
  }

  private resolveStorage(): Storage | null {
    if (!isBrowser) {
      return null;
    }

    try {
      const testKey = `${CACHE_KEY_PREFIX}__test__`;
      window.sessionStorage.setItem(testKey, '1');
      window.sessionStorage.removeItem(testKey);
      return window.sessionStorage;
    } catch (error) {
      console.warn('[CacheService] Session storage unavailable, falling back to memory cache.', error);
      return null;
    }
  }

  private readEntry(key: string): CacheEntry | null {
    if (this.storage) {
      const raw = this.storage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as CacheEntry;
          return parsed;
        } catch (error) {
          console.warn(`[CacheService] Failed to parse cached entry for ${key}`, error);
          this.storage.removeItem(key);
        }
      }
    }

    const entry = this.memoryCache.get(key);
    return entry ?? null;
  }

  private persistEntry(key: string, entry: CacheEntry): void {
    if (this.storage) {
      try {
        this.storage.setItem(key, JSON.stringify(entry));
        return;
      } catch (error) {
        console.warn(`[CacheService] Failed to persist entry in sessionStorage for key ${key}`, error);
      }
    }

    this.memoryCache.set(key, entry);
  }

  private deleteKey(key: string): void {
    if (this.storage) {
      this.storage.removeItem(key);
    }
    this.memoryCache.delete(key);
  }
}

export const cacheService = new CacheService();
