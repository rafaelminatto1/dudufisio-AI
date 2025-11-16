import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FunnelStage {
  name: string;
  value: number;
  color: string;
}

interface FunnelChartProps {
  data: FunnelStage[];
  height?: number;
  showPercentage?: boolean;
  showValues?: boolean;
}

export function FunnelChart({
  data,
  height = 400,
  showPercentage = true,
  showValues = true,
}: FunnelChartProps) {
  const total = data[0]?.value || 1;
  const maxWidth = 100;

  return (
    <div className="space-y-2" style={{ height }}>
      {data.map((stage, index) => {
        const percentage = (stage.value / total) * 100;
        const width = (stage.value / total) * maxWidth;
        const conversionFromPrevious =
          index > 0 ? ((stage.value / data[index - 1].value) * 100).toFixed(1) : 100;

        return (
          <div key={stage.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{stage.name}</span>
              <div className="flex items-center gap-2">
                {showValues && (
                  <span className="text-muted-foreground">{stage.value}</span>
                )}
                {showPercentage && (
                  <span className="text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </span>
                )}
                {index > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({conversionFromPrevious}% conv.)
                  </span>
                )}
              </div>
            </div>
            <div className="relative flex justify-center">
              <div
                className={cn(
                  'rounded-lg py-4 transition-all',
                  `bg-[${stage.color}]`
                )}
                style={{
                  width: `${width}%`,
                  backgroundColor: stage.color,
                  minWidth: '60px',
                }}
              >
                <div className="text-center text-sm font-medium text-white">
                  {stage.value}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

