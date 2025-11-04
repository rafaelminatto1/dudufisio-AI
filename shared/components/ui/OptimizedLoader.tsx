import React, { memo } from 'react';

interface OptimizedLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  className?: string;
  text?: string;
}

/**
 * Componente de loading otimizado com múltiplas variantes
 */
const OptimizedLoader: React.FC<OptimizedLoaderProps> = memo(({
  size = 'md',
  variant = 'spinner',
  className = '',
  text
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const renderSpinner = () => (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-slate-300 border-t-sky-600 ${className}`} />
  );

  const renderDots = () => (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} bg-sky-600 rounded-full animate-pulse`}
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={`${sizeClasses[size]} bg-sky-600 rounded-full animate-pulse ${className}`} />
  );

  const renderSkeleton = () => (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} style={{ width: sizeClasses[size], height: sizeClasses[size] }} />
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots': return renderDots();
      case 'pulse': return renderPulse();
      case 'skeleton': return renderSkeleton();
      default: return renderSpinner();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {renderLoader()}
      {text && (
        <p className={`text-slate-600 ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  );
});

OptimizedLoader.displayName = 'OptimizedLoader';

export default OptimizedLoader;
