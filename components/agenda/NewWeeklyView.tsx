import React, { useState, useMemo } from 'react';
import format from 'date-fns/format';
import addDays from 'date-fns/addDays';
import startOfWeek from 'date-fns/startOfWeek';
import isSameDay from 'date-fns/isSameDay';
import isToday from 'date-fns/isToday';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { EnrichedAppointment, Therapist, AppointmentStatus } from '../../types';
import { cn } from '../../lib/utils';
import AppointmentContextMenu from './AppointmentContextMenu';
import AppointmentTooltip from './AppointmentTooltip';
import HolidayIndicator from './HolidayIndicator';

interface NewWeeklyViewProps {
  currentDate: Date;
  appointments: EnrichedAppointment[];
  therapists: Therapist[];
  onSlotClick: (day: Date, time: string, therapistId: string) => void;
  onAppointmentClick: (appointment: EnrichedAppointment) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, appointment: EnrichedAppointment) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, day: Date, therapistId: string) => void;
  draggedAppointmentId: string | null;
  onEdit?: (appointment: EnrichedAppointment) => void;
  onDelete?: (appointmentId: string) => void;
  onStatusChange?: (appointment: EnrichedAppointment, status: AppointmentStatus) => void;
  onPaymentStatusChange?: (appointment: EnrichedAppointment, status: 'paid' | 'pending') => void;
}

const START_HOUR = 7;
const END_HOUR = 19;
const SLOT_DURATION = 30;
const PIXELS_PER_MINUTE = 2.5; // Aumentado para melhor visualização

// Cores sólidas e opacas para os terapeutas
const THERAPIST_COLORS = {
  'therapist-1': {
    primary: '#8B5CF6', // Purple
    light: '#F3F4F6',
    border: '#8B5CF6'
  },
  'therapist-2': {
    primary: '#10B981', // Emerald
    light: '#F0FDF4',
    border: '#10B981'
  },
  'therapist-3': {
    primary: '#3B82F6', // Blue
    light: '#EFF6FF',
    border: '#3B82F6'
  }
};

const timeSlots = Array.from({ length: (END_HOUR - START_HOUR) * (60 / SLOT_DURATION) }, (_, i) => {
  const totalMinutes = START_HOUR * 60 + i * SLOT_DURATION;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

// Indicador de tempo atual
const CurrentTimeIndicator: React.FC = () => {
  const [top, setTop] = React.useState(0);

  React.useEffect(() => {
    const updatePosition = () => {
      const now = new Date();
      const minutesFromStart = (now.getHours() - START_HOUR) * 60 + now.getMinutes();
      setTop(minutesFromStart * PIXELS_PER_MINUTE);
    };

    updatePosition();
    const interval = setInterval(updatePosition, 60000);
    return () => clearInterval(interval);
  }, []);

  if (top < 0 || top > (END_HOUR - START_HOUR) * 60 * PIXELS_PER_MINUTE) {
    return null;
  }

  return (
    <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: `${top}px` }}>
      <div className="relative h-0.5 bg-red-500 shadow-sm">
        <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full shadow-sm"></div>
      </div>
    </div>
  );
};

// Card de agendamento com design sólido e sem transparência
const AppointmentCard: React.FC<{
  appointment: EnrichedAppointment;
  startHour: number;
  pixelsPerMinute: number;
  isBeingDragged: boolean;
  onClick: (appointment: EnrichedAppointment) => void;
  onRightClick: (appointment: EnrichedAppointment, e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, appointment: EnrichedAppointment) => void;
  onDragEnd: () => void;
  therapistIndex: number;
}> = ({
  appointment,
  startHour,
  pixelsPerMinute,
  isBeingDragged,
  onClick,
  onRightClick,
  onDragStart,
  onDragEnd,
  therapistIndex
}) => {
  const top = ((appointment.startTime.getHours() - startHour) * 60 + appointment.startTime.getMinutes()) * pixelsPerMinute;
  const durationInMinutes = (appointment.endTime.getTime() - appointment.startTime.getTime()) / (60 * 1000);
  const height = Math.max(durationInMinutes * pixelsPerMinute, 40);

  // Cores sólidas baseadas no terapeuta
  const therapistColor = THERAPIST_COLORS[`therapist-${(therapistIndex % 3) + 1}` as keyof typeof THERAPIST_COLORS];
  
  // Estilos sólidos para status
  const getStatusStyle = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Scheduled:
        return 'bg-white border-slate-200';
      case AppointmentStatus.Completed:
        return 'bg-green-50 border-green-200';
      case AppointmentStatus.Canceled:
        return 'bg-gray-100 border-gray-300';
      case AppointmentStatus.NoShow:
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-white border-slate-200';
    }
  };

  return (
    <AppointmentTooltip appointment={appointment}>
      <div
        onClick={(e) => { e.stopPropagation(); onClick(appointment); }}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onRightClick(appointment, e); }}
        draggable="true"
        onDragStart={(e) => onDragStart(e, appointment)}
        onDragEnd={onDragEnd}
        className={cn(
          "absolute rounded-lg cursor-pointer transition-all duration-200 overflow-hidden flex flex-col border-2 shadow-lg hover:shadow-xl hover:scale-[1.02] font-semibold",
          getStatusStyle(appointment.status),
          isBeingDragged && 'opacity-50 ring-4 ring-blue-400 scale-105',
          appointment.hasConflict && 'ring-4 ring-red-500 ring-opacity-75 animate-pulse'
        )}
        data-testid="appointment-block"
        style={{
          top: `${top}px`,
          height: `${height}px`,
          left: `${therapistIndex * 33.33}%`,
          width: `${33.33}%`,
          zIndex: 50,
          borderLeftColor: therapistColor.border,
          borderLeftWidth: '4px',
          backgroundColor: appointment.status === AppointmentStatus.Completed ? '#F0FDF4' : 
                          appointment.status === AppointmentStatus.Canceled ? '#F9FAFB' :
                          appointment.status === AppointmentStatus.NoShow ? '#FFF7ED' : '#FFFFFF',
          opacity: isBeingDragged ? 0.5 : 1
        }}
      >
        <div className="flex-grow min-h-0 flex flex-col justify-between p-2">
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="font-bold text-sm leading-tight truncate flex-1 text-slate-900">
              {appointment.patientName.split(' ')[0] || appointment.patientName}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {appointment.hasConflict && (
                <span className="text-orange-600 text-base" title={appointment.conflictReason}>
                  ⚠️
                </span>
              )}
              {appointment.paymentStatus === 'paid' && (
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0 shadow-sm"></div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs leading-tight font-mono text-slate-700 font-bold">
              {format(appointment.startTime, 'HH:mm')}
            </div>
            <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">
              {appointment.type.substring(0, 3)}
            </div>
          </div>
        </div>
      </div>
    </AppointmentTooltip>
  );
};

const NewWeeklyView: React.FC<NewWeeklyViewProps> = ({
  currentDate,
  appointments,
  therapists,
  onSlotClick,
  onAppointmentClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  draggedAppointmentId,
  onEdit,
  onDelete,
  onStatusChange,
  onPaymentStatusChange
}) => {
  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekDays = useMemo(() => Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const [contextMenu, setContextMenu] = useState<{
    appointment: EnrichedAppointment;
    position: { x: number; y: number };
  } | null>(null);

  const handleRightClick = (appointment: EnrichedAppointment, e: React.MouseEvent) => {
    setContextMenu({
      appointment,
      position: { x: e.clientX, y: e.clientY }
    });
  };

  const handleDuplicate = (appointment: EnrichedAppointment) => {
    const newStartTime = new Date(appointment.startTime);
    newStartTime.setDate(newStartTime.getDate() + 7);

    onSlotClick(newStartTime, format(newStartTime, 'HH:mm'), appointment.therapistId);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header com informações dos dias */}
      <div className="mb-4">
        <div className="grid grid-cols-6 gap-2">
          {weekDays.map(day => {
            const dayAppointments = appointments.filter(app => isSameDay(app.startTime, day));
            return (
              <Card key={day.toISOString()} className={cn(
                "p-3 transition-all duration-200 hover:shadow-md",
                isToday(day)
                  ? "border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md"
                  : "border border-slate-200 bg-white hover:border-slate-300"
              )}>
                <div className="text-center">
                  <div className={cn(
                    "text-lg font-bold mb-1",
                    isToday(day) ? "text-blue-700" : "text-slate-800"
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className={cn(
                    "text-xs font-semibold uppercase tracking-wide mb-2",
                    isToday(day) ? "text-blue-600" : "text-slate-600"
                  )}>
                    {format(day, 'EEE', { locale: ptBR })}
                  </div>
                  {dayAppointments.length > 0 && (
                    <Badge
                      variant={isToday(day) ? "default" : "secondary"}
                      className={cn(
                        "text-xs h-5 px-2 font-semibold shadow-sm",
                        isToday(day) && "bg-blue-600 hover:bg-blue-700"
                      )}
                    >
                      {dayAppointments.length} {dayAppointments.length === 1 ? 'consulta' : 'consultas'}
                    </Badge>
                  )}
                  <HolidayIndicator date={day} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Grid principal do calendário */}
      <div className="flex-1 flex overflow-hidden rounded-lg shadow-lg border border-slate-200">
        {/* Coluna de horários */}
        <div className="w-20 flex-shrink-0 border-r-2 border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100">
          <div className="h-12 text-center text-sm font-bold text-slate-700 py-3 bg-gradient-to-r from-slate-200 to-slate-300 shadow-sm border-b border-slate-300">
            Hora
          </div>
          {timeSlots.map(time => (
            <div key={time} className={cn(
              "h-12 text-right pr-3 text-xs font-semibold flex items-center justify-end border-b transition-colors",
              time.endsWith('00') ? "border-slate-300 text-slate-700 bg-slate-100/50" : "border-slate-200 text-slate-500"
            )}>
              {time.endsWith('00') ? time : ''}
            </div>
          ))}
        </div>

        {/* Grid dos dias - Design sólido sem transparência */}
        <div className="flex-1 grid grid-cols-6 bg-slate-100 overflow-auto">
          {weekDays.map((day) => {
            const dayAppointments = appointments.filter(app => isSameDay(app.startTime, day));

            return (
              <div key={day.toISOString()} className={cn(
                "relative border-r border-slate-200 last:border-r-0",
                isToday(day) ? "bg-blue-50/30" : "bg-white"
              )}>
                {/* Linhas de horário - mais visíveis mas não sobrepostas */}
                {timeSlots.map(time => (
                  <div
                    key={time}
                    className={cn(
                      "absolute w-full border-b",
                      time.endsWith('00') ? "border-slate-400" : "border-slate-200"
                    )}
                    style={{ 
                      top: `${(parseInt(time.split(':')[0]) - START_HOUR) * 60 * PIXELS_PER_MINUTE}px`, 
                      height: '1px' 
                    }}
                  />
                ))}

                {/* Área de slots para cada terapeuta */}
                <div className="relative" style={{ height: `${(END_HOUR - START_HOUR) * 60 * PIXELS_PER_MINUTE}px` }}>
                  {/* Grid de terapeutas */}
                  <div className="absolute inset-0 grid grid-cols-3">
                    {therapists.slice(0, 3).map((therapist, therapistIndex) => (
                      <div
                        key={therapist.id}
                        className={cn(
                          "border-r border-slate-200 last:border-r-0 hover:bg-blue-50/20 transition-all duration-150",
                          therapistIndex === 0 && "hover:bg-purple-50/20",
                          therapistIndex === 1 && "hover:bg-emerald-50/20",
                          therapistIndex === 2 && "hover:bg-blue-50/20"
                        )}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, day, therapist.id)}
                      >
                        {timeSlots.map((time) => (
                          <div
                            key={time}
                            className={cn(
                              "border-b hover:bg-gradient-to-r transition-all duration-150 cursor-pointer group relative",
                              time.endsWith('00') ? "border-slate-300" : "border-slate-200",
                              "hover:shadow-sm hover:scale-[1.005]",
                              therapistIndex === 0 && "hover:from-purple-50 hover:to-purple-100/30",
                              therapistIndex === 1 && "hover:from-emerald-50 hover:to-emerald-100/30",
                              therapistIndex === 2 && "hover:from-blue-50 hover:to-blue-100/30"
                            )}
                            style={{
                              height: `${SLOT_DURATION * PIXELS_PER_MINUTE}px`,
                              minHeight: '48px'
                            }}
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const clickY = e.clientY - rect.top;
                              const minutesFromTop = clickY / PIXELS_PER_MINUTE;
                              const snappedMinutes = Math.floor(minutesFromTop / SLOT_DURATION) * SLOT_DURATION;
                              const hour = START_HOUR + Math.floor(snappedMinutes / 60);
                              const minute = snappedMinutes % 60;
                              onSlotClick(day, `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`, therapist.id);
                            }}
                          >
                            {/* Indicador de hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-xs font-bold text-slate-400 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                                +
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Agendamentos */}
                  {dayAppointments.map((appointment) => {
                    const therapistIndex = therapists.findIndex(t => t.id === appointment.therapistId);
                    return (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        startHour={START_HOUR}
                        pixelsPerMinute={PIXELS_PER_MINUTE}
                        isBeingDragged={draggedAppointmentId === appointment.id}
                        onClick={onAppointmentClick}
                        onRightClick={handleRightClick}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        therapistIndex={therapistIndex >= 0 ? therapistIndex : 0}
                      />
                    );
                  })}

                  {/* Indicador de tempo atual */}
                  {isToday(day) && <CurrentTimeIndicator />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <AppointmentContextMenu
          appointment={contextMenu.appointment}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onEdit={() => {
            if (onEdit) onEdit(contextMenu.appointment);
          }}
          onDelete={() => {
            if (onDelete) onDelete(contextMenu.appointment.id);
          }}
          onDuplicate={() => handleDuplicate(contextMenu.appointment)}
          onStatusChange={(status) => {
            if (onStatusChange) onStatusChange(contextMenu.appointment, status);
          }}
          onPaymentToggle={() => {
            if (onPaymentStatusChange) {
              const newStatus = contextMenu.appointment.paymentStatus === 'paid' ? 'pending' : 'paid';
              onPaymentStatusChange(contextMenu.appointment, newStatus);
            }
          }}
          onCall={() => {
            if (contextMenu.appointment.patientPhone) {
              window.open(`tel:${contextMenu.appointment.patientPhone}`);
            }
          }}
        />
      )}
    </div>
  );
};

export default NewWeeklyView;
