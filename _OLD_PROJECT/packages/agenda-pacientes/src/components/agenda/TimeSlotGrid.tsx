import React from 'react';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TimeSlotGridProps {
  startHour?: number;
  endHour?: number;
  slotDuration?: number; // em minutos
  pixelsPerMinute?: number;
  showCurrentTime?: boolean;
  className?: string;
  onSlotClick?: (time: string) => void;
  children?: React.ReactNode;
}

const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  startHour = 7,
  endHour = 21,
  slotDuration = 30,
  pixelsPerMinute = 1.5,
  showCurrentTime = true,
  className,
  onSlotClick,
  children
}) => {
  const timeSlots = Array.from({ length: (endHour - startHour) * (60 / slotDuration) }, (_, i) => {
    const totalMinutes = startHour * 60 + i * slotDuration;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  const CurrentTimeIndicator: React.FC = () => {
    const now = new Date();
    const minutesFromStart = (now.getHours() - startHour) * 60 + now.getMinutes();
    const top = minutesFromStart * pixelsPerMinute;

    if (top < 0 || top > (endHour - startHour) * 60 * pixelsPerMinute) {
      return null;
    }

    return (
      <div className="absolute left-0 right-0 z-10 pointer-events-none" style={{ top: `${top}px` }}>
        <div className="relative h-0.5 bg-red-500">
          <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("relative", className)}>
      {/* Time Slots */}
      <div className="flex flex-col">
        {timeSlots.map((time, index) => {
          const [hour, minute] = time.split(':').map(Number);
          const isFullHour = minute === 0;
          
          return (
            <div
              key={time}
              className={cn(
                "relative border-b border-slate-200 transition-colors",
                isFullHour ? "border-slate-300" : "border-slate-100",
                onSlotClick && "cursor-pointer hover:bg-slate-50"
              )}
              style={{
                height: `${slotDuration * pixelsPerMinute}px`,
                minHeight: `${slotDuration * pixelsPerMinute}px`
              }}
              onClick={() => onSlotClick?.(time)}
            >
              {/* Time Label */}
              {isFullHour && (
                <div className="absolute -left-16 top-0 flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{format(new Date().setHours(hour, minute), 'HH:mm', { locale: ptBR })}</span>
                </div>
              )}

              {/* Drop Zone Indicator */}
              {onSlotClick && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="h-full border-2 border-dashed border-blue-300 bg-blue-50/30"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Time Indicator */}
      {showCurrentTime && <CurrentTimeIndicator />}

      {/* Children (Appointments) */}
      {children}
    </div>
  );
};

export default TimeSlotGrid;

