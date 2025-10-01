import React, { memo, useMemo, useCallback, ReactNode } from 'react';

// 🚀 Sistema de Memoização Otimizado
// Implementa memoização inteligente baseada em props e contexto

// 🎯 Memoização de Componentes com Comparação Customizada
export const createMemoizedComponent = <P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return memo(Component, areEqual);
};

// 🎯 Memoização de Funções com Dependências
export const createMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
) => {
  return useCallback(callback, deps);
};

// 🎯 Memoização de Valores Computados
export const createMemoizedValue = <T>(
  factory: () => T,
  deps: React.DependencyList
) => {
  return useMemo(factory, deps);
};

// 🎯 Comparadores Otimizados para Props Comuns
export const propsComparators = {
  // Comparador para objetos simples
  shallowEqual: <T extends Record<string, any>>(prev: T, next: T) => {
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);
    
    if (prevKeys.length !== nextKeys.length) return false;
    
    return prevKeys.every(key => prev[key] === next[key]);
  },

  // Comparador para arrays
  arrayEqual: <T>(prev: T[], next: T[]) => {
    if (prev.length !== next.length) return false;
    return prev.every((item, index) => item === next[index]);
  },

  // Comparador para objetos com arrays
  objectWithArraysEqual: <T extends Record<string, any>>(prev: T, next: T) => {
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);
    
    if (prevKeys.length !== nextKeys.length) return false;
    
    return prevKeys.every(key => {
      const prevValue = prev[key];
      const nextValue = next[key];
      
      if (Array.isArray(prevValue) && Array.isArray(nextValue)) {
        return propsComparators.arrayEqual(prevValue, nextValue);
      }
      
      return prevValue === nextValue;
    });
  },

  // Comparador para props de tabela/lista
  tablePropsEqual: (prev: any, next: any) => {
    return (
      prev.data === next.data &&
      prev.loading === next.loading &&
      prev.error === next.error &&
      propsComparators.arrayEqual(prev.columns || [], next.columns || [])
    );
  },

  // Comparador para props de formulário
  formPropsEqual: (prev: any, next: any) => {
    return (
      prev.initialValues === next.initialValues &&
      prev.validationSchema === next.validationSchema &&
      prev.onSubmit === next.onSubmit &&
      prev.loading === next.loading
    );
  }
};

// 🎯 HOC para Memoização Automática
export const withMemoization = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    areEqual?: (prevProps: P, nextProps: P) => boolean;
    displayName?: string;
  } = {}
) => {
  const { areEqual, displayName } = options;
  
  const MemoizedComponent = memo(Component, areEqual);
  
  if (displayName) {
    MemoizedComponent.displayName = displayName;
  }
  
  return MemoizedComponent;
};

// 🎯 Hook para Memoização de Listas Grandes
export const useMemoizedList = <T>(
  items: T[],
  keyExtractor: (item: T, index: number) => string | number
) => {
  return useMemo(() => {
    return items.map((item, index) => ({
      item,
      key: keyExtractor(item, index),
      index
    }));
  }, [items, keyExtractor]);
};

// 🎯 Hook para Memoização de Filtros
export const useMemoizedFilter = <T>(
  items: T[],
  filterFn: (item: T) => boolean,
  deps: React.DependencyList = []
) => {
  return useMemo(() => {
    return items.filter(filterFn);
  }, [items, filterFn, ...deps]);
};

// 🎯 Hook para Memoização de Ordenação
export const useMemoizedSort = <T>(
  items: T[],
  sortFn: (a: T, b: T) => number,
  deps: React.DependencyList = []
) => {
  return useMemo(() => {
    return [...items].sort(sortFn);
  }, [items, sortFn, ...deps]);
};

// 🎯 Hook para Memoização de Agrupamento
export const useMemoizedGroup = <T, K extends string | number>(
  items: T[],
  groupBy: (item: T) => K,
  deps: React.DependencyList = []
) => {
  return useMemo(() => {
    return items.reduce((groups, item) => {
      const key = groupBy(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<K, T[]>);
  }, [items, groupBy, ...deps]);
};

// 🎯 Componente de Memoização Condicional
interface ConditionalMemoProps {
  condition: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export const ConditionalMemo: React.FC<ConditionalMemoProps> = memo(({
  condition,
  children,
  fallback = null
}) => {
  if (condition) {
    return React.createElement(React.Fragment, null, children);
  }
  return React.createElement(React.Fragment, null, fallback);
});

// 🎯 Utilitários de Performance
export const performanceUtils = {
  // Debounce para funções
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): T => {
    let timeout: NodeJS.Timeout;
    return ((...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    }) as T;
  },

  // Throttle para funções
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T => {
    let inThrottle: boolean;
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  },

  // Medição de performance
  measurePerformance: (name: string, fn: () => void) => {
    if (import.meta.env.DEV) {
      const start = performance.now();
      fn();
      const end = performance.now();
      console.log(`⏱️ ${name}: ${end - start}ms`);
    } else {
      fn();
    }
  }
};