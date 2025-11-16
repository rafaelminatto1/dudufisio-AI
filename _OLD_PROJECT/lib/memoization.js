import React, { memo, useMemo, useCallback } from 'react';
// 🚀 Sistema de Memoização Otimizado
// Implementa memoização inteligente baseada em props e contexto
// 🎯 Memoização de Componentes com Comparação Customizada
export const createMemoizedComponent = (Component, areEqual) => {
    return memo(Component, areEqual);
};
// 🎯 Memoização de Funções com Dependências
export const createMemoizedCallback = (callback, deps) => {
    return useCallback(callback, deps);
};
// 🎯 Memoização de Valores Computados
export const createMemoizedValue = (factory, deps) => {
    return useMemo(factory, deps);
};
// 🎯 Comparadores Otimizados para Props Comuns
export const propsComparators = {
    // Comparador para objetos simples
    shallowEqual: (prev, next) => {
        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(next);
        if (prevKeys.length !== nextKeys.length)
            return false;
        return prevKeys.every(key => prev[key] === next[key]);
    },
    // Comparador para arrays
    arrayEqual: (prev, next) => {
        if (prev.length !== next.length)
            return false;
        return prev.every((item, index) => item === next[index]);
    },
    // Comparador para objetos com arrays
    objectWithArraysEqual: (prev, next) => {
        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(next);
        if (prevKeys.length !== nextKeys.length)
            return false;
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
    tablePropsEqual: (prev, next) => {
        return (prev.data === next.data &&
            prev.loading === next.loading &&
            prev.error === next.error &&
            propsComparators.arrayEqual(prev.columns || [], next.columns || []));
    },
    // Comparador para props de formulário
    formPropsEqual: (prev, next) => {
        return (prev.initialValues === next.initialValues &&
            prev.validationSchema === next.validationSchema &&
            prev.onSubmit === next.onSubmit &&
            prev.loading === next.loading);
    }
};
// 🎯 HOC para Memoização Automática
export const withMemoization = (Component, options = {}) => {
    const { areEqual, displayName } = options;
    const MemoizedComponent = memo(Component, areEqual);
    if (displayName) {
        MemoizedComponent.displayName = displayName;
    }
    return MemoizedComponent;
};
// 🎯 Hook para Memoização de Listas Grandes
export const useMemoizedList = (items, keyExtractor) => {
    return useMemo(() => {
        return items.map((item, index) => ({
            item,
            key: keyExtractor(item, index),
            index
        }));
    }, [items, keyExtractor]);
};
// 🎯 Hook para Memoização de Filtros
export const useMemoizedFilter = (items, filterFn, deps = []) => {
    return useMemo(() => {
        return items.filter(filterFn);
    }, [items, filterFn, ...deps]);
};
// 🎯 Hook para Memoização de Ordenação
export const useMemoizedSort = (items, sortFn, deps = []) => {
    return useMemo(() => {
        return [...items].sort(sortFn);
    }, [items, sortFn, ...deps]);
};
// 🎯 Hook para Memoização de Agrupamento
export const useMemoizedGroup = (items, groupBy, deps = []) => {
    return useMemo(() => {
        return items.reduce((groups, item) => {
            const key = groupBy(item);
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {});
    }, [items, groupBy, ...deps]);
};
export const ConditionalMemo = memo(({ condition, children, fallback = null }) => {
    if (condition) {
        return React.createElement(React.Fragment, null, children);
    }
    return React.createElement(React.Fragment, null, fallback);
});
// 🎯 Utilitários de Performance
export const performanceUtils = {
    // Debounce para funções
    debounce: (func, wait) => {
        let timeout;
        return ((...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        });
    },
    // Throttle para funções
    throttle: (func, limit) => {
        let inThrottle;
        return ((...args) => {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        });
    },
    // Medição de performance
    measurePerformance: (name, fn) => {
        if (import.meta.env.DEV) {
            const start = performance.now();
            fn();
            const end = performance.now();
            console.log(`⏱️ ${name}: ${end - start}ms`);
        }
        else {
            fn();
        }
    }
};
