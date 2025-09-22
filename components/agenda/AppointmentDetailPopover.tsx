import React from 'react';
import { EnrichedAppointment, AppointmentStatus } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Clock, 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  DollarSign,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Repeat,
  Stethoscope,
  FileText
} from 'lucide-react';
import { getTherapistColor, getAppointmentStatusColor } from '../../design-system/tokens';

interface AppointmentDetailPopoverProps {
  appointment: EnrichedAppointment;
  children: React.ReactNode;
  onEdit?: (appointment: EnrichedAppointment) => void;
  onDelete?: (appointment: EnrichedAppointment) => void;
  onStatusChange?: (appointment: EnrichedAppointment, status: AppointmentStatus) => void;
}

const AppointmentDetailPopover: React.FC<AppointmentDetailPopoverProps> = ({
  appointment,
  children,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Completed:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case AppointmentStatus.Canceled:
      case AppointmentStatus.NoShow:
        return <XCircle className="w-4 h-4 text-red-600" />;
      case AppointmentStatus.Scheduled:
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
    }
  };

  const getStatusVariant = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Completed:
        return 'default' as const;
      case AppointmentStatus.Canceled:
      case AppointmentStatus.NoShow:
        return 'destructive' as const;
      case AppointmentStatus.Scheduled:
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const formatDate = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const therapistColor = getTherapistColor(appointment.therapistId || 1);

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 space-y-4">
          {/* Header with Patient Info */}
          <div className="flex items-start space-x-3">
            <Avatar className="w-12 h-12 ring-2 ring-white shadow-sm">
              <AvatarImage src={`/avatars/${appointment.patientId}.jpg`} />
              <AvatarFallback 
                className="text-sm font-medium"
                style={{ 
                  backgroundColor: therapistColor[100], 
                  color: therapistColor[700] 
                }}
              >
                {getInitials(appointment.patientName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">
                {appointment.patientName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {appointment.type}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusIcon(appointment.status)}
                <Badge variant={getStatusVariant(appointment.status)}>
                  {appointment.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Date and Time */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{formatDate(appointment.startTime)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Duração: {Math.round((appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60))} minutos
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Therapist Info */}
          <div className="flex items-center space-x-3">
            <Stethoscope className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: therapistColor[500] }}
              />
              <span className="text-sm font-medium">{appointment.therapistName}</span>
            </div>
          </div>

          {/* Value */}
          {appointment.value && (
            <>
              <Separator />
              <div className="flex items-center space-x-3">
                <DollarSign className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-600">
                    R$ {appointment.value.toFixed(2)}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {appointment.notes && (
            <>
              <Separator />
              <div className="flex items-start space-x-3">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">Observações</p>
                  <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                </div>
              </div>
            </>
          )}

          {/* Series Indicator */}
          {appointment.seriesId && (
            <>
              <Separator />
              <div className="flex items-center space-x-3">
                <Repeat className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Parte de uma série de consultas
                </p>
              </div>
            </>
          )}

          {/* Actions */}
          {(onEdit || onDelete || onStatusChange) && (
            <>
              <Separator />
              <div className="flex items-center space-x-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(appointment)}
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                )}
                
                {onStatusChange && appointment.status === AppointmentStatus.Scheduled && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onStatusChange(appointment, AppointmentStatus.Completed)}
                    className="flex-1"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Concluir
                  </Button>
                )}
                
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(appointment)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AppointmentDetailPopover;
