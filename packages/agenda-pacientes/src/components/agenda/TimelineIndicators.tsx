import React from 'react';
import { Utensils, Zap, Coffee } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TimelineIndicatorsProps {
  startHour: number;
  pixelsPerMinute: number;
  className?: string;
}

interface TimeIndicator {
  hour: number;
  minute: number;
  label: string;
  color: string;
  icon: React.ReactNode;
  type: 'lunch' | 'peak' | 'break';
}

const TimelineIndicators: React.FC<TimelineIndicatorsProps> = ({
  startHour,
  pixelsPerMinute,
  className
}) => {
  // Horários especiais configuráveis
  const indicators: TimeIndicator[] = [
    {
      hour: 12,
      minute: 0,
      label: 'Horário de Almoço',
      color: 'bg-yellow-100 border-yellow-300',
      icon: <Utensils className="w-3 h-3 text-yellow-600" />,
      type: 'lunch'
    },
    {
      hour: 9,
      minute: 0,
      label: 'Horário de Pico',
      color: 'bg-orange-100 border-orange-300',
      icon: <Zap className="w-3 h-3 text-orange-600" />,
      type: 'peak'
    },
    {
      hour: 15,
      minute: 0,
      label: 'Horário de Pico',
      color: 'bg-orange-100 border-orange-300',
      icon: <Zap className="w-3 h-3 text-orange-600" />,
      type: 'peak'
    },
    {
      hour: 10,
      minute: 30,
      label: 'Pausa Café',
      color: 'bg-amber-100 border-amber-300',
      icon: <Coffee className="w-3 h-3 text-amber-700" />,
      type: 'break'
    }
  ];

  return (
    <>
      {indicators.map((indicator, index) => {
        const minutesFromStart = (indicator.hour - startHour) * 60 + indicator.minute;
        const top = minutesFromStart * pixelsPerMinute;
        
        // Não mostrar se estiver fora do horário visível
        if (indicator.hour < startHour || top < 0) {
          return null;
        }

        return (
          <div
            key={`${indicator.type}-${index}`}
            className={cn(
              "absolute left-0 right-0 z-5 pointer-events-none",
              className
            )}
            style={{ top: `${top}px` }}
          >
            {/* Linha horizontal */}
            <div className={cn(
              "h-px border-t-2 border-dashed opacity-40",
              indicator.color
            )} />
            
            {/* Label */}
            <div className={cn(
              "absolute -top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 shadow-sm border",
              indicator.color
            )}>
              {indicator.icon}
              <span>{indicator.label}</span>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default TimelineIndicators;


