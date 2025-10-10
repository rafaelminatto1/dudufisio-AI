/**
 * React Query Hooks para Nutrition
 * Hooks para orientação nutricional
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nutritionalServiceSupabase } from '../services/nutrition/nutritionalServiceSupabase';
import type { NutritionalAssessment, NutritionalPlan } from '../services/nutrition/nutritionalServiceSupabase';
import { toast } from 'react-toastify';

// Query Keys
export const nutritionKeys = {
  all: ['nutrition'] as const,
  assessments: (patientId: string) => [...nutritionKeys.all, 'assessments', patientId] as const,
  plans: (patientId: string) => [...nutritionKeys.all, 'plans', patientId] as const,
  bodyComp: (patientId: string) => [...nutritionKeys.all, 'body-comp', patientId] as const,
  meals: (patientId: string, days?: number) => [...nutritionKeys.all, 'meals', patientId, days] as const,
  adherence: (patientId: string) => [...nutritionKeys.all, 'adherence', patientId] as const,
};

/**
 * Hook para buscar avaliações nutricionais
 */
export function useNutritionalAssessments(patientId: string | undefined) {
  return useQuery({
    queryKey: nutritionKeys.assessments(patientId!),
    queryFn: () => nutritionalServiceSupabase.getAssessments(patientId!),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para criar avaliação nutricional
 */
export function useCreateNutritionalAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<NutritionalAssessment>) =>
      nutritionalServiceSupabase.createAssessment(data),

    onSuccess: (data, variables) => {
      if (variables.patient_id) {
        queryClient.invalidateQueries({ 
          queryKey: nutritionKeys.assessments(variables.patient_id) 
        });
      }
      toast.success('Avaliação nutricional criada! BMI: ' + data.bmi);
    },

    onError: (err) => {
      toast.error('Erro ao criar avaliação nutricional');
      console.error(err);
    },
  });
}

/**
 * Hook para buscar planos nutricionais
 */
export function useNutritionalPlans(patientId: string | undefined) {
  return useQuery({
    queryKey: nutritionKeys.plans(patientId!),
    queryFn: () => nutritionalServiceSupabase.getPlans(patientId!),
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para criar plano nutricional
 */
export function useCreateNutritionalPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<NutritionalPlan>) =>
      nutritionalServiceSupabase.createPlan(data),

    onSuccess: (data, variables) => {
      if (variables.patient_id) {
        queryClient.invalidateQueries({ 
          queryKey: nutritionKeys.plans(variables.patient_id) 
        });
      }
      toast.success('Plano nutricional criado!');
    },

    onError: (err) => {
      toast.error('Erro ao criar plano');
      console.error(err);
    },
  });
}

/**
 * Hook para buscar composição corporal
 */
export function useBodyComposition(patientId: string | undefined, limit: number = 30) {
  return useQuery({
    queryKey: [...nutritionKeys.bodyComp(patientId!), limit],
    queryFn: () => nutritionalServiceSupabase.getBodyComposition(patientId!, limit),
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para adicionar medição de composição corporal
 */
export function useAddBodyComposition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      nutritionalServiceSupabase.addBodyComposition(data),

    onSuccess: (data, variables) => {
      if (variables.patient_id) {
        queryClient.invalidateQueries({ 
          queryKey: nutritionKeys.bodyComp(variables.patient_id) 
        });
      }
      toast.success('Medição registrada! Peso: ' + data.weight + ' kg');
    },

    onError: (err) => {
      toast.error('Erro ao registrar medição');
      console.error(err);
    },
  });
}

/**
 * Hook para buscar logs de refeições
 */
export function useMealLogs(patientId: string | undefined, days: number = 7) {
  return useQuery({
    queryKey: nutritionKeys.meals(patientId!, days),
    queryFn: () => nutritionalServiceSupabase.getMealLogs(patientId!, days),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook para registrar refeição
 */
export function useLogMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      nutritionalServiceSupabase.logMeal(data),

    onSuccess: (data, variables) => {
      if (variables.patient_id) {
        queryClient.invalidateQueries({ 
          queryKey: nutritionKeys.meals(variables.patient_id) 
        });
        queryClient.invalidateQueries({ 
          queryKey: nutritionKeys.adherence(variables.patient_id) 
        });
      }
      toast.success('Refeição registrada!');
    },

    onError: (err) => {
      toast.error('Erro ao registrar refeição');
      console.error(err);
    },
  });
}

/**
 * Hook para buscar aderência nutricional
 */
export function useNutritionalAdherence(patientId: string | undefined) {
  return useQuery({
    queryKey: nutritionKeys.adherence(patientId!),
    queryFn: () => nutritionalServiceSupabase.getAdherenceSummary(patientId!),
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000,
  });
}








