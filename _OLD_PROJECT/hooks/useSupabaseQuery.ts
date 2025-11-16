/**
 * useSupabaseQuery Hook - DuduFisio-AI
 * 
 * Hook para queries Supabase com estados de erro/loading automáticos
 * e tratamento de erro consistente.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { withSupabaseQuery, DEFAULT_QUERY_OPTIONS } from '../lib/supabase/errorHandler';
import { AppError } from '../lib/middleware/errorHandler';

// =============================================================================
// TIPOS E INTERFACES
// =============================================================================

interface UseSupabaseQueryOptions {
  /** Se deve executar a query automaticamente */
  enabled?: boolean;
  /** Intervalo de refetch automático (ms) */
  refetchInterval?: number;
  /** Se deve manter dados anteriores durante refetch */
  keepPreviousData?: boolean;
  /** Dependências para re-executar a query */
  deps?: any[];
  /** Configurações do error handler */
  errorOptions?: {
    operation?: string;
    fallbackMessage?: string;
    showToast?: boolean;
  };
}

interface UseSupabaseQueryResult<T> {
  /** Dados retornados pela query */
  data: T | null;
  /** Se está carregando */
  isLoading: boolean;
  /** Se está fazendo refetch */
  isRefetching: boolean;
  /** Erro da última operação */
  error: AppError | null;
  /** Função para refetch manual */
  refetch: () => Promise<void>;
  /** Função para limpar dados */
  clear: () => void;
  /** Se houve erro na última tentativa */
  hasError: boolean;
  /** Se os dados estão vazios */
  isEmpty: boolean;
}

// =============================================================================
// HOOK PRINCIPAL
// =============================================================================

/**
 * Hook para queries Supabase com estados automáticos
 * 
 * @param queryFn - Função que executa a query Supabase
 * @param options - Opções de configuração
 * @returns Estado da query e funções de controle
 * 
 * @example
 * ```typescript
 * const { data, isLoading, error, refetch } = useSupabaseQuery(
 *   () => supabase.from('patients').select('*'),
 *   {
 *     enabled: true,
 *     refetchInterval: 30000,
 *     errorOptions: {
 *       operation: 'getPatients',
 *       fallbackMessage: 'Erro ao buscar pacientes'
 *     }
 *   }
 * );
 * ```
 */
export function useSupabaseQuery<T>(
  queryFn: () => Promise<T>,
  options: UseSupabaseQueryOptions = {}
): UseSupabaseQueryResult<T> {
  const {
    enabled = true,
    refetchInterval,
    keepPreviousData = true,
    deps = [],
    errorOptions = {}
  } = options;

  // Estados
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  // Refs para controle
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Wrapper da query com tratamento de erro
  const wrappedQueryFn = useCallback(
    withSupabaseQuery(queryFn, {
      ...DEFAULT_QUERY_OPTIONS,
      operation: errorOptions.operation || 'supabaseQuery',
      fallbackMessage: errorOptions.fallbackMessage,
      showToast: errorOptions.showToast ?? true
    }),
    [queryFn, errorOptions]
  );

  // Função de execução da query
  const executeQuery = useCallback(async (isRefetch = false) => {
    if (!isMountedRef.current) return;

    try {
      if (isRefetch) {
        setIsRefetching(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const result = await wrappedQueryFn();
      
      if (isMountedRef.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof AppError ? err : new AppError(500, 'Erro desconhecido'));
        // Se não manter dados anteriores, limpa os dados em caso de erro
        if (!keepPreviousData) {
          setData(null);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefetching(false);
      }
    }
  }, [wrappedQueryFn, keepPreviousData]);

  // Função de refetch manual
  const refetch = useCallback(async () => {
    await executeQuery(true);
  }, [executeQuery]);

  // Função para limpar dados
  const clear = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setIsRefetching(false);
  }, []);

  // Efeito para executar query quando habilitada
  useEffect(() => {
    if (enabled) {
      executeQuery(false);
    }
  }, [enabled, executeQuery, ...deps]);

  // Efeito para refetch automático
  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(() => {
        executeQuery(true);
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refetchInterval, enabled, executeQuery]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Estados computados
  const hasError = error !== null;
  const isEmpty = data === null || (Array.isArray(data) && data.length === 0);

  return {
    data,
    isLoading,
    isRefetching,
    error,
    refetch,
    clear,
    hasError,
    isEmpty
  };
}

// =============================================================================
// HOOKS ESPECIALIZADOS
// =============================================================================

/**
 * Hook para queries que retornam arrays
 */
export function useSupabaseQueryList<T>(
  queryFn: () => Promise<T[]>,
  options: UseSupabaseQueryOptions = {}
) {
  const result = useSupabaseQuery(queryFn, options);
  
  return {
    ...result,
    data: result.data || [],
    isEmpty: Array.isArray(result.data) && result.data.length === 0
  };
}

/**
 * Hook para queries que podem retornar null/undefined
 */
export function useSupabaseQueryOptional<T>(
  queryFn: () => Promise<T | null | undefined>,
  options: UseSupabaseQueryOptions = {}
) {
  return useSupabaseQuery(queryFn, options);
}

/**
 * Hook para queries com cache local
 */
export function useSupabaseQueryCached<T>(
  queryFn: () => Promise<T>,
  cacheKey: string,
  options: UseSupabaseQueryOptions = {}
) {
  const [cache, setCache] = useState<Map<string, T>>(new Map());
  
  const cachedQueryFn = useCallback(async () => {
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    const result = await queryFn();
    setCache(prev => new Map(prev).set(cacheKey, result));
    return result;
  }, [queryFn, cacheKey, cache]);

  return useSupabaseQuery(cachedQueryFn, options);
}

// =============================================================================
// UTILITÁRIOS
// =============================================================================

/**
 * Hook para queries com paginação
 */
export function useSupabasePaginatedQuery<T>(
  queryFn: (page: number, limit: number) => Promise<{ data: T[]; hasMore: boolean }>,
  options: UseSupabaseQueryOptions & {
    pageSize?: number;
    initialPage?: number;
  } = {}
) {
  const { pageSize = 20, initialPage = 1, ...queryOptions } = options;
  const [page, setPage] = useState(initialPage);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const paginatedQueryFn = useCallback(
    () => queryFn(page, pageSize),
    [queryFn, page, pageSize]
  );

  const result = useSupabaseQuery(paginatedQueryFn, queryOptions);

  // Atualizar dados acumulados quando resultado muda
  useEffect(() => {
    if (result.data) {
      if (page === initialPage) {
        setAllData(result.data.data);
      } else {
        setAllData(prev => [...prev, ...result.data.data]);
      }
      setHasMore(result.data.hasMore);
    }
  }, [result.data, page, initialPage]);

  const loadMore = useCallback(() => {
    if (hasMore && !result.isLoading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, result.isLoading]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setAllData([]);
    setHasMore(true);
    result.clear();
  }, [initialPage, result]);

  return {
    ...result,
    data: allData,
    hasMore,
    loadMore,
    reset,
    currentPage: page
  };
}

export default useSupabaseQuery;
