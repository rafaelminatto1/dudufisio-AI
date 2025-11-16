import { useState, useCallback, useEffect } from 'react';
import { aiToolsService, AIResponse, ReportGenerationData, EvolutionGenerationData, HEPGenerationData, RiskAnalysisData, ChatMessage } from '../services/ai/aiToolsService';

interface AIToolsState {
  isLoading: boolean;
  error: string | null;
  lastResponse: AIResponse | null;
  metrics: {
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
  };
}

interface UseAIToolsReturn extends AIToolsState {
  generateReport: (data: ReportGenerationData, provider?: string) => Promise<AIResponse>;
  generateEvolution: (data: EvolutionGenerationData, provider?: string) => Promise<AIResponse>;
  generateHEP: (data: HEPGenerationData, provider?: string) => Promise<AIResponse>;
  analyzeRisk: (data: RiskAnalysisData, provider?: string) => Promise<AIResponse>;
  chatWithAI: (messages: ChatMessage[], provider?: string) => Promise<AIResponse>;
  clearError: () => void;
  getAvailableProviders: () => any[];
  refreshMetrics: () => Promise<void>;
}

export const useAITools = (): UseAIToolsReturn => {
  const [state, setState] = useState<AIToolsState>({
    isLoading: false,
    error: null,
    lastResponse: null,
    metrics: {
      totalRequests: 0,
      successRate: 0,
      averageResponseTime: 0
    }
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setLastResponse = useCallback((response: AIResponse | null) => {
    setState(prev => ({ ...prev, lastResponse: response }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const executeAICall = useCallback(async (
    aiFunction: () => Promise<AIResponse>,
    operation: string
  ): Promise<AIResponse> => {
    setLoading(true);
    setError(null);

    try {
      const startTime = Date.now();
      const response = await aiFunction();
      const responseTime = Date.now() - startTime;

      setLastResponse(response);
      
      // Log usage para métricas
      await aiToolsService.logUsage(operation, response.provider, true, responseTime);
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      
      // Log error
      console.error(`Erro na operação ${operation}:`, error);
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setLastResponse]);

  const generateReport = useCallback(async (
    data: ReportGenerationData, 
    provider: string = 'gemini'
  ): Promise<AIResponse> => {
    return executeAICall(
      () => aiToolsService.generateReport(data, provider),
      'generate-report'
    );
  }, [executeAICall]);

  const generateEvolution = useCallback(async (
    data: EvolutionGenerationData, 
    provider: string = 'gemini'
  ): Promise<AIResponse> => {
    return executeAICall(
      () => aiToolsService.generateEvolution(data, provider),
      'generate-evolution'
    );
  }, [executeAICall]);

  const generateHEP = useCallback(async (
    data: HEPGenerationData, 
    provider: string = 'gemini'
  ): Promise<AIResponse> => {
    return executeAICall(
      () => aiToolsService.generateHEP(data, provider),
      'generate-hep'
    );
  }, [executeAICall]);

  const analyzeRisk = useCallback(async (
    data: RiskAnalysisData, 
    provider: string = 'gemini'
  ): Promise<AIResponse> => {
    return executeAICall(
      () => aiToolsService.analyzeRisk(data, provider),
      'analyze-risk'
    );
  }, [executeAICall]);

  const chatWithAI = useCallback(async (
    messages: ChatMessage[], 
    provider: string = 'gemini'
  ): Promise<AIResponse> => {
    return executeAICall(
      () => aiToolsService.chatWithAI(messages, provider),
      'chat-ai'
    );
  }, [executeAICall]);

  const getAvailableProviders = useCallback(() => {
    return aiToolsService.getAvailableProviders();
  }, []);

  const refreshMetrics = useCallback(async () => {
    try {
      const metrics = await aiToolsService.getUsageMetrics();
      setState(prev => ({ ...prev, metrics }));
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  }, []);

  // Carregar métricas iniciais
  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics]);

  return {
    ...state,
    generateReport,
    generateEvolution,
    generateHEP,
    analyzeRisk,
    chatWithAI,
    clearError,
    getAvailableProviders,
    refreshMetrics
  };
};

export default useAITools;
