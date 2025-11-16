/**
 * React Query Configuration
 * Configuração centralizada do QueryClient com boas práticas
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos (staleTime)
      staleTime: 5 * 60 * 1000,
      // Manter em cache por 10 minutos
      gcTime: 10 * 60 * 1000,
      // Retry 3 vezes em caso de erro
      retry: 3,
      // Delay exponencial entre retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Não refetch ao focar janela (pode ser habilitado por query)
      refetchOnWindowFocus: false,
      // Não refetch ao reconectar (pode ser habilitado por query)
      refetchOnReconnect: true,
      // Não refetch ao montar (pode ser habilitado por query)
      refetchOnMount: true,
    },
    mutations: {
      // Retry uma vez para mutations
      retry: 1,
      // Delay de 1s entre retries
      retryDelay: 1000,
    },
  },
});


