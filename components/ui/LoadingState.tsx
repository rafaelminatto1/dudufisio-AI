/**
 * LoadingState Component - DuduFisio-AI
 * 
 * Componente reutilizável para estados de carregamento
 * com skeleton/spinner consistente.
 * 
 * ♿ Acessibilidade:
 * - role="status" com aria-live="polite" para leitores de tela
 * - aria-label descritivo
 * - Animações respeitam prefers-reduced-motion
 */

import React, { memo } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  /** Mensagem opcional para exibir durante carregamento */
  message?: string;
  /** Tamanho do spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Se deve mostrar skeleton ao invés de spinner */
  skeleton?: boolean;
  /** Número de linhas do skeleton */
  skeletonLines?: number;
  /** Classe CSS adicional */
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = memo(({
  message = 'Carregando...',
  size = 'md',
  skeleton = false,
  skeletonLines = 3,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (skeleton) {
    return (
      <div 
        className={`animate-pulse space-y-3 motion-reduce:animate-none ${className}`}
        role="status"
        aria-live="polite"
        aria-label={message}
      >
        {Array.from({ length: skeletonLines }).map((_, index) => (
          <div
            key={index}
            className="h-4 bg-gray-200 rounded"
            style={{
              width: `${Math.random() * 40 + 60}%` // Variação de largura
            }}
          />
        ))}
        <span className="sr-only">{message}</span>
      </div>
    );
  }

  return (
    <div 
      className={`flex flex-col items-center justify-center p-8 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <Loader2 
        className={`${sizeClasses[size]} animate-spin motion-reduce:animate-none text-blue-600 mb-3`}
        aria-hidden="true"
      />
      <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
        {message}
      </p>
    </div>
  );
});

export default LoadingState;
