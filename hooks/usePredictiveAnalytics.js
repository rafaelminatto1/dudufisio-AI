/**
 * React Query Hooks para Predictive Analytics
 * Hooks para análise preditiva com IA
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { predictiveAnalyticsServiceSupabase } from '../services/ai/predictiveAnalyticsServiceSupabase';
import { toast } from 'react-toastify';
// Query Keys
export const predictiveKeys = {
    all: ['predictive-analytics'],
    predictions: (patientId) => [...predictiveKeys.all, 'predictions', patientId],
    prediction: (id) => [...predictiveKeys.all, 'prediction', id],
    models: () => [...predictiveKeys.all, 'models'],
    model: (id) => [...predictiveKeys.all, 'model', id],
    insights: () => [...predictiveKeys.all, 'insights'],
    monitoring: (modelId) => [...predictiveKeys.all, 'monitoring', modelId],
};
/**
 * Hook para buscar predições de um paciente
 */
export function usePredictions(patientId) {
    return useQuery({
        queryKey: predictiveKeys.predictions(patientId),
        queryFn: () => predictiveAnalyticsServiceSupabase.getPredictions(patientId),
        enabled: !!patientId,
        staleTime: 10 * 60 * 1000, // 10 minutos - predições são custosas
    });
}
/**
 * Hook para buscar detalhes de uma predição
 */
export function usePredictionDetails(predictionId) {
    return useQuery({
        queryKey: predictiveKeys.prediction(predictionId),
        queryFn: () => predictiveAnalyticsServiceSupabase.getPredictionDetails(predictionId),
        enabled: !!predictionId,
        staleTime: 15 * 60 * 1000,
    });
}
/**
 * Hook para buscar modelos de ML ativos
 */
export function useMLModels() {
    return useQuery({
        queryKey: predictiveKeys.models(),
        queryFn: () => predictiveAnalyticsServiceSupabase.getActiveModels(),
        staleTime: 30 * 60 * 1000, // 30 minutos - modelos mudam raramente
    });
}
/**
 * Hook para buscar insights da IA
 */
export function useAIInsights() {
    return useQuery({
        queryKey: predictiveKeys.insights(),
        queryFn: () => predictiveAnalyticsServiceSupabase.getAIInsights(),
        staleTime: 20 * 60 * 1000,
    });
}
/**
 * Hook para buscar monitoramento de um modelo
 */
export function useModelMonitoring(modelId) {
    return useQuery({
        queryKey: predictiveKeys.monitoring(modelId),
        queryFn: () => predictiveAnalyticsServiceSupabase.getModelMonitoring(modelId),
        enabled: !!modelId,
        staleTime: 15 * 60 * 1000,
    });
}
/**
 * Hook para gerar nova predição
 */
export function useGeneratePrediction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => predictiveAnalyticsServiceSupabase.generatePrediction(data),
        onSuccess: (data, variables) => {
            if (variables.patient_id) {
                queryClient.invalidateQueries({
                    queryKey: predictiveKeys.predictions(variables.patient_id)
                });
            }
            toast.success('Predição gerada com sucesso!');
        },
        onError: (err) => {
            toast.error('Erro ao gerar predição');
            console.error(err);
        },
    });
}
/**
 * Hook para validar predição com outcome real
 */
export function useValidatePrediction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ predictionId, actualOutcome, wasAccurate }) => predictiveAnalyticsServiceSupabase.validatePrediction(predictionId, actualOutcome, wasAccurate),
        onSuccess: (data, { predictionId }) => {
            queryClient.invalidateQueries({ queryKey: predictiveKeys.prediction(predictionId) });
            queryClient.invalidateQueries({ queryKey: predictiveKeys.insights() });
            toast.success('Predição validada!');
        },
        onError: (err) => {
            toast.error('Erro ao validar predição');
            console.error(err);
        },
    });
}
/**
 * Hook para fornecer feedback sobre predição
 */
export function useProvideFeedback() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => predictiveAnalyticsServiceSupabase.provideFeedback(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: predictiveKeys.all });
            toast.success('Feedback registrado!');
        },
        onError: (err) => {
            toast.error('Erro ao registrar feedback');
            console.error(err);
        },
    });
}
