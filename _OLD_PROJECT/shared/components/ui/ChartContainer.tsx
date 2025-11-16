import React, { ReactNode } from 'react';
import { ResponsiveContainer as RechartsResponsiveContainer } from '@/components/charts/ChartsLazyOptimized';
import { cn } from '../../lib/utils';
import { Skeleton } from './skeleton';

interface ChartContainerProps {
  children: ReactNode;
  height?: number | string;
  className?: string;
  isLoading?: boolean;
  error?: string | null;
  minHeight?: number;
  showScrollbar?: boolean;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  height = 300,
  className,
  isLoading = false,
  error = null,
  minHeight = 200,
  showScrollbar = false
}) => {
  const getHeightClasses = () => {
    if (typeof height === 'number') {
      return `h-[${height}px]`;
    }
    return height;
  };

  if (error) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5',
          getHeightClasses()
        )}
      >
        <div className="text-center text-destructive">
          <p className="text-sm font-medium">Erro ao carregar gráfico</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        <Skeleton className="h-4 w-32" />
        <Skeleton className={getHeightClasses()} />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'relative w-full min-h-[200px]',
        showScrollbar ? 'overflow-x-auto' : 'overflow-hidden',
        className
      )}
    >
      <RechartsResponsiveContainer 
        width="100%" 
        height={height}
        className="min-h-[200px]"
      >
        {children}
      </RechartsResponsiveContainer>
    </div>
  );
};

export default ChartContainer;
