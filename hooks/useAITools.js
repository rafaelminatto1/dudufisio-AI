import { useState, useCallback, useEffect } from 'react';
import { aiToolsService } from '../services/ai/aiToolsService';
export const useAITools = () => {
    const [state, setState] = useState({
        isLoading: false,
        error: null,
        lastResponse: null,
        metrics: {
            totalRequests: 0,
            successRate: 0,
            averageResponseTime: 0
        }
    });
    const setLoading = useCallback((loading) => {
        setState(prev => ({ ...prev, isLoading: loading }));
    }, []);
    const setError = useCallback((error) => {
        setState(prev => ({ ...prev, error }));
    }, []);
    const setLastResponse = useCallback((response) => {
        setState(prev => ({ ...prev, lastResponse: response }));
    }, []);
    const clearError = useCallback(() => {
        setError(null);
    }, [setError]);
    const executeAICall = useCallback(async (aiFunction, operation) => {
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            setError(errorMessage);
            // Log error
            console.error(`Erro na operação ${operation}:`, error);
            throw error;
        }
        finally {
            setLoading(false);
        }
    }, [setLoading, setError, setLastResponse]);
    const generateReport = useCallback(async (data, provider = 'gemini') => {
        return executeAICall(() => aiToolsService.generateReport(data, provider), 'generate-report');
    }, [executeAICall]);
    const generateEvolution = useCallback(async (data, provider = 'gemini') => {
        return executeAICall(() => aiToolsService.generateEvolution(data, provider), 'generate-evolution');
    }, [executeAICall]);
    const generateHEP = useCallback(async (data, provider = 'gemini') => {
        return executeAICall(() => aiToolsService.generateHEP(data, provider), 'generate-hep');
    }, [executeAICall]);
    const analyzeRisk = useCallback(async (data, provider = 'gemini') => {
        return executeAICall(() => aiToolsService.analyzeRisk(data, provider), 'analyze-risk');
    }, [executeAICall]);
    const chatWithAI = useCallback(async (messages, provider = 'gemini') => {
        return executeAICall(() => aiToolsService.chatWithAI(messages, provider), 'chat-ai');
    }, [executeAICall]);
    const getAvailableProviders = useCallback(() => {
        return aiToolsService.getAvailableProviders();
    }, []);
    const refreshMetrics = useCallback(async () => {
        try {
            const metrics = await aiToolsService.getUsageMetrics();
            setState(prev => ({ ...prev, metrics }));
        }
        catch (error) {
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
