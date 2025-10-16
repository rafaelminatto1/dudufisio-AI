/**
 * components/charts/PainEvolutionChart.tsx
 * 
 * Gráfico de evolução da dor (EVA 0-10)
 */

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown } from 'lucide-react';

interface PainEvolutionChartProps {
  patientId: string;
}

interface PainData {
  session: number;
  date: string;
  painBefore: number;
  painAfter: number;
  predictedPain?: number;
}

export function PainEvolutionChart({ patientId }: PainEvolutionChartProps) {
  // Mock data - TODO: Buscar dados reais do banco
  const data: PainData[] = [
    { session: 1, date: '01/01', painBefore: 8, painAfter: 8 },
    { session: 2, date: '08/01', painBefore: 7, painAfter: 6 },
    { session: 3, date: '11/01', painBefore: 6, painAfter: 5 },
    { session: 4, date: '13/01', painBefore: 6, painAfter: 4 },
    { session: 5, date: '15/01', painBefore: 5, painAfter: 3, predictedPain: 4 },
  ];

  const averageReduction = ((data[0].painBefore - data[data.length - 1].painAfter) / data[0].painBefore) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-health-success-600" />
          Evolução da Dor (EVA)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Redução Média</p>
              <p className="text-2xl font-bold text-health-success-600">{averageReduction.toFixed(0)}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">De {data[0].painBefore} para {data[data.length - 1].painAfter}</p>
              <p className="text-xs text-slate-500">EVA 0-10</p>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#64748b"
              domain={[0, 10]}
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Line 
              type="monotone" 
              dataKey="painBefore" 
              stroke="#f43f5e" 
              strokeWidth={2}
              name="Dor Antes"
              dot={{ fill: '#f43f5e', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="painAfter" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Dor Depois"
              dot={{ fill: '#10b981', r: 4 }}
            />
            {data.some(d => d.predictedPain) && (
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

        <div className="mt-4 text-xs text-slate-500 text-center">
          <p>EVA: Escala Visual Analógica de 0 (sem dor) a 10 (dor máxima)</p>
        </div>
      </CardContent>
    </Card>
  );
}

