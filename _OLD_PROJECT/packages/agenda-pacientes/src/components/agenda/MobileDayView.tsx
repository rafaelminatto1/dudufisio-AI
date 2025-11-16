import React from 'react';
import { EnrichedAppointment } from '../../types';
import { AppointmentCard } from './AppointmentCard';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';

interface MobileDayViewProps {
  appointments: EnrichedAppointment[];
  onAppointmentClick: (appointment: EnrichedAppointment) => void;
  compact?: boolean;
}

const MobileDayView: React.FC<MobileDayViewProps> = ({
  appointments,
  onAppointmentClick,
  compact = true
}) => {
  // Agrupar por hora
  const groupedByHour = appointments.reduce((acc, appointment) => {
    const hour = format(appointment.startTime, 'HH:00', { locale: ptBR });
    if (!acc[hour]) {
      acc[hour] = [];
    }
    acc[hour].push(appointment);
    return acc;
  }, {} as Record<string, EnrichedAppointment[]>);

  const hours = Object.keys(groupedByHour).sort();

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">Nenhum agendamento</p>
          <p className="text-sm text-slate-500 mt-1">Toque no botão + para criar um novo agendamento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pb-24">
      {hours.map((hour) => (
        <div key={hour} className="space-y-2">
          {/* Hour Header */}
          <div className="py-2 bg-white border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700">{hour}</h3>
          </div>

          {/* Appointments */}
          <div className="space-y-2">
            {(groupedByHour[hour] || []).map((appointment) => (
              <div
                key={appointment.id}
                onClick={() => onAppointmentClick(appointment)}
                className={cn(
                  "touch-manipulation",
                  compact && "scale-95"
                )}
              >
                <AppointmentCard
                  appointment={appointment}
                  therapistColor={appointment.therapistColor || '#3b82f6'}
                  compact={compact}
                  draggable={false}
                  onClick={() => onAppointmentClick(appointment)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MobileDayView;


