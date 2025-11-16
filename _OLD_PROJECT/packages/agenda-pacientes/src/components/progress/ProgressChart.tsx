/**
 * Gráfico de Progresso
 * Visualização de evolução de métricas
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from '@/components/charts/ChartsLazyOptimized';

interface ProgressChartProps {
  data: Array<{
    date: string;
    value: number;
    target?: number;
  }>;
  metric: string;
  color?: string;
  height?: number;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  metric,
  color = '#3B82F6',
  height = 300,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          name={metric}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        {data[0]?.target !== undefined && (
          <Line
            type="monotone"
            dataKey="target"
            stroke="#94A3B8"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Meta"
            dot={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

