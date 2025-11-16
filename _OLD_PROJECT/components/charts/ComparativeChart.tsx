import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from '@/components/charts/ChartsLazyOptimized';

interface ComparativeData {
  category: string;
  [key: string]: string | number;
}

interface ComparativeSeries {
  dataKey: string;
  name: string;
  color: string;
}

interface ComparativeChartProps {
  data: ComparativeData[];
  series: ComparativeSeries[];
  height?: number;
  layout?: 'horizontal' | 'vertical';
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
}

export function ComparativeChart({
  data,
  series,
  height = 300,
  layout = 'vertical',
  showGrid = true,
  showLegend = true,
  stacked = false,
}: ComparativeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
        {layout === 'vertical' ? (
          <>
            <XAxis dataKey="category" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
          </>
        ) : (
          <>
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="category" type="category" tick={{ fontSize: 12 }} width={100} />
          </>
        )}
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload?.length) {
              return (
                <div className="rounded-lg border bg-background p-3 shadow-lg">
                  <div className="text-sm font-medium mb-2">
                    {payload[0].payload.category}
                  </div>
                  {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div
                        className="h-3 w-3 rounded"
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
          <Bar
            key={s.dataKey}
            dataKey={s.dataKey}
            name={s.name}
            fill={s.color}
            stackId={stacked ? 'stack' : undefined}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

