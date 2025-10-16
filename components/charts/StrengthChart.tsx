/**
 * components/charts/StrengthChart.tsx
 * 
 * Gráfico comparativo de força (perna direita vs esquerda)
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell } from 'lucide-react';

interface StrengthChartProps {
  patientId: string;
}

interface StrengthData {
  session: number;
  date: string;
  rightLeg: number;
  leftLeg: number;
}

export function StrengthChart({ patientId }: StrengthChartProps) {
  // Mock data - TODO: Buscar dados reais do banco
  const data: StrengthData[] = [
    { session: 1, date: '01/01', rightLeg: 50, leftLeg: 45 },
    { session: 2, date: '08/01', rightLeg: 55, leftLeg: 50 },
    { session: 3, date: '11/01', rightLeg: 60, leftLeg: 55 },
    { session: 4, date: '13/01', rightLeg: 65, leftLeg: 60 },
    { session: 5, date: '15/01', rightLeg: 70, leftLeg: 65 },
  ];

  const currentRight = data[data.length - 1].rightLeg;
  const currentLeft = data[data.length - 1].leftLeg;
  const difference = Math.abs(currentRight - currentLeft);
  const asymmetry = ((difference / Math.max(currentRight, currentLeft)) * 100).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-health-warning-600" />
          Força Muscular
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-health-success-50 rounded-lg">
            <p className="text-xs text-slate-600">Perna Direita</p>
            <p className="text-xl font-bold text-health-success-600">{currentRight} kg</p>
          </div>
          <div className="p-3 bg-health-info-50 rounded-lg">
            <p className="text-xs text-slate-600">Perna Esquerda</p>
            <p className="text-xl font-bold text-health-info-600">{currentLeft} kg</p>
          </div>
        </div>

        <div className="mb-4 p-2 bg-slate-50 rounded">
          <p className="text-xs text-slate-600">
            Assimetria: <span className="font-semibold">{asymmetry}%</span>
            {parseFloat(asymmetry) < 10 ? (
              <span className="ml-2 text-health-success-600">✓ Dentro do normal</span>
            ) : (
              <span className="ml-2 text-health-warning-600">⚠ Atenção necessária</span>
            )}
          </p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
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
              label={{ value: 'Força (kg)', angle: -90, position: 'insideLeft' }}
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
            <Bar 
              dataKey="rightLeg" 
              fill="#10b981" 
              name="Perna Direita"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="leftLeg" 
              fill="#0ea5e9" 
              name="Perna Esquerda"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 text-xs text-slate-500 text-center">
          <p>Comparação de força entre membros (kg)</p>
        </div>
      </CardContent>
    </Card>
  );
}

