import React, { memo, useMemo, useCallback } from 'react';
import { EnrichedAppointment, AppointmentStatus } from '../types';
import { cn } from '../lib/utils';
import { Repeat } from 'lucide-react';

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
        case 'purple': return 'bg-fisio-primary-500 border-fisio-primary-700 shadow-sm hover:shadow-md';
        case 'emerald': return 'bg-fisio-secondary-500 border-fisio-secondary-700 shadow-sm hover:shadow-md';
        case 'blue': return 'bg-fisio-primary-400 border-fisio-primary-600 shadow-sm hover:shadow-md';
        case 'amber': return 'bg-fisio-warning-500 border-fisio-warning-700 shadow-sm hover:shadow-md';
        case 'red': return 'bg-fisio-error-500 border-fisio-error-700 shadow-sm hover:shadow-md';
        case 'indigo': return 'bg-fisio-primary-600 border-fisio-primary-800 shadow-sm hover:shadow-md';
        case 'teal': return 'bg-fisio-secondary-400 border-fisio-secondary-600 shadow-sm hover:shadow-md';
        case 'sky': return 'bg-fisio-primary-300 border-fisio-primary-500 shadow-sm hover:shadow-md';
        default: return 'bg-fisio-neutral-500 border-fisio-neutral-700 shadow-sm hover:shadow-md';
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
          "absolute left-1 right-1 p-2 rounded-lg text-white text-xs z-10 cursor-pointer transition-all overflow-hidden flex flex-col group border-l-4",
          style,
          (isCompleted || isCancelled) && 'opacity-60 hover:opacity-100',
          isBeingDragged && 'opacity-50 ring-2 ring-fisio-primary-400',
          !isBeingDragged && 'hover:scale-[1.02]'
      )}
      style={{ top: `${top}px`, height: `${height}px`, minHeight: '20px' }}
    >
      <div className="flex-grow min-h-0">
        <p className={cn("font-bold truncate text-sm", isCancelled && "line-through")}>{appointment.patientName}</p>
        <p className="truncate text-xs opacity-90 font-medium">{appointment.type}</p>
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
