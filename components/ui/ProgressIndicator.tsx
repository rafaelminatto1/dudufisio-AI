import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ProgressIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'linear' | 'circular' | 'steps';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  showPercentage?: boolean;
  animated?: boolean;
  steps?: Array<{
    id: string;
    label: string;
    completed: boolean;
  }>;
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  max = 100,
  variant = 'linear',
  size = 'md',
  color = 'primary',
  showPercentage = false,
  animated = true,
  steps,
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colorClasses = {
    primary: 'bg-gradient-primary',
    success: 'bg-health-success',
    warning: 'bg-health-warning',
    error: 'bg-health-error',
  };

  const sizeClasses = {
    sm: {
      linear: 'h-1',
      circular: 'w-16 h-16',
      text: 'text-sm',
    },
    md: {
      linear: 'h-2',
      circular: 'w-20 h-20',
      text: 'text-base',
    },
    lg: {
      linear: 'h-3',
      circular: 'w-24 h-24',
      text: 'text-lg',
    },
  };

  if (variant === 'circular') {
    const radius = size === 'sm' ? 24 : size === 'md' ? 32 : 40;
    const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className={cn('relative inline-flex items-center justify-center', className)} {...props}>
        <svg
          className={cn('transform -rotate-90', sizeClasses[size].circular)}
          viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}
        >
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-gray-700"
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            className={cn(
              'text-transparent bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text',
              {
                'text-health-success': color === 'success',
                'text-health-warning': color === 'warning',
                'text-health-error': color === 'error',
              }
            )}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: animated ? strokeDashoffset : circumference - (percentage / 100) * circumference,
            }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
        </svg>
        
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              'font-semibold',
              sizeClasses[size].text,
              'text-gray-900 dark:text-white'
            )}
          >
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'steps' && steps) {
    return (
      <div className={cn('w-full', className)} {...props}>
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className="relative">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                    {
                      'bg-gradient-primary border-transparent text-white': step.completed,
                      'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400': !step.completed,
                    }
                  )}
                >
                  {step.completed ? (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </motion.svg>
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </div>
                
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'absolute top-4 left-8 w-full h-0.5 transition-colors duration-300',
                      {
                        'bg-gradient-primary': step.completed,
                        'bg-gray-300 dark:bg-gray-600': !step.completed,
                      }
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs text-center max-w-20',
                  {
                    'text-gray-900 dark:text-white font-medium': step.completed,
                    'text-gray-500 dark:text-gray-400': !step.completed,
                  }
                )}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Linear variant (default)
  return (
    <div className={cn('w-full', className)} {...props}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Progress
        </span>
        {showPercentage && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      
      <div
        className={cn(
          'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
          sizeClasses[size].linear
        )}
      >
        <motion.div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            colorClasses[color]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 1 : 0, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;
