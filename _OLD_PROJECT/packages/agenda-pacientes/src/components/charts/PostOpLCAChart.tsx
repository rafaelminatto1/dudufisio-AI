/**
 * PostOpLCAChart - Gráfico específico para pós-operatório de LCA
 * Mostra amplitude do joelho, força do quadríceps e fases do protocolo
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from '@/components/charts/ChartsLazyOptimized';
import { Activity, Target, TrendingUp, Download } from 'lucide-react';
import differenceInDays from 'date-fns/differenceInDays';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';

export interface LCAProtocolPhase {
  name: string;
  startDay: number;
  endDay: number;
  color: string;
  milestones: string[];
}

export interface LCAMetric {
  date: string;
  dayPostOp: number;
  kneeFlexion?: number;
  kneeExtension?: number;
  quadricepsStrength?: number;
  painLevel?: number;
  notes?: string;
}

interface PostOpLCAChartProps {
  surgeryDate: Date;
  data: LCAMetric[];
  onExport?: () => void;
}

// Fases do protocolo de LCA
const LCA_PHASES: LCAProtocolPhase[] = [
  {
    name: 'Fase Aguda (0-14 dias)',
    startDay: 0,
    endDay: 14,
    color: '#ef4444',
    milestones: ['Cirurgia', 'Primeira mobilização', 'Primeira carga']
  },
  {
    name: 'Fase Subaguda (15-42 dias)',
    startDay: 15,
    endDay: 42,
    color: '#f59e0b',
    milestones: ['Início de exercícios resistidos', 'Retirada de muletas']
  },
  {
    name: 'Reabilitação (43-90 dias)',
    startDay: 43,
    endDay: 90,
    color: '#3b82f6',
    milestones: ['Retorno ao esporte', 'Teste funcional']
  },
  {
    name: 'Retorno (90+ dias)',
    startDay: 91,
    endDay: 180,
    color: '#10b981',
    milestones: ['Retorno completo ao esporte', 'Alta']
  }
];

// Valores normativos para amplitude do joelho
const NORMAL_RANGES = {
  kneeFlexion: { min: 0, max: 135, target: 120 },
  kneeExtension: { min: -5, max: 0, target: 0 },
  quadricepsStrength: { min: 70, max: 100, target: 85 } // % do membro contralateral
};

export const PostOpLCAChart: React.FC<PostOpLCAChartProps> = ({
  surgeryDate,
  data,
  onExport
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'kneeFlexion' | 'kneeExtension' | 'quadricepsStrength'>('kneeFlexion');
  const [showPhases, setShowPhases] = useState(true);
  const [showNormalRange, setShowNormalRange] = useState(true);

  // Preparar dados para o gráfico
  const chartData = useMemo(() => {
    return data.map(point => ({
      ...point,
      dayPostOp: differenceInDays(new Date(point.date), surgeryDate)
    }));
  }, [data, surgeryDate]);

  // Determinar fase atual
  const currentDay = differenceInDays(new Date(), surgeryDate);
  const currentPhase = LCA_PHASES.find(
    phase => currentDay >= phase.startDay && currentDay <= phase.endDay
  ) || LCA_PHASES[LCA_PHASES.length - 1];

  // Calcular progresso
  const calculateProgress = () => {
    if (chartData.length === 0) return { current: 0, target: 0, percentage: 0 };

    const latest = chartData[chartData.length - 1];
    const target = NORMAL_RANGES[selectedMetric].target;
    const current = latest[selectedMetric] || 0;

    return {
      current,
      target,
      percentage: Math.min((current / target) * 100, 100)
    };
  };

  const progress = calculateProgress();

  // Renderizar áreas de fase
  const renderPhaseAreas = () => {
    if (!showPhases) return null;

    return LCA_PHASES.map((phase, index) => (
      <ReferenceArea
        key={index}
        x1={phase.startDay}
        x2={phase.endDay}
        fill={phase.color}
        fillOpacity={0.1}
        label={{
          value: phase.name,
          position: 'insideTop',
          fontSize: 10,
          fill: phase.color
        }}
      />
    ));
  };

  // Renderizar linha de valor normal
  const renderNormalRange = () => {
    if (!showNormalRange) return null;

    const range = NORMAL_RANGES[selectedMetric];
    
    return (
      <>
        <ReferenceLine
          y={range.target}
          stroke="#10b981"
          strokeDasharray="3 3"
          label={{ value: 'Meta', position: 'right', fill: '#10b981' }}
        />
        {selectedMetric === 'kneeFlexion' && (
          <ReferenceArea
            y1={range.min}
            y2={range.max}
            fill="#10b981"
            fillOpacity={0.05}
          />
        )}
      </>
    );
  };

  // Renderizar marcadores de eventos
  const renderEventMarkers = () => {
    const events = [
      { day: 0, label: 'Cirurgia', color: '#ef4444' },
      { day: 7, label: 'Primeira Carga', color: '#f59e0b' },
      { day: 42, label: 'Retirada Muletas', color: '#3b82f6' },
      { day: 90, label: 'Retorno Esporte', color: '#10b981' }
    ];

    return events.map((event, index) => (
      <ReferenceLine
        key={index}
        x={event.day}
        stroke={event.color}
        strokeDasharray="2 2"
        label={{
          value: event.label,
          position: 'top',
          fontSize: 10,
          fill: event.color
        }}
      />
    ));
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'kneeFlexion':
        return 'Flexão do Joelho (°)';
      case 'kneeExtension':
        return 'Extensão do Joelho (°)';
      case 'quadricepsStrength':
        return 'Força do Quadríceps (%)';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Evolução Pós-Operatória de LCA
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={currentPhase.color === '#ef4444' ? 'destructive' : 'default'}>
              {currentPhase.name}
            </Badge>
            {onExport && (
              <Button size="sm" variant="outline" onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Informações da Cirurgia */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <div className="text-xs text-slate-600">Data da Cirurgia</div>
              <div className="font-medium">{format(surgeryDate, 'dd/MM/yyyy', { locale: ptBR })}</div>
            </div>
            <div>
              <div className="text-xs text-slate-600">Dias Pós-Operatório</div>
              <div className="font-medium">{currentDay} dias</div>
            </div>
            <div>
              <div className="text-xs text-slate-600">Fase Atual</div>
              <div className="font-medium text-sm">{currentPhase.name.split('(')[0].trim()}</div>
            </div>
          </div>

          {/* Progresso Atual */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-blue-900">{getMetricLabel()}</span>
              <span className="text-2xl font-bold text-blue-600">
                {progress.current}° / {progress.target}°
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <div className="text-xs text-blue-700 mt-2">
              {progress.percentage.toFixed(1)}% da meta alcançada
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Métrica
              </label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={selectedMetric === 'kneeFlexion' ? 'default' : 'outline'}
                  onClick={() => setSelectedMetric('kneeFlexion')}
                >
                  Flexão
                </Button>
                <Button
                  size="sm"
                  variant={selectedMetric === 'kneeExtension' ? 'default' : 'outline'}
                  onClick={() => setSelectedMetric('kneeExtension')}
                >
                  Extensão
                </Button>
                <Button
                  size="sm"
                  variant={selectedMetric === 'quadricepsStrength' ? 'default' : 'outline'}
                  onClick={() => setSelectedMetric('quadricepsStrength')}
                >
                  Força
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPhases"
                checked={showPhases}
                onChange={(e) => setShowPhases(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="showPhases" className="text-sm text-slate-700">
                Mostrar fases
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showNormalRange"
                checked={showNormalRange}
                onChange={(e) => setShowNormalRange(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="showNormalRange" className="text-sm text-slate-700">
                Valores normais
              </label>
            </div>
          </div>

          {/* Gráfico */}
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="dayPostOp"
                  label={{ value: 'Dias Pós-Operatório', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  label={{ value: getMetricLabel(), angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                  labelFormatter={(value) => `${value} dias pós-operatório`}
                  formatter={(value: any) => [`${value}°`, getMetricLabel()]}
                />
                <Legend />
                
                {/* Áreas de fase */}
                {renderPhaseAreas()}
                
                {/* Linha de valor normal */}
                {renderNormalRange()}
                
                {/* Marcadores de eventos */}
                {renderEventMarkers()}
                
                {/* Linha principal */}
                <Line
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                  name={getMetricLabel()}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legenda de Fases */}
          {showPhases && (
            <div className="grid grid-cols-4 gap-2">
              {LCA_PHASES.map((phase, index) => (
                <div
                  key={index}
                  className="p-2 rounded border"
                  style={{ borderColor: phase.color, backgroundColor: `${phase.color}10` }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: phase.color }}
                    />
                    <span className="text-xs font-medium">{phase.name.split('(')[0].trim()}</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Dias {phase.startDay}-{phase.endDay}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PostOpLCAChart;

