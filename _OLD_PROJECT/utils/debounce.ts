/* eslint-disable no-unused-vars */
/**
 * Utilitário de Debounce
 * Para otimizar buscas e filtros em tempo real
 */

export function debounce<TArgs extends unknown[], TReturn>(
  func: (...fnArgs: TArgs) => TReturn,
  wait: number
): (...args: TArgs) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...fnArgs: TArgs) {
    const later = () => {
      timeout = null;
      func(...fnArgs);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Import React for the hook
import React from 'react';


