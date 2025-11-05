import React from 'react';
import { cn } from '../../lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  noPadding?: boolean;
  noBackground?: boolean;
}

/**
 * PageContainer - Componente padrão para padronizar margens e padding em todas as páginas
 * 
 * Sistema de espaçamento:
 * - Padding responsivo: px-4 sm:px-6 lg:px-8
 * - Padding vertical: py-8
 * - Container máximo: max-w-7xl mx-auto (padrão)
 * - Background: bg-gray-50 (padrão)
 * - Título com espaçamento mb-8
 */
export function PageContainer({
  children,
  title,
  subtitle,
  className,
  maxWidth = '7xl',
  noPadding = false,
  noBackground = false,
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'min-h-screen',
        !noBackground && 'bg-gray-50',
        className
      )}
    >
      <div
        className={cn(
          maxWidthClasses[maxWidth],
          'mx-auto',
          !noPadding && 'px-4 sm:px-6 lg:px-8 py-8'
        )}
      >
        {(title || subtitle) && (
          <header className="mb-8">
            {title && (
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-gray-600 text-lg">
                {subtitle}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </div>
  );
}

export default PageContainer;

