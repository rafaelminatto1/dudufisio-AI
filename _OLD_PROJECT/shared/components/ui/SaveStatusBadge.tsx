// components/ui/SaveStatusBadge.tsx
import React from 'react';
import { CheckCircle, Loader, AlertCircle, AlertTriangle } from 'lucide-react';

type SaveStatus = 'saved' | 'saving' | 'error' | 'unsaved';

interface SaveStatusBadgeProps {
  status: SaveStatus;
}

export const SaveStatusBadge: React.FC<SaveStatusBadgeProps> = ({ status }) => {
  const configs = {
    saved: {
      icon: CheckCircle,
      text: 'Salvo',
      className: 'bg-green-50 text-green-700 border-green-200',
    },
    saving: {
      icon: Loader,
      text: 'Salvando...',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      animate: true,
    },
    error: {
      icon: AlertCircle,
      text: 'Erro',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
    unsaved: {
      icon: AlertTriangle,
      text: 'Não salvo',
      className: 'bg-orange-50 text-orange-700 border-orange-200',
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${config.className}`}>
      <Icon className={`w-3.5 h-3.5 ${config.animate ? 'animate-spin' : ''}`} />
      <span>{config.text}</span>
    </div>
  );
};
