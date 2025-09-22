import React from 'react';
import { EnrichedAppointment, AppointmentStatus } from '../../types';
import { cn } from '../../lib/utils';
import { getTherapistColor, getAppointmentStatusColor } from '../../design-system/tokens';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Card } from '../ui/card';
import { 
  Clock, 
  User, 
  Calendar, 
  Repeat, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign,
} from 'lucide-react';

interface EnhancedAppointmentCardProps {
  appointment: EnrichedAppointment;
  startHour: number;
  pixelsPerMinute: number;
  isBeingDragged: boolean;
  onClick: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  showDetails?: boolean;
}

const getStatusIcon = (status: AppointmentStatus) => {
  switch (status) {
    case AppointmentStatus.Completed:
      return <CheckCircle className="w-3 h-3" />;
    case AppointmentStatus.Canceled:
    case AppointmentStatus.NoShow:
      return <XCircle className="w-3 h-3" />;
    case AppointmentStatus.Scheduled:
      return <Clock className="w-3 h-3" />;
    default:
      return <AlertCircle className="w-3 h-3" />;
  }
};


const formatTime = (date: Date) => {
  return date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const EnhancedAppointmentCard: React.FC<EnhancedAppointmentCardProps> = ({ 
  appointment, 
  startHour, 
  pixelsPerMinute, 
  isBeingDragged, 
  onClick, 
  onDragStart, 
  onDragEnd,
  showDetails = false
}) => {
  const top = ((appointment.startTime.getHours() - startHour) * 60 + appointment.startTime.getMinutes()) * pixelsPerMinute;
  const durationInMinutes = (appointment.endTime.getTime() - appointment.startTime.getTime()) / (60 * 1000);
  const height = durationInMinutes * pixelsPerMinute;
  
  const isCompleted = appointment.status === AppointmentStatus.Completed;
  const isCancelled = appointment.status === AppointmentStatus.Canceled || appointment.status === AppointmentStatus.NoShow;
  const isPast = appointment.endTime < new Date();

  // Get therapist color from design system
  const therapistColor = getTherapistColor(parseInt(appointment.therapistId || '1'));
  getAppointmentStatusColor(appointment.status.toLowerCase());

  const cardContent = (
    <Card
      className={cn(
        "relative w-full transition-all duration-200 cursor-pointer group",
        "hover:shadow-md hover:scale-[1.02]",
        isBeingDragged && "opacity-50 ring-2 ring-blue-400 scale-105",
        isPast && !isCompleted && "opacity-70",
        isCancelled && "opacity-60"
      )}
      style={{ 
        top: `${top}px`, 
        height: `${Math.max(height, 60)}px`,
        borderLeftColor: therapistColor[500],
        borderLeftWidth: '4px'
      }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      draggable="true"
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="p-3 h-full flex flex-col">
        {/* Header with Avatar and Status */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Avatar className="w-8 h-8 ring-2 ring-white shadow-sm">
              <AvatarImage src={`/avatars/${appointment.patientId}.jpg`} />
              <AvatarFallback 
                className="text-xs font-medium"
                style={{ 
                  backgroundColor: therapistColor[100], 
                  color: therapistColor[700] 
                }}
              >
                {getInitials(appointment.patientName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "font-semibold text-sm truncate",
                isCancelled && "line-through opacity-60"
              )}>
                {appointment.patientName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {appointment.type}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {getStatusIcon(appointment.status)}
          </div>
        </div>

        {/* Time and Duration */}
        <div className="flex items-center space-x-2 mb-2">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-medium">
            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
          </span>
        </div>

        {/* Additional Details (when showDetails is true) */}
        {showDetails && (
          <div className="space-y-1 mt-auto">
            {appointment.value && (
              <div className="flex items-center space-x-1">
                <DollarSign className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600 font-medium">
                  R$ {appointment.value.toFixed(2)}
                </span>
              </div>
            )}
            
            {appointment.notes && (
              <p className="text-xs text-muted-foreground truncate">
                {appointment.notes}
              </p>
            )}
          </div>
        )}

        {/* Series Indicator */}
        {appointment.seriesId && (
          <div className="absolute top-2 right-2">
            <Repeat className="w-3 h-3 text-muted-foreground" />
          </div>
        )}

        {/* Therapist Badge */}
        <div className="absolute bottom-2 right-2">
          <Badge 
            variant="outline" 
            className="text-xs px-1.5 py-0.5"
            style={{ 
              borderColor: therapistColor[300],
              color: therapistColor[700],
              backgroundColor: therapistColor[50]
            }}
          >
            {appointment.therapistName}
          </Badge>
        </div>
      </div>
    </Card>
  );

  // Wrap with tooltip for additional info
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {cardContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="font-medium">{appointment.patientName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{appointment.startTime.toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
            </div>
            {appointment.notes && (
              <p className="text-sm text-muted-foreground">{appointment.notes}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EnhancedAppointmentCard;
