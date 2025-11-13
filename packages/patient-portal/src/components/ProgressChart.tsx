/**
 * Componente de Gráfico de Progresso
 * MoocaFisio - App para Pacientes
 */

import React, { useMemo } from 'react';
import type { Serie } from '@nivo/line';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProgressDataPoint } from '../services/patientStatsService';
import { NivoLineChart, TooltipCard } from '../../../components/charts/nivo';

interface ProgressChartProps {
  data: ProgressDataPoint[];
}

export default function ProgressChart({ data }: ProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-xl text-neutral-textSecondary">
        <p>Nenhum dado disponível ainda</p>
      </div>
    );
  }
  
  // Preparar dados para o gráfico (mostrar apenas últimos 14 dias para melhor visualização)
  const recentData = data.slice(-14);
  const hasData = recentData.length > 0;

  type ProgressDatum = {
    x: string;
    y: number;
    raw: ProgressDataPoint;
  };

  const pointMap = useMemo(() => {
    return recentData.reduce<Record<string, ProgressDataPoint>>((acc, point) => {
      acc[point.date] = point;
      return acc;
    }, {});
  }, [recentData]);

  const series: Serie<ProgressDatum>[] = useMemo(() => {
    return [
      {
        id: 'exercises',
        color: '#2563eb',
        data: recentData.map((point) => ({
          x: point.date,
          y: point.count,
          raw: point,
        })),
      },
    ];
  }, [recentData]);

  return (
    <div className="w-full h-64 mt-md">
      {hasData ? (
        <NivoLineChart<ProgressDatum>
          data={series}
          margin={{ top: 24, right: 16, bottom: 48, left: 48 }}
          xScale={{ type: 'point' }}
          yScale={{ type: 'linear', min: 0, stacked: false }}
          axisBottom={{
            format: (value) => {
              const point = pointMap[value as string];
              if (!point) return value;
              return format(new Date(point.date), 'dd/MM', { locale: ptBR });
            },
            tickPadding: 10,
            tickRotation: -30,
          }}
          axisLeft={{
            tickPadding: 8,
            tickSize: 0,
          }}
          enableGridX={false}
          enableGridY
          colors={['#2563eb']}
          enablePoints
          pointSize={8}
          pointColor={{ from: 'color' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          enableArea
          areaOpacity={0.15}
          sliceTooltip={({ slice }) => {
            const datum = slice.points[0]?.data.raw;
            if (!datum) {
              return null;
            }

            return (
              <TooltipCard
                title={format(new Date(datum.date), "dd/MM/yyyy '•' EEEE", { locale: ptBR })}
                rows={[
                  {
                    id: 'completed',
                    label: 'Completados',
                    color: '#2563eb',
                    value: `${datum.count} exercício${datum.count !== 1 ? 's' : ''}`,
                  },
                ]}
              />
            );
          }}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-neutral-textSecondary">
          <p>Nenhum dado recente disponível</p>
        </div>
      )}
    </div>
  );
}

