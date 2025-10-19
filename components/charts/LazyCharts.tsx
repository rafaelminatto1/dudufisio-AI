import { lazy, Suspense } from 'react';
import { Skeleton } from '../ui/skeleton';

const LineChartWrapper = lazy(() => import('./wrappers/LineChartWrapper'));
const BarChartWrapper = lazy(() => import('./wrappers/BarChartWrapper'));
const PieChartWrapper = lazy(() => import('./wrappers/PieChartWrapper'));
const AreaChartWrapper = lazy(() => import('./wrappers/AreaChartWrapper'));

const ChartSkeleton = () => (
  <div className="w-full h-[300px] flex flex-col gap-2">
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-[250px] w-full" />
  </div>
);

interface LazyChartProps {
  data: any[];
  xKey: string;
  lines?: any[];
  bars?: any[];
  areas?: any[];
  [key: string]: any;
}

export const LazyLineChart: React.FC<LazyChartProps> = (props) => (
  <Suspense fallback={<ChartSkeleton />}>
    <LineChartWrapper {...props} />
  </Suspense>
);

export const LazyBarChart: React.FC<LazyChartProps> = (props) => (
  <Suspense fallback={<ChartSkeleton />}>
    <BarChartWrapper {...props} />
  </Suspense>
);

export const LazyPieChart: React.FC<LazyChartProps> = (props) => (
  <Suspense fallback={<ChartSkeleton />}>
    <PieChartWrapper {...props} />
  </Suspense>
);

export const LazyAreaChart: React.FC<LazyChartProps> = (props) => (
  <Suspense fallback={<ChartSkeleton />}>
    <AreaChartWrapper {...props} />
  </Suspense>
);

