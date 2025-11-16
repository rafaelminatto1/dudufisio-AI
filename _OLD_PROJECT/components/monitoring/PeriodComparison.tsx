import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { KPIMetrics } from '../../types';

interface PeriodComparisonProps {
  currentPeriod: KPIMetrics;
  previousPeriod: KPIMetrics;
  currentPeriodLabel?: string;
  previousPeriodLabel?: string;
}

interface ComparisonMetric {
  label: string;
  current: number;
  previous: number;
  unit: string;
  format: 'number' | 'percentage';
  isPositiveGood: boolean; // true se aumento é bom, false se aumento é ruim
}

export const PeriodComparison: React.FC<PeriodComparisonProps> = ({
  currentPeriod,
  previousPeriod,
  currentPeriodLabel = 'Período Atual',
  previousPeriodLabel = 'Período Anterior',
}) => {
  const metrics: ComparisonMetric[] = [
    {
      label: 'Pacientes Ativos',
      current: currentPeriod.totalActivePatients,
      previous: previousPeriod.totalActivePatients,
      unit: '',
      format: 'number',
      isPositiveGood: true,
    },
    {
      label: 'Taxa de Presença',
      current: currentPeriod.averageAttendanceRate,
      previous: previousPeriod.averageAttendanceRate,
      unit: '%',
      format: 'percentage',
      isPositiveGood: true,
    },
    {
      label: 'Pacientes em Risco',
      current: currentPeriod.patientsAtRisk,
      previous: previousPeriod.patientsAtRisk,
      unit: '',
      format: 'number',
      isPositiveGood: false, // Menos pacientes em risco é melhor
    },
    {
      label: 'Total de Faltas',
      current: currentPeriod.totalMissesInPeriod,
      previous: previousPeriod.totalMissesInPeriod,
      unit: '',
      format: 'number',
      isPositiveGood: false, // Menos faltas é melhor
    },
  ];

  const calculateDelta = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getDeltaIcon = (delta: number, isPositiveGood: boolean) => {
    const isGood = (delta > 0 && isPositiveGood) || (delta < 0 && !isPositiveGood);
    
    if (delta > 0) {
      return <TrendingUp className={`w-4 h-4 ${isGood ? 'text-green-600' : 'text-red-600'}`} />;
    } else if (delta < 0) {
      return <TrendingDown className={`w-4 h-4 ${isGood ? 'text-green-600' : 'text-red-600'}`} />;
    }
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getDeltaColor = (delta: number, isPositiveGood: boolean) => {
    const isGood = (delta > 0 && isPositiveGood) || (delta < 0 && !isPositiveGood);
    
    if (delta === 0) return 'text-slate-600';
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  const generateInsights = (): string[] => {
    const insights: string[] = [];

    metrics.forEach(metric => {
      const delta = calculateDelta(metric.current, metric.previous);
      const isGood = (delta > 0 && metric.isPositiveGood) || (delta < 0 && !metric.isPositiveGood);
      
      if (Math.abs(delta) >= 10) { // Mudanças significativas (>10%)
        const direction = delta > 0 ? 'aumentou' : 'diminuiu';
        const sentiment = isGood ? '✅' : '⚠️';
        insights.push(
          `${sentiment} ${metric.label} ${direction} ${Math.abs(delta).toFixed(1)}%`
        );
      }
    });

    if (insights.length === 0) {
      insights.push('📊 Métricas estáveis entre os períodos');
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Comparação de Períodos</CardTitle>
            <CardDescription>Análise de variação entre períodos</CardDescription>
          </div>
          <Calendar className="w-5 h-5 text-blue-600" />
        </div>
      </CardHeader>

      <CardContent>
        {/* Grid de métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {metrics.map((metric, index) => {
            const delta = calculateDelta(metric.current, metric.previous);
            const deltaColor = getDeltaColor(delta, metric.isPositiveGood);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-50 rounded-lg p-4 border border-slate-200"
              >
                <p className="text-xs font-medium text-slate-600 mb-2">{metric.label}</p>
                
                {/* Valores */}
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {metric.format === 'percentage' 
                        ? metric.current.toFixed(1) 
                        : metric.current}
                      {metric.unit}
                    </p>
                    <p className="text-xs text-slate-500">
                      {currentPeriodLabel}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-600">
                      {metric.format === 'percentage' 
                        ? metric.previous.toFixed(1) 
                        : metric.previous}
                      {metric.unit}
                    </p>
                    <p className="text-xs text-slate-500">
                      {previousPeriodLabel}
                    </p>
                  </div>
                </div>

                {/* Delta */}
                <div className={`flex items-center gap-1 ${deltaColor}`}>
                  {getDeltaIcon(delta, metric.isPositiveGood)}
                  <span className="text-sm font-semibold">
                    {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                  </span>
                  <span className="text-xs text-slate-500 ml-1">vs. período anterior</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Insights automáticos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-blue-900 text-sm mb-2">📊 Insights da Comparação</p>
              <ul className="space-y-1">
                {insights.map((insight, idx) => (
                  <li key={idx} className="text-xs text-blue-800">
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-600" />
            <span>Melhoria</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-red-600" />
            <span>Piora</span>
          </div>
          <div className="flex items-center gap-1">
            <Minus className="w-3 h-3 text-slate-400" />
            <span>Estável</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


