/**
 * React Query Hooks para Population Health
 * Hooks para dashboard de saúde populacional
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { populationHealthServiceSupabase } from '../services/analytics/populationHealthServiceSupabase';

// Query Keys
export const populationKeys = {
  all: ['population-health'] as const,
  metrics: (period?: string) => [...populationKeys.all, 'metrics', period] as const,
  cohorts: () => [...populationKeys.all, 'cohorts'] as const,
  cohort: (id: string) => [...populationKeys.cohorts(), id] as const,
  trends: () => [...populationKeys.all, 'trends'] as const,
  disparities: () => [...populationKeys.all, 'disparities'] as const,
  demographics: () => [...populationKeys.all, 'demographics'] as const,
};

/**
 * Hook para buscar métricas populacionais agregadas
 */
export function usePopulationMetrics(period: string = '30d') {
  return useQuery({
    queryKey: populationKeys.metrics(period),
    queryFn: () => populationHealthServiceSupabase.getPopulationMetrics(period),
    staleTime: 10 * 60 * 1000, // 10 minutos - dados agregados mudam menos
  });
}

/**
 * Hook para buscar coortes populacionais
 */
export function useCohorts() {
  return useQuery({
    queryKey: populationKeys.cohorts(),
    queryFn: () => populationHealthServiceSupabase.getCohorts(),
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Hook para buscar insights demográficos
 */
export function useDemographicInsights() {
  return useQuery({
    queryKey: populationKeys.demographics(),
    queryFn: () => populationHealthServiceSupabase.getDemographicInsights(),
    staleTime: 20 * 60 * 1000, // 20 minutos - dados demográficos estáveis
  });
}

/**
 * Hook para buscar disparidades de saúde
 */
export function useHealthDisparities() {
  return useQuery({
    queryKey: populationKeys.disparities(),
    queryFn: () => populationHealthServiceSupabase.getHealthDisparities(),
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Hook para buscar tendências preditivas
 */
export function usePredictiveTrends() {
  return useQuery({
    queryKey: populationKeys.trends(),
    queryFn: () => populationHealthServiceSupabase.getPredictiveTrends(),
    staleTime: 30 * 60 * 1000, // 30 minutos - predições são computacionalmente caras
  });
}

/**
 * Hook para prefetch de dados de população (melhora navegação)
 */
export function usePrefetchPopulationData() {
  const queryClient = useQueryClient();

  return {
    prefetchAll: () => {
      queryClient.prefetchQuery({
        queryKey: populationKeys.metrics(),
        queryFn: () => populationHealthServiceSupabase.getPopulationMetrics('30d'),
      });
      queryClient.prefetchQuery({
        queryKey: populationKeys.demographics(),
        queryFn: () => populationHealthServiceSupabase.getDemographicInsights(),
      });
    },
  };
}


