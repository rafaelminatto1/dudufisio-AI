/**
 * components/charts/AmplitudeChart.tsx
 * 
 * Gráfico de amplitude de movimento (graus)
 */

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface AmplitudeChartProps {
  patientId: string;
}

interface AmplitudeData {
  session: number;
  date: string;
  flexion: number;
  extension: number;
  abduction: number;
  adduction: number;
}

export function AmplitudeChart({ patientId }: AmplitudeChartProps) {
  // Mock data - TODO: Buscar dados reais do banco
  const data: AmplitudeData[] = [
    { session: 1, date: '01/01', flexion: 90, extension: 0, abduction: 45, adduction: 20 },
    { session: 2, date: '08/01', flexion: 100, extension: 5, abduction: 50, adduction: 25 },
    { session: 3, date: '11/01', flexion: 110, extension: 10, abduction: 55, adduction: 30 },
    { session: 4, date: '13/01', flexion: 120, extension: 15, abduction: 60, adduction: 35 },
    { session: 5, date: '15/01', flexion: 130, extension: 20, abduction: 65, adduction: 40 },
  ];

  const targetFlexion = 140;
  const currentFlexion = data[data.length - 1].flexion;
  const progress = (currentFlexion / targetFlexion) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-health-info-600" />
          Amplitude de Movimento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Flexão Atual</p>
              <p className="text-2xl font-bold text-health-info-600">{currentFlexion}°</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Meta: {targetFlexion}°</p>
              <p className="text-xs text-slate-500">{progress.toFixed(0)}% da meta</p>
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
              domain={[0, 180]}
              style={{ fontSize: '12px' }}
              label={{ value: 'Graus (°)', angle: -90, position: 'insideLeft' }}
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
              dataKey="flexion" 
              stroke="#06b6d4" 
              strokeWidth={2}
              name="Flexão"
              dot={{ fill: '#06b6d4', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="extension" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Extensão"
              dot={{ fill: '#10b981', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="abduction" 
              stroke="#a855f7" 
              strokeWidth={2}
              name="Abdução"
              dot={{ fill: '#a855f7', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="adduction" 
              stroke="#f59e0b" 
              strokeWidth={2}
              name="Adução"
              dot={{ fill: '#f59e0b', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 text-xs text-slate-500 text-center">
          <p>Medidas em graus (°) - Comparação de amplitudes articulares</p>
        </div>
      </CardContent>
    </Card>
  );
}

