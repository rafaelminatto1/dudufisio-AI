import React from 'react';
import { Stethoscope, Loader2 } from 'lucide-react';

interface LazyFallbackProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
}

const LazyFallback: React.FC<LazyFallbackProps> = ({ 
  message = "Carregando...", 
  showProgress = false,
  progress = 0,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div 
      className="flex flex-col items-center justify-center p-8"
      role="status"
      aria-live="polite"
      aria-label="Carregando componente"
    >
      <div className="relative flex items-center justify-center mb-4">
        <Stethoscope 
          className={`${iconSizes[size]} text-sky-500 animate-pulse`}
          aria-hidden="true"
        />
        <Loader2 
          className={`absolute ${iconSizes[size]} text-sky-300 animate-spin`}
          aria-hidden="true"
        />
      </div>
      
      <p className={`text-slate-600 font-medium ${
        size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'
      }`}>
        {message}
      </p>
      
      {showProgress && (
        <div className="w-48 mt-4">
          <div className="bg-slate-200 rounded-full h-2">
            <div 
              className="bg-sky-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              aria-label={`Progresso: ${progress}%`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de fallback específico para dashboards
export const DashboardFallback: React.FC = () => (
  <LazyFallback 
    message="Carregando Dashboard..."
    size="lg"
    showProgress={true}
    progress={75}
  />
);

// Componente de fallback específico para páginas
export const PageFallback: React.FC = () => (
  <LazyFallback 
    message="Carregando página..."
    size="md"
  />
);

// Componente de fallback específico para modais
export const ModalFallback: React.FC = () => (
  <LazyFallback 
    message="Carregando..."
    size="sm"
  />
);

// Componente de fallback específico para listas
export const ListFallback: React.FC = () => (
  <div className="space-y-3 p-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <div 
        key={index}
        className="animate-pulse flex space-x-4"
        role="status"
        aria-label="Carregando item da lista"
      >
        <div className="rounded-full bg-slate-200 h-10 w-10"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

// Componente de fallback específico para tabelas
export const TableFallback: React.FC = () => (
  <div className="animate-pulse">
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
        <div className="flex space-x-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-4 bg-slate-200 rounded w-24"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: 6 }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4 border-b border-slate-100">
          <div className="flex space-x-4">
            {Array.from({ length: 4 }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-slate-200 rounded w-20"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default LazyFallback;
