import React, { useState } from 'react';
import { Database, Circle, AlertCircle, X } from 'lucide-react';
import { shouldUseSupabase, shouldFallbackToMock } from '../../config/supabaseTablesConfig';

/**
 * Indicador visual de fonte de dados
 * Mostra se está usando Supabase ou Mock
 * Apenas visível em dev mode ou para Admin
 */

type DataSource = 'supabase' | 'mock' | 'error';

interface DataSourceIndicatorProps {
  visible?: boolean;
  position?: 'top-right' | 'bottom-right' | 'bottom-left';
}

export const DataSourceIndicator: React.FC<DataSourceIndicatorProps> = ({
  visible = true,
  position = 'bottom-right',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSource, setCurrentSource] = useState<DataSource>('mock');

  // Detectar fonte de dados (simplificado)
  useEffect(() => {
    if (shouldUseSupabase()) {
      setCurrentSource('supabase');
    } else {
      setCurrentSource('mock');
    }
  }, []);

  if (!visible) return null;

  const getStatusConfig = () => {
    switch (currentSource) {
      case 'supabase':
        return {
          icon: Circle,
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Supabase',
          description: 'Conectado ao banco de dados',
        };
      case 'mock':
        return {
          icon: Circle,
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'Modo Mock',
          description: 'Usando dados de teste',
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'bg-red-500',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Erro',
          description: 'Erro de conexão',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-[9990]`}>
      {isExpanded ? (
        // Versão expandida
        <div className={`${config.bgColor} border ${config.borderColor} rounded-lg shadow-lg p-4 min-w-[280px]`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`${config.color} rounded-full p-1.5 animate-pulse`}>
                <Database className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className={`font-semibold text-sm ${config.textColor}`}>
                  {config.label}
                </p>
                <p className="text-xs text-slate-600">
                  {config.description}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsExpanded(false)}
              className="hover:bg-white/50 rounded p-1 transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Detalhes */}
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <span>Supabase Ativo:</span>
              <span className="font-medium">
                {shouldUseSupabase() ? '✓ Sim' : '✗ Não'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Fallback Mock:</span>
              <span className="font-medium">
                {shouldFallbackToMock() ? '✓ Ativo' : '✗ Desativado'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ambiente:</span>
              <span className="font-medium">
                {process.env.NODE_ENV || 'development'}
              </span>
            </div>
          </div>

          {/* Link para configurações */}
          <div className="mt-3 pt-3 border-t border-slate-200">
            <a
              href="/session-evolution-settings"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Configurar Dados Mock →
            </a>
          </div>
        </div>
      ) : (
        // Versão compacta
        <button
          onClick={() => setIsExpanded(true)}
          className={`${config.bgColor} border ${config.borderColor} rounded-full shadow-lg px-3 py-2 hover:shadow-xl transition-all flex items-center space-x-2`}
          title={`Fonte de dados: ${config.label}`}
        >
          <div className={`${config.color} rounded-full w-2 h-2 animate-pulse`} />
          <span className={`text-xs font-medium ${config.textColor}`}>
            {config.label}
          </span>
        </button>
      )}
    </div>
  );
};

export default DataSourceIndicator;

