/**
 * React Query Hooks para Sports Rehabilitation
 * Hooks otimizados com cache e optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sportsRehabServiceSupabase } from '../services/sports/sportsRehabServiceSupabase';
import type { 
  AthleteProfile, 
  PerformanceMetric, 
  LoadMonitoring,
  RehabProgression 
} from '../types/sportsRehabTypes';
import { toast } from 'react-toastify';

// Query Keys
export const sportsKeys = {
  all: ['sports-rehab'] as const,
  profiles: () => [...sportsKeys.all, 'profile'] as const,
  profile: (patientId: string) => [...sportsKeys.profiles(), patientId] as const,
  metrics: (athleteId: string) => [...sportsKeys.all, 'metrics', athleteId] as const,
  loads: (athleteId: string) => [...sportsKeys.all, 'loads', athleteId] as const,
  progression: (athleteId: string) => [...sportsKeys.all, 'progression', athleteId] as const,
  sessions: (athleteId: string) => [...sportsKeys.all, 'sessions', athleteId] as const,
  rts: (athleteId: string) => [...sportsKeys.all, 'rts', athleteId] as const,
};

/**
 * Hook para buscar perfil do atleta
 */
export function useAthleteProfile(patientId: string | undefined) {
  return useQuery({
    queryKey: sportsKeys.profile(patientId!),
    queryFn: () => sportsRehabServiceSupabase.getAthleteProfile(patientId!),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para buscar métricas de performance
 */
export function usePerformanceMetrics(athleteId: string | undefined) {
  return useQuery({
    queryKey: sportsKeys.metrics(athleteId!),
    queryFn: () => sportsRehabServiceSupabase.getPerformanceMetrics(athleteId!),
    enabled: !!athleteId,
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Hook para buscar monitoramento de carga
 */
export function useLoadMonitoring(athleteId: string | undefined, weeks: number = 8) {
  return useQuery({
    queryKey: [...sportsKeys.loads(athleteId!), weeks],
    queryFn: () => sportsRehabServiceSupabase.getLoadMonitoring(athleteId!, weeks),
    enabled: !!athleteId,
    staleTime: 10 * 60 * 1000, // 10 minutos - dados menos voláteis
  });
}

/**
 * Hook para buscar progressão de reabilitação
 */
export function useRehabProgression(athleteId: string | undefined) {
  return useQuery({
    queryKey: sportsKeys.progression(athleteId!),
    queryFn: () => sportsRehabServiceSupabase.getRehabProgression(athleteId!),
    enabled: !!athleteId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para buscar sessões de treino
 */
export function useTrainingSessions(athleteId: string | undefined, limit: number = 10) {
  return useQuery({
    queryKey: [...sportsKeys.sessions(athleteId!), limit],
    queryFn: () => sportsRehabServiceSupabase.getTrainingSessions(athleteId!, limit),
    enabled: !!athleteId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook para criar/atualizar perfil de atleta
 */
export function useUpsertAthleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<AthleteProfile>) =>
      sportsRehabServiceSupabase.upsertAthleteProfile(data),

    onSuccess: (data) => {
      if (data.patientId) {
        queryClient.invalidateQueries({ queryKey: sportsKeys.profile(data.patientId) });
      }
      toast.success('Perfil de atleta salvo com sucesso!');
    },

    onError: (err) => {
      toast.error('Erro ao salvar perfil de atleta');
      console.error(err);
    },
  });
}

/**
 * Hook para adicionar métrica de performance
 */
export function useAddPerformanceMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PerformanceMetric>) =>
      sportsRehabServiceSupabase.addPerformanceMetric(data),

    onMutate: async (newMetric) => {
      const athleteId = newMetric.athlete_id;
      if (!athleteId) return;

      await queryClient.cancelQueries({ queryKey: sportsKeys.metrics(athleteId) });

      const previousMetrics = queryClient.getQueryData(sportsKeys.metrics(athleteId));

      // Optimistic update
      queryClient.setQueryData(
        sportsKeys.metrics(athleteId),
        (old: PerformanceMetric[] = []) => [
          ...old,
          { ...newMetric, id: 'temp-' + Date.now() } as PerformanceMetric,
        ]
      );

      return { previousMetrics, athleteId };
    },

    onError: (err, newMetric, context) => {
      if (context?.previousMetrics && context?.athleteId) {
        queryClient.setQueryData(
          sportsKeys.metrics(context.athleteId),
          context.previousMetrics
        );
      }
      toast.error('Erro ao adicionar métrica');
      console.error(err);
    },

    onSuccess: (data, variables) => {
      if (variables.athlete_id) {
        queryClient.invalidateQueries({ 
          queryKey: sportsKeys.metrics(variables.athlete_id) 
        });
      }
      toast.success('Métrica adicionada com sucesso!');
    },
  });
}

/**
 * Hook para adicionar sessão de treino
 */
export function useAddTrainingSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      sportsRehabServiceSupabase.addTrainingSession(data),

    onSuccess: (data, variables) => {
      if (variables.athlete_id) {
        queryClient.invalidateQueries({ 
          queryKey: sportsKeys.sessions(variables.athlete_id) 
        });
        queryClient.invalidateQueries({ 
          queryKey: sportsKeys.loads(variables.athlete_id) 
        });
      }
      toast.success('Sessão de treino registrada!');
    },

    onError: (err) => {
      toast.error('Erro ao registrar sessão');
      console.error(err);
    },
  });
}

/**
 * Hook para atualizar progressão
 */
export function useUpdateProgression() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ athleteId, data }: { athleteId: string; data: Partial<RehabProgression> }) =>
      sportsRehabServiceSupabase.updateProgression(athleteId, data),

    onSuccess: (data, { athleteId }) => {
      queryClient.invalidateQueries({ queryKey: sportsKeys.progression(athleteId) });
      toast.success('Progressão atualizada!');
    },

    onError: (err) => {
      toast.error('Erro ao atualizar progressão');
      console.error(err);
    },
  });
}


