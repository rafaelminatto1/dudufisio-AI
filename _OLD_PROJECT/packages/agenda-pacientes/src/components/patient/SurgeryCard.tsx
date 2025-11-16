/**
 * components/patient/SurgeryCard.tsx
 * 
 * Card resumido de última cirurgia com predição de alta
 */

import React, { useState, useEffect } from 'react';
import { Scissors, Calendar, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { surgeryService } from '@/services/supabase/surgeryService';
import { predictionService } from '@/services/ai/predictionService';
import { pathologyService } from '@/services/supabase/pathologyService';
import { goalsService } from '@/services/supabase/goalsService';
import { Surgery } from '@/types';

interface SurgeryCardProps {
  patientId: string;
  currentSessionNumber: number;
}

export function SurgeryCard({ patientId, currentSessionNumber }: SurgeryCardProps) {
  const [latestSurgery, setLatestSurgery] = useState<Surgery | null>(null);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState<any>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const surgery = await surgeryService.getLatestSurgery(patientId);
      setLatestSurgery(surgery);

      if (surgery) {
        // Carregar predição
        setLoadingPrediction(true);
        const pathologies = await pathologyService.getActivePathologies(patientId);
        const goals = await goalsService.getActiveGoals(patientId);
        
        const pred = await predictionService.predictDischargeDate(
          surgery,
          pathologies,
          goals,
          currentSessionNumber
        );
        setPrediction(pred);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da cirurgia:', error);
    } finally {
      setLoading(false);
      setLoadingPrediction(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-l-4 border-l-health-danger-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-health-danger-500" />
            Última Cirurgia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-danger-500 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!latestSurgery) {
    return (
      <Card className="border-l-4 border-l-health-danger-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-health-danger-500" />
            Última Cirurgia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Scissors className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>Nenhuma cirurgia registrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { days, weeks, months } = surgeryService.calculateDaysSinceSurgery(latestSurgery.date);
  const recoveryProgress = latestSurgery.recoveryTimeDays 
    ? surgeryService.calculateRecoveryProgress(latestSurgery)
    : 0;

  return (
    <Card className="border-l-4 border-l-health-danger-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-health-danger-500" />
          Última Cirurgia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold text-lg text-slate-900 mb-2">{latestSurgery.name}</h3>
        
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600">
            {new Date(latestSurgery.date).toLocaleDateString('pt-BR')}
          </span>
        </div>

        <div className="flex gap-2 mb-4">
          <Badge variant="outline" className="text-xs">
            {days} dias
          </Badge>
          <Badge variant="outline" className="text-xs">
            {weeks} semanas
          </Badge>
          <Badge variant="outline" className="text-xs">
            {months} meses
          </Badge>
        </div>

        {latestSurgery.recoveryTimeDays && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600">Recuperação atual</span>
              <span className="text-xs font-semibold text-health-primary-600">{recoveryProgress}%</span>
            </div>
            <Progress value={recoveryProgress} className="h-2 mb-4" />
          </>
        )}

        {latestSurgery.complications && (
          <div className="mb-4 p-2 bg-health-warning-50 rounded border border-health-warning-200">
            <p className="text-xs font-medium text-health-warning-700 mb-1">
              ⚠️ Complicações:
            </p>
            <p className="text-xs text-slate-700">{latestSurgery.complications}</p>
          </div>
        )}

        {/* Predição de Alta */}
        {prediction && (
          <div className="p-3 bg-health-info-50 rounded-lg border border-health-info-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-health-info-600" />
              <p className="text-xs font-semibold text-health-info-700">Predição de Alta</p>
            </div>
            <p className="text-sm text-slate-700 font-medium mb-1">
              {new Date(prediction.predictedDischargeDate).toLocaleDateString('pt-BR')}
            </p>
            <p className="text-xs text-slate-600">
              ({prediction.daysToDischarge} dias) • {prediction.confidence}% de confiança
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Baseado em {prediction.similarCasesCount} casos similares
            </p>
          </div>
        )}

        {loadingPrediction && (
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 animate-spin" />
              <p className="text-xs text-slate-600">Calculando predição...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

