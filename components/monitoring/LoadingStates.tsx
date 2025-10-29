import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardHeader } from '../ui/card';

/**
 * Skeleton loader para KPI Cards com shimmer effect
 */
export const KPICardsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="w-12 h-12 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

/**
 * Skeleton loader para gráficos
 */
export const ChartSkeleton: React.FC<{ title?: string }> = ({ title }) => {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-between gap-2 px-4">
          {[65, 85, 45, 95, 55, 75, 60, 80, 70, 50].map((height, i) => (
            <Skeleton 
              key={i} 
              className="w-full rounded-t" 
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Skeleton loader para tabela
 */
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 10 }) => {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 bg-slate-50 rounded-lg">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2 w-24" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton loader para página completa com progressive loading
 */
export const MonitoringPageSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* KPIs - Load first */}
      <KPICardsSkeleton />

      {/* Charts - Load second */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Table - Load last */}
      <Card>
        <CardContent className="p-6">
          <TableSkeleton rows={8} />
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Shimmer effect overlay component
 */
export const ShimmerOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  );
};

/**
 * Progressive loader que mostra componentes gradualmente
 */
export const ProgressiveLoader: React.FC<{
  stage: 'kpis' | 'charts' | 'table' | 'complete';
  children?: React.ReactNode;
}> = ({ stage, children }) => {
  if (stage === 'complete') {
    return <>{children}</>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {stage === 'kpis' ? (
        <KPICardsSkeleton />
      ) : (
        children
      )}

      {(stage === 'kpis' || stage === 'charts') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      )}

      {stage === 'kpis' && (
        <Card>
          <CardContent className="p-6">
            <TableSkeleton rows={8} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

