import React from 'react';
import { Users, Filter, Search, UserPlus, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

interface EmptyStateProps {
  type: 'no-patients' | 'no-results' | 'no-data' | 'filtered-out';
  onAction?: () => void;
  actionLabel?: string;
}

/**
 * Estado vazio com ilustrações SVG e call-to-actions contextuais
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction, actionLabel }) => {
  const configs = {
    'no-patients': {
      icon: Users,
      title: 'Nenhum paciente cadastrado',
      description: 'Comece adicionando seu primeiro paciente ao sistema para começar o monitoramento.',
      actionLabel: actionLabel || 'Adicionar Primeiro Paciente',
      suggestions: [
        'Adicione informações básicas do paciente',
        'Configure o acompanhamento inicial',
        'Agende a primeira sessão',
      ],
    },
    'no-results': {
      icon: Search,
      title: 'Nenhum resultado encontrado',
      description: 'Não encontramos pacientes com os critérios de busca informados.',
      actionLabel: actionLabel || 'Limpar Busca',
      suggestions: [
        'Verifique a ortografia dos termos',
        'Tente termos mais gerais',
        'Use filtros diferentes',
      ],
    },
    'filtered-out': {
      icon: Filter,
      title: 'Nenhum paciente corresponde aos filtros',
      description: 'Ajuste os filtros para visualizar mais resultados.',
      actionLabel: actionLabel || 'Limpar Filtros',
      suggestions: [
        'Remova alguns filtros ativos',
        'Amplie o período de análise',
        'Tente combinar filtros diferentes',
      ],
    },
    'no-data': {
      icon: RefreshCw,
      title: 'Dados ainda não disponíveis',
      description: 'Aguarde enquanto carregamos as informações dos pacientes.',
      actionLabel: actionLabel || 'Recarregar',
      suggestions: [
        'Verifique sua conexão com a internet',
        'Tente recarregar a página',
        'Entre em contato com o suporte se o problema persistir',
      ],
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Ilustração */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full p-8 border-2 border-blue-100">
          <Icon className="w-16 h-16 text-blue-600" strokeWidth={1.5} />
        </div>
      </div>

      {/* Conteúdo */}
      <h3 className="text-xl font-semibold text-slate-900 mb-2 text-center">
        {config.title}
      </h3>
      <p className="text-sm text-slate-600 mb-6 text-center max-w-md">
        {config.description}
      </p>

      {/* Sugestões */}
      <div className="mb-6 bg-slate-50 rounded-lg p-4 max-w-md w-full">
        <p className="text-xs font-medium text-slate-700 mb-2">Sugestões:</p>
        <ul className="space-y-1.5">
          {config.suggestions.map((suggestion, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
      {onAction && (
        <Button onClick={onAction} className="gap-2">
          {type === 'no-patients' && <UserPlus className="w-4 h-4" />}
          {type === 'no-results' && <Search className="w-4 h-4" />}
          {type === 'filtered-out' && <Filter className="w-4 h-4" />}
          {type === 'no-data' && <RefreshCw className="w-4 h-4" />}
          {config.actionLabel}
        </Button>
      )}
    </div>
  );
};

/**
 * Estado vazio específico para tabela
 */
export const TableEmptyState: React.FC<{
  hasFilters: boolean;
  onClearFilters?: () => void;
  onAddPatient?: () => void;
}> = ({ hasFilters, onClearFilters, onAddPatient }) => {
  if (hasFilters) {
    return (
      <EmptyState
        type="filtered-out"
        onAction={onClearFilters}
      />
    );
  }

  return (
    <EmptyState
      type="no-patients"
      onAction={onAddPatient}
    />
  );
};

/**
 * Estado vazio para gráficos sem dados
 */
export const ChartEmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[300px] text-center px-4">
      <div className="bg-slate-100 rounded-full p-6 mb-4">
        <svg
          className="w-12 h-12 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-700 mb-1">
        Dados insuficientes
      </p>
      <p className="text-xs text-slate-500">
        Não há dados suficientes para gerar este gráfico
      </p>
    </div>
  );
};

/**
 * Estado de loading com mensagem customizada
 */
export const LoadingState: React.FC<{ message?: string }> = ({ 
  message = 'Carregando dados...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="relative mb-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin animation-delay-150" />
      </div>
      <p className="text-sm text-slate-600 animate-pulse">{message}</p>
    </div>
  );
};

/**
 * Estado de erro com retry
 */
export const ErrorState: React.FC<{
  message?: string;
  onRetry?: () => void;
}> = ({ message = 'Ocorreu um erro ao carregar os dados', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-red-50 rounded-full p-6 mb-4">
        <svg
          className="w-12 h-12 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.959-1.333-2.73 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-900 mb-1">Erro ao carregar</p>
      <p className="text-xs text-slate-600 mb-4 text-center max-w-sm">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Tentar Novamente
        </Button>
      )}
    </div>
  );
};


