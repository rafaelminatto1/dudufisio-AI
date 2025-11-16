/**
 * Charts Lazy Loading
 * Wrapper que carrega componentes do Recharts apenas quando necessário
 * Reduz o bundle inicial em ~100KB
 */

import { lazy, Suspense, ReactNode } from 'react';
import { Skeleton } from '../ui/skeleton';

// Lazy load dos componentes do Recharts
const LineChartLazy = lazy(() => import('recharts').then(m => ({
  default: m.LineChart
})));

const BarChartLazy = lazy(() => import('recharts').then(m => ({
  default: m.BarChart
})));

const PieChartLazy = lazy(() => import('recharts').then(m => ({
  default: m.PieChart
})));

const AreaChartLazy = lazy(() => import('recharts').then(m => ({
  default: m.AreaChart
})));

const ComposedChartLazy = lazy(() => import('recharts').then(m => ({
  default: m.ComposedChart
})));

const RadarChartLazy = lazy(() => import('recharts').then(m => ({
  default: m.RadarChart
})));

const ScatterChartLazy = lazy(() => import('recharts').then(m => ({
  default: m.ScatterChart
})));

const FunnelChartLazy = lazy(() => import('recharts').then(m => ({
  default: m.FunnelChart
})));

const TreemapLazy = lazy(() => import('recharts').then(m => ({
  default: m.Treemap
})));

// Loading fallback para gráficos
const ChartSkeleton = ({ width = '100%', height = '300px' }: { width?: string; height?: string }) => (
  <div style={{ width, height }} className="flex items-center justify-center border border-slate-200 rounded-lg bg-slate-50">
    <div className="text-center">
      <Skeleton className="h-8 w-8 mx-auto mb-2" />
      <Skeleton className="h-4 w-32" />
    </div>
  </div>
);

// Wrapper genérico para componentes lazy
const LazyWrapper = ({ 
  children, 
  fallback 
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
}) => (
  <Suspense fallback={fallback || <ChartSkeleton />}>
    {children}
  </Suspense>
);

/**
 * LineChart com lazy loading
 */
export const LineChart = (props: any) => (
  <LazyWrapper>
    <LineChartLazy {...props} />
  </LazyWrapper>
);

/**
 * BarChart com lazy loading
 */
export const BarChart = (props: any) => (
  <LazyWrapper>
    <BarChartLazy {...props} />
  </LazyWrapper>
);

/**
 * PieChart com lazy loading
 */
export const PieChart = (props: any) => (
  <LazyWrapper>
    <PieChartLazy {...props} />
  </LazyWrapper>
);

/**
 * AreaChart com lazy loading
 */
export const AreaChart = (props: any) => (
  <LazyWrapper>
    <AreaChartLazy {...props} />
  </LazyWrapper>
);

/**
 * ComposedChart com lazy loading
 */
export const ComposedChart = (props: any) => (
  <LazyWrapper>
    <ComposedChartLazy {...props} />
  </LazyWrapper>
);

/**
 * RadarChart com lazy loading
 */
export const RadarChart = (props: any) => (
  <LazyWrapper>
    <RadarChartLazy {...props} />
  </LazyWrapper>
);

/**
 * ScatterChart com lazy loading
 */
export const ScatterChart = (props: any) => (
  <LazyWrapper>
    <ScatterChartLazy {...props} />
  </LazyWrapper>
);

/**
 * FunnelChart com lazy loading
 */
export const FunnelChart = (props: any) => (
  <LazyWrapper>
    <FunnelChartLazy {...props} />
  </LazyWrapper>
);

/**
 * Treemap com lazy loading
 */
export const Treemap = (props: any) => (
  <LazyWrapper>
    <TreemapLazy {...props} />
  </LazyWrapper>
);

// Exportar componentes do Recharts que não precisam de lazy loading
export {
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
  LabelList
} from '@/components/charts/ChartsLazyOptimized';

