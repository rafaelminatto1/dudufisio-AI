import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { 
  aiSchedulingService, 
  SchedulingSuggestion 
} from '../../services/aiSchedulingService';
import { EnrichedAppointment, Therapist, Patient } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Sparkles,
  Clock,
  User,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AISchedulingSuggestionsProps {
  appointments: EnrichedAppointment[];
  therapists: Therapist[];
  patient: Patient | null;
  preferredDuration?: number;
  preferredType?: string;
  onSelectSuggestion: (suggestion: SchedulingSuggestion) => void;
  className?: string;
}

const AISchedulingSuggestions: React.FC<AISchedulingSuggestionsProps> = ({
  appointments,
  therapists,
  patient,
  preferredDuration = 50,
  preferredType = 'Fisioterapia',
  onSelectSuggestion,
  className
}) => {
  const [suggestions, setSuggestions] = useState<SchedulingSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (patient) {
      loadSuggestions();
    }
  }, [patient, appointments.length]);

  const loadSuggestions = async () => {
    if (!patient) return;
    
    setIsLoading(true);
    try {
      const results = await aiSchedulingService.suggestBestSlots(
        appointments,
        therapists,
        patient,
        preferredDuration,
        preferredType,
        7 // Próximos 7 dias
      );
      setSuggestions(results);
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 border-green-300';
    if (score >= 60) return 'text-blue-600 bg-blue-100 border-blue-300';
    return 'text-orange-600 bg-orange-100 border-orange-300';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    return 'Disponível';
  };

  if (!patient) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p className="text-slate-600">
          Selecione um paciente para ver sugestões inteligentes de horários
        </p>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-600">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-purple-900">Sugestões Inteligentes de IA</h3>
            <p className="text-sm text-purple-700">
              Os melhores horários baseados em otimização automática
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={loadSuggestions}
            disabled={isLoading}
            className="border-purple-300"
          >
            Atualizar
          </Button>
        </div>
      </Card>

      {/* Suggestions List */}
      <div className="space-y-2">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </Card>
          ))
        ) : suggestions.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-600">
              Nenhuma sugestão disponível nos próximos 7 dias
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Tente aumentar o período de busca ou verifique a disponibilidade dos terapeutas
            </p>
          </Card>
        ) : (
          <AnimatePresence>
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={`${suggestion.therapistId}-${suggestion.date}-${suggestion.time}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:shadow-lg",
                    selectedIndex === index && "ring-2 ring-blue-500 bg-blue-50"
                  )}
                  onClick={() => {
                    setSelectedIndex(index);
                    onSelectSuggestion(suggestion);
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Rank Badge */}
                    <div className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center font-bold border-2",
                      index === 0 && "bg-yellow-100 border-yellow-400 text-yellow-800",
                      index === 1 && "bg-slate-100 border-slate-400 text-slate-800",
                      index === 2 && "bg-orange-100 border-orange-400 text-orange-800",
                      index > 2 && "bg-white border-slate-300 text-slate-600"
                    )}>
                      <div className="text-xs">#{index + 1}</div>
                      {index === 0 && <div className="text-lg">🏆</div>}
                      {index === 1 && <div className="text-lg">🥈</div>}
                      {index === 2 && <div className="text-lg">🥉</div>}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            {format(suggestion.date, "EEEE, d 'de' MMMM", { locale: ptBR })}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">
                              {suggestion.time}
                            </span>
                          </div>
                        </div>

                        <Badge className={cn("gap-1 font-semibold", getScoreColor(suggestion.score))}>
                          <TrendingUp className="w-3 h-3" />
                          {suggestion.score}% {getScoreLabel(suggestion.score)}
                        </Badge>
                      </div>

                      {/* Therapist */}
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700">{suggestion.therapistName}</span>
                      </div>

                      {/* Reason */}
                      <p className="text-sm text-slate-600 mb-2">
                        {suggestion.reason}
                      </p>

                      {/* Benefits */}
                      {suggestion.benefits.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {suggestion.benefits.map((benefit, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs gap-1 bg-green-100 text-green-700 border-green-300"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer Hint */}
      {suggestions.length > 0 && (
        <Card className="p-3 bg-slate-50 text-center">
          <p className="text-xs text-slate-600">
            💡 <strong>Dica:</strong> As sugestões consideram carga de trabalho do terapeuta, 
            gaps na agenda, horários de pico e preferências do paciente
          </p>
        </Card>
      )}
    </div>
  );
};

export default AISchedulingSuggestions;


