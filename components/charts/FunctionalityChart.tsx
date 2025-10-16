/**
 * components/charts/FunctionalityChart.tsx
 * 
 * Gráfico de área empilhado para funcionalidade
 */

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

interface FunctionalityChartProps {
  patientId: string;
}

interface FunctionalityData {
  session: number;
  date: string;
  functionality: number;
  amplitude: number;
}

export function FunctionalityChart({ patientId }: FunctionalityChartProps) {
  // Mock data - TODO: Buscar dados reais do banco
  const data: FunctionalityData[] = [
    { session: 1, date: '01/01', functionality: 40, amplitude: 30 },
    { session: 2, date: '08/01', functionality: 50, amplitude: 40 },
    { session: 3, date: '11/01', functionality: 60, amplitude: 50 },
    { session: 4, date: '13/01', functionality: 70, amplitude: 60 },
    { session: 5, date: '15/01', functionality: 80, amplitude: 70 },
  ];

  const currentFunctionality = data[data.length - 1].functionality;
  const initialFunctionality = data[0].functionality;
  const improvement = ((currentFunctionality - initialFunctionality) / initialFunctionality) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-health-warning-600" />
          Funcionalidade e Amplitude
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Score Funcional</p>
              <p className="text-2xl font-bold text-health-warning-600">{currentFunctionality}/100</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Melhoria</p>
              <p className="text-xs text-health-success-600 font-semibold">+{improvement.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorFunctionality" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorAmplitude" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#64748b"
              domain={[0, 100]}
              style={{ fontSize: '12px' }}
              label={{ value: 'Score (0-100)', angle: -90, position: 'insideLeft' }}
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
            <Area 
              type="monotone" 
              dataKey="functionality" 
              stroke="#10b981" 
              fillOpacity={0.6}
              fill="url(#colorFunctionality)"
              name="Funcionalidade"
            />
            <Area 
              type="monotone" 
              dataKey="amplitude" 
              stroke="#06b6d4" 
              fillOpacity={0.6}
              fill="url(#colorAmplitude)"
              name="Amplitude"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-4 text-xs text-slate-500 text-center">
          <p>Evolução de funcionalidade e amplitude de movimento (0-100)</p>
        </div>
      </CardContent>
    </Card>
  );
}

