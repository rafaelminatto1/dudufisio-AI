import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import * as patientGoalsService from '../../services/patientGoalsService';

/**
 * Componente visual de countdown para objetivos
 * Mostra tempo restante até data alvo
 * Animação de progresso e alertas visuais
 */

interface GoalCountdownProps {
  targetDate: string;
  title: string;
  currentProgress?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const GoalCountdown: React.FC<GoalCountdownProps> = ({
  targetDate,
  title,
  currentProgress = 0,
  size = 'md',
}) => {
  const countdown = patientGoalsService.calculateCountdown(targetDate);

  // Definir cores baseado no status
  const getStatusColor = () => {
    if (countdown.isOverdue) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-300',
        text: 'text-red-800',
        badge: 'bg-red-100 text-red-800',
        icon: AlertTriangle,
      };
    }
    if (countdown.isUrgent) {
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-300',
        text: 'text-orange-800',
        badge: 'bg-orange-100 text-orange-800',
        icon: Clock,
      };
    }
    if (currentProgress >= 100) {
      return {
        bg: 'bg-green-50',
        border: 'border-green-300',
        text: 'text-green-800',
        badge: 'bg-green-100 text-green-800',
        icon: CheckCircle2,
      };
    }
    return {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-800',
      badge: 'bg-blue-100 text-blue-800',
      icon: Calendar,
    };
  };

  const statusColor = getStatusColor();
  const Icon = statusColor.icon;

  // Tamanhos
  const sizes = {
    sm: {
      container: 'p-3',
      title: 'text-sm',
      countdown: 'text-lg',
      icon: 'w-4 h-4',
      progress: 'h-1.5',
    },
    md: {
      container: 'p-4',
      title: 'text-base',
      countdown: 'text-2xl',
      icon: 'w-5 h-5',
      progress: 'h-2',
    },
    lg: {
      container: 'p-5',
      title: 'text-lg',
      countdown: 'text-3xl',
      icon: 'w-6 h-6',
      progress: 'h-3',
    },
  };

  const sizeClasses = sizes[size];

  return (
    <div className={`${statusColor.bg} border ${statusColor.border} rounded-lg ${sizeClasses.container}`}>
      {/* Header com ícone */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className={`font-semibold ${statusColor.text} ${sizeClasses.title} mb-1`}>
            {title}
          </h4>
          <p className="text-xs text-slate-600">
            {new Date(targetDate).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${statusColor.badge.replace('text-', 'text-').replace('bg-', 'bg-')}`}>
          <Icon className={sizeClasses.icon} />
        </div>
      </div>

      {/* Countdown */}
      <div className="mb-3">
        <p className={`font-bold ${statusColor.text} ${sizeClasses.countdown}`}>
          {countdown.formatted}
        </p>
        {countdown.days > 0 && !countdown.isOverdue && (
          <p className="text-xs text-slate-600 mt-1">
            ({countdown.days} dia{countdown.days !== 1 ? 's' : ''})
          </p>
        )}
      </div>

      {/* Barra de Progresso */}
      {currentProgress !== undefined && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Progresso</span>
            <span className={`font-semibold ${statusColor.text}`}>
              {currentProgress}%
            </span>
          </div>
          <div className={`w-full bg-slate-200 rounded-full ${sizeClasses.progress} overflow-hidden`}>
            <div
              className={`${statusColor.badge.split(' ')[0]} ${sizeClasses.progress} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(100, currentProgress)}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Badge */}
      {(countdown.isOverdue || countdown.isUrgent || currentProgress >= 100) && (
        <div className={`mt-3 px-2 py-1 rounded text-xs font-medium text-center ${statusColor.badge}`}>
          {countdown.isOverdue && '⏰ Atrasado'}
          {countdown.isUrgent && !countdown.isOverdue && '⚡ Urgente'}
          {currentProgress >= 100 && '✓ Concluído'}
        </div>
      )}
    </div>
  );
};

export default GoalCountdown;

