import React, { ReactNode, Suspense } from 'react';
import { useLazyLoad } from '@/hooks/useLazyLoad';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LazyComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  minHeight?: number;
}

export function LazyComponent({
  children,
  fallback,
  className,
  threshold = 0.1,
  rootMargin = '100px',
  minHeight = 200,
}: LazyComponentProps) {
  const { ref, hasIntersected } = useLazyLoad({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  const defaultFallback = (
    <div className={cn('space-y-2', className)} style={{ minHeight }}>
      <Skeleton className="h-full w-full" />
    </div>
  );

  return (
    <div ref={ref} className={className}>
      {hasIntersected ? (
        <Suspense fallback={fallback || defaultFallback}>
          {children}
        </Suspense>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
}

