/**
 * React Query Hooks para Symptom Tracker
 * Hooks para rastreamento avançado de sintomas
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { symptomTrackerServiceSupabase } from '../services/symptom/symptomTrackerServiceSupabase';
import type { SymptomEntry, SymptomCorrelation } from '../services/symptom/symptomTrackerServiceSupabase';
import { toast } from 'react-toastify';

// Query Keys
export const symptomKeys = {
  all: ['symptom-tracker'] as const,
  entries: (patientId: string, period?: string) => [...symptomKeys.all, 'entries', patientId, period] as const,
  entry: (id: string) => [...symptomKeys.all, 'entry', id] as const,
  trends: (patientId: string) => [...symptomKeys.all, 'trends', patientId] as const,
  correlations: (patientId: string) => [...symptomKeys.all, 'correlations', patientId] as const,
  alerts: (patientId: string) => [...symptomKeys.all, 'alerts', patientId] as const,
  patterns: (patientId: string) => [...symptomKeys.all, 'patterns', patientId] as const,
};

/**
 * Hook para buscar entradas do diário de sintomas
 */
export function useSymptomEntries(
  patientId: string | undefined,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: symptomKeys.entries(patientId!, `${startDate}-${endDate}`),
    queryFn: () => symptomTrackerServiceSupabase.getSymptomEntries(patientId!, startDate, endDate),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook para adicionar entrada de sintoma
 */
export function useAddSymptomEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<SymptomEntry>) =>
      symptomTrackerServiceSupabase.addSymptomEntry(data),

    onMutate: async (newEntry) => {
      const patientId = newEntry.patient_id;
      if (!patientId) return;

      await queryClient.cancelQueries({ queryKey: symptomKeys.all });

      const previousEntries = queryClient.getQueryData(symptomKeys.entries(patientId));

      // Optimistic update
      queryClient.setQueryData(
        symptomKeys.entries(patientId),
        (old: SymptomEntry[] = []) => [
          { ...newEntry, id: 'temp-' + Date.now(), created_at: new Date().toISOString() } as SymptomEntry,
          ...old,
        ]
      );

      return { previousEntries, patientId };
    },

    onError: (err, newEntry, context) => {
      if (context?.previousEntries && context?.patientId) {
        queryClient.setQueryData(
          symptomKeys.entries(context.patientId),
          context.previousEntries
        );
      }
      toast.error('Erro ao registrar sintoma');
      console.error(err);
    },

    onSuccess: (data, variables) => {
      if (variables.patient_id) {
        queryClient.invalidateQueries({ queryKey: symptomKeys.entries(variables.patient_id) });
        queryClient.invalidateQueries({ queryKey: symptomKeys.trends(variables.patient_id) });
        queryClient.invalidateQueries({ queryKey: symptomKeys.alerts(variables.patient_id) });
      }
      toast.success('Sintoma registrado!');
    },
  });
}

/**
 * Hook para buscar tendências de sintomas
 */
export function useSymptomTrends(patientId: string | undefined) {
  return useQuery({
    queryKey: symptomKeys.trends(patientId!),
    queryFn: () => symptomTrackerServiceSupabase.getSymptomTrends(patientId!),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para buscar correlações
 */
export function useSymptomCorrelations(patientId: string | undefined) {
  return useQuery({
    queryKey: symptomKeys.correlations(patientId!),
    queryFn: () => symptomTrackerServiceSupabase.getCorrelations(patientId!),
    enabled: !!patientId,
    staleTime: 15 * 60 * 1000, // 15 minutos - correlações são computacionalmente caras
  });
}

/**
 * Hook para buscar alertas de sintomas
 */
export function useSymptomAlerts(patientId: string | undefined) {
  return useQuery({
    queryKey: symptomKeys.alerts(patientId!),
    queryFn: () => symptomTrackerServiceSupabase.getSymptomAlerts(patientId!),
    enabled: !!patientId,
    staleTime: 1 * 60 * 1000,
    refetchInterval: 30 * 1000, // Refetch a cada 30s
  });
}

/**
 * Hook para buscar padrões identificados
 */
export function useSymptomPatterns(patientId: string | undefined) {
  return useQuery({
    queryKey: symptomKeys.patterns(patientId!),
    queryFn: () => symptomTrackerServiceSupabase.getSymptomPatterns(patientId!),
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para reconhecer alerta
 */
export function useAcknowledgeSymptomAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, acknowledgedBy }: { alertId: string; acknowledgedBy: string }) =>
      symptomTrackerServiceSupabase.acknowledgeAlert(alertId, acknowledgedBy),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: symptomKeys.all });
      toast.success('Alerta reconhecido!');
    },

    onError: (err) => {
      toast.error('Erro ao reconhecer alerta');
      console.error(err);
    },
  });
}



