/**
 * Componente de Status dos AI Providers
 * Mostra qual provider está sendo usado e métricas em tempo real
 */

import React, { useState, useEffect } from 'react';
import { Activity, Zap, Brain, TrendingUp, AlertCircle } from 'lucide-react';

interface AIProviderStatusProps {
  compact?: boolean;
  showMetrics?: boolean;
}

export const AIProviderStatus: React.FC<AIProviderStatusProps> = ({
  compact = false,
  showMetrics = true,
}) => {
  const [groqAvailable, setGroqAvailable] = useState(false);
  const [geminiAvailable, setGeminiAvailable] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkProviders();
    if (showMetrics) {
      updateMetrics();
      const interval = setInterval(updateMetrics, 10000); // Atualizar a cada 10s
      return () => clearInterval(interval);
    }
  }, [showMetrics]);

  const checkProviders = async () => {
    try {
      const [groq, gemini] = await Promise.all([
        aiOrchestratorService.isGroqConfigured(),
        Promise.resolve(aiOrchestratorService.isGeminiConfigured()),
      ]);
      setGroqAvailable(groq);
      setGeminiAvailable(gemini);
    } catch (error) {
      console.error('Erro ao verificar providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMetrics = () => {
    try {
      const collector = getAIMetricsCollector();
      const aggregated = collector.getAggregatedMetrics(3600000); // Última hora
      setMetrics(aggregated);
    } catch (error) {
      console.error('Erro ao obter métricas:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Activity className="w-4 h-4 animate-pulse" />
        <span>Verificando providers...</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {groqAvailable && (
          <div className="flex items-center gap-1 text-green-600">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-medium">Groq</span>
          </div>
        )}
        {geminiAvailable && (
          <div className="flex items-center gap-1 text-blue-600">
            <Brain className="w-4 h-4" />
            <span className="text-xs font-medium">Gemini</span>
          </div>
        )}
        {!groqAvailable && !geminiAvailable && (
          <div className="flex items-center gap-1 text-amber-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-medium">IA Indisponível</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Status dos AI Providers
        </h3>
      </div>

      {/* Status dos Providers */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Groq */}
        <div className={`p-3 rounded-lg border-2 ${
          groqAvailable 
            ? 'bg-green-50 border-green-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className={`w-5 h-5 ${
              groqAvailable ? 'text-green-600' : 'text-gray-400'
            }`} />
            <div>
              <div className="font-semibold text-gray-900">Groq</div>
              <div className="text-xs text-gray-500">Velocidade</div>
            </div>
          </div>
          <div className={`text-sm font-medium ${
            groqAvailable ? 'text-green-700' : 'text-gray-500'
          }`}>
            {groqAvailable ? '✓ Disponível' : '✗ Indisponível'}
          </div>
          {metrics?.providers?.groq && (
            <div className="mt-2 text-xs text-gray-600">
              <div>Latência: {Math.round(metrics.providers.groq.averageLatencyMs)}ms</div>
              <div>Requisições: {metrics.providers.groq.totalRequests}</div>
            </div>
          )}
        </div>

        {/* Gemini */}
        <div className={`p-3 rounded-lg border-2 ${
          geminiAvailable 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Brain className={`w-5 h-5 ${
              geminiAvailable ? 'text-blue-600' : 'text-gray-400'
            }`} />
            <div>
              <div className="font-semibold text-gray-900">Gemini</div>
              <div className="text-xs text-gray-500">Complexidade</div>
            </div>
          </div>
          <div className={`text-sm font-medium ${
            geminiAvailable ? 'text-blue-700' : 'text-gray-500'
          }`}>
            {geminiAvailable ? '✓ Disponível' : '✗ Indisponível'}
          </div>
          {metrics?.providers?.gemini && (
            <div className="mt-2 text-xs text-gray-600">
              <div>Latência: {Math.round(metrics.providers.gemini.averageLatencyMs)}ms</div>
              <div>Requisições: {metrics.providers.gemini.totalRequests}</div>
            </div>
          )}
        </div>
      </div>

      {/* Métricas de Comparação */}
      {showMetrics && metrics?.comparison && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <TrendingUp className="w-4 h-4" />
            Comparação Groq vs Gemini
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Melhoria de Latência */}
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Melhoria de Latência</div>
              <div className={`text-2xl font-bold ${
                metrics.comparison.groqVsGemini.latencyImprovement > 0 
                  ? 'text-green-600' 
                  : 'text-gray-500'
              }`}>
                {metrics.comparison.groqVsGemini.latencyImprovement > 0 ? '+' : ''}
                {metrics.comparison.groqVsGemini.latencyImprovement.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Groq é mais rápido
              </div>
            </div>

            {/* Economia de Custo */}
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Economia de Custo</div>
              <div className={`text-2xl font-bold ${
                metrics.comparison.groqVsGemini.costSavings > 0 
                  ? 'text-blue-600' 
                  : 'text-gray-500'
              }`}>
                {metrics.comparison.groqVsGemini.costSavings > 0 ? '+' : ''}
                {metrics.comparison.groqVsGemini.costSavings.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Groq é mais barato
              </div>
            </div>
          </div>

          {/* Fallback Info */}
          {metrics.fallback && metrics.fallback.totalFallbacks > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-amber-800 text-sm">
                <AlertCircle className="w-4 h-4" />
                <div>
                  <div className="font-medium">
                    {metrics.fallback.totalFallbacks} fallback(s) usado(s)
                  </div>
                  <div className="text-xs text-amber-600">
                    Taxa de fallback: {metrics.fallback.fallbackRate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cache Info */}
          {metrics.cache && metrics.cache.hits > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="text-sm text-purple-900 font-medium mb-1">
                Cache Performance
              </div>
              <div className="text-xs text-purple-700">
                {metrics.cache.hits} hits / {metrics.cache.misses} misses
                ({metrics.cache.hitRate.toFixed(1)}% de acerto)
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ações */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
        <button
          onClick={updateMetrics}
          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Atualizar
        </button>
        <button
          onClick={() => {
            getAIMetricsCollector().reset();
            updateMetrics();
          }}
          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Resetar Métricas
        </button>
      </div>
    </div>
  );
};

export default AIProviderStatus;


