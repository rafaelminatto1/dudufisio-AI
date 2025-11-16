import React, { useMemo } from 'react';
import type { Serie } from '@nivo/line';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SessionRating } from '../../services/ratingService';
import { getEmojiForValue } from '../feedback/EmojiRating';
import { EmojiRatingValue } from '../../types';
import { NivoLineChart, TooltipCard } from '../charts/nivo';

interface RatingChartProps {
  ratings: SessionRating[];
  height?: number;
  showLegend?: boolean;
}

// Interface para dados do gráfico
interface ChartDataPoint {
  date: string;
  displayDate: string;
  patientRating?: number;
  professionalRating?: number;
  tooltip: {
    patientEmoji?: string;
    professionalEmoji?: string;
  };
}

type ChartSeriesDatum = {
  x: string;
  y: number | null;
  raw: ChartDataPoint;
  serieId: 'patientRating' | 'professionalRating';
};

export function RatingChart({ 
  ratings, 
  height = 300, 
  showLegend = true 
}: RatingChartProps) {
  const chartData: ChartDataPoint[] = useMemo(() => {
    // Ordenar por data (mais antiga primeiro para o gráfico)
    const sortedRatings = [...ratings].sort(
      (a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
    );

    return sortedRatings.map((rating) => ({
      date: rating.sessionDate,
      displayDate: format(new Date(rating.sessionDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
      patientRating: rating.patient_rating || undefined,
      professionalRating: rating.professional_rating || undefined,
      tooltip: {
        patientEmoji: rating.patient_rating ? getEmojiForValue(rating.patient_rating) : undefined,
        professionalEmoji: rating.professional_rating ? getEmojiForValue(rating.professional_rating) : undefined,
      },
    }));
  }, [ratings]);

  const dateLabelMap = useMemo(() => {
    return chartData.reduce<Record<string, ChartDataPoint>>((acc, item) => {
      acc[item.date] = item;
      return acc;
    }, {});
  }, [chartData]);

  const lineSeries: Serie<ChartSeriesDatum>[] = useMemo(() => {
    const buildSeries = (
      key: 'patientRating' | 'professionalRating',
      label: string,
      color: string
    ): Serie<ChartSeriesDatum> => ({
      id: label,
      color,
      data: chartData.map((point) => ({
        x: point.date,
        y: point[key] ?? null,
        raw: point,
        serieId: key,
      })),
    });

    return [
      buildSeries('patientRating', 'Avaliação do Paciente', '#3b82f6'),
      buildSeries('professionalRating', 'Avaliação do Profissional', '#22c55e'),
    ];
  }, [chartData]);

  // Se não houver dados suficientes
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <p className="text-gray-500 text-sm">Sem dados de avaliações</p>
          <p className="text-gray-400 text-xs mt-1">
            As avaliações aparecerão aqui após serem registradas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <NivoLineChart<ChartSeriesDatum>
        height={height}
        data={lineSeries}
        curve="monotoneX"
        margin={{
          top: 24,
          right: 24,
          bottom: showLegend ? 80 : 48,
          left: 60,
        }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 1, max: 5 }}
        axisLeft={{
          tickValues: [1, 2, 3, 4, 5],
          format: (value) => getEmojiForValue(value as EmojiRatingValue),
          tickPadding: 12,
        }}
        axisBottom={{
          format: (value) => {
            const point = dateLabelMap[value as string];
            if (!point) return value as string;
            return format(new Date(point.date), 'dd/MM', { locale: ptBR });
          },
          tickPadding: 10,
          tickRotation: -30,
        }}
        pointSize={10}
        pointColor={{ from: 'color' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        colors={['#3b82f6', '#22c55e']}
        enableArea={false}
        sliceTooltip={({ slice }) => {
          const tooltipPoint = slice.points[0]?.data.raw;
          if (!tooltipPoint) return null;

          return (
            <TooltipCard
              title={tooltipPoint.displayDate}
              rows={slice.points
                .filter((point) => point.data.y !== null)
                .map((point) => {
                  const isPatient = point.data.serieId === 'patientRating';
                  const emoji = isPatient
                    ? point.data.raw.tooltip.patientEmoji
                    : point.data.raw.tooltip.professionalEmoji;
                  const valueLabel = point.data.yFormatted ?? point.data.y;

                  return {
                    id: point.id,
                    color: point.serieColor,
                    label:
                      point.serieId === 'Avaliação do Paciente'
                        ? 'Avaliação do Paciente'
                        : 'Avaliação do Profissional',
                    value: (
                      <span className="flex items-center gap-2">
                        <span className="text-base">{emoji}</span>
                        <span>{valueLabel}/5</span>
                      </span>
                    ),
                  };
                })}
            />
          );
        }}
        legends={
          showLegend
            ? [
                {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  translateY: 60,
                  itemsSpacing: 16,
                  itemWidth: 180,
                  itemHeight: 16,
                  itemDirection: 'left-to-right',
                  itemOpacity: 1,
                  symbolSize: 14,
                  symbolShape: 'circle',
                },
              ]
            : undefined
        }
      />
    </div>
  );
}

// Componente simplificado para espaços menores
export function RatingChartMini({ ratings }: { ratings: SessionRating[] }) {
  return <RatingChart ratings={ratings} height={200} showLegend={false} />;
}

