import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, User, AlertTriangle, CheckCircle2, Repeat } from 'lucide-react';
import { Badge } from '../ui/badge';
import { EnrichedAppointment, AppointmentStatus } from '../../types';
import { cn } from '../../lib/utils';

interface AppointmentCardProps {
  appointment: EnrichedAppointment;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
  isBeingDragged?: boolean;
  className?: string;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onClick,
  onDragStart,
  onDragEnd,
  isBeingDragged = false,
  className
}) => {
  const getStatusConfig = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Completed:
        return { 
          icon: CheckCircle2, 
          color: 'bg-green-600 hover:bg-green-700',
          badge: 'bg-green-100 text-green-700 border-green-200'
        };
      case AppointmentStatus.Canceled:
        return { 
          icon: AlertTriangle, 
          color: 'bg-gray-600 hover:bg-gray-700',
          badge: 'bg-gray-100 text-gray-700 border-gray-200'
        };
      case AppointmentStatus.NoShow:
        return { 
          icon: AlertTriangle, 
          color: 'bg-orange-600 hover:bg-orange-700',
          badge: 'bg-orange-100 text-orange-700 border-orange-200'
        };
      default:
        return { 
          icon: Clock, 
          color: 'bg-blue-600 hover:bg-blue-700',
          badge: 'bg-blue-100 text-blue-700 border-blue-200'
        };
    }
  };

  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      draggable={!!onDragStart}
      className={cn(
        "p-3 rounded-lg text-white cursor-pointer transition-all shadow-sm",
        statusConfig.color,
        isBeingDragged && 'opacity-50 ring-2 ring-blue-400 scale-105',
        appointment.hasConflict && 'ring-2 ring-red-500 ring-opacity-75 animate-pulse',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">
            {appointment.patientName}
          </h4>
          <p className="text-xs opacity-90 mt-0.5">
            {appointment.type}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {appointment.hasConflict && (
            <span className="text-red-300 text-xs" title={appointment.conflictReason}>
              ⚠️
            </span>
          )}
          {appointment.paymentStatus === 'paid' && (
            <div className="w-2 h-2 bg-green-300 rounded-full"></div>
          )}
        </div>
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 text-xs opacity-90 mb-2">
        <Clock className="w-3.5 h-3.5" />
        <span>
          {format(new Date(appointment.startTime), 'HH:mm', { locale: ptBR })} - {' '}
          {format(new Date(appointment.endTime), 'HH:mm', { locale: ptBR })}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 opacity-75" />
          <span className="text-xs opacity-90 truncate max-w-[120px]">
            {appointment.therapistName}
          </span>
        </div>
        {appointment.seriesId && (
          <Repeat className="w-3.5 h-3.5 opacity-75" />
        )}
      </div>

      {/* Status Badge (overlay) */}
      <div className="absolute top-2 right-2">
        <Badge variant="secondary" className={cn("text-xs", statusConfig.badge)}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {appointment.status}
        </Badge>
      </div>
    </div>
  );
};

export default AppointmentCard;

