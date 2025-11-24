'use client';

import { Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '~/lib/utils';

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  className?: string;
}

export function AutoSaveIndicator({
  status,
  lastSaved,
  className,
}: AutoSaveIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: Loader2,
          text: 'Salvando...',
          className: 'text-blue-600 dark:text-blue-400',
        };
      case 'saved':
        return {
          icon: Check,
          text: lastSaved
            ? `Salvo às ${lastSaved.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}`
            : 'Salvo',
          className: 'text-green-600 dark:text-green-400',
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Erro ao salvar',
          className: 'text-red-600 dark:text-red-400',
        };
      default:
        return {
          icon: null,
          text: '',
          className: '',
        };
    }
  };

  const config = getStatusConfig();

  if (!config.icon) {
    return null;
  }

  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-xs',
        config.className,
        className
      )}
    >
      <Icon
        className={cn(
          'h-3 w-3',
          status === 'saving' && 'animate-spin'
        )}
      />
      <span>{config.text}</span>
    </div>
  );
}

