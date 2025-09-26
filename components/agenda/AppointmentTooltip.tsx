import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Badge } from '../ui/badge';
import AppointmentStatusIndicator from './AppointmentStatusIndicator';
import { EnrichedAppointment } from '../../types';

interface AppointmentTooltipProps {
  appointment: EnrichedAppointment;
  children: React.ReactNode;
}

const AppointmentTooltip: React.FC<AppointmentTooltipProps> = ({
  appointment,
  children
}) => {
  const getDuration = () => {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins}min`;
    }
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (mins === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${mins}min`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3 bg-white border border-slate-200 shadow-lg">
          <div className="space-y-2">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">
                  {appointment.patientName}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  {appointment.type}
                </p>
              </div>
              <AppointmentStatusIndicator 
                status={appointment.status} 
                size="sm" 
                showText={false}
              />
            </div>

            {/* Time info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Início:</span>
                <span className="font-medium text-slate-700">
                  {format(new Date(appointment.startTime), 'HH:mm', { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Duração:</span>
                <span className="font-medium text-slate-700">
                  {getDuration()}
                </span>
              </div>
            </div>

            {/* Status badge */}
            <div className="pt-1">
              <Badge 
                variant="outline" 
                className="text-xs"
              >
                <AppointmentStatusIndicator 
                  status={appointment.status} 
                  size="sm" 
                  showIcon={true}
                  showText={true}
                />
              </Badge>
            </div>

            {/* Value if available */}
            {appointment.value && appointment.value > 0 && (
              <div className="pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Valor:</span>
                  <span className="font-medium text-green-600">
                    R$ {appointment.value.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AppointmentTooltip;
