import React from 'react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'critical' | 'warning' | 'info' | 'completed' | 'paused' | 'cancelled' | 'archived';
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  active: {
    className: 'bg-health-success-100 text-health-success-700 border-health-success-300 hover:bg-health-success-200',
    label: 'Ativo'
  },
  inactive: {
    className: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200',
    label: 'Inativo'
  },
  critical: {
    className: 'bg-health-danger-100 text-health-danger-700 border-health-danger-300 hover:bg-health-danger-200',
    label: 'Crítico'
  },
  warning: {
    className: 'bg-health-warning-100 text-health-warning-700 border-health-warning-300 hover:bg-health-warning-200',
    label: 'Atenção'
  },
  info: {
    className: 'bg-health-info-100 text-health-info-700 border-health-info-300 hover:bg-health-info-200',
    label: 'Info'
  },
  completed: {
    className: 'bg-health-success-100 text-health-success-700 border-health-success-300 hover:bg-health-success-200',
    label: 'Concluído'
  },
  paused: {
    className: 'bg-health-warning-100 text-health-warning-700 border-health-warning-300 hover:bg-health-warning-200',
    label: 'Pausado'
  },
  cancelled: {
    className: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200',
    label: 'Cancelado'
  },
  archived: {
    className: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200',
    label: 'Arquivado'
  }
};

const sizeConfig = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5'
};

export function StatusBadge({ 
  status, 
  children, 
  className,
  variant = 'outline',
  size = 'md'
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses = sizeConfig[size];
  
  return (
    <Badge 
      variant={variant}
      className={cn(
        'border font-medium transition-colors',
        config.className,
        sizeClasses,
        className
      )}
    >
      {children || config.label}
    </Badge>
  );
}

