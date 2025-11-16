import { useRef, useCallback } from 'react';

/**
 * Hook para throttle de funções
 * Garante que a função só seja chamada no máximo uma vez a cada `delay` ms
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRanRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastRanRef.current >= delay) {
        lastRanRef.current = now;
        return callback(...args);
      } else {
        // Agendar para executar após o delay
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastRanRef.current = Date.now();
          callback(...args);
        }, delay - (now - lastRanRef.current));
      }
    }) as T,
    [callback, delay]
  );
}


