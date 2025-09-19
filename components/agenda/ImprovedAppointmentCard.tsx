import React from 'react';
import { EnrichedAppointment, AppointmentStatus } from '../types';
import { cn } from '../lib/utils';
import { Repeat, Clock, User } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface ImprovedAppointmentCardProps {
  appointment: EnrichedAppointment;
  startHour: number;
  pixelsPerMinute: number;
  isBeingDragged?: boolean;
  onClick: () => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  viewMode?: 'compact' | 'detailed' | 'list';
}

const getAppointmentStyle = (color: string) => {
  switch (color) {
    case 'purple': return 'bg-purple-500 border-purple-700 hover:bg-purple-600';
    case 'emerald': return 'bg-emerald-500 border-emerald-700 hover:bg-emerald-600';
    case 'blue': return 'bg-blue-500 border-blue-700 hover:bg-blue-600';
    case 'amber': return 'bg-amber-500 border-amber-700 hover:bg-amber-600';
    case 'red': return 'bg-red-500 border-red-700 hover:bg-red-600';
    case 'indigo': return 'bg-indigo-500 border-indigo-700 hover:bg-indigo-600';
    case 'teal': return 'bg-teal-500 border-teal-700 hover:bg-teal-600';
    case 'sky': return 'bg-sky-500 border-sky-700 hover:bg-sky-600';
    default: return 'bg-slate-500 border-slate-700 hover:bg-slate-600';
  }
};

const getStatusBadgeVariant = (status: AppointmentStatus) => {
  switch (status) {
    case AppointmentStatus.Scheduled:
      return 'secondary';
    case AppointmentStatus.Completed:
      return 'default';
    case AppointmentStatus.Canceled:
    case AppointmentStatus.NoShow:
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getStatusText = (status: AppointmentStatus) => {
  switch (status) {
    case AppointmentStatus.Scheduled:
      return 'Agendado';
    case AppointmentStatus.Completed:
      return 'Concluído';
    case AppointmentStatus.Canceled:
      return 'Cancelado';
    case AppointmentStatus.NoShow:
      return 'Não compareceu';
    default:
      return 'Agendado';
  }
};

const ImprovedAppointmentCard: React.FC<ImprovedAppointmentCardProps> = ({ 
  appointment, 
  startHour, 
  pixelsPerMinute, 
  isBeingDragged = false, 
  onClick, 
  onDragStart, 
  onDragEnd,
  viewMode = 'compact'
}) => {
  const top = ((appointment.startTime.getHours() - startHour) * 60 + appointment.startTime.getMinutes()) * pixelsPerMinute;
  const durationInMinutes = (appointment.endTime.getTime() - appointment.startTime.getTime()) / (60 * 1000);
  const height = durationInMinutes * pixelsPerMinute;
  
  const isCompleted = appointment.status === AppointmentStatus.Completed;
  const isCancelled = appointment.status === AppointmentStatus.Canceled || appointment.status === AppointmentStatus.NoShow;

  const style = getAppointmentStyle(appointment.therapistColor);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getDuration = () => {
    const duration = Math.round(durationInMinutes);
    if (duration < 60) return `${duration}min`;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return minutes > 0 ? `${hours}h${minutes}min` : `${hours}h`;
  };

  if (viewMode === 'list') {
    return (
      <Card 
        className={cn(
          "w-full cursor-pointer transition-all hover:shadow-md",
          isBeingDragged && 'opacity-50 ring-2 ring-sky-400',
          (isCompleted || isCancelled) && 'opacity-60 hover:opacity-100'
        )}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        draggable="true"
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn("w-3 h-3 rounded-full", style.replace('bg-', 'bg-').replace(' border-', ''))} />
              <div>
                <h4 className={cn("font-semibold text-sm", isCancelled && "line-through")}>
                  {appointment.patientName}
                </h4>
                <p className="text-xs text-muted-foreground">{appointment.type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusBadgeVariant(appointment.status)}>
                {getStatusText(appointment.status)}
              </Badge>
              <div className="text-xs text-muted-foreground">
                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
              </div>
              {appointment.seriesId && (
                <Repeat className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'detailed') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={(e) => { e.stopPropagation(); onClick(); }}
              draggable="true"
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              className={cn(
                "absolute left-1 right-1 rounded-lg text-white z-10 cursor-pointer transition-all overflow-hidden border-l-4 shadow-sm",
                style,
                (isCompleted || isCancelled) && 'opacity-60 hover:opacity-100',
                isBeingDragged && 'opacity-50 ring-2 ring-sky-400'
              )}
              style={{ top: `${top}px`, height: `${height}px`, minHeight: '60px' }}
            >
              <div className="p-3 h-full flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className={cn("font-bold text-sm leading-tight", isCancelled && "line-through")}>
                      {appointment.patientName}
                    </h4>
                    <p className="text-xs opacity-90 mt-1">{appointment.type}</p>
                  </div>
                  <Badge 
                    variant={getStatusBadgeVariant(appointment.status)}
                    className="text-xs ml-2 flex-shrink-0"
                  >
                    {getStatusText(appointment.status)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs opacity-90 mt-auto">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{getDuration()}</span>
                  </div>
                  {appointment.seriesId && (
                    <Repeat className="w-3 h-3" />
                  )}
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">{appointment.patientName}</p>
              <p className="text-xs">{appointment.type}</p>
              <p className="text-xs">
                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
              </p>
              <p className="text-xs">Duração: {getDuration()}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Compact view (default)
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            draggable="true"
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={cn(
              "absolute left-1 right-1 p-2 rounded-lg text-white z-10 cursor-pointer transition-all overflow-hidden flex flex-col group border-l-4 shadow-sm",
              style,
              (isCompleted || isCancelled) && 'opacity-60 hover:opacity-100',
              isBeingDragged && 'opacity-50 ring-2 ring-sky-400'
            )}
            style={{ top: `${top}px`, height: `${height}px`, minHeight: '32px' }}
          >
            <div className="flex-grow min-h-0">
              <p className={cn("font-bold text-sm leading-tight", isCancelled && "line-through")}>
                {appointment.patientName}
              </p>
              <p className="text-xs opacity-90 truncate">{appointment.type}</p>
            </div>
            {appointment.seriesId && (
              <div className="flex-shrink-0 mt-auto text-right">
                <Repeat className="w-3 h-3 text-white/70" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">{appointment.patientName}</p>
            <p className="text-xs">{appointment.type}</p>
            <p className="text-xs">
              {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
            </p>
            <p className="text-xs">Duração: {getDuration()}</p>
            <p className="text-xs">Status: {getStatusText(appointment.status)}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ImprovedAppointmentCard;
