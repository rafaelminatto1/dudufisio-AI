import React, { useState, useEffect } from 'react';
import { Lightbulb, X, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AbandonmentPrediction } from '../../services/aiPredictionService';

export interface Suggestion {
  id: string;
  type: 'contact' | 'reschedule' | 'adjust_treatment' | 'support_group' | 'incentive';
  patientId: string;
  patientName: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
  action: string;
  isDismissed: boolean;
}

interface SmartSuggestionsProps {
  predictions: AbandonmentPrediction[];
  onActionClick: (patientId: string, action: string) => void;
  maxSuggestions?: number;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  predictions,
  onActionClick,
  maxSuggestions = 5,
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Gerar sugestões a partir das predições
  useEffect(() => {
    const generated: Suggestion[] = [];

    predictions
      .filter(p => p.probabilityScore >= 40) // Apenas probabilidade média/alta
      .sort((a, b) => b.probabilityScore - a.probabilityScore)
      .slice(0, maxSuggestions * 2) // Gerar mais do que precisa
      .forEach(prediction => {
        prediction.recommendedActions.forEach((action, index) => {
          const suggestionId = `${prediction.patientId}-${index}`;
          
          if (!dismissedIds.has(suggestionId)) {
            generated.push({
              id: suggestionId,
              type: mapActionToType(action.action),
              patientId: prediction.patientId,
              patientName: prediction.patientName,
              title: action.action,
              description: action.description,
              priority: action.priority,
              estimatedImpact: action.estimatedImpact,
              action: action.action,
              isDismissed: false,
            });
          }
        });
      });

    setSuggestions(generated.slice(0, maxSuggestions));
  }, [predictions, dismissedIds, maxSuggestions]);

  const handleDismiss = (suggestionId: string) => {
    setDismissedIds(prev => new Set([...prev, suggestionId]));
  };

  const handleAction = (suggestion: Suggestion) => {
    onActionClick(suggestion.patientId, suggestion.action);
    handleDismiss(suggestion.id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-amber-200 bg-amber-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-slate-200 bg-slate-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const configs = {
      high: { label: 'Alta', className: 'bg-red-100 text-red-800' },
      medium: { label: 'Média', className: 'bg-amber-100 text-amber-800' },
      low: { label: 'Baixa', className: 'bg-blue-100 text-blue-800' },
    };
    const config = configs[priority as keyof typeof configs] || configs.low;
    return (
      <Badge variant="outline" className={`${config.className} border-none text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    // Retornar emoji baseado no tipo
    switch (type) {
      case 'contact':
        return '📞';
      case 'reschedule':
        return '📅';
      case 'adjust_treatment':
        return '🔧';
      case 'support_group':
        return '👥';
      case 'incentive':
        return '🎁';
      default:
        return '💡';
    }
  };

  if (suggestions.length === 0) {
    return null; // Não renderizar se não há sugestões
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        <h3 className="font-semibold text-slate-900">Sugestões Inteligentes da IA</h3>
        <Badge variant="secondary" className="ml-auto">
          {suggestions.length} sugestã{suggestions.length > 1 ? 'ões' : 'o'}
        </Badge>
      </div>

      <AnimatePresence>
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`border-2 ${getPriorityColor(suggestion.priority)} hover:shadow-md transition-shadow`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Ícone */}
                  <div className="text-2xl flex-shrink-0 mt-0.5">
                    {getTypeIcon(suggestion.type)}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 text-sm mb-1">
                          {suggestion.title}
                        </h4>
                        <p className="text-xs text-slate-600 mb-1">
                          Paciente: <span className="font-medium">{suggestion.patientName}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(suggestion.priority)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismiss(suggestion.id)}
                          className="h-6 w-6 p-0 hover:bg-slate-200"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 mb-3">
                      {suggestion.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-green-700">
                        <CheckCircle className="w-3 h-3" />
                        <span>{suggestion.estimatedImpact}</span>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleAction(suggestion)}
                        className="h-7 gap-1.5 text-xs"
                      >
                        Executar Ação
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Resumo */}
      <div className="text-xs text-slate-500 text-center pt-2">
        Sugestões geradas pela IA baseadas em padrões de abandono
      </div>
    </div>
  );
};

// Helper para mapear ação para tipo
function mapActionToType(action: string): Suggestion['type'] {
  const actionLower = action.toLowerCase();
  
  if (actionLower.includes('contato') || actionLower.includes('ligar') || actionLower.includes('whatsapp')) {
    return 'contact';
  }
  if (actionLower.includes('agendar') || actionLower.includes('reagendar')) {
    return 'reschedule';
  }
  if (actionLower.includes('tratamento') || actionLower.includes('protocolo') || actionLower.includes('ajustar')) {
    return 'adjust_treatment';
  }
  if (actionLower.includes('grupo') || actionLower.includes('conectar')) {
    return 'support_group';
  }
  if (actionLower.includes('desconto') || actionLower.includes('incentivo')) {
    return 'incentive';
  }
  
  return 'contact'; // Default
}


