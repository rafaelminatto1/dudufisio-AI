// components/MetricCard.tsx
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  loading?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle,
  icon,
  trend,
  size = 'md',
  className,
  loading = false,
  variant = 'default'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-3 sm:p-4',
          title: 'text-xs sm:text-sm',
          value: 'text-lg sm:text-xl',
          subtitle: 'text-xs',
          icon: 'w-4 h-4 sm:w-5 sm:h-5'
        };
      case 'lg':
        return {
          container: 'p-6 sm:p-8',
          title: 'text-base sm:text-lg',
          value: 'text-2xl sm:text-3xl lg:text-4xl',
          subtitle: 'text-sm sm:text-base',
          icon: 'w-6 h-6 sm:w-8 sm:h-8'
        };
      default: // md
        return {
          container: 'p-4 sm:p-5 lg:p-6',
          title: 'text-sm sm:text-base',
          value: 'text-xl sm:text-2xl lg:text-3xl',
          subtitle: 'text-xs sm:text-sm',
          icon: 'w-5 h-5 sm:w-6 sm:h-6'
        };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return {
          container: 'border-l-4 border-l-green-400',
          value: 'text-green-700',
          trend: 'text-green-600'
        };
      case 'warning':
        return {
          container: 'border-l-4 border-l-yellow-400',
          value: 'text-yellow-700',
          trend: 'text-yellow-600'
        };
      case 'error':
        return {
          container: 'border-l-4 border-l-orange-400',
          value: 'text-orange-700',
          trend: 'text-orange-600'
        };
      case 'info':
        return {
          container: 'border-l-4 border-l-blue-400',
          value: 'text-blue-700',
          trend: 'text-blue-600'
        };
      default:
        return {
          container: '',
          value: 'text-slate-900',
          trend: 'text-slate-600'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  if (loading) {
    return (
      <div className={cn(
        'bg-white rounded-lg shadow-md animate-pulse',
        sizeClasses.container,
        variantClasses.container,
        className
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className="h-3 bg-slate-200 rounded w-20"></div>
          {icon && <div className={cn('bg-slate-200 rounded', sizeClasses.icon)}></div>}
        </div>
        <div className="h-6 bg-slate-200 rounded w-24 mb-1"></div>
        {subtitle && <div className="h-3 bg-slate-200 rounded w-16"></div>}
      </div>
    );
  }

  const cardContent = (
    <div className={cn(
      'bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-default border border-slate-200',
      sizeClasses.container,
      variantClasses.container,
      className
    )}>
      <div className="flex items-start justify-between mb-2">
        <h3 className={cn(
          'font-medium text-slate-600 truncate flex-1',
          sizeClasses.title
        )}>
          {title}
        </h3>
        {icon && (
          <div className={cn(
            'text-slate-400 flex-shrink-0 ml-2',
            sizeClasses.icon
          )}>
            {icon}
          </div>
        )}
      </div>
      
      <p className={cn(
        'font-bold truncate',
        sizeClasses.value,
        variantClasses.value
      )}>
        {value}
      </p>

      {subtitle && (
        <p className={cn(
          'text-slate-500 truncate mt-1',
          sizeClasses.subtitle
        )}>
          {subtitle}
        </p>
      )}

      {trend && (
        <div className={cn(
          'flex items-center mt-2 text-xs font-medium',
          variantClasses.trend,
          trend.isPositive ? 'text-green-600' : 'text-orange-600'
        )}>
          <span className="truncate">{trend.label}</span>
        </div>
      )}
    </div>
  );

  // Wrap with tooltip if content might be truncated
  if (title.length > 20 || value.length > 15) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {cardContent}
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return cardContent;
};

export default MetricCard;