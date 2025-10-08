/**
 * React Query Hooks para Mental Health
 * Hooks para integração com saúde mental
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mentalHealthServiceSupabase } from '../services/mental-health/mentalHealthServiceSupabase';
import type { MentalHealthScreening, MentalHealthReferral } from '../services/mental-health/mentalHealthServiceSupabase';
import { toast } from 'react-toastify';

// Query Keys
export const mentalHealthKeys = {
  all: ['mental-health'] as const,
  screenings: (patientId: string) => [...mentalHealthKeys.all, 'screenings', patientId] as const,
  referrals: (patientId: string) => [...mentalHealthKeys.all, 'referrals', patientId] as const,
  alerts: (patientId?: string) => [...mentalHealthKeys.all, 'alerts', patientId] as const,
  priority: () => [...mentalHealthKeys.all, 'priority'] as const,
};

/**
 * Hook para buscar triagens de saúde mental
 */
export function useMentalHealthScreenings(patientId: string | undefined) {
  return useQuery({
    queryKey: mentalHealthKeys.screenings(patientId!),
    queryFn: () => mentalHealthServiceSupabase.getScreenings(patientId!),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para criar triagem
 */
export function useCreateMentalHealthScreening() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<MentalHealthScreening>) =>
      mentalHealthServiceSupabase.createScreening(data),

    onSuccess: (data, variables) => {
      if (variables.patient_id) {
        queryClient.invalidateQueries({ 
          queryKey: mentalHealthKeys.screenings(variables.patient_id) 
        });
        
        // Se requer encaminhamento, invalidar lista de prioridade
        if (data.requires_referral) {
          queryClient.invalidateQueries({ queryKey: mentalHealthKeys.priority() });
        }
      }
      toast.success('Triagem de saúde mental registrada!');
    },

    onError: (err) => {
      toast.error('Erro ao registrar triagem');
      console.error(err);
    },
  });
}

/**
 * Hook para buscar encaminhamentos
 */
export function useMentalHealthReferrals(patientId: string | undefined) {
  return useQuery({
    queryKey: mentalHealthKeys.referrals(patientId!),
    queryFn: () => mentalHealthServiceSupabase.getReferrals(patientId!),
    enabled: !!patientId,
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Hook para criar encaminhamento
 */
export function useCreateReferral() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<MentalHealthReferral>) =>
      mentalHealthServiceSupabase.createReferral(data),

    onSuccess: (data, variables) => {
      if (variables.patient_id) {
        queryClient.invalidateQueries({ 
          queryKey: mentalHealthKeys.referrals(variables.patient_id) 
        });
      }
      toast.success('Encaminhamento criado!');
    },

    onError: (err) => {
      toast.error('Erro ao criar encaminhamento');
      console.error(err);
    },
  });
}

/**
 * Hook para atualizar status de encaminhamento
 */
export function useUpdateReferralStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, updates }: { id: string; status: string; updates?: any }) =>
      mentalHealthServiceSupabase.updateReferralStatus(id, status, updates),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentalHealthKeys.all });
      toast.success('Status atualizado!');
    },

    onError: (err) => {
      toast.error('Erro ao atualizar status');
      console.error(err);
    },
  });
}

/**
 * Hook para buscar alertas ativos
 */
export function useMentalHealthAlerts(patientId?: string) {
  return useQuery({
    queryKey: mentalHealthKeys.alerts(patientId),
    queryFn: () => mentalHealthServiceSupabase.getActiveAlerts(patientId),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 60 * 1000, // Refetch a cada 1 minuto - alertas são críticos
  });
}

/**
 * Hook para buscar pacientes prioritários
 */
export function usePriorityMentalHealthPatients() {
  return useQuery({
    queryKey: mentalHealthKeys.priority(),
    queryFn: () => mentalHealthServiceSupabase.getPriorityPatients(),
    staleTime: 5 * 60 * 1000,
  });
}


