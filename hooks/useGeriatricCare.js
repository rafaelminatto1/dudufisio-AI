/**
 * React Query Hooks para Geriatric Care
 * Hooks para módulo de cuidados geriátricos
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { geriatricServiceSupabase } from '../services/geriatric/geriatricServiceSupabase';
import { toast } from 'react-toastify';
// Query Keys
export const geriatricKeys = {
    all: ['geriatric'],
    assessments: (patientId) => [...geriatricKeys.all, 'assessments', patientId],
    assessment: (id) => [...geriatricKeys.all, 'assessment', id],
    fallPlans: (patientId) => [...geriatricKeys.all, 'fall-plans', patientId],
    cognitiveSession: (patientId) => [...geriatricKeys.all, 'cognitive', patientId],
    highRisk: () => [...geriatricKeys.all, 'high-risk'],
};
/**
 * Hook para buscar avaliações geriátricas
 */
export function useGeriatricAssessments(patientId) {
    return useQuery({
        queryKey: geriatricKeys.assessments(patientId),
        queryFn: () => geriatricServiceSupabase.getAssessments(patientId),
        enabled: !!patientId,
        staleTime: 5 * 60 * 1000,
    });
}
/**
 * Hook para buscar última avaliação
 */
export function useLatestGeriatricAssessment(patientId) {
    return useQuery({
        queryKey: [...geriatricKeys.assessments(patientId), 'latest'],
        queryFn: () => geriatricServiceSupabase.getLatestAssessment(patientId),
        enabled: !!patientId,
        staleTime: 3 * 60 * 1000,
    });
}
/**
 * Hook para criar avaliação geriátrica
 */
export function useCreateGeriatricAssessment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => geriatricServiceSupabase.createAssessment(data),
        onSuccess: (data, variables) => {
            if (variables.patient_id) {
                queryClient.invalidateQueries({
                    queryKey: geriatricKeys.assessments(variables.patient_id)
                });
            }
            toast.success('Avaliação geriátrica criada com sucesso!');
        },
        onError: (err) => {
            toast.error('Erro ao criar avaliação geriátrica');
            console.error(err);
        },
    });
}
/**
 * Hook para buscar planos de prevenção de quedas
 */
export function useFallPreventionPlans(patientId) {
    return useQuery({
        queryKey: geriatricKeys.fallPlans(patientId),
        queryFn: () => geriatricServiceSupabase.getFallPreventionPlans(patientId),
        enabled: !!patientId,
        staleTime: 5 * 60 * 1000,
    });
}
/**
 * Hook para criar plano de prevenção de quedas
 */
export function useCreateFallPreventionPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => geriatricServiceSupabase.createFallPreventionPlan(data),
        onSuccess: (data, variables) => {
            if (variables.patient_id) {
                queryClient.invalidateQueries({
                    queryKey: geriatricKeys.fallPlans(variables.patient_id)
                });
            }
            toast.success('Plano de prevenção de quedas criado!');
        },
        onError: (err) => {
            toast.error('Erro ao criar plano');
            console.error(err);
        },
    });
}
/**
 * Hook para buscar pacientes de alto risco
 */
export function useHighRiskElderlyPatients() {
    return useQuery({
        queryKey: geriatricKeys.highRisk(),
        queryFn: () => geriatricServiceSupabase.getHighRiskPatients(),
        staleTime: 10 * 60 * 1000,
    });
}
