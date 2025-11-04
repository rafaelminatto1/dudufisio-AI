/**
 * components/patient/MetricsGrid.tsx
 * 
 * Grid de métricas rápidas do paciente
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, TrendingDown, Activity, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MetricsGridProps {
  patientId: string;
}

export function MetricsGrid({ patientId }: MetricsGridProps) {
  const [metrics, setMetrics] = useState({
    adherenceRate: 85,
    missedSessions: 2,
    painReduction: 45,
    initialPainLevel: 8,
    currentPainLevel: 4,
    functionalGain: 35,
    currentFunctionalScore: 65,
    daysToNextSession: 3,
    nextSessionDate: '2025-01-19',
    nextSessionTime: '14:00'
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [patientId]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      // TODO: Buscar métricas reais do banco de dados
      // Por enquanto usando dados mock
      setMetrics({
        adherenceRate: 85,
        missedSessions: 2,
        painReduction: 45,
        initialPainLevel: 8,
        currentPainLevel: 4,
        functionalGain: 35,
        currentFunctionalScore: 65,
        daysToNextSession: 3,
        nextSessionDate: '2025-01-19',
        nextSessionTime: '14:00'
      });
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Aderência ao Tratamento */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Aderência</p>
              <p className="text-2xl font-bold text-health-primary-600">{metrics.adherenceRate}%</p>
            </div>
            <div className={`p-3 rounded-full ${metrics.adherenceRate >= 80 ? 'bg-health-success-100' : 'bg-health-warning-100'}`}>
              <CheckCircle className={`w-6 h-6 ${metrics.adherenceRate >= 80 ? 'text-health-success-600' : 'text-health-warning-600'}`} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {metrics.missedSessions} falta(s) nos últimos 30 dias
          </p>
        </CardContent>
      </Card>

      {/* Evolução de Dor */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Redução de Dor</p>
              <p className="text-2xl font-bold text-health-success-600">-{metrics.painReduction}%</p>
            </div>
            <div className="p-3 rounded-full bg-health-success-100">
              <TrendingDown className="w-6 h-6 text-health-success-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            De {metrics.initialPainLevel} para {metrics.currentPainLevel} (EVA)
          </p>
        </CardContent>
      </Card>

      {/* Funcionalidade */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Funcionalidade</p>
              <p className="text-2xl font-bold text-health-info-600">+{metrics.functionalGain}%</p>
            </div>
            <div className="p-3 rounded-full bg-health-info-100">
              <Activity className="w-6 h-6 text-health-info-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Score atual: {metrics.currentFunctionalScore}/100
          </p>
        </CardContent>
      </Card>

      {/* Próxima Sessão */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Próxima Sessão</p>
              <p className="text-lg font-bold text-slate-800">{metrics.daysToNextSession}d</p>
            </div>
            <div className="p-3 rounded-full bg-health-secondary-100">
              <Calendar className="w-6 h-6 text-health-secondary-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {new Date(metrics.nextSessionDate).toLocaleDateString('pt-BR')} às {metrics.nextSessionTime}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

