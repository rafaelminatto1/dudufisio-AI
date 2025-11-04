import React from 'react';
import { cn } from '../../lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  autoFit?: boolean;
  minChildWidth?: string;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { base: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  autoFit = false,
  minChildWidth = '250px'
}) => {
  const getGapClasses = () => {
    switch (gap) {
      case 'none':
        return 'gap-0';
      case 'sm':
        return 'gap-2 sm:gap-3';
      case 'md':
        return 'gap-4 sm:gap-5 lg:gap-6';
      case 'lg':
        return 'gap-6 sm:gap-8 lg:gap-10';
      case 'xl':
        return 'gap-8 sm:gap-10 lg:gap-12';
      default:
        return 'gap-4 sm:gap-5 lg:gap-6';
    }
  };

  const getColClasses = () => {
    if (autoFit) {
      return `grid-cols-[repeat(auto-fit,minmax(${minChildWidth},1fr))]`;
    }

    const colClasses = [];
    
    if (cols.base !== undefined) {
      colClasses.push(`grid-cols-${cols.base}`);
    }
    if (cols.sm !== undefined) {
      colClasses.push(`sm:grid-cols-${cols.sm}`);
    }
    if (cols.md !== undefined) {
      colClasses.push(`md:grid-cols-${cols.md}`);
    }
    if (cols.lg !== undefined) {
      colClasses.push(`lg:grid-cols-${cols.lg}`);
    }
    if (cols.xl !== undefined) {
      colClasses.push(`xl:grid-cols-${cols.xl}`);
    }
    if (cols['2xl'] !== undefined) {
      colClasses.push(`2xl:grid-cols-${cols['2xl']}`);
    }

    return colClasses.join(' ');
  };

  const baseClasses = cn(
    'grid',
    getColClasses(),
    getGapClasses()
  );

  return (
    <div className={cn(baseClasses, className)}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;
