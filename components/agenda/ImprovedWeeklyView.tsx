import React, { useState } from 'react';
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

interface ImprovedWeeklyViewProps {
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
const END_HOUR = 21;
const SLOT_DURATION = 30;
const PIXELS_PER_MINUTE = 1.5; // Reduzido de 2 para 1.5 para blocos mais compactos

const timeSlots = Array.from({ length: (END_HOUR - START_HOUR) * (60 / SLOT_DURATION) }, (_, i) => {
  const totalMinutes = START_HOUR * 60 + i * SLOT_DURATION;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

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
    <div className="absolute left-0 right-0 z-10 pointer-events-none" style={{ top: `${top}px` }}>
      <div className="relative h-0.5 bg-red-500">
        <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
      </div>
    </div>
  );
};

// Função para agrupar agendamentos que se sobrepõem por terapeuta
const groupOverlappingAppointments = (appointments: EnrichedAppointment[]) => {
  const groupedByTherapist: { [therapistId: string]: EnrichedAppointment[] } = {};

  // Agrupar por terapeuta
  appointments.forEach(app => {
    if (!groupedByTherapist[app.therapistId]) {
      groupedByTherapist[app.therapistId] = [];
    }
    groupedByTherapist[app.therapistId]!.push(app);
  });

  const result: Array<{
    appointments: EnrichedAppointment[];
    therapistId: string;
    startTime: Date;
    endTime: Date;
    width: number;
    leftOffset: number;
  }> = [];

  // Para cada terapeuta, organizar agendamentos
  Object.entries(groupedByTherapist).forEach(([therapistId, therapistApps], therapistIndex) => {
    therapistApps.forEach((app, index) => {
      const overlapping = therapistApps.filter(otherApp =>
        otherApp.id !== app.id &&
        app.startTime < otherApp.endTime &&
        app.endTime > otherApp.startTime
      );

      const totalOverlapping = overlapping.length + 1;
      const width = 100 / Math.max(totalOverlapping, 1);
      const leftOffset = (index % totalOverlapping) * width;

      result.push({
        appointments: [app],
        therapistId,
        startTime: app.startTime,
        endTime: app.endTime,
        width,
        leftOffset: leftOffset / 3 + (therapistIndex * 33.333) // Dividir por terapeuta
      });
    });
  });

  return result;
};

const MultiTherapistAppointmentCard: React.FC<{
  appointments: EnrichedAppointment[];
  startHour: number;
  pixelsPerMinute: number;
  isBeingDragged: boolean;
  onClick: (appointment: EnrichedAppointment) => void;
  onRightClick: (appointment: EnrichedAppointment, e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, appointment: EnrichedAppointment) => void;
  onDragEnd: () => void;
  width: number;
  leftOffset: number;
  therapistId: string;
}> = ({
  appointments,
  startHour,
  pixelsPerMinute,
  isBeingDragged,
  onClick,
  onRightClick,
  onDragStart,
  onDragEnd,
  width,
  leftOffset
}) => {
  const appointment = appointments[0]; // Apenas um agendamento por card agora
  if (!appointment) return null;

  const top = ((appointment.startTime.getHours() - startHour) * 60 + appointment.startTime.getMinutes()) * pixelsPerMinute;
  const durationInMinutes = (appointment.endTime.getTime() - appointment.startTime.getTime()) / (60 * 1000);
  const height = Math.max(durationInMinutes * pixelsPerMinute, 28); // Reduzido de 40 para 28

  const getAppointmentStyle = (color: string, status: AppointmentStatus) => {
    // Nova paleta FisioFlow com gradientes vibrantes
    const baseStyles = {
      purple: 'bg-gradient-to-br from-fisio-primary-500 to-fisio-primary-700 hover:from-fisio-primary-600 hover:to-fisio-primary-800 shadow-lg border-fisio-primary-400',
      emerald: 'bg-gradient-to-br from-fisio-secondary-500 to-fisio-secondary-700 hover:from-fisio-secondary-600 hover:to-fisio-secondary-800 shadow-lg border-fisio-secondary-400',
      blue: 'bg-gradient-to-br from-fisio-primary-400 to-fisio-primary-600 hover:from-fisio-primary-500 hover:to-fisio-primary-700 shadow-lg border-fisio-primary-300',
      amber: 'bg-gradient-to-br from-fisio-warning-500 to-fisio-warning-700 hover:from-fisio-warning-600 hover:to-fisio-warning-800 shadow-lg border-fisio-warning-400',
      red: 'bg-gradient-to-br from-fisio-error-500 to-fisio-error-700 hover:from-fisio-error-600 hover:to-fisio-error-800 shadow-lg border-fisio-error-400',
      indigo: 'bg-gradient-to-br from-fisio-primary-600 to-fisio-primary-800 hover:from-fisio-primary-700 hover:to-fisio-primary-900 shadow-lg border-fisio-primary-500',
      teal: 'bg-gradient-to-br from-fisio-secondary-400 to-fisio-secondary-600 hover:from-fisio-secondary-500 hover:to-fisio-secondary-700 shadow-lg border-fisio-secondary-300',
      sky: 'bg-gradient-to-br from-fisio-primary-300 to-fisio-primary-500 hover:from-fisio-primary-400 hover:to-fisio-primary-600 shadow-lg border-fisio-primary-200',
      pink: 'bg-gradient-to-br from-fisio-primary-400 to-fisio-primary-600 hover:from-fisio-primary-500 hover:to-fisio-primary-700 shadow-lg border-fisio-primary-300',
      rose: 'bg-gradient-to-br from-fisio-error-400 to-fisio-error-600 hover:from-fisio-error-500 hover:to-fisio-error-700 shadow-lg border-fisio-error-300',
      cyan: 'bg-gradient-to-br from-fisio-secondary-300 to-fisio-secondary-500 hover:from-fisio-secondary-400 hover:to-fisio-secondary-600 shadow-lg border-fisio-secondary-200',
    };

    // Map status enum values to CSS classes - com gradientes vibrantes usando paleta FisioFlow
    const getStatusStyle = (status: AppointmentStatus): string => {
      switch (status) {
        case AppointmentStatus.Scheduled:
          return ''; // Default style - cores vivas com gradiente
        case AppointmentStatus.Completed:
          return 'bg-gradient-to-br from-fisio-secondary-500 to-fisio-secondary-700 hover:from-fisio-secondary-600 hover:to-fisio-secondary-800 border-fisio-secondary-400'; // Verde vibrante
        case AppointmentStatus.Canceled:
          return 'bg-gradient-to-br from-fisio-neutral-500 to-fisio-neutral-700 hover:from-fisio-neutral-600 hover:to-fisio-neutral-800 border-fisio-neutral-400'; // Cinza sólido
        case AppointmentStatus.NoShow:
          return 'bg-gradient-to-br from-fisio-warning-400 to-fisio-warning-600 hover:from-fisio-warning-500 hover:to-fisio-warning-700 border-fisio-warning-300'; // Laranja vibrante
        default:
          return '';
      }
    };

    const colorStyle = baseStyles[color as keyof typeof baseStyles] || 'bg-gradient-to-br from-fisio-neutral-500 to-fisio-neutral-700 hover:from-fisio-neutral-600 hover:to-fisio-neutral-800 shadow-lg border-fisio-neutral-400';
    const statusStyle = getStatusStyle(status);

    return statusStyle || colorStyle;
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
          "absolute p-2 rounded-lg text-white cursor-pointer transition-all overflow-hidden flex flex-col border-l-4 hover:shadow-xl hover:scale-[1.03] font-semibold",
          getAppointmentStyle(appointment.therapistColor, appointment.status),
          isBeingDragged && 'opacity-50 ring-4 ring-blue-400 scale-105',
          appointment.hasConflict && 'ring-4 ring-red-500 ring-opacity-75 animate-pulse'
        )}
        data-testid="appointment-block"
        style={{
          top: `${top}px`,
          height: `${height}px`,
          width: `${width}%`,
          left: `${leftOffset}%`,
          zIndex: 50
        }}
      >
        <div className="flex-grow min-h-0 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="font-bold text-sm leading-tight truncate flex-1 drop-shadow-sm" data-testid="appointment-text">
              {appointment.patientName.split(' ')[0] || appointment.patientName}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {appointment.hasConflict && (
                <span className="text-yellow-200 text-base drop-shadow-md" title={appointment.conflictReason}>
                  ⚠️
                </span>
              )}
              {appointment.paymentStatus === 'paid' && (
                <div className="w-2.5 h-2.5 bg-green-300 rounded-full flex-shrink-0 ring-2 ring-white shadow-md"></div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs leading-tight font-mono text-white/90 font-bold drop-shadow-sm">
              {format(appointment.startTime, 'HH:mm')}
            </div>
            <div className="text-[10px] font-semibold text-white/80 uppercase tracking-wide">
              {appointment.type.substring(0, 3)}
            </div>
          </div>
        </div>
      </div>
    </AppointmentTooltip>
  );
};

const ImprovedWeeklyView: React.FC<ImprovedWeeklyViewProps> = ({
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
  const weekStart = React.useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekDays = React.useMemo(() => Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)), [weekStart]); // Segunda a Sábado

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
    newStartTime.setDate(newStartTime.getDate() + 7); // Próxima semana

    const newEndTime = new Date(appointment.endTime);
    newEndTime.setDate(newEndTime.getDate() + 7);

    // Unused variable removed: newAppointment
    // const newAppointment = {
    //   ...appointment,
    //   id: `app_${Date.now()}`,
    //   startTime: newStartTime,
    //   endTime: newEndTime
    // };

    onSlotClick(newStartTime, format(newStartTime, 'HH:mm'), appointment.therapistId);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header with day info - Modern design with gradients */}
      <div className="mb-4">
        <div className="grid grid-cols-6 gap-1 ml-2">
          {weekDays.map(day => {
            const dayAppointments = appointments.filter(app => isSameDay(app.startTime, day));
            return (
              <Card key={day.toISOString()} className={cn(
                "p-3 transition-all duration-200 hover:shadow-md",
                isToday(day)
                  ? "border-2 border-fisio-primary-DEFAULT bg-gradient-to-br from-fisio-primary-50 to-fisio-primary-100 shadow-md"
                  : "border border-fisio-neutral-200 bg-gradient-to-br from-white to-fisio-neutral-50 hover:border-fisio-neutral-300"
              )} data-testid="day-header">
                <div className="text-center">
                  <div className={cn(
                    "text-base font-bold mb-1",
                    isToday(day) ? "text-fisio-primary-700" : "text-fisio-neutral-800"
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className={cn(
                    "text-xs font-semibold uppercase tracking-wide mb-1",
                    isToday(day) ? "text-fisio-primary-600" : "text-fisio-neutral-600"
                  )}>
                    {format(day, 'EEE', { locale: ptBR }).slice(0, 3)}
                  </div>
                  {dayAppointments.length > 0 && (
                    <Badge
                      variant={isToday(day) ? "default" : "secondary"}
                      className={cn(
                        "text-xs h-5 px-2 font-semibold shadow-sm",
                        isToday(day) && "bg-fisio-primary-DEFAULT hover:bg-fisio-primary-600"
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

      {/* Main calendar grid */}
      <div className="flex-1 flex overflow-hidden rounded-lg shadow-md">
        {/* Time column - Modern design */}
        <div className="w-20 flex-shrink-0 border-r-2 border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100 ml-2">
          <div className="h-10 text-center text-xs font-bold text-slate-700 py-2 bg-gradient-to-r from-slate-200 to-slate-300 shadow-sm">
            Hora
          </div>
          {timeSlots.map(time => (
            <div key={time} className={cn(
              "h-8 text-right pr-3 text-xs font-semibold flex items-center justify-end border-b transition-colors",
              time.endsWith('00') ? "border-slate-300 text-slate-700 bg-slate-100/50" : "border-slate-200 text-slate-500"
            )}>
              {time.endsWith('00') ? time : ''}
            </div>
          ))}
        </div>

        {/* Days grid - Modern design with better contrast */}
        <div className="flex-1 grid grid-cols-6 gap-1 bg-slate-200 overflow-auto scroll-smooth ml-2 p-1 rounded-r-lg" data-testid="calendar-grid">
          {weekDays.map((day) => {
            const dayAppointments = appointments.filter(app => isSameDay(app.startTime, day));
            const groupedAppointments = groupOverlappingAppointments(dayAppointments);

            return (
              <div key={day.toISOString()} className={cn(
                "relative shadow-md rounded-md overflow-hidden",
                isToday(day) ? "bg-blue-50/50" : "bg-white"
              )}>
                {/* Time lines for each hour - More visible */}
                {timeSlots.map(time => (
                  <div
                    key={time}
                    className={cn(
                      "absolute w-full border-b transition-colors",
                      time.endsWith('00') ? "border-slate-300" : "border-slate-200"
                    )}
                    style={{ top: `${(parseInt(time.split(':')[0]) - START_HOUR) * 60 * PIXELS_PER_MINUTE}px`, height: '1px' }}
                  ></div>
                ))}

                {/* Time slots with improved drop zones */}
                <div className="relative" style={{ height: `${(END_HOUR - START_HOUR) * 60 * PIXELS_PER_MINUTE}px` }}>
                  {/* Drop zones para cada terapeuta */}
                  <div className="absolute inset-0 grid grid-cols-3">
                    {therapists.slice(0, 3).map((therapist, therapistIndex) => (
                      <div
                        key={therapist.id}
                        className={cn(
                          "border-r-2 last:border-r-0 hover:bg-blue-50/30 transition-all duration-150",
                          therapistIndex === 0 && "border-purple-200",
                          therapistIndex === 1 && "border-emerald-200",
                          therapistIndex === 2 && "border-blue-200"
                        )}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, day, therapist.id)}
                      >
                        {timeSlots.map((time) => (
                          <div
                            key={time}
                            className={cn(
                              "border-t hover:bg-gradient-to-r transition-all duration-150 cursor-pointer group relative",
                              time.endsWith('00') ? "border-slate-300" : "border-slate-200",
                              "hover:shadow-md hover:scale-[1.01]",
                              therapistIndex === 0 && "hover:from-purple-50 hover:to-purple-100/50",
                              therapistIndex === 1 && "hover:from-emerald-50 hover:to-emerald-100/50",
                              therapistIndex === 2 && "hover:from-blue-50 hover:to-blue-100/50"
                            )}
                            style={{
                              height: `${SLOT_DURATION * PIXELS_PER_MINUTE}px`,
                              minHeight: '32px'
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
                            {/* Hover indicator */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-[10px] font-bold text-slate-400">+</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Appointments */}
                  {groupedAppointments.map((group) => (
                    group.appointments[0] && <MultiTherapistAppointmentCard
                      key={group.appointments[0].id}
                      appointments={group.appointments}
                      startHour={START_HOUR}
                      pixelsPerMinute={PIXELS_PER_MINUTE}
                      isBeingDragged={draggedAppointmentId === group.appointments[0].id}
                      onClick={onAppointmentClick}
                      onRightClick={handleRightClick}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                      width={group.width}
                      leftOffset={group.leftOffset}
                      therapistId={group.therapistId}
                    />
                  ))}

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

export default ImprovedWeeklyView;