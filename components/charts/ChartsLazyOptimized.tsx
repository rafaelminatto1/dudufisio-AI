/**
 * 🚀 Optimized Charts Lazy Loading
 *
 * PROBLEMA IDENTIFICADO:
 * - Recharts é importado em 91 arquivos, adicionando ~500KB ao bundle inicial
 * - O ChartsLazy.tsx anterior NÃO lazy-loadava os componentes auxiliares (Line, XAxis, etc)
 * - Isso causava o recharts ser carregado SEMPRE no bundle inicial
 *
 * SOLUÇÃO:
 * - Lazy load COMPLETO do módulo recharts
 * - Exportar todos os componentes através de um único wrapper lazy
 * - Redução esperada: ~500KB no bundle inicial
 *
 * USO:
 * Trocar:
 *   import { LineChart, Line, XAxis } from '@/components/charts/ChartsLazyOptimized';
 * Por:
 *   import { LineChart, Line, XAxis } from '../components/charts/ChartsLazyOptimized';
 */

import { lazy, Suspense, ComponentType, ReactNode } from 'react';
import { Skeleton } from '../ui/skeleton';

// ============================================================
// LOADING FALLBACK
// ============================================================

const ChartSkeleton = ({
  width = '100%',
  height = '300px'
}: {
  width?: string;
  height?: string
}) => (
  <div
    style={{ width, height }}
    className="flex items-center justify-center border border-slate-200 rounded-lg bg-slate-50 animate-pulse"
  >
    <div className="text-center space-y-2">
      <Skeleton className="h-8 w-8 mx-auto" />
      <Skeleton className="h-4 w-32 mx-auto" />
      <Skeleton className="h-2 w-24 mx-auto" />
    </div>
  </div>
);

// ============================================================
// LAZY LOAD DE RECHARTS COMPLETO
// ============================================================

/**
 * Lazy load do módulo COMPLETO do recharts
 * Isso garante que recharts NUNCA é carregado no bundle inicial
 */
const RechartsModule = lazy(() => import('recharts'));

// ============================================================
// COMPONENTE WRAPPER GENÉRICO
// ============================================================

interface ChartWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  height?: string;
  width?: string;
}

/**
 * Wrapper que lazy-loada o recharts e renderiza os filhos
 */
const ChartWrapper: React.FC<ChartWrapperProps> = ({
  children,
  fallback,
  height = '300px',
  width = '100%'
}) => (
  <Suspense fallback={fallback || <ChartSkeleton width={width} height={height} />}>
    {children}
  </Suspense>
);

// ============================================================
// COMPONENTES PRINCIPAIS (CHARTS) - LAZY LOADED
// ============================================================

// Criar os lazy components UMA VEZ (fora das funções de render)
const LazyLineChart = lazy(() =>
  import('recharts').then(m => ({ default: m.LineChart }))
);

const LazyBarChart = lazy(() =>
  import('recharts').then(m => ({ default: m.BarChart }))
);

const LazyPieChart = lazy(() =>
  import('recharts').then(m => ({ default: m.PieChart }))
);

const LazyAreaChart = lazy(() =>
  import('recharts').then(m => ({ default: m.AreaChart }))
);

const LazyComposedChart = lazy(() =>
  import('recharts').then(m => ({ default: m.ComposedChart }))
);

const LazyRadarChart = lazy(() =>
  import('recharts').then(m => ({ default: m.RadarChart }))
);

const LazyScatterChart = lazy(() =>
  import('recharts').then(m => ({ default: m.ScatterChart }))
);

const LazyFunnelChart = lazy(() =>
  import('recharts').then(m => ({ default: m.FunnelChart }))
);

const LazyTreemap = lazy(() =>
  import('recharts').then(m => ({ default: m.Treemap }))
);

/**
 * LineChart com lazy loading COMPLETO
 */
export const LineChart = (props: any) => (
  <ChartWrapper>
    <LazyLineChart {...props} />
  </ChartWrapper>
);

/**
 * BarChart com lazy loading COMPLETO
 */
export const BarChart = (props: any) => (
  <ChartWrapper>
    <LazyBarChart {...props} />
  </ChartWrapper>
);

/**
 * PieChart com lazy loading COMPLETO
 */
export const PieChart = (props: any) => (
  <ChartWrapper>
    <LazyPieChart {...props} />
  </ChartWrapper>
);

/**
 * AreaChart com lazy loading COMPLETO
 */
export const AreaChart = (props: any) => (
  <ChartWrapper>
    <LazyAreaChart {...props} />
  </ChartWrapper>
);

/**
 * ComposedChart com lazy loading COMPLETO
 */
export const ComposedChart = (props: any) => (
  <ChartWrapper>
    <LazyComposedChart {...props} />
  </ChartWrapper>
);

/**
 * RadarChart com lazy loading COMPLETO
 */
export const RadarChart = (props: any) => (
  <ChartWrapper>
    <LazyRadarChart {...props} />
  </ChartWrapper>
);

/**
 * ScatterChart com lazy loading COMPLETO
 */
export const ScatterChart = (props: any) => (
  <ChartWrapper>
    <LazyScatterChart {...props} />
  </ChartWrapper>
);

/**
 * FunnelChart com lazy loading COMPLETO
 */
export const FunnelChart = (props: any) => (
  <ChartWrapper>
    <LazyFunnelChart {...props} />
  </ChartWrapper>
);

/**
 * Treemap com lazy loading COMPLETO
 */
export const Treemap = (props: any) => (
  <ChartWrapper>
    <LazyTreemap {...props} />
  </ChartWrapper>
);

// ============================================================
// COMPONENTES AUXILIARES (LAZY WRAPPERS)
// ============================================================

/**
 * Cria um lazy wrapper para componentes auxiliares do Recharts
 * Estes componentes são usados DENTRO dos charts principais
 */
const createLazyAuxComponent = (componentName: string): ComponentType<any> => {
  return lazy(() =>
    import('recharts').then(module => ({
      default: (module as any)[componentName]
    }))
  ) as ComponentType<any>;
};

// Componentes de linha/barra/área
export const Line = createLazyAuxComponent('Line');
export const Bar = createLazyAuxComponent('Bar');
export const Pie = createLazyAuxComponent('Pie');
export const Area = createLazyAuxComponent('Area');
export const Cell = createLazyAuxComponent('Cell');
export const Sector = createLazyAuxComponent('Sector');

// Componentes de eixos
export const XAxis = createLazyAuxComponent('XAxis');
export const YAxis = createLazyAuxComponent('YAxis');
export const ZAxis = createLazyAuxComponent('ZAxis');

// Grid e referências
export const CartesianGrid = createLazyAuxComponent('CartesianGrid');
export const PolarGrid = createLazyAuxComponent('PolarGrid');
export const PolarAngleAxis = createLazyAuxComponent('PolarAngleAxis');
export const PolarRadiusAxis = createLazyAuxComponent('PolarRadiusAxis');
export const ReferenceLine = createLazyAuxComponent('ReferenceLine');
export const ReferenceArea = createLazyAuxComponent('ReferenceArea');
export const ReferenceDot = createLazyAuxComponent('ReferenceDot');

// UI Components
export const Tooltip = createLazyAuxComponent('Tooltip');
export const Legend = createLazyAuxComponent('Legend');
export const Brush = createLazyAuxComponent('Brush');
export const Label = createLazyAuxComponent('Label');
export const LabelList = createLazyAuxComponent('LabelList');

// Container
export const ResponsiveContainer = createLazyAuxComponent('ResponsiveContainer');

// Outros
export const ErrorBar = createLazyAuxComponent('ErrorBar');
export const Customized = createLazyAuxComponent('Customized');
export const Curve = createLazyAuxComponent('Curve');
export const Dot = createLazyAuxComponent('Dot');
export const Cross = createLazyAuxComponent('Cross');
export const Radar = createLazyAuxComponent('Radar');
export const RadialBar = createLazyAuxComponent('RadialBar');
export const Sankey = createLazyAuxComponent('Sankey');
export const Scatter = createLazyAuxComponent('Scatter');
export const Symbols = createLazyAuxComponent('Symbols');
export const FunnelTrapezoid = createLazyAuxComponent('FunnelTrapezoid');

// ============================================================
// UTILITÁRIOS PARA MIGRAÇÃO
// ============================================================

/**
 * Hook para preload de recharts em background
 * Use quando souber que o usuário precisará de charts em breve
 */
export const usePreloadCharts = () => {
  const preload = () => {
    // Preload do módulo completo em background
    import('recharts').catch(console.error);
  };

  return { preloadCharts: preload };
};

/**
 * Componente HOC que preloada recharts quando o mouse entra na área
 * Útil para dashboards que mostram charts ao rolar a página
 */
export const withChartPreload = <P extends object>(
  Component: ComponentType<P>
): ComponentType<P> => {
  return (props: P) => {
    const handleMouseEnter = () => {
      // Preload quando usuário passar o mouse
      import('recharts').catch(console.error);
    };

    return (
      <div onMouseEnter={handleMouseEnter}>
        <Component {...props} />
      </div>
    );
  };
};

// ============================================================
// EXPORTS DEFAULT
// ============================================================

export default {
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  ComposedChart,
  RadarChart,
  ScatterChart,
  FunnelChart,
  Treemap,
  Line,
  Bar,
  Pie,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Brush,
  ErrorBar,
  LabelList,
  usePreloadCharts,
  withChartPreload
};
