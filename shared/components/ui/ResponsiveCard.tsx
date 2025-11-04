import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card';
import { cn } from '../../lib/utils';

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  header?: {
    title?: string;
    description?: string;
    action?: React.ReactNode;
  };
  padding?: 'none' | 'sm' | 'md' | 'lg';
  orientation?: 'vertical' | 'horizontal';
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  variant?: 'default' | 'outline' | 'ghost';
}

const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className,
  header,
  padding = 'md',
  orientation = 'vertical',
  overflow = 'visible',
  variant = 'default'
}) => {
  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'p-3 sm:p-4';
      case 'md':
        return 'p-4 sm:p-5 lg:p-6';
      case 'lg':
        return 'p-6 sm:p-8 lg:p-10';
      default:
        return 'p-4 sm:p-5 lg:p-6';
    }
  };

  const getOrientationClasses = () => {
    return orientation === 'horizontal' ? 'flex-row' : 'flex-col';
  };

  const getOverflowClasses = () => {
    switch (overflow) {
      case 'hidden':
        return 'overflow-hidden';
      case 'scroll':
        return 'overflow-auto';
      case 'auto':
        return 'overflow-auto';
      default:
        return 'overflow-visible';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'border-2';
      case 'ghost':
        return 'border-0 shadow-none bg-transparent';
      default:
        return '';
    }
  };

  const cardClasses = cn(
    'transition-all duration-200',
    getOrientationClasses(),
    getOverflowClasses(),
    getVariantClasses(),
    className
  );

  return (
    <Card className={cardClasses}>
      {header && (
        <CardHeader className={cn(
          padding === 'none' ? 'p-0' : '',
          padding === 'sm' ? 'p-3 sm:p-4' : '',
          padding === 'md' ? 'p-4 sm:p-5 lg:p-6' : '',
          padding === 'lg' ? 'p-6 sm:p-8 lg:p-10' : ''
        )}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {header.title && (
                <CardTitle className="text-lg sm:text-xl lg:text-2xl">
                  {header.title}
                </CardTitle>
              )}
              {header.description && (
                <CardDescription className="text-sm sm:text-base">
                  {header.description}
                </CardDescription>
              )}
            </div>
            {header.action && (
              <div className="flex-shrink-0">
                {header.action}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(
        padding === 'none' ? 'p-0' : '',
        padding === 'sm' ? 'p-3 sm:p-4' : '',
        padding === 'md' ? 'p-4 sm:p-5 lg:p-6' : '',
        padding === 'lg' ? 'p-6 sm:p-8 lg:p-10' : ''
      )}>
        {children}
      </CardContent>
    </Card>
  );
};

export default ResponsiveCard;
