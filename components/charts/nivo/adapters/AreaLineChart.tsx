import type { Theme } from '@nivo/core';
import type { DefaultSeries, LineSvgProps, LineCustomSvgLayer } from '@nivo/line';
import { ResponsiveLine } from '@nivo/line';
import { useMemo } from 'react';
import { mergeThemes } from '../theme';
import { TooltipCard } from '../tooltips';

type AllowedX = string | number | Date | null;

export interface AreaLineDatum {
  x: AllowedX;
  y: number | null;
}

export interface AreaLineSerie {
  id: string;
  /**
   * Aparece em tooltips/legendas. Se omitido, usa o próprio id.
   */
  label?: string;
  /**
   * Cor base utilizada para linha/área.
   */
  color: string;
  data: AreaLineDatum[];
  /**
   * Configurações da área preenchida (quando desejado).
   */
  area?: {
    enabled?: boolean;
    opacity?: number;
    fill?: string;
  };
  /**
   * Define se a série deve ser exibida em tooltips e legenda (default: true).
   */
  visibility?: {
    tooltip?: boolean;
    legend?: boolean;
  };
}

export interface AreaLineChartProps {
  series: AreaLineSerie[];
  height?: number;
  themeOverride?: Theme;
  curve?: LineSvgProps<DefaultSeries>['curve'];
  xScale?: LineSvgProps<DefaultSeries>['xScale'];
  yScale?: LineSvgProps<DefaultSeries>['yScale'];
  yFormat?: LineSvgProps<DefaultSeries>['yFormat'];
  xFormat?: LineSvgProps<DefaultSeries>['xFormat'];
  margin?: LineSvgProps<DefaultSeries>['margin'];
  useMesh?: boolean;
}

export function NivoAreaLineChart({
  series,
  height = 320,
  themeOverride,
  curve = 'monotoneX',
  xScale = { type: 'point' },
  yScale = { type: 'linear', stacked: false, min: 'auto', max: 'auto' },
  yFormat = value => (typeof value === 'number' ? value.toLocaleString('pt-BR') : `${value}`),
  xFormat,
  margin = { top: 24, right: 32, bottom: 48, left: 60 },
  useMesh = true,
}: AreaLineChartProps) {
  const data = useMemo<DefaultSeries[]>(() => {
    return series.map(serie => ({
      id: serie.id,
      data: serie.data,
    }));
  }, [series]);

  const colorById = useMemo(() => {
    const map = new Map<string, string>();
    series.forEach(serie => {
      map.set(serie.id, serie.color);
    });
    return map;
  }, [series]);

  const seriesById = useMemo(() => {
    const map = new Map<string, AreaLineSerie>();
    series.forEach(serie => map.set(serie.id, serie));
    return map;
  }, [series]);

  const areaLayer: LineCustomSvgLayer<DefaultSeries> = useMemo(() => {
    const enabledAreas = new Set(
      series
        .filter(serie => serie.area?.enabled ?? false)
        .map(serie => serie.id),
    );

    return ({ series: computedSeries, areaGenerator }) => (
      <g>
        {computedSeries
          .filter(serie => enabledAreas.has(String(serie.id)))
          .map(serie => {
            const originalSerie = seriesById.get(String(serie.id));
            const fill = originalSerie?.area?.fill ?? serie.color;
            const opacity = originalSerie?.area?.opacity ?? 0.25;
            const path = areaGenerator(
              serie.data.map(point => ({
                x: point.position.x,
                y: point.position.y,
              })),
            );

            if (!path) {
              return null;
            }

            return (
              <path
                key={`area-${serie.id}`}
                d={path}
                fill={fill}
                fillOpacity={opacity}
                stroke="none"
                pointerEvents="none"
              />
            );
          })}
      </g>
    );
  }, [seriesById]);

  const legends = useMemo(() => {
    const legendSeries = series.filter(serie => serie.visibility?.legend ?? true);

    if (legendSeries.length === 0) {
      return [];
    }

    return [
      {
        anchor: 'bottom',
        direction: 'row' as const,
        justify: false,
        translateX: 0,
        translateY: 48,
        itemsSpacing: 12,
        itemWidth: 100,
        itemHeight: 16,
        itemDirection: 'left-to-right' as const,
        symbolSize: 12,
        symbolShape: 'circle' as const,
        data: legendSeries.map(serie => ({
          id: serie.id,
          label: serie.label ?? serie.id,
          color: serie.color,
        })),
      },
    ];
  }, [series]);

  return (
    <div style={{ height }}>
      <ResponsiveLine
        data={data}
        margin={margin}
        theme={mergeThemes(themeOverride)}
        curve={curve}
        xScale={xScale}
        xFormat={xFormat}
        yScale={yScale}
        yFormat={yFormat}
        enableGridX={false}
        enableGridY
        enablePoints
        pointSize={6}
        pointBorderWidth={2}
        pointColor={{ from: 'color' }}
        pointBorderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
        enableSlices="x"
        useMesh={useMesh}
        motionConfig="gentle"
        colors={({ id }) => colorById.get(String(id)) ?? '#2563eb'}
        lineWidth={2}
        enableArea={false}
        legends={legends}
        sliceTooltip={({ slice }) => {
          const rows = slice.points
            .filter(point => seriesById.get(String(point.serieId))?.visibility?.tooltip ?? true)
            .map(point => {
              const serie = seriesById.get(String(point.serieId));
              return {
                id: String(point.serieId),
                label: serie?.label ?? point.serieId,
                value: point.data.yFormatted,
                color: point.serieColor,
              };
            });

          const title = slice.points[0]?.data?.xFormatted ?? slice.id;

          return <TooltipCard title={title} rows={rows} />;
        }}
        layers={[
          'grid',
          'markers',
          'axes',
          areaLayer,
          'lines',
          'points',
          'slices',
          'mesh',
          'legends',
        ]}
      />
    </div>
  );
}

