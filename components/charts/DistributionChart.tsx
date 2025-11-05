import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from '@/components/charts/ChartsLazyOptimized';

interface DistributionData {
  name: string;
  value: number;
  color: string;
}

interface DistributionChartProps {
  data: DistributionData[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  type?: 'pie' | 'donut';
}

export function DistributionChart({
  data,
  height = 300,
  innerRadius = 0,
  outerRadius = 80,
  showLegend = true,
  type = 'donut',
}: DistributionChartProps) {
  const calculatedInnerRadius = type === 'donut' ? innerRadius || 60 : 0;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={calculatedInnerRadius}
          outerRadius={outerRadius}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const percentage = ((payload[0].value as number) / total) * 100;
              return (
                <div className="rounded-lg border bg-background p-3 shadow-lg">
                  <div className="text-sm font-medium">{payload[0].name}</div>
                  <div className="text-sm text-muted-foreground">
                    {payload[0].value} ({percentage.toFixed(1)}%)
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        {showLegend && (
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => {
              const percentage = ((entry.payload.value / total) * 100).toFixed(1);
              return (
                <span className="text-sm">
                  {value}: {entry.payload.value} ({percentage}%)
                </span>
              );
            }}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}

