/**
 * React Query Hooks para Risk Stratification
 * Hooks otimizados com cache, invalidação automática e optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { riskStratificationServiceSupabase } from '../services/clinical/riskStratificationServiceSupabase';
import type { RiskAssessment } from '../types/riskTypes';
import { toast } from 'react-toastify';

// Query Keys - Centralizados para consistência
export const riskKeys = {
  all: ['risk-assessments'] as const,
  lists: () => [...riskKeys.all, 'list'] as const,
  list: (patientId: string) => [...riskKeys.lists(), patientId] as const,
  details: () => [...riskKeys.all, 'detail'] as const,
  detail: (id: string) => [...riskKeys.details(), id] as const,
  profile: (patientId: string) => ['risk-profile', patientId] as const,
  alerts: (patientId: string) => ['risk-alerts', patientId] as const,
};

/**
 * Hook para buscar avaliações de risco de um paciente
 */
export function useRiskAssessments(patientId: string | undefined) {
  return useQuery({
    queryKey: riskKeys.list(patientId!),
    queryFn: () => riskStratificationServiceSupabase.getAssessments(patientId!),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar perfil de risco completo de um paciente
 */
export function useRiskProfile(patientId: string | undefined) {
  return useQuery({
    queryKey: riskKeys.profile(patientId!),
    queryFn: () => riskStratificationServiceSupabase.getPatientRiskProfile(patientId!),
    enabled: !!patientId,
    staleTime: 3 * 60 * 1000, // 3 minutos
  });
}

/**
 * Hook para buscar alertas de risco ativos
 */
export function useRiskAlerts(patientId: string | undefined) {
  return useQuery({
    queryKey: riskKeys.alerts(patientId!),
    queryFn: () => riskStratificationServiceSupabase.getActiveAlerts(patientId!),
    enabled: !!patientId,
    refetchInterval: 30 * 1000, // Refetch a cada 30s para alertas
  });
}

/**
 * Hook para criar uma nova avaliação de risco
 * Implementa optimistic updates e invalidação de cache
 */
export function useCreateRiskAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<RiskAssessment>) =>
      riskStratificationServiceSupabase.createAssessment(data),
    
    // Optimistic update
    onMutate: async (newAssessment) => {
      const patientId = newAssessment.patient_id;
      if (!patientId) return;

      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: riskKeys.list(patientId) });

      // Snapshot do valor anterior
      const previousAssessments = queryClient.getQueryData(riskKeys.list(patientId));

      // Atualizar otimisticamente
      queryClient.setQueryData(riskKeys.list(patientId), (old: RiskAssessment[] = []) => [
        ...old,
        { ...newAssessment, id: 'temp-' + Date.now(), created_at: new Date().toISOString() } as RiskAssessment,
      ]);

      return { previousAssessments, patientId };
    },

    // Em caso de erro, reverter
    onError: (err, newAssessment, context) => {
      if (context?.previousAssessments && context?.patientId) {
        queryClient.setQueryData(
          riskKeys.list(context.patientId),
          context.previousAssessments
        );
      }
      toast.error('Erro ao criar avaliação de risco');
      console.error(err);
    },

    // Sempre refetch após sucesso ou erro
    onSuccess: (data, variables) => {
      const patientId = variables.patient_id;
      if (patientId) {
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: riskKeys.list(patientId) });
        queryClient.invalidateQueries({ queryKey: riskKeys.profile(patientId) });
        queryClient.invalidateQueries({ queryKey: riskKeys.alerts(patientId) });
      }
      toast.success('Avaliação de risco criada com sucesso!');
    },
  });
}

/**
 * Hook para atualizar uma avaliação de risco existente
 */
export function useUpdateRiskAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RiskAssessment> }) =>
      riskStratificationServiceSupabase.updateAssessment(id, data),

    onMutate: async ({ id, data }) => {
      const patientId = data.patient_id;
      if (!patientId) return;

      await queryClient.cancelQueries({ queryKey: riskKeys.list(patientId) });

      const previousAssessments = queryClient.getQueryData(riskKeys.list(patientId));

      // Atualizar otimisticamente
      queryClient.setQueryData(
        riskKeys.list(patientId),
        (old: RiskAssessment[] = []) =>
          old.map((assessment) =>
            assessment.id === id ? { ...assessment, ...data } : assessment
          )
      );

      return { previousAssessments, patientId };
    },

    onError: (err, { data }, context) => {
      if (context?.previousAssessments && context?.patientId) {
        queryClient.setQueryData(
          riskKeys.list(context.patientId),
          context.previousAssessments
        );
      }
      toast.error('Erro ao atualizar avaliação');
      console.error(err);
    },

    onSuccess: (data, { data: variables }) => {
      const patientId = variables.patient_id;
      if (patientId) {
        queryClient.invalidateQueries({ queryKey: riskKeys.list(patientId) });
        queryClient.invalidateQueries({ queryKey: riskKeys.profile(patientId) });
      }
      toast.success('Avaliação atualizada com sucesso!');
    },
  });
}

/**
 * Hook para deletar uma avaliação de risco
 */
export function useDeleteRiskAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      riskStratificationServiceSupabase.deleteAssessment(id),

    onSuccess: () => {
      // Invalidar todas as queries de risk assessments
      queryClient.invalidateQueries({ queryKey: riskKeys.all });
      toast.success('Avaliação deletada com sucesso!');
    },

    onError: (err) => {
      toast.error('Erro ao deletar avaliação');
      console.error(err);
    },
  });
}

/**
 * Hook para prefetch de dados relacionados
 * Útil para melhorar UX ao navegar
 */
export function usePrefetchRiskData(patientId: string) {
  const queryClient = useQueryClient();

  return {
    prefetchAssessments: () =>
      queryClient.prefetchQuery({
        queryKey: riskKeys.list(patientId),
        queryFn: () => riskStratificationServiceSupabase.getAssessments(patientId),
      }),
    prefetchProfile: () =>
      queryClient.prefetchQuery({
        queryKey: riskKeys.profile(patientId),
        queryFn: () => riskStratificationServiceSupabase.getPatientRiskProfile(patientId),
      }),
  };
}


