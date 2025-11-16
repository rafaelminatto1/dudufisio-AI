/**
 * components/patient/AIPredictionCard.tsx
 * 
 * Card de predições com IA (3 predições + recomendações)
 */

import React, { useState, useEffect } from 'react';
import { Brain, Clock, AlertTriangle, Star, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { predictionService } from '@/services/ai/predictionService';
import { surgeryService } from '@/services/supabase/surgeryService';
import { pathologyService } from '@/services/supabase/pathologyService';
import { goalsService } from '@/services/supabase/goalsService';

interface AIPredictionCardProps {
  patientId: string;
  currentSessionNumber: number;
  adherenceRate: number;
  painReduction: number;
  functionalGain: number;
}

export function AIPredictionCard({ 
  patientId, 
  currentSessionNumber,
  adherenceRate,
  painReduction,
  functionalGain
}: AIPredictionCardProps) {
  const [predictions, setPredictions] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictions();
  }, [patientId, currentSessionNumber, adherenceRate, painReduction, functionalGain]);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      
      // Carregar dados necessários
      const surgery = await surgeryService.getLatestSurgery(patientId);
      const pathologies = await pathologyService.getActivePathologies(patientId);
      const goals = await goalsService.getActiveGoals(patientId);
      
      // Gerar predições
      const [dischargePred, recidiveRisk, satisfaction, aiRecs] = await Promise.all([
        predictionService.predictDischargeDate(surgery, pathologies, goals, currentSessionNumber),
        predictionService.predictRecidiveRisk(surgery, pathologies, adherenceRate, painReduction),
        predictionService.predictSatisfaction(painReduction, functionalGain, adherenceRate, goals.filter(g => g.status === 'completed').length),
        predictionService.generateRecommendations(surgery, pathologies, goals, adherenceRate, 4)
      ]);

      setPredictions({
        discharge: dischargePred,
        recidiveRisk,
        satisfaction
      });
      setRecommendations(aiRecs);
    } catch (error) {
      console.error('Erro ao carregar predições:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-health-secondary-50 to-health-primary-50 border-health-primary-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-health-primary-600" />
            Análise Preditiva com IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-primary-600 mx-auto"></div>
            <p className="text-slate-600 mt-2">Analisando dados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-health-secondary-50 to-health-primary-50 border-health-primary-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-health-primary-600" />
          Análise Preditiva com IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Predição 1: Tempo de Recuperação */}
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-health-info-600" />
              <h4 className="font-semibold text-sm">Tempo de Recuperação</h4>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-health-primary-600">
                {predictions?.discharge?.daysToDischarge || 'N/A'}
              </span>
              <span className="text-sm text-slate-600">dias</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Progress value={predictions?.discharge?.confidence || 0} className="flex-1 h-2" />
              <span className="text-xs text-slate-600">{predictions?.discharge?.confidence || 0}%</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Baseado em padrão de {predictions?.discharge?.similarCasesCount || 0} casos similares
            </p>
          </div>

          {/* Predição 2: Risco de Recidiva */}
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-health-warning-600" />
              <h4 className="font-semibold text-sm">Risco de Recidiva</h4>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-health-warning-600">
                {predictions?.recidiveRisk?.risk || 0}%
              </span>
            </div>
            <div className="mt-2">
              <Progress value={predictions?.recidiveRisk?.risk || 0} className="h-2" />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {predictions?.recidiveRisk?.risk < 30 ? 'Baixo risco - Continue o protocolo' : 
               predictions?.recidiveRisk?.risk < 60 ? 'Médio risco - Reforçar exercícios' : 
               'Alto risco - Revisar tratamento'}
            </p>
          </div>

          {/* Predição 3: Satisfação Esperada */}
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-health-success-600" />
              <h4 className="font-semibold text-sm">Satisfação Esperada</h4>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-health-success-600">
                {predictions?.satisfaction?.score?.toFixed(1) || 'N/A'}
              </span>
              <span className="text-sm text-slate-600">/10</span>
            </div>
            <div className="mt-2 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor((predictions?.satisfaction?.score || 0) / 2) ? 'fill-health-success-500 text-health-success-500' : 'text-slate-300'}`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Modelo baseado em feedback de pacientes
            </p>
          </div>
        </div>

        {/* Recomendações da IA */}
        {recommendations.length > 0 && (
          <div className="mt-4 p-4 bg-white rounded-lg">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-health-warning-500" />
              Recomendações Inteligentes
            </h4>
            <ul className="space-y-2">
              {recommendations.slice(0, 5).map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Badge 
                    variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'} 
                    className="mt-0.5"
                  >
                    {rec.priority}
                  </Badge>
                  <span className="text-slate-700">{rec.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

