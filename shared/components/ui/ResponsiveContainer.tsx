import React from 'react';
import { cn } from '../../lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'full' | 'contained' | 'fluid';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  variant = 'contained',
  maxWidth = 'full',
  padding = 'md'
}) => {
  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'px-3 sm:px-4';
      case 'md':
        return 'px-4 sm:px-6 lg:px-8';
      case 'lg':
        return 'px-6 sm:px-8 lg:px-12';
      default:
        return 'px-4 sm:px-6 lg:px-8';
    }
  };

  const getMaxWidthClasses = () => {
    if (variant === 'full') return '';
    
    switch (maxWidth) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-4xl';
      case 'xl':
        return 'max-w-6xl';
      case '2xl':
        return 'max-w-7xl';
      case 'full':
        return 'max-w-full';
      default:
        return 'max-w-7xl';
    }
  };

  const baseClasses = cn(
    'mx-auto w-full',
    getPaddingClasses(),
    getMaxWidthClasses()
  );

  return (
    <div className={cn(baseClasses, className)}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;
