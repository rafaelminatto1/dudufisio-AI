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

interface TrendData {
  date: string;
  [key: string]: string | number;
}

interface TrendSeries {
  dataKey: string;
  name: string;
  color: string;
}

interface TrendChartProps {
  data: TrendData[];
  series: TrendSeries[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

export function TrendChart({
  data,
  series,
  height = 300,
  showGrid = true,
  showLegend = true,
}: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-3 shadow-lg">
                  <div className="text-sm font-medium mb-2">
                    {payload[0].payload.date}
                  </div>
                  {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-muted-foreground">{entry.name}:</span>
                      <span className="font-medium">{entry.value}</span>
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          }}
        />
        {showLegend && <Legend />}
        {series.map((s) => (
          <Line
            key={s.dataKey}
            type="monotone"
            dataKey={s.dataKey}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

