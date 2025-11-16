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
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
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
              'text-blue-600',
              {
                'text-green-600': color === 'success',
                'text-yellow-600': color === 'warning',
                'text-red-600': color === 'error',
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
                      'bg-blue-600 border-transparent text-white': step.completed,
                      'bg-white border-slate-300 text-slate-500': !step.completed,
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
                        'bg-blue-600': step.completed,
                        'bg-slate-300': !step.completed,
                      }
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs text-center max-w-20',
                  {
                    'text-slate-900 font-medium': step.completed,
                    'text-slate-500': !step.completed,
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
        <span className="text-sm font-medium text-slate-700">
          Progress
        </span>
        {showPercentage && (
          <span className="text-sm text-slate-500">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      
      <div
        className={cn(
          'w-full bg-slate-200 rounded-full overflow-hidden',
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
