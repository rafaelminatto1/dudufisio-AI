import React from 'react';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  header?: {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
  };
  padding?: 'sm' | 'md' | 'lg' | 'none';
  variant?: 'default' | 'dark' | 'colored';
  hover?: boolean;
  glow?: boolean;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  header,
  padding = 'md',
  variant = 'default',
  hover = true,
  glow = false,
  className,
  ...props
}) => {
  const baseClasses = cn(
    'relative overflow-hidden rounded-lg transition-all duration-200 shadow-md',
    {
      'bg-white': variant === 'default',
      'bg-slate-900': variant === 'dark',
      'bg-gradient-to-br from-fisio-primary-500 via-fisio-primary-600 to-fisio-primary-700': variant === 'colored',
      'hover:shadow-lg': hover,
      'border border-slate-200': variant !== 'colored',
    },
    className
  );

  const paddingClasses = {
    'p-3': padding === 'sm',
    'p-4 sm:p-5 lg:p-6': padding === 'md',
    'p-6 sm:p-7 lg:p-8': padding === 'lg',
    'p-0': padding === 'none',
  };

  return (
    <div className={baseClasses} {...props}>
      {/* Header */}
      {header && (
        <div className={cn(
          'relative border-b border-slate-200 bg-slate-50',
          padding === 'none' ? 'px-4 py-3 sm:px-5 sm:py-4' : paddingClasses
        )}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg font-semibold text-slate-900">
                {header.title}
              </CardTitle>
              {header.subtitle && (
                <p className="text-sm mt-1 text-slate-600">
                  {header.subtitle}
                </p>
              )}
            </div>
            {header.action && <div>{header.action}</div>}
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className={cn(
        'relative',
        paddingClasses,
        header ? 'pt-4 sm:pt-5 lg:pt-6' : ''
      )}>
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
