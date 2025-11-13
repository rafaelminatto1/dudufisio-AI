# Protótipos de bibliotecas alternativas ao Recharts

## Objetivo
Explorar opções de gráficos React sem dependência de `lodash`, identificando equivalências funcionais para os componentes atuais e comparando o peso estimado dos pacotes (dados coletados via `npm view <package> dist.unpackedSize` em 2025-11-13).

## Resumo comparativo

| Biblioteca | Pacotes instalados | Tamanho unpacked (aprox.) | Observações |
|------------|--------------------|---------------------------|-------------|
| `react-chartjs-2` + `chart.js` | `react-chartjs-2`, `chart.js` | `55 KB` + `6.18 MB` | Wrapper leve, mas `chart.js` principal é pesado; exige tree-shaking manual em builds modernos ou uso de registries seletivos. |
| `@visx/xychart` (subset visx) | `@visx/xychart` | `630 KB` | Modular, depende de vários subpacotes visx; não usa `lodash`, porém requer composição manual de escalas/series. |
| `@nivo/line` (ecosistema nivo) | `@nivo/line` | `371 KB` | Inclui Chart internamente com suporte a tooltips e responsividade; requer adaptar estilos e provedor de tema; sem `lodash`. |

> ℹ️ Os valores acima representam o tamanho do pacote descompactado publicado no npm, não refletindo o gzip final (tipicamente ~5x menor após tree-shaking).

## Protótipos (snippet conceitual)

Os exemplos abaixo traduzem o cenário atual (`LineChart`, `BarChart`, `PieChart`) para cada biblioteca, demonstrando como replicar tooltips customizados e responsividade. Eles não estão conectados ao build principal; servem como referência para migrações futuras.

### `@visx/xychart`

```tsx
// protótipos/VisxPerformanceCharts.tsx
import { XYChart, AnimatedAxis, AnimatedGrid, AnimatedLineSeries, Tooltip } from '@visx/xychart';
import { ParentSize } from '@visx/responsive';

export function VisxResponseTimeChart({ data }: { data: Array<{ time: string; responseTime: number }> }) {
  return (
    <ParentSize>
      {({ width, height }) => (
        <XYChart
          height={height}
          width={width}
          xScale={{ type: 'band' }}
          yScale={{ type: 'linear' }}
        >
          <AnimatedAxis orientation="bottom" hideTicks />
          <AnimatedAxis orientation="left" numTicks={4} />
          <AnimatedGrid columns={false} numTicks={4} />
          <AnimatedLineSeries dataKey="responseTime" data={data} xAccessor={d => d.time} yAccessor={d => d.responseTime} />
          <Tooltip
            showVerticalCrosshair
            renderTooltip={({ tooltipData }) => (
              <div>
                <strong>{tooltipData?.nearestDatum?.datum?.time}</strong>
                <div>{tooltipData?.nearestDatum?.datum?.responseTime} ms</div>
              </div>
            )}
          />
        </XYChart>
      )}
    </ParentSize>
  );
}
```

### `@nivo/line` + `@nivo/bar` + `@nivo/pie`

```tsx
// protótipos/NivoPerformanceCharts.tsx
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';

export function NivoLineChart({ data }: { data: Array<{ x: string; y: number }> }) {
  return (
    <ResponsiveLine
      data={[{ id: 'responseTime', data }]}
      margin={{ top: 20, right: 20, bottom: 40, left: 50 }}
      axisBottom={{ tickRotation: -30 }}
      colors={{ scheme: 'paired' }}
      enablePoints
      pointSize={6}
      enableGridX={false}
      curve="monotoneX"
      useMesh
    />
  );
}

export function NivoBarChart({ data }: { data: Array<{ time: string; requests: number }> }) {
  return (
    <ResponsiveBar
      data={data}
      keys={['requests']}
      indexBy="time"
      margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
      padding={0.3}
      colors={{ scheme: 'greens' }}
      enableLabel={false}
    />
  );
}

export function NivoPieChart({ data }: { data: Array<{ id: string; label: string; value: number; color: string }> }) {
  return (
    <ResponsivePie
      data={data}
      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      innerRadius={0.6}
      padAngle={4}
      colors={{ datum: 'data.color' }}
      enableArcLabels={false}
      activeOuterRadiusOffset={8}
    />
  );
}
```

### `react-chartjs-2` + `chart.js`

```tsx
// protótipos/ChartJsPerformanceCharts.tsx
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend);

export function ChartJsLineChart({ labels, datapoints }: { labels: string[]; datapoints: number[] }) {
  const data = {
    labels,
    datasets: [
      {
        label: 'Tempo de resposta',
        data: datapoints,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        tension: 0.35,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: { enabled: true },
      legend: { display: false },
    },
  };

  return <Line data={data} options={options} />;
}
```

## Comparação funcional com o estado atual
- **Tooltips customizados**: visx e nivo oferecem APIs declarativas; Chart.js depende de callbacks imperativos. Todos suportam tooltips formatados.
- **Responsividade**: visx exige wrapper `ParentSize`; nivo e react-chartjs-2 possuem componentes responsivos nativos.
- **Eco-sistema**: visx é altamente modular (pode-se importar apenas o necessário). Nivo traz temas e componentes prontos, reduzindo implementação manual. Chart.js possui comunidade ampla e plugins, porém peso elevado.

## Recomendações
1. Validar `@nivo/*` para dashboards completos (substitui Line/Bar/Pie com mínima lógica adicional).
2. Avaliar `@visx/*` para casos com layout customizado e necessidade de controle fino.
3. Evitar `chart.js` em rotas críticas sem code splitting rigoroso, devido ao tamanho base.
4. Criar branch de prova de conceito migrando `RatingChart` para `@nivo/line` e comparar bundle com `npm run bundle:analyze:size`.

