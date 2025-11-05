/**
 * components/charts/PainEvolutionChart.tsx
 * 
 * Gráfico aprimorado de evolução da dor (EVA 0-10)
 * Com comparação pré vs pós, destaque de threshold e intervenções
 */

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceArea } from '@/components/charts/ChartsLazyOptimized';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { TrendingDown, AlertTriangle, Download } from 'lucide-react';

interface PainEvolutionChartProps {
  patientId: string;
  showComparison?: boolean;
  highlightThreshold?: number;
  showInterventions?: boolean;
  onExport?: () => void;
}

interface PainData {
  session: number;
  date: string;
  painBefore: number;
  painAfter: number;
  predictedPain?: number;
  intervention?: string;
}

export function PainEvolutionChart({ 
  patientId,
  showComparison = true,
  highlightThreshold = 7,
  showInterventions = true,
  onExport
}: PainEvolutionChartProps) {
  // Mock data - TODO: Buscar dados reais do banco
  const data: PainData[] = [
    { session: 1, date: '01/01', painBefore: 9, painAfter: 8, intervention: 'Crioterapia' },
    { session: 2, date: '08/01', painBefore: 7, painAfter: 6, intervention: 'TENS' },
    { session: 3, date: '11/01', painBefore: 6, painAfter: 5, intervention: 'Exercícios' },
    { session: 4, date: '13/01', painBefore: 6, painAfter: 4, intervention: 'Mobilização' },
    { session: 5, date: '15/01', painBefore: 5, painAfter: 3, predictedPain: 4, intervention: 'Alongamento' },
  ];

  const [showPrediction, setShowPrediction] = useState(false);

  const averageReduction = ((data[0].painBefore - data[data.length - 1].painAfter) / data[0].painBefore) * 100;
  
  // Contar sessões com dor acima do threshold
  const highPainSessions = data.filter(d => d.painBefore >= highlightThreshold).length;
  
  // Calcular redução média por sessão
  const averageSessionReduction = data.reduce((sum, d) => sum + (d.painBefore - d.painAfter), 0) / data.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-health-success-600" />
            Evolução da Dor (EVA)
          </CardTitle>
          {onExport && (
            <Button size="sm" variant="outline" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          {/* Métricas principais */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-slate-600 mb-1">Redução Total</p>
              <p className="text-2xl font-bold text-green-600">{averageReduction.toFixed(0)}%</p>
              <p className="text-xs text-slate-500 mt-1">
                De {data[0].painBefore} para {data[data.length - 1].painAfter}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-slate-600 mb-1">Redução/Sessão</p>
              <p className="text-2xl font-bold text-blue-600">{averageSessionReduction.toFixed(1)}</p>
              <p className="text-xs text-slate-500 mt-1">EVA por sessão</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs text-slate-600 mb-1">Dor Alta</p>
              <p className="text-2xl font-bold text-red-600">{highPainSessions}</p>
              <p className="text-xs text-slate-500 mt-1">
                ≥ {highlightThreshold} EVA
              </p>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPrediction"
                checked={showPrediction}
                onChange={(e) => setShowPrediction(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="showPrediction" className="text-sm text-slate-700">
                Mostrar predição IA
              </label>
            </div>
            {highPainSessions > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {highPainSessions} sessão(ões) com dor alta
              </Badge>
            )}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              label={{ value: 'Sessão', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              stroke="#64748b"
              domain={[0, 10]}
              style={{ fontSize: '12px' }}
              label={{ value: 'EVA', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: any, name: string) => {
                if (name === 'painBefore' || name === 'painAfter') {
                  return [`${value}/10`, name === 'painBefore' ? 'Dor Antes' : 'Dor Depois'];
                }
                return value;
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
            />
            
            {/* Área de alerta para dor alta */}
            <ReferenceArea
              y1={highlightThreshold}
              y2={10}
              fill="#fef2f2"
              label={{ value: 'Dor Alta', position: 'right', fill: '#ef4444' }}
            />
            
            {/* Linha de threshold */}
            <ReferenceLine
              y={highlightThreshold}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{ value: `Alerta (≥${highlightThreshold})`, position: 'right', fill: '#ef4444' }}
            />
            
            {/* Linha de dor antes da sessão */}
            {showComparison && (
              <Line 
                type="monotone" 
                dataKey="painBefore" 
                stroke="#f43f5e" 
                strokeWidth={2}
                name="Dor Antes"
                dot={{ fill: '#f43f5e', r: 5 }}
              />
            )}
            
            {/* Linha de dor depois da sessão */}
            <Line 
              type="monotone" 
              dataKey="painAfter" 
              stroke="#10b981" 
              strokeWidth={3}
              name="Dor Depois"
              dot={{ fill: '#10b981', r: 5 }}
              strokeDasharray={showComparison ? undefined : '5 5'}
            />
            
            {/* Linha de predição IA */}
            {showPrediction && data.some(d => d.predictedPain) && (
              <Line 
                type="monotone" 
                dataKey="predictedPain" 
                stroke="#06b6d4" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Predição IA"
                dot={{ fill: '#06b6d4', r: 4 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        {/* Legenda de intervenções */}
        {showInterventions && (
          <div className="mt-4 space-y-2">
            <div className="text-xs font-medium text-slate-700 mb-2">Intervenções Realizadas:</div>
            <div className="flex flex-wrap gap-2">
              {data.filter(d => d.intervention).map((d, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  Sessão {d.session}: {d.intervention}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-slate-500 text-center">
          <p>EVA: Escala Visual Analógica de 0 (sem dor) a 10 (dor máxima)</p>
        </div>
      </CardContent>
    </Card>
  );
}

