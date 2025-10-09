import React, { memo, useMemo, useCallback } from 'react';
import { AppointmentStatus } from '../types';
import { cn } from '../lib/utils';
import { Repeat } from 'lucide-react';
const getAppointmentStyle = (color) => {
    switch (color) {
        case 'purple': return 'bg-purple-500 border-purple-700';
        case 'emerald': return 'bg-emerald-500 border-emerald-700';
        case 'blue': return 'bg-blue-500 border-blue-700';
        case 'amber': return 'bg-amber-500 border-amber-700';
        case 'red': return 'bg-red-500 border-red-700';
        case 'indigo': return 'bg-indigo-500 border-indigo-700';
        case 'teal': return 'bg-teal-500 border-teal-700';
        case 'sky': return 'bg-sky-500 border-sky-700';
        default: return 'bg-slate-500 border-slate-700';
    }
};
const AppointmentCard = ({ appointment, startHour, pixelsPerMinute, isBeingDragged, onClick, onDragStart, onDragEnd }) => {
    const top = useMemo(() => ((appointment.startTime.getHours() - startHour) * 60 + appointment.startTime.getMinutes()) * pixelsPerMinute, [appointment.startTime, startHour, pixelsPerMinute]);
    const durationInMinutes = useMemo(() => (appointment.endTime.getTime() - appointment.startTime.getTime()) / (60 * 1000), [appointment.startTime, appointment.endTime]);
    const height = useMemo(() => durationInMinutes * pixelsPerMinute, [durationInMinutes, pixelsPerMinute]);
    const isCompleted = useMemo(() => appointment.status === AppointmentStatus.Completed, [appointment.status]);
    const isCancelled = useMemo(() => appointment.status === AppointmentStatus.Canceled || appointment.status === AppointmentStatus.NoShow, [appointment.status]);
    const style = useMemo(() => getAppointmentStyle(appointment.therapistColor), [appointment.therapistColor]);
    const handleClick = useCallback((e) => {
        e.stopPropagation();
        onClick();
    }, [onClick]);
    const handleDragStart = useCallback((e) => {
        onDragStart(e);
    }, [onDragStart]);
    const handleDragEnd = useCallback((e) => {
        onDragEnd(e);
    }, [onDragEnd]);
    return (<div onClick={handleClick} draggable="true" onDragStart={handleDragStart} onDragEnd={handleDragEnd} className={cn("absolute left-1 right-1 p-2 rounded-lg text-white text-xs z-10 cursor-pointer transition-all overflow-hidden flex flex-col group border-l-4", style, (isCompleted || isCancelled) && 'opacity-60 hover:opacity-100', isBeingDragged && 'opacity-50 ring-2 ring-sky-400')} style={{ top: `${top}px`, height: `${height}px`, minHeight: '20px' }}>
      <div className="flex-grow min-h-0">
        <p className={cn("font-bold truncate", isCancelled && "line-through")}>{appointment.patientName}</p>
        <p className="truncate text-xs opacity-90">{appointment.type}</p>
      </div>
      {appointment.seriesId && (<div className="flex-shrink-0 mt-auto text-right">
            <Repeat className="w-3 h-3 text-white/70"/>
        </div>)}
    </div>);
};
export default memo(AppointmentCard);
