/**
 * Hook for AI Dashboard data management
 * Integrates with all AI services: Churn, BI, Treatment Plans
 */

import { useQuery } from '@tanstack/react-query';
import { batchAnalyzeChurnRisk } from '@/lib/ai/churn-prediction';
import { generateBIInsights } from '@/lib/ai/business-intelligence';
import { 
  fetchPatientsForChurnAnalysis,
  fetchClinicMetrics,
  fetchTreatmentPlansStats as fetchTreatmentPlansStatsService
} from '@/lib/services/ai-dashboard.service';

/**
 * Hook for churn predictions
 */
export function useChurnPredictions() {
  return useQuery({
    queryKey: ['churn-predictions'],
    queryFn: async () => {
      const patients = await fetchPatientsForChurnAnalysis();
      const predictions = await batchAnalyzeChurnRisk(patients);
      return predictions;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook for BI insights
 */
export function useBIInsights() {
  return useQuery({
    queryKey: ['bi-insights'],
    queryFn: async () => {
      const metrics = await fetchClinicMetrics();
      const insights = await generateBIInsights(metrics);
      return { metrics, insights };
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook for treatment plans statistics
 */
export function useTreatmentPlansStats() {
  return useQuery({
    queryKey: ['treatment-plans-stats'],
    queryFn: fetchTreatmentPlansStatsService,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Combined hook for entire dashboard
 */
export function useAIDashboard() {
  const churn = useChurnPredictions();
  const bi = useBIInsights();
  const treatments = useTreatmentPlansStats();

  return {
    churn: {
      data: churn.data,
      isLoading: churn.isLoading,
      error: churn.error,
    },
    bi: {
      data: bi.data,
      isLoading: bi.isLoading,
      error: bi.error,
    },
    treatments: {
      data: treatments.data,
      isLoading: treatments.isLoading,
      error: treatments.error,
    },
    isLoading: churn.isLoading || bi.isLoading || treatments.isLoading,
    hasError: !!(churn.error || bi.error || treatments.error),
  };
}

/**
 * Hook for AI status check
 */
export function useAIStatus() {
  return useQuery({
    queryKey: ['ai-status'],
    queryFn: async () => {
      const hasApiKey = !!process.env.GOOGLE_AI_API_KEY;
      
      return {
        isOnline: hasApiKey,
        provider: 'Google Gemini Pro',
        features: {
          churnPrediction: true,
          biInsights: hasApiKey,
          treatmentGeneration: hasApiKey,
        },
        fallbackMode: !hasApiKey,
      };
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
