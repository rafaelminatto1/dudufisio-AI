import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular' | 'card' | 'table';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animated?: boolean;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  animated = true,
  className,
  ...props
}) => {
  const baseClasses = cn(
    'bg-gray-200 dark:bg-gray-700',
    {
      'animate-pulse': animated,
      'rounded': variant === 'text',
      'rounded-lg': variant === 'rectangular',
      'rounded-full': variant === 'circular',
      'rounded-xl': variant === 'card',
    },
    className
  );

  const widthClass = typeof width === 'number' ? `w-[${width}px]` : width ? `w-[${width}]` : '';
  const heightClass = typeof height === 'number' ? `h-[${height}px]` : height ? `h-[${height}]` : '';

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2" {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              {
                'h-4': !height,
                'w-full': !width,
                'w-3/4': index === lines - 1 && !width, // Last line shorter
              }
            )}
            className={index === lines - 1 ? `${widthClass} ${heightClass}` : ''}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('p-6 space-y-4', baseClasses)} {...props}>
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6 animate-pulse" />
        </div>
        <div className="flex space-x-2">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16 animate-pulse" />
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20 animate-pulse" />
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="space-y-3" {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="flex space-x-4">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 animate-pulse" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded flex-1 animate-pulse" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 animate-pulse" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        {
          'h-4': variant === 'text' && !height,
          'h-32': variant === 'rectangular' && !height,
          'h-10 w-10': variant === 'circular' && !width && !height,
          'w-full': !width,
        }
      )}
      className={cn(widthClass, heightClass)}
      {...props}
    />
  );
};

export default SkeletonLoader;
