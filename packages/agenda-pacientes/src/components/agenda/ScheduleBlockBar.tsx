import React from 'react';
import { ScheduleBlock, ScheduleBlockType } from '../../types';
import { cn } from '../../lib/utils';
import Tooltip from '../ui/tooltip';

interface ScheduleBlockBarProps {
  block: ScheduleBlock;
  startHour: number;
  pixelsPerMinute: number;
  therapistIndex: number;
  totalTherapists: number;
}

// Cores baseadas no tipo de bloqueio
const BLOCK_TYPE_COLORS: Record<ScheduleBlockType, { bg: string; border: string; text: string }> = {
  'ferias': { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700' },
  'almoco': { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700' },
  'ausencia': { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700' },
  'feriado': { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700' },
  'treinamento': { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700' },
  'outro': { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-700' }
};

const BLOCK_TYPE_LABELS: Record<ScheduleBlockType, string> = {
  'ferias': 'Férias',
  'almoco': 'Almoço',
  'ausencia': 'Ausência',
  'feriado': 'Feriado',
  'treinamento': 'Treinamento',
  'outro': 'Outro'
};

const ScheduleBlockBar: React.FC<ScheduleBlockBarProps> = ({
  block,
  startHour,
  pixelsPerMinute,
  therapistIndex,
  totalTherapists
}) => {
  // Calcular posição e altura
  const top = ((block.startTime.getHours() - startHour) * 60 + block.startTime.getMinutes()) * pixelsPerMinute;
  const durationInMinutes = (block.endTime.getTime() - block.startTime.getTime()) / (60 * 1000);
  const height = Math.max(durationInMinutes * pixelsPerMinute, 20);

  // Calcular largura baseada no número de terapeutas
  const widthPercentage = 100 / totalTherapists;
  const leftPercentage = therapistIndex * widthPercentage;

  const colors = BLOCK_TYPE_COLORS[block.blockType] || BLOCK_TYPE_COLORS.outro;
  const label = BLOCK_TYPE_LABELS[block.blockType] || 'Bloqueio';

  return (
    <div
      className={cn(
        "absolute rounded-sm border-2 opacity-80 pointer-events-none z-5",
        colors.bg,
        colors.border
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: `${leftPercentage}%`,
        width: `${widthPercentage}%`,
        minHeight: '20px'
      }}
    >
      <Tooltip 
        content={
          <div className="text-xs">
            <div className="font-semibold">{label}</div>
            {block.reason && <div className="mt-1">{block.reason}</div>}
            <div className="mt-1 opacity-75">
              {block.startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - 
              {block.endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        }
        side="top"
        delayDuration={300}
      >
        <div className="h-full flex items-center justify-center p-1">
          <span className={cn("text-xs font-semibold truncate", colors.text)}>
            {label}
          </span>
        </div>
      </Tooltip>
    </div>
  );
};

export default ScheduleBlockBar;

