import React from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  glow?: boolean;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  variant = 'default',
  size = 'md',
  animated = true,
  glow = false,
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const iconSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const variantClasses = {
    default: {
      card: 'glass-card hover-lift',
      iconContainer: 'bg-neutral-100 dark:bg-neutral-800',
      icon: 'text-neutral-700 dark:text-neutral-300',
      title: 'text-gray-900 dark:text-white',
      description: 'text-gray-600 dark:text-gray-300',
    },
    primary: {
      card: 'glass-card hover-lift hover-glow',
      iconContainer: 'bg-gradient-primary',
      icon: 'text-white',
      title: 'text-gray-900 dark:text-white',
      description: 'text-gray-600 dark:text-gray-300',
    },
    success: {
      card: 'glass-card hover-lift',
      iconContainer: 'bg-health-success/10',
      icon: 'text-health-success',
      title: 'text-gray-900 dark:text-white',
      description: 'text-gray-600 dark:text-gray-300',
    },
    warning: {
      card: 'glass-card hover-lift',
      iconContainer: 'bg-health-warning/10',
      icon: 'text-health-warning',
      title: 'text-gray-900 dark:text-white',
      description: 'text-gray-600 dark:text-gray-300',
    },
    error: {
      card: 'glass-card hover-lift',
      iconContainer: 'bg-health-error/10',
      icon: 'text-health-error',
      title: 'text-gray-900 dark:text-white',
      description: 'text-gray-600 dark:text-gray-300',
    },
  };

  const currentVariant = variantClasses[variant];

  return (
    <div
      className={cn(
        'relative rounded-xl transition-all duration-300',
        currentVariant.card,
        sizeClasses[size],
        {
          'animate-fade-in-up': animated,
          'hover-glow': glow,
        },
        className
      )}
      {...props}
    >
      {/* Icon Container */}
      <div className="mb-4">
        <div
          className={cn(
            'inline-flex items-center justify-center rounded-lg transition-transform duration-300',
            currentVariant.iconContainer,
            iconSizeClasses[size],
            {
              'group-hover:rotate-12': animated,
            }
          )}
        >
          <Icon
            className={cn(
              'transition-colors duration-300',
              currentVariant.icon,
              {
                'w-4 h-4': size === 'sm',
                'w-6 h-6': size === 'md',
                'w-8 h-8': size === 'lg',
              }
            )}
          />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3
          className={cn(
            'font-semibold transition-colors duration-300',
            currentVariant.title,
            {
              'text-sm': size === 'sm',
              'text-base': size === 'md',
              'text-lg': size === 'lg',
            }
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            'transition-colors duration-300',
            currentVariant.description,
            {
              'text-xs': size === 'sm',
              'text-sm': size === 'md',
              'text-base': size === 'lg',
            }
          )}
        >
          {description}
        </p>
      </div>

      {/* Subtle particle effect overlay */}
      {variant === 'primary' && (
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div className="absolute top-4 right-4 w-1 h-1 bg-white/30 rounded-full animate-pulse" />
          <div className="absolute bottom-6 left-6 w-0.5 h-0.5 bg-white/20 rounded-full animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-4 w-0.5 h-0.5 bg-white/25 rounded-full animate-pulse delay-500" />
        </div>
      )}
    </div>
  );
};

export default FeatureCard;
