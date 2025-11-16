import React, { useState } from 'react';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { Clock, User, DollarSign, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { EnrichedAppointment, AppointmentStatus } from '../../types';
import { cn } from '../../lib/utils';

interface AppointmentTooltipProps {
  appointment: EnrichedAppointment;
  overlappingAppointments?: EnrichedAppointment[];
  onViewOverlapping?: (appointments: EnrichedAppointment[]) => void;
  className?: string;
}

const AppointmentTooltip: React.FC<AppointmentTooltipProps> = ({
  appointment,
  overlappingAppointments = [],
  onViewOverlapping,
  className
}) => {
  const [showOverlapping, setShowOverlapping] = useState(false);

  const getStatusConfig = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Completed:
        return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Concluído' };
      case AppointmentStatus.Canceled:
        return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelado' };
      case AppointmentStatus.NoShow:
        return { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Faltou' };
      default:
        return { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Agendado' };
    }
  };

  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className={cn("bg-white rounded-lg shadow-lg border border-slate-200 p-3 min-w-[280px] max-w-[320px]", className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-slate-900 truncate">
            {appointment.patientName}
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            {displayAppointmentType(appointment.type)}
          </p>
        </div>
        <Badge variant="secondary" className={cn("text-xs", statusConfig.bg, statusConfig.color)}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusConfig.label}
        </Badge>
      </div>

      {/* Details */}
      <div className="space-y-1.5 mb-2">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {format(new Date(appointment.startTime), 'HH:mm', { locale: ptBR })} - {' '}
            {format(new Date(appointment.endTime), 'HH:mm', { locale: ptBR })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">{appointment.therapistName}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatCurrencyBR(appointment.value)}</span>
        </div>
      </div>

      {/* Overlapping Appointments */}
      {overlappingAppointments.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <button
            onClick={() => {
              setShowOverlapping(!showOverlapping);
              if (!showOverlapping && onViewOverlapping) {
                onViewOverlapping(overlappingAppointments);
              }
            }}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between text-xs text-blue-600 hover:text-blue-700">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span className="font-medium">
                  +{overlappingAppointments.length} mais aguardando...
                </span>
              </div>
              <span className="text-blue-400">Ver</span>
            </div>
          </button>

          {showOverlapping && (
            <div className="mt-2 space-y-1.5">
              {overlappingAppointments.map((overlapping) => (
                <div
                  key={overlapping.id}
                  className="p-2 bg-slate-50 rounded border border-slate-200 text-xs"
                >
                  <div className="font-medium text-slate-900">
                    {overlapping.patientName}
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    {format(new Date(overlapping.startTime), 'HH:mm', { locale: ptBR })} - {' '}
                    {overlapping.type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 pt-3 border-t border-slate-200 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs h-7"
          onClick={() => {
            // TODO: Implementar ação de visualizar detalhes
            
          }}
        >
          Ver Detalhes
        </Button>
        {appointment.status === AppointmentStatus.Scheduled && (
          <Button
            size="sm"
            className="flex-1 text-xs h-7"
            onClick={() => {
              // TODO: Implementar ação de iniciar sessão
              
            }}
          >
            Iniciar
          </Button>
        )}
      </div>
    </div>
  );
};

export default AppointmentTooltip;
