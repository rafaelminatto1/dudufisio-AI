import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ResponsiveGrid({
  children,
  cols = { default: 1, md: 2, lg: 3, xl: 4 },
  gap = 'md',
  className,
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const colClasses = {
    default: cols.default ? `grid-cols-${cols.default}` : '',
    sm: cols.sm ? `sm:grid-cols-${cols.sm}` : '',
    md: cols.md ? `md:grid-cols-${cols.md}` : '',
    lg: cols.lg ? `lg:grid-cols-${cols.lg}` : '',
    xl: cols.xl ? `xl:grid-cols-${cols.xl}` : '',
    '2xl': cols['2xl'] ? `2xl:grid-cols-${cols['2xl']}` : '',
  };

  return (
    <div
      className={cn(
        'grid',
        gapClasses[gap],
        colClasses.default,
        colClasses.sm,
        colClasses.md,
        colClasses.lg,
        colClasses.xl,
        colClasses['2xl'],
        className
      )}
    >
      {children}
    </div>
  );
}

