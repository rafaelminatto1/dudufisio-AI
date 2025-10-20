/**
 * ReportSuggestionsPanel - Painel de sugestões automáticas de relatórios
 * Exibe métricas relevantes baseadas na patologia do paciente
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Sparkles, TrendingUp, BarChart3, Activity, Download } from 'lucide-react';
import { Patient } from '../../types';
import { 
  generateReportSuggestions, 
  generateInsights,
  ReportSuggestion 
} from '../../services/reportSuggestionsService';
import { compareToNormative } from '../../services/normativeDataService';

interface ReportSuggestionsPanelProps {
  patient: Patient;
  sessionData?: any[];
  onApplySuggestion?: (suggestion: ReportSuggestion) => void;
  onGenerateReport?: () => void;
}

export const ReportSuggestionsPanel: React.FC<ReportSuggestionsPanelProps> = ({
  patient,
  sessionData = [],
  onApplySuggestion,
  onGenerateReport
}) => {
  const [suggestions, setSuggestions] = useState<ReportSuggestion[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSuggestions = () => {
      try {
        // Gerar sugestões baseadas na patologia
        const reportSuggestions = generateReportSuggestions(patient);
        setSuggestions(reportSuggestions);

        // Gerar insights automáticos
        const autoInsights = generateInsights(patient, sessionData);
        setInsights(autoInsights);
      } catch (error) {
        console.error('Erro ao gerar sugestões:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, [patient, sessionData]);

  const getRelevanceIcon = (relevance: string) => {
    switch (relevance) {
      case 'high': return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'medium': return <BarChart3 className="w-4 h-4 text-yellow-600" />;
      default: return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-4 bg-slate-200 rounded w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Insights Automáticos */}
      {insights.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="font-medium mb-2">💡 Insights Automáticos:</div>
            <ul className="space-y-1 text-sm">
              {insights.map((insight, idx) => (
                <li key={idx}>• {insight}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Sugestões de Métricas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Métricas Sugeridas para Relatório
            </CardTitle>
            {onGenerateReport && (
              <Button size="sm" onClick={onGenerateReport}>
                <Download className="w-4 h-4 mr-2" />
                Gerar Relatório
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 bg-white"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getRelevanceIcon(suggestion.relevance)}
                    <span className="font-medium text-slate-900">{suggestion.metric}</span>
                  </div>
                  <Badge className={getRelevanceColor(suggestion.relevance)}>
                    {suggestion.relevance}
                  </Badge>
                </div>
                
                <p className="text-sm text-slate-600 mb-3">{suggestion.insight}</p>

                {suggestion.chartRecommendation && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <span>Gráfico sugerido:</span>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.chartRecommendation.type}
                    </Badge>
                  </div>
                )}

                {suggestion.normativeComparison && (
                  <div className="text-xs text-slate-500 mb-2">
                    <span className="font-medium">Faixa normal:</span>{' '}
                    {suggestion.normativeComparison.expectedRange[0]} - {suggestion.normativeComparison.expectedRange[1]} {suggestion.normativeComparison.unit}
                  </div>
                )}

                {onApplySuggestion && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onApplySuggestion(suggestion)}
                    className="mt-2"
                  >
                    Incluir no Relatório
                  </Button>
                )}
              </div>
            ))}
          </div>

          {suggestions.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Sparkles className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>Nenhuma sugestão disponível</p>
              <p className="text-xs mt-1">Configure patologias do paciente para receber sugestões</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportSuggestionsPanel;

