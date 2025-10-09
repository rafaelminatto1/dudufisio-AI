/**
 * Hook para Otimizações de Performance
 * Implementa memoization, lazy loading e virtualização
 */

import { useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * Hook para debounce otimizado
 */
export const useOptimizedDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );
};

/**
 * Hook para virtualização de lista
 */
export const useVirtualList = <T,>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const scrollPositionRef = useRef(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollPositionRef.current / itemHeight);
    const endIndex = Math.ceil((scrollPositionRef.current + containerHeight) / itemHeight);
    
    return {
      startIndex: Math.max(0, startIndex - 5), // Buffer
      endIndex: Math.min(items.length, endIndex + 5),
      items: items.slice(
        Math.max(0, startIndex - 5),
        Math.min(items.length, endIndex + 5)
      ),
    };
  }, [items, itemHeight, containerHeight, scrollPositionRef.current]);

  const handleScroll = useCallback((scrollTop: number) => {
    scrollPositionRef.current = scrollTop;
  }, []);

  return {
    visibleItems,
    handleScroll,
    totalHeight: items.length * itemHeight,
  };
};

/**
 * Hook para memoização inteligente de objetos
 */
export const useDeepMemo = <T,>(factory: () => T, deps: any[]): T => {
  const ref = useRef<{ value: T; deps: any[] }>();

  if (!ref.current || !depsEqual(ref.current.deps, deps)) {
    ref.current = {
      value: factory(),
      deps,
    };
  }

  return ref.current.value;
};

/**
 * Comparar dependências profundamente
 */
function depsEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) {
      return false;
    }
  }
  
  return true;
}

/**
 * Hook para lazy loading de imagens
 */
export const useLazyImage = (src: string) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new Image();
            img.src = src;
            img.onload = () => setImageSrc(src);
            img.onerror = () => setError(true);
            imgRef.current = img;
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    return () => observer.disconnect();
  }, [src]);

  return { imageSrc, error };
};

/**
 * Hook para batch updates
 */
export const useBatchUpdates = <T,>(initialState: T[]) => {
  const [items, setItems] = useState(initialState);
  const pendingUpdates = useRef<Array<(items: T[]) => T[]>>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const addUpdate = useCallback((updater: (items: T[]) => T[]) => {
    pendingUpdates.current.push(updater);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setItems((current) => {
        let result = current;
        pendingUpdates.current.forEach((update) => {
          result = update(result);
        });
        pendingUpdates.current = [];
        return result;
      });
    }, 50);
  }, []);

  return { items, addUpdate };
};

import { useState } from 'react';
