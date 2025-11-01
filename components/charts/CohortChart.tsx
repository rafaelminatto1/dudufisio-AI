import React from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CohortData {
  cohort: string;
  period0: number;
  period1: number;
  period2: number;
  period3: number;
  period4: number;
  period5: number;
}

interface CohortChartProps {
  data: CohortData[];
  periodLabels?: string[];
  showPercentages?: boolean;
}

export function CohortChart({
  data,
  periodLabels = ['Mês 0', 'Mês 1', 'Mês 2', 'Mês 3', 'Mês 4', 'Mês 5'],
  showPercentages = true,
}: CohortChartProps) {
  const getColorIntensity = (value: number, baseValue: number) => {
    const percentage = (value / baseValue) * 100;
    if (percentage >= 80) return 'bg-green-600';
    if (percentage >= 60) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const periods = ['period0', 'period1', 'period2', 'period3', 'period4', 'period5'];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border bg-muted p-2 text-left text-sm font-medium">
              Coorte
            </th>
            {periodLabels.map((label, index) => (
              <th
                key={index}
                className="border bg-muted p-2 text-center text-sm font-medium"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((cohort) => (
            <tr key={cohort.cohort}>
              <td className="border bg-muted p-2 text-sm font-medium">
                {cohort.cohort}
              </td>
              {periods.map((period, index) => {
                const value = cohort[period as keyof CohortData] as number;
                const baseValue = cohort.period0 as number;
                const percentage = baseValue ? (value / baseValue) * 100 : 0;

                return (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <td
                          className={cn(
                            'border p-2 text-center text-sm font-medium text-white transition-colors',
                            getColorIntensity(value, baseValue)
                          )}
                        >
                          {showPercentages ? `${percentage.toFixed(0)}%` : value}
                        </td>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {cohort.cohort} - {periodLabels[index]}
                          </div>
                          <div className="text-sm">
                            Valor: {value} ({percentage.toFixed(1)}%)
                          </div>
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

