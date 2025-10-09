/**
 * React Query Hooks para Nutrition
 * Hooks para orientação nutricional
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nutritionalServiceSupabase } from '../services/nutrition/nutritionalServiceSupabase';
import { toast } from 'react-toastify';
// Query Keys
export const nutritionKeys = {
    all: ['nutrition'],
    assessments: (patientId) => [...nutritionKeys.all, 'assessments', patientId],
    plans: (patientId) => [...nutritionKeys.all, 'plans', patientId],
    bodyComp: (patientId) => [...nutritionKeys.all, 'body-comp', patientId],
    meals: (patientId, days) => [...nutritionKeys.all, 'meals', patientId, days],
    adherence: (patientId) => [...nutritionKeys.all, 'adherence', patientId],
};
/**
 * Hook para buscar avaliações nutricionais
 */
export function useNutritionalAssessments(patientId) {
    return useQuery({
        queryKey: nutritionKeys.assessments(patientId),
        queryFn: () => nutritionalServiceSupabase.getAssessments(patientId),
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
        mutationFn: (data) => nutritionalServiceSupabase.createAssessment(data),
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
export function useNutritionalPlans(patientId) {
    return useQuery({
        queryKey: nutritionKeys.plans(patientId),
        queryFn: () => nutritionalServiceSupabase.getPlans(patientId),
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
        mutationFn: (data) => nutritionalServiceSupabase.createPlan(data),
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
export function useBodyComposition(patientId, limit = 30) {
    return useQuery({
        queryKey: [...nutritionKeys.bodyComp(patientId), limit],
        queryFn: () => nutritionalServiceSupabase.getBodyComposition(patientId, limit),
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
        mutationFn: (data) => nutritionalServiceSupabase.addBodyComposition(data),
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
export function useMealLogs(patientId, days = 7) {
    return useQuery({
        queryKey: nutritionKeys.meals(patientId, days),
        queryFn: () => nutritionalServiceSupabase.getMealLogs(patientId, days),
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
        mutationFn: (data) => nutritionalServiceSupabase.logMeal(data),
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
export function useNutritionalAdherence(patientId) {
    return useQuery({
        queryKey: nutritionKeys.adherence(patientId),
        queryFn: () => nutritionalServiceSupabase.getAdherenceSummary(patientId),
        enabled: !!patientId,
        staleTime: 10 * 60 * 1000,
    });
}
