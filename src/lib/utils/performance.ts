import React from 'react';

/**
 * Utilitários para otimização de performance
 */

/**
 * Debounce function para otimizar chamadas frequentes
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function para limitar execuções
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load component wrapper
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFunc);
}

/**
 * Memoize function results
 */
export function memoize<Args extends any[], Return>(
  fn: (...args: Args) => Return
): (...args: Args) => Return {
  const cache = new Map<string, Return>();

  return (...args: Args): Return => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Prefetch data for better performance
 */
export async function prefetchData<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  ttl: number = 5 * 60 * 1000 // 5 minutos default
): Promise<T> {
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < ttl) {
      return data;
    }
  }

  const data = await fetchFn();
  sessionStorage.setItem(
    cacheKey,
    JSON.stringify({ data, timestamp: Date.now() })
  );
  return data;
}

/**
 * Image optimization helper
 */
export function optimizeImageUrl(
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  if (!url) return url;
  
  // Se for Supabase Storage, adiciona parâmetros de otimização
  if (url.includes('supabase.co/storage')) {
    const params = new URLSearchParams();
    if (width) params.set('width', width.toString());
    if (height) params.set('height', height.toString());
    params.set('quality', quality.toString());
    return `${url}?${params.toString()}`;
  }
  
  return url;
}

/**
 * Batch operations para reduzir chamadas ao servidor
 */
export function batchOperations<T, R>(
  items: T[],
  batchSize: number,
  operation: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  return Promise.all(batches.map(operation)).then((results) =>
    results.flat()
  );
}

