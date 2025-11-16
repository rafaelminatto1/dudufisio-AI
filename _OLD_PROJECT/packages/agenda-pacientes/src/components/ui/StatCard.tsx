import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    period: string;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  loading?: boolean;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  size = 'md',
  animated = true,
  loading = false,
  className,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState(typeof value === 'number' ? 0 : value);
  const [isVisible, setIsVisible] = useState(false);

  // Counter animation for numbers
  useEffect(() => {
    if (typeof value === 'number' && animated && isVisible) {
      const duration = 1500; // 1.5 seconds
      const steps = 60;
      const stepValue = value / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        setDisplayValue(Math.round(stepValue * currentStep));
        
        if (currentStep >= steps) {
          setDisplayValue(value);
          clearInterval(timer);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animated, isVisible]);

  // Intersection Observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`stat-card-${title.replace(/\s+/g, '-')}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [title]);

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantClasses = {
    default: {
      card: 'glass-card hover-lift',
      iconContainer: 'bg-neutral-100 dark:bg-neutral-800',
      icon: 'text-neutral-700 dark:text-neutral-300',
      title: 'text-gray-600 dark:text-gray-400',
      value: 'text-gray-900 dark:text-white',
      subtitle: 'text-gray-500 dark:text-gray-500',
    },
    primary: {
      card: 'glass-card hover-lift hover-glow',
      iconContainer: 'bg-gradient-primary',
      icon: 'text-white',
      title: 'text-gray-600 dark:text-gray-400',
      value: 'text-gray-900 dark:text-white',
      subtitle: 'text-gray-500 dark:text-gray-500',
    },
    success: {
      card: 'glass-card hover-lift',
      iconContainer: 'bg-health-success/10',
      icon: 'text-health-success',
      title: 'text-gray-600 dark:text-gray-400',
      value: 'text-gray-900 dark:text-white',
      subtitle: 'text-gray-500 dark:text-gray-500',
    },
    warning: {
      card: 'glass-card hover-lift',
      iconContainer: 'bg-health-warning/10',
      icon: 'text-health-warning',
      title: 'text-gray-600 dark:text-gray-400',
      value: 'text-gray-900 dark:text-white',
      subtitle: 'text-gray-500 dark:text-gray-500',
    },
    error: {
      card: 'glass-card hover-lift',
      iconContainer: 'bg-health-error/10',
      icon: 'text-health-error',
      title: 'text-gray-600 dark:text-gray-400',
      value: 'text-gray-900 dark:text-white',
      subtitle: 'text-gray-500 dark:text-gray-500',
    },
  };

  const currentVariant = variantClasses[variant];

  if (loading) {
    return (
      <div className={cn('rounded-xl', sizeClasses[size], className)} {...props}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`stat-card-${title.replace(/\s+/g, '-')}`}
      className={cn(
        'relative transition-all duration-300',
        currentVariant.card,
        sizeClasses[size],
        {
          'animate-fade-in-up': animated,
        },
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className={cn(
            'font-medium transition-colors duration-300',
            currentVariant.title,
            {
              'text-xs': size === 'sm',
              'text-sm': size === 'md',
              'text-base': size === 'lg',
            }
          )}
        >
          {title}
        </h3>
        {Icon && (
          <div
            className={cn(
              'flex items-center justify-center rounded-lg transition-transform duration-300',
              currentVariant.iconContainer,
              {
                'w-6 h-6': size === 'sm',
                'w-8 h-8': size === 'md',
                'w-10 h-10': size === 'lg',
              }
            )}
          >
            <Icon
              className={cn(
                'transition-colors duration-300',
                currentVariant.icon,
                {
                  'w-3 h-3': size === 'sm',
                  'w-4 h-4': size === 'md',
                  'w-5 h-5': size === 'lg',
                }
              )}
            />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <span
          className={cn(
            'font-bold transition-colors duration-300',
            currentVariant.value,
            {
              'text-lg': size === 'sm',
              'text-2xl': size === 'md',
              'text-3xl': size === 'lg',
            }
          )}
        >
          {typeof value === 'number' ? displayValue.toLocaleString() : displayValue}
        </span>
      </div>

      {/* Trend and Subtitle */}
      {(trend || subtitle) && (
        <div className="flex items-center justify-between">
          {trend && (
            <div className="flex items-center space-x-1">
              {trend.value > 0 ? (
                <TrendingUp className="w-3 h-3 text-health-success" />
              ) : (
                <TrendingDown className="w-3 h-3 text-health-error" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.value > 0 ? 'text-health-success' : 'text-health-error'
                )}
              >
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {trend.period}
              </span>
            </div>
          )}
          {subtitle && (
            <span
              className={cn(
                'text-xs transition-colors duration-300',
                currentVariant.subtitle
              )}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}

      {/* Mini sparkline placeholder */}
      {variant === 'primary' && (
        <div className="absolute bottom-2 right-2 w-12 h-6 opacity-20">
          <svg viewBox="0 0 48 24" className="w-full h-full">
            <path
              d="M0,20 Q12,8 24,12 T48,4"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              className="text-primary-500"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default StatCard;
