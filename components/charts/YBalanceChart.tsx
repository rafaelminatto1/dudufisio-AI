/**
 * components/charts/YBalanceChart.tsx
 * 
 * Gráfico Radar para Y Balance Test
 */

import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

interface YBalanceChartProps {
  patientId: string;
}

interface YBalanceData {
  direction: string;
  initial: number;
  current: number;
}

export function YBalanceChart({ patientId }: YBalanceChartProps) {
  // Mock data - TODO: Buscar dados reais do banco
  const data: YBalanceData[] = [
    { direction: 'Anterior', initial: 60, current: 75 },
    { direction: 'Posterolateral', initial: 55, current: 70 },
    { direction: 'Posteromedial', initial: 58, current: 72 },
  ];

  const averageImprovement = ((data.reduce((acc, d) => acc + (d.current - d.initial), 0) / data.length) / 100) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-health-secondary-600" />
          Y Balance Test
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Melhoria Média</p>
              <p className="text-2xl font-bold text-health-secondary-600">+{averageImprovement.toFixed(0)}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">3 direções avaliadas</p>
              <p className="text-xs text-slate-500">Alcance em cm</p>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis 
              dataKey="direction" 
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
            />
            <Radar 
              name="Inicial" 
              dataKey="initial" 
              stroke="#f43f5e" 
              fill="#f43f5e" 
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar 
              name="Atual" 
              dataKey="current" 
              stroke="#10b981" 
              fill="#10b981" 
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
            />
          </RadarChart>
        </ResponsiveContainer>

        <div className="mt-4 text-xs text-slate-500 text-center">
          <p>Y Balance Test - Alcance em 3 direções (cm)</p>
        </div>
      </CardContent>
    </Card>
  );
}

