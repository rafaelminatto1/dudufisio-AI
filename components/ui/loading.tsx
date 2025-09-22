import React from 'react';
import { Loader, Spinner, Stethoscope } from 'lucide-react';
import { cn } from '../../lib/utils';

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'accent' | 'muted';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    accent: 'text-accent-500',
    muted: 'text-muted-foreground'
  };

  return (
    <Loader
      className={cn(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
};

// Skeleton Component
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-muted';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse', // Can be enhanced with custom wave animation
    none: ''
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
    />
  );
};

// Loading Page Component
interface LoadingPageProps {
  message?: string;
  submessage?: string;
  logo?: boolean;
  className?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  message = 'Carregando...',
  submessage,
  logo = true,
  className
}) => {
  return (
    <div className={cn(
      'flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
      className
    )}>
      <div className="text-center space-y-6">
        {logo && (
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <Stethoscope className="w-12 h-12 text-primary-500" />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <LoadingSpinner size="lg" />
          <div className="space-y-1">
            <p className="text-lg font-medium text-foreground">{message}</p>
            {submessage && (
              <p className="text-sm text-muted-foreground">{submessage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading Card Component
interface LoadingCardProps {
  lines?: number;
  showAvatar?: boolean;
  showActions?: boolean;
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  lines = 3,
  showAvatar = false,
  showActions = false,
  className
}) => {
  return (
    <div className={cn('p-6 bg-card rounded-lg border border-border', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-3">
          {showAvatar && <Skeleton variant="circular" width={40} height={40} />}
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={12} />
          </div>
        </div>

        {/* Content Lines */}
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton
              key={index}
              width={index === lines - 1 ? '80%' : '100%'}
              height={12}
            />
          ))}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2 pt-4">
            <Skeleton width={80} height={32} />
            <Skeleton width={100} height={32} />
          </div>
        )}
      </div>
    </div>
  );
};

// Loading Table Component
interface LoadingTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export const LoadingTable: React.FC<LoadingTableProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  className
}) => {
  return (
    <div className={cn('bg-card rounded-lg border border-border overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {showHeader && (
            <thead className="bg-muted">
              <tr>
                {Array.from({ length: columns }).map((_, index) => (
                  <th key={index} className="p-4 text-left">
                    <Skeleton width="80%" height={16} />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-t border-border">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="p-4">
                    <Skeleton
                      width={colIndex === 0 ? '90%' : '70%'}
                      height={16}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Loading Button Component
interface LoadingButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  [key: string]: any;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
        'bg-primary-500 text-white hover:bg-primary-600',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" color="muted" className="mr-2" />}
      {children}
    </button>
  );
};

// Loading State for lists
interface LoadingListProps {
  items?: number;
  showThumbnails?: boolean;
  className?: string;
}

export const LoadingList: React.FC<LoadingListProps> = ({
  items = 5,
  showThumbnails = false,
  className
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-card rounded-lg border border-border">
          {showThumbnails && (
            <Skeleton variant="rectangular" width={48} height={48} />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton width="70%" height={16} />
            <Skeleton width="50%" height={12} />
          </div>
          <Skeleton variant="circular" width={24} height={24} />
        </div>
      ))}
    </div>
  );
};

// Loading Chart placeholder
interface LoadingChartProps {
  height?: number;
  className?: string;
}

export const LoadingChart: React.FC<LoadingChartProps> = ({
  height = 300,
  className
}) => {
  return (
    <div className={cn('bg-card rounded-lg border border-border p-6', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton width="30%" height={20} />
          <Skeleton width="20%" height={16} />
        </div>
        <Skeleton width="100%" height={height} />
        <div className="flex justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <Skeleton variant="circular" width={12} height={12} />
            <Skeleton width="60px" height={12} />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton variant="circular" width={12} height={12} />
            <Skeleton width="80px" height={12} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Loading component that combines multiple states
interface LoadingProps {
  variant?: 'page' | 'card' | 'table' | 'list' | 'chart' | 'spinner';
  className?: string;
  [key: string]: any;
}

export const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  className,
  ...props
}) => {
  switch (variant) {
    case 'page':
      return <LoadingPage className={className} {...props} />;
    case 'card':
      return <LoadingCard className={className} {...props} />;
    case 'table':
      return <LoadingTable className={className} {...props} />;
    case 'list':
      return <LoadingList className={className} {...props} />;
    case 'chart':
      return <LoadingChart className={className} {...props} />;
    default:
      return <LoadingSpinner className={className} {...props} />;
  }
};