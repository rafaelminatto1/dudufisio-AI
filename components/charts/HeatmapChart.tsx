import React from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HeatmapData {
  x: string;
  y: string;
  value: number;
}

interface HeatmapChartProps {
  data: HeatmapData[];
  xLabels: string[];
  yLabels: string[];
  colorScale?: {
    min: string;
    mid: string;
    max: string;
  };
  showValues?: boolean;
  cellSize?: number;
}

export function HeatmapChart({
  data,
  xLabels,
  yLabels,
  colorScale = {
    min: '#f0f9ff',
    mid: '#3b82f6',
    max: '#1e40af',
  },
  showValues = false,
  cellSize = 60,
}: HeatmapChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));

  const getColorIntensity = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue || 1);
    
    if (normalized < 0.33) return colorScale.min;
    if (normalized < 0.66) return colorScale.mid;
    return colorScale.max;
  };

  const getValue = (x: string, y: string): number => {
    const item = data.find((d) => d.x === x && d.y === y);
    return item?.value || 0;
  };

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse">
        <thead>
          <tr>
            <th className="border p-2"></th>
            {xLabels.map((label) => (
              <th
                key={label}
                className="border p-2 text-center text-xs font-medium"
                style={{ minWidth: cellSize }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {yLabels.map((yLabel) => (
            <tr key={yLabel}>
              <td className="border p-2 text-xs font-medium">
                {yLabel}
              </td>
              {xLabels.map((xLabel) => {
                const value = getValue(xLabel, yLabel);
                const intensity = getColorIntensity(value);

                return (
                  <TooltipProvider key={`${xLabel}-${yLabel}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <td
                          className="border p-2 text-center transition-all hover:ring-2 hover:ring-primary"
                          style={{
                            backgroundColor: intensity,
                            minWidth: cellSize,
                            height: cellSize,
                          }}
                        >
                          {showValues && value > 0 && (
                            <span
                              className={cn(
                                'text-xs font-medium',
                                value > maxValue * 0.5 ? 'text-white' : 'text-foreground'
                              )}
                            >
                              {value}
                            </span>
                          )}
                        </td>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          {yLabel} - {xLabel}: <strong>{value}</strong>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

