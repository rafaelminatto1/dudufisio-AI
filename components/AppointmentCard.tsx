import React, { memo, useMemo, useCallback } from 'react';
import { EnrichedAppointment, AppointmentStatus } from '../types';
import { cn } from '../lib/utils';
import { Repeat } from 'lucide-react';
import Tooltip from './ui/tooltip';

interface AppointmentCardProps {
  appointment: EnrichedAppointment;
  startHour: number;
  pixelsPerMinute: number;
  isBeingDragged: boolean;
  onClick: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}

const getAppointmentStyle = (color: string) => {
    switch (color) {
        case 'purple': return 'bg-purple-500 border-purple-700 shadow-md hover:shadow-lg';
        case 'emerald': return 'bg-emerald-500 border-emerald-700 shadow-md hover:shadow-lg';
        case 'blue': return 'bg-blue-500 border-blue-700 shadow-md hover:shadow-lg';
        case 'amber': return 'bg-amber-500 border-amber-700 shadow-md hover:shadow-lg';
        case 'red': return 'bg-red-500 border-red-700 shadow-md hover:shadow-lg';
        case 'indigo': return 'bg-indigo-500 border-indigo-700 shadow-md hover:shadow-lg';
        case 'teal': return 'bg-teal-500 border-teal-700 shadow-md hover:shadow-lg';
        case 'sky': return 'bg-sky-500 border-sky-700 shadow-md hover:shadow-lg';
        default: return 'bg-slate-500 border-slate-700 shadow-md hover:shadow-lg';
    }
};

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, startHour, pixelsPerMinute, isBeingDragged, onClick, onDragStart, onDragEnd }) => {
  const top = useMemo(() => 
    ((appointment.startTime.getHours() - startHour) * 60 + appointment.startTime.getMinutes()) * pixelsPerMinute,
    [appointment.startTime, startHour, pixelsPerMinute]
  );
  
  const durationInMinutes = useMemo(() => 
    (appointment.endTime.getTime() - appointment.startTime.getTime()) / (60 * 1000),
    [appointment.startTime, appointment.endTime]
  );
  
  const height = useMemo(() => durationInMinutes * pixelsPerMinute, [durationInMinutes, pixelsPerMinute]);
  
  const isCompleted = useMemo(() => appointment.status === AppointmentStatus.Completed, [appointment.status]);
  const isCancelled = useMemo(() => 
    appointment.status === AppointmentStatus.Canceled || appointment.status === AppointmentStatus.NoShow,
    [appointment.status]
  );

  const style = useMemo(() => getAppointmentStyle(appointment.therapistColor), [appointment.therapistColor]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  }, [onClick]);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    onDragStart(e);
  }, [onDragStart]);

  const handleDragEnd = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    onDragEnd(e);
  }, [onDragEnd]);

  return (
    <div
      onClick={handleClick}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
          "absolute left-1 right-1 p-2 rounded-lg text-white text-xs z-10 cursor-pointer transition-all duration-200 overflow-hidden flex flex-col group border-l-4",
          style,
          (isCompleted || isCancelled) && 'opacity-60 hover:opacity-100',
          isBeingDragged && 'opacity-50 ring-2 ring-blue-400',
          !isBeingDragged && 'hover:scale-[1.02]'
      )}
      style={{ top: `${top}px`, height: `${height}px`, minHeight: '20px' }}
    >
      <div className="flex-grow min-h-0">
        <Tooltip 
          content={`${appointment.patientName}${appointment.therapistName ? ` - ${appointment.therapistName}` : ''}`}
          side="top"
          delayDuration={200}
        >
          <p className={cn("font-bold text-sm min-w-0", isCancelled && "line-through")}>
            <span className="truncate block">
              {appointment.patientName.split(' ').slice(0, 2).join(' ')}
            </span>
          </p>
        </Tooltip>
        <p className="truncate text-xs opacity-90 font-medium">{appointment.type || 'Não definido'}</p>
        {appointment.therapistName && (
          <p className="truncate text-xs opacity-75 mt-0.5">{appointment.therapistName}</p>
        )}
      </div>
      {appointment.seriesId && (
        <div className="flex-shrink-0 mt-auto text-right">
            <Repeat className="w-3 h-3 text-white/70" />
        </div>
      )}
    </div>
  );
};

export default memo(AppointmentCard);
