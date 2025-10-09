import { useState, useEffect, useRef, useCallback } from 'react';
/**
 * Hook para debounce de valores
 */
export function useDebounce(value, options = {}) {
    const { delay = 300, leading = false, trailing = true } = options;
    const [debouncedValue, setDebouncedValue] = useState(value);
    const timeoutRef = useRef(null);
    const isLeadingRef = useRef(false);
    useEffect(() => {
        // Se é leading e é o primeiro call
        if (leading && !isLeadingRef.current) {
            setDebouncedValue(value);
            isLeadingRef.current = true;
            return;
        }
        // Limpa timeout anterior
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        // Configura novo timeout
        timeoutRef.current = setTimeout(() => {
            if (trailing) {
                setDebouncedValue(value);
            }
            isLeadingRef.current = false;
        }, delay);
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [value, delay, leading, trailing]);
    return debouncedValue;
}
/**
 * Hook para debounce de callbacks
 */
export function useDebouncedCallback(callback, options = {}) {
    const { delay = 300, leading = false, trailing = true, maxWait = 0 } = options;
    const timeoutRef = useRef(null);
    const maxTimeoutRef = useRef(null);
    const lastCallTimeRef = useRef(0);
    const lastInvokeTimeRef = useRef(0);
    const lastArgsRef = useRef(undefined);
    const isLeadingRef = useRef(false);
    const isInvokingRef = useRef(false);
    const invoke = useCallback(() => {
        const args = lastArgsRef.current;
        lastInvokeTimeRef.current = Date.now();
        isInvokingRef.current = false;
        return callback(...args);
    }, [callback]);
    const cancel = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (maxTimeoutRef.current) {
            clearTimeout(maxTimeoutRef.current);
            maxTimeoutRef.current = null;
        }
        isLeadingRef.current = false;
        isInvokingRef.current = false;
    }, []);
    const debouncedCallback = useCallback((...args) => {
        lastArgsRef.current = args;
        lastCallTimeRef.current = Date.now();
        // Se é leading e não está executando
        if (leading && !isLeadingRef.current) {
            isLeadingRef.current = true;
            return invoke();
        }
        // Limpa timeouts anteriores
        cancel();
        // Configura timeout principal
        timeoutRef.current = setTimeout(() => {
            if (trailing && !isInvokingRef.current) {
                isInvokingRef.current = true;
                invoke();
            }
            isLeadingRef.current = false;
        }, delay);
        // Configura timeout máximo se especificado
        if (maxWait > 0 && !maxTimeoutRef.current) {
            maxTimeoutRef.current = setTimeout(() => {
                if (!isInvokingRef.current) {
                    isInvokingRef.current = true;
                    invoke();
                }
                cancel();
            }, maxWait);
        }
    }, [callback, delay, leading, trailing, maxWait, invoke, cancel]);
    // Adiciona método cancel ao callback
    debouncedCallback.cancel = cancel;
    debouncedCallback.flush = () => {
        if (lastArgsRef.current && !isInvokingRef.current) {
            isInvokingRef.current = true;
            const result = invoke();
            cancel();
            return result;
        }
    };
    return debouncedCallback;
}
/**
 * Hook para debounce de estado
 */
export function useDebouncedState(initialValue, delay = 300) {
    const [value, setValue] = useState(initialValue);
    const [debouncedValue, setDebouncedValue] = useState(initialValue);
    const timeoutRef = useRef(null);
    const setDebouncedState = useCallback((newValue) => {
        setValue(newValue);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setDebouncedValue(newValue);
        }, delay);
    }, [delay]);
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    return [value, debouncedValue, setDebouncedState];
}
/**
 * Hook para debounce de pesquisa
 */
export function useDebouncedSearch(initialQuery = '', delay = 300) {
    const [query, setQuery] = useState(initialQuery);
    const debouncedQuery = useDebounce(query, { delay });
    const [isSearching, setIsSearching] = useState(false);
    useEffect(() => {
        if (debouncedQuery !== initialQuery) {
            setIsSearching(true);
            // Simula delay de pesquisa
            const timer = setTimeout(() => {
                setIsSearching(false);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [debouncedQuery, initialQuery]);
    return {
        query,
        debouncedQuery,
        isSearching,
        setQuery
    };
}
export default useDebounce;
