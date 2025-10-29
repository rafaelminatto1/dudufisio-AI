import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PresenceDataPoint } from '../../types';

interface PresenceEvolutionChartProps {
  data: PresenceDataPoint[];
  onPeriodChange?: (period: number) => void;
}

export const PresenceEvolutionChart: React.FC<PresenceEvolutionChartProps> = ({ 
  data, 
  onPeriodChange 
}) => {
  const [period, setPeriod] = useState<number>(30);

  const handlePeriodChange = (value: string) => {
    const numValue = parseInt(value);
    setPeriod(numValue);
    onPeriodChange?.(numValue);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900 mb-2">
            {new Date(data.date).toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: 'long' 
            })}
          </p>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600 font-medium">
              Taxa: {data.attendanceRate.toFixed(1)}%
            </p>
            <p className="text-slate-600">
              Sessões: {data.totalSessions}
            </p>
            <p className="text-green-600">
              Realizadas: {data.completed}
            </p>
            <p className="text-red-600">
              Faltas: {data.missed}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Evolução de Presença</CardTitle>
            <CardDescription>Taxa de comparecimento ao longo do tempo</CardDescription>
          </div>
          <Select value={period.toString()} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="60">60 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              className="text-xs"
              stroke="#64748b"
            />
            <YAxis 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              className="text-xs"
              stroke="#64748b"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="attendanceRate"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 3 }}
              activeDot={{ r: 5 }}
              name="Taxa de Presença (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </>
  );
};

