/**
 * Estatísticas de Volume
 * Métricas de volume total de exercícios
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface VolumeStatsProps {
  current: number;
  previous: number;
  unit: string;
  label: string;
}

export const VolumeStats: React.FC<VolumeStatsProps> = ({
  current,
  previous,
  unit,
  label,
}) => {
  const change = current - previous;
  const percentChange = previous > 0 ? ((change / previous) * 100).toFixed(1) : 0;
  
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-600">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900">
            {current.toLocaleString()} {unit}
          </div>
          
          <div className="flex items-center gap-2">
            {isNeutral ? (
              <>
                <Minus className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Sem alteração</span>
              </>
            ) : isPositive ? (
              <>
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">
                  +{percentChange}% vs período anterior
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">
                  {percentChange}% vs período anterior
                </span>
              </>
            )}
          </div>

          <div className="text-xs text-gray-500">
            Período anterior: {previous.toLocaleString()} {unit}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

