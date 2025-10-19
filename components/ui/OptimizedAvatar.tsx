import React from 'react';
import LazyImage from './LazyImage';
import { cn } from '@/lib/utils';

interface OptimizedAvatarProps {
  src?: string;
  fallback?: string;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  initials?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

/**
 * OptimizedAvatar - Avatar otimizado com LazyImage e WebP support
 * 
 * Usa LazyImage para lazy loading e suporte a WebP com fallback
 * Mostra iniciais quando não tem imagem
 */
export const OptimizedAvatar: React.FC<OptimizedAvatarProps> = ({
  src,
  fallback,
  alt,
  className = '',
  size = 'md',
  initials
}) => {
  // Se não tem src, mostrar iniciais
  if (!src && !fallback) {
    return (
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-fisio-primary-400 to-fisio-primary-600 flex items-center justify-center text-white font-semibold',
          sizeClasses[size],
          textSizeClasses[size],
          className
        )}
      >
        {initials || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  // Se tem src, usar LazyImage
  return (
    <div className={cn('rounded-full overflow-hidden', sizeClasses[size], className)}>
      <LazyImage
        src={src || fallback || ''}
        fallback={fallback}
        alt={alt}
        className="w-full h-full"
      />
    </div>
  );
};

export default OptimizedAvatar;

