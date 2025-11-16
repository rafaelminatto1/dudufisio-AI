import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Copy,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../contexts/ToastContext';
import * as medicalReportSuggestionsService from '../../services/medicalReportSuggestionsService';
import { MedicalInsight } from '../../types';

/**
 * Painel de Sugestões para Relatórios Médicos
 * Insights automáticos gerados com IA
 * Copiar texto para relatório
 */

interface MedicalReportSuggestionsProps {
  patientId: string;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}

export const MedicalReportSuggestions: React.FC<MedicalReportSuggestionsProps> = ({
  patientId,
  isCollapsible = true,
  defaultExpanded = true,
}) => {
  const { showToast } = useToast();
  const [insights, setInsights] = useState<MedicalInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [selectedTypes, setSelectedTypes] = useState<MedicalInsight['type'][]>([
    'pain_reduction',
    'range_improvement',
    'strength_gain',
    'functional_progress',
    'milestone',
  ]);

  useEffect(() => {
    loadInsights();
  }, [patientId]);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const data = await medicalReportSuggestionsService.generateMedicalInsights(patientId);
      setInsights(data);
    } catch (error) {
      console.error('Erro ao carregar insights:', error);
      showToast('Erro ao carregar sugestões para relatório', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyInsight = (insight: MedicalInsight) => {
    if (!insight.suggestedText) return;

    navigator.clipboard.writeText(insight.suggestedText);
    showToast('Texto copiado para área de transferência', 'success');
  };

  const handleCopyAll = () => {
    const allText = filteredInsights
      .filter(i => i.suggestedText)
      .map(i => `• ${i.suggestedText}`)
      .join('\n\n');

    if (!allText) {
      showToast('Nenhum insight disponível para copiar', 'info');
      return;
    }

    navigator.clipboard.writeText(allText);
    showToast('Todos os insights copiados', 'success');
  };

  const handleExportReport = async () => {
    try {
      const fullReport = await medicalReportSuggestionsService.generateFullMedicalReport(patientId);
      
      // Download como arquivo .txt
      const blob = new Blob([fullReport], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_medico_${patientId}_${new Date().toISOString().split('T')[0]}.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Relatório exportado com sucesso', 'success');
    } catch (error) {
      showToast('Erro ao exportar relatório', 'error');
    }
  };

  const filteredInsights = insights.filter(i => selectedTypes.includes(i.type));

  const getInsightIcon = (type: MedicalInsight['type']) => {
    const icons = {
      pain_reduction: TrendingUp,
      range_improvement: TrendingUp,
      strength_gain: TrendingUp,
      functional_progress: TrendingUp,
      milestone: CheckCircle2,
      alert: AlertCircle,
    };
    return icons[type] || Info;
  };

  const getInsightColor = (severity?: MedicalInsight['severity']) => {
    const colors = {
      success: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-900',
        badge: 'bg-green-100 text-green-800',
      },
      warning: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-900',
        badge: 'bg-orange-100 text-orange-800',
      },
      error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-900',
        badge: 'bg-red-100 text-red-800',
      },
      info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-900',
        badge: 'bg-blue-100 text-blue-800',
      },
    };
    return colors[severity || 'info'];
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-24 bg-slate-200 rounded-lg"></div>
        <div className="h-24 bg-slate-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200 ${
          isCollapsible ? 'cursor-pointer hover:from-purple-100 hover:to-pink-100' : ''
        }`}
        onClick={isCollapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-purple-600" />
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Insights para Relatório Médico
            </h3>
            <p className="text-xs text-slate-600">
              {filteredInsights.length} sugestão{filteredInsights.length !== 1 ? 'ões' : ''} gerada{filteredInsights.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isCollapsible && filteredInsights.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAll}
                title="Copiar todos os insights"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportReport}
                title="Exportar relatório completo"
              >
                <Download className="w-4 h-4" />
              </Button>
            </>
          )}
          {isCollapsible && (
            isExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {filteredInsights.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Lightbulb className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum insight disponível ainda</p>
              <p className="text-xs mt-1">Insights serão gerados conforme o paciente evolui</p>
            </div>
          ) : (
            filteredInsights.map(insight => {
              const Icon = getInsightIcon(insight.type);
              const colors = getInsightColor(insight.severity);

              return (
                <div
                  key={insight.id}
                  className={`border ${colors.border} ${colors.bg} rounded-lg p-3`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${colors.badge} flex-shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className={`font-semibold ${colors.text} text-sm`}>
                          {insight.title}
                        </h4>
                        {insight.suggestedText && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyInsight(insight)}
                            className="h-6 w-6 p-0 hover:bg-white/50 flex-shrink-0"
                            title="Copiar texto"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mb-2">
                        {insight.description}
                      </p>

                      {/* Dados do insight */}
                      {insight.data && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {insight.data.metric && (
                            <span className="text-xs px-2 py-0.5 bg-white/50 rounded">
                              📊 {insight.data.metric}
                            </span>
                          )}
                          {insight.data.improvement !== undefined && (
                            <span className="text-xs px-2 py-0.5 bg-white/50 rounded">
                              📈 {insight.data.improvement > 0 ? '+' : ''}
                              {insight.data.improvement.toFixed(1)}
                            </span>
                          )}
                          {insight.data.percentImprovement !== undefined && (
                            <span className="text-xs px-2 py-0.5 bg-white/50 rounded">
                              {insight.data.percentImprovement > 0 ? '✓' : '✗'}{' '}
                              {insight.data.percentImprovement.toFixed(1)}%
                            </span>
                          )}
                          {insight.data.sessions && (
                            <span className="text-xs px-2 py-0.5 bg-white/50 rounded">
                              🎯 {insight.data.sessions} sessões
                            </span>
                          )}
                        </div>
                      )}

                      {/* Texto sugerido para laudo */}
                      {insight.suggestedText && (
                        <div className="bg-white/70 border border-slate-200 rounded p-2 mt-2">
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {insight.suggestedText}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Action Buttons */}
          {filteredInsights.length > 0 && (
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAll}
                className="flex items-center space-x-2"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Todos</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportReport}
                className="flex items-center space-x-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Relatório</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicalReportSuggestions;

