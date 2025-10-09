/**
 * React Query Hooks para ML Predictions
 * Hooks para predições de Machine Learning
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mlPredictionService } from '../services/ml/mlPredictionService';
import { modelTrainingService } from '../services/ml/modelTrainingService';
import { toast } from 'react-toastify';

// Query Keys
export const mlKeys = {
  all: ['ml'] as const,
  models: () => [...mlKeys.all, 'models'] as const,
  model: (id: string) => [...mlKeys.models(), id] as const,
  predictions: (patientId: string) => [...mlKeys.all, 'predictions', patientId] as const,
  monitoring: (modelId: string) => [...mlKeys.all, 'monitoring', modelId] as const,
  trainingRuns: (modelId: string) => [...mlKeys.all, 'training-runs', modelId] as const,
};

/**
 * Hook para gerar predição de outcome
 */
export function usePredictTreatmentOutcome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: any) =>
      mlPredictionService.predictTreatmentOutcome(input),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: mlKeys.predictions(variables.patient_id) 
      });
      
      toast.success(
        `Predição gerada! Outcome: ${data.outcome_prediction} (${Math.round(data.confidence_score * 100)}% confiança)`
      );
    },

    onError: (err) => {
      toast.error('Erro ao gerar predição');
      console.error(err);
    },
  });
}

/**
 * Hook para predição de risco de abandono
 */
export function usePredictDropoutRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientId: string) =>
      mlPredictionService.predictDropoutRisk(patientId),

    onSuccess: (data, patientId) => {
      queryClient.invalidateQueries({ 
        queryKey: mlKeys.predictions(patientId) 
      });

      const riskLevel = data.outcome_prediction;
      const message = riskLevel === 'high' 
        ? '⚠️ Alto risco de abandono detectado!'
        : riskLevel === 'medium'
        ? '⚠️ Risco moderado de abandono'
        : '✅ Baixo risco de abandono';

      toast.info(message);
    },

    onError: (err) => {
      toast.error('Erro ao calcular risco de abandono');
      console.error(err);
    },
  });
}

/**
 * Hook para recomendação de exercícios
 */
export function useRecommendExercises() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, conditionType }: { patientId: string; conditionType: string }) =>
      mlPredictionService.recommendExercises(patientId, conditionType),

    onSuccess: (exercises) => {
      queryClient.invalidateQueries({ queryKey: ['exercise-recommendations'] });
      toast.success(`${exercises.length} exercícios recomendados!`);
    },

    onError: (err) => {
      toast.error('Erro ao gerar recomendações');
      console.error(err);
    },
  });
}

/**
 * Hook para treinar modelo
 */
export function useTrainModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      modelName, 
      predictionType, 
      algorithm 
    }: { 
      modelName: string; 
      predictionType: string; 
      algorithm?: string;
    }) =>
      modelTrainingService.trainModel(modelName, predictionType, algorithm),

    onSuccess: (results, { modelName }) => {
      queryClient.invalidateQueries({ queryKey: mlKeys.model(modelName) });
      queryClient.invalidateQueries({ queryKey: mlKeys.trainingRuns(modelName) });
      
      toast.success(
        `Modelo treinado! Accuracy: ${(results.accuracy * 100).toFixed(1)}%`,
        { duration: 5000 }
      );
    },

    onError: (err) => {
      toast.error('Erro ao treinar modelo');
      console.error(err);
    },
  });
}

/**
 * Hook para monitorar modelo
 */
export function useMonitorModel(modelId: string | undefined) {
  return useQuery({
    queryKey: mlKeys.monitoring(modelId!),
    queryFn: () => modelTrainingService.monitorModel(modelId!),
    enabled: !!modelId,
    staleTime: 60 * 60 * 1000, // 1 hora
  });
}






