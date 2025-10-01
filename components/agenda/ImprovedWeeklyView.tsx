import React, { useState } from 'react';
import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns';
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
    const baseStyles = {
      purple: 'bg-purple-600 border-purple-700 hover:bg-purple-700 shadow-sm',
      emerald: 'bg-emerald-600 border-emerald-700 hover:bg-emerald-700 shadow-sm',
      blue: 'bg-blue-600 border-blue-700 hover:bg-blue-700 shadow-sm',
      amber: 'bg-amber-600 border-amber-700 hover:bg-amber-700 shadow-sm',
      red: 'bg-red-600 border-red-700 hover:bg-red-700 shadow-sm',
      indigo: 'bg-indigo-600 border-indigo-700 hover:bg-indigo-700 shadow-sm',
      teal: 'bg-teal-600 border-teal-700 hover:bg-teal-700 shadow-sm',
      sky: 'bg-sky-600 border-sky-700 hover:bg-sky-700 shadow-sm',
    };

    const statusStyles = {
      scheduled: '',
      confirmed: 'ring-2 ring-green-400',
      completed: 'opacity-80',
      cancelled: 'opacity-60 bg-slate-500 border-slate-600',
      no_show: 'opacity-70 bg-orange-500 border-orange-600',
    };

    const colorStyle = baseStyles[color as keyof typeof baseStyles] || 'bg-slate-600 border-slate-700 hover:bg-slate-700 shadow-sm';
    const statusStyle = statusStyles[status] || '';

    return `${colorStyle} ${statusStyle}`;
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
          "absolute p-1 rounded-md text-white cursor-pointer transition-all overflow-hidden flex flex-col border-l-2 hover:shadow-md hover:scale-[1.01]",
          getAppointmentStyle(appointment.therapistColor, appointment.status),
          isBeingDragged && 'opacity-50 ring-2 ring-blue-400 scale-105'
        )}
        data-testid="appointment-block"
        style={{
          top: `${top}px`,
          height: `${height}px`,
          width: `${width}%`,
          left: `${leftOffset}%`,
          zIndex: 20
        }}
      >
        <div className="flex-grow min-h-0 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm leading-tight truncate flex-1" data-testid="appointment-text">
              {appointment.patientName.split(' ')[0] || appointment.patientName}
            </div>
            {appointment.paymentStatus === 'paid' && (
              <div className="w-2 h-2 bg-green-300 rounded-full ml-1 flex-shrink-0"></div>
            )}
          </div>
          <div className="text-xs opacity-95 leading-tight font-mono">
            {format(appointment.startTime, 'HH:mm')}
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
      {/* Header with day info - Compact design */}
      <div className="mb-3">
        <div className="grid grid-cols-6 gap-0.5 bg-slate-200 ml-2">
          {weekDays.map(day => {
            const dayAppointments = appointments.filter(app => isSameDay(app.startTime, day));
            return (
              <Card key={day.toISOString()} className={cn(
                "p-2 transition-colors",
                isToday(day) ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-white"
              )} data-testid="day-header">
                <div className="text-center">
                  <div className={cn(
                    "text-sm font-bold",
                    isToday(day) ? "text-sky-700" : "text-slate-800"
                  )}>
                    {format(day, 'd')}/{format(day, 'EEE', { locale: ptBR }).slice(0, 3)}
                  </div>
                  {dayAppointments.length > 0 && (
                    <Badge 
                      variant={isToday(day) ? "default" : "secondary"} 
                      className="mt-1 text-xs h-4 px-1.5"
                    >
                      {dayAppointments.length}
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
      <div className="flex-1 flex overflow-hidden">
        {/* Time column - Compact design */}
        <div className="w-20 flex-shrink-0 border-r bg-slate-50/50 ml-2">
          <div className="h-8 text-center text-xs font-semibold text-slate-600 py-1">Hora</div>
          {timeSlots.map(time => (
            <div key={time} className="h-8 text-right pr-4 text-xs text-slate-500 font-medium flex items-center border-b border-slate-200">
              {time.endsWith('00') ? time : ''}
            </div>
          ))}
        </div>

        {/* Days grid - Improved design */}
        <div className="flex-1 grid grid-cols-6 gap-0.5 bg-slate-200 overflow-auto scroll-smooth ml-2" data-testid="calendar-grid">
          {weekDays.map((day) => {
            const dayAppointments = appointments.filter(app => isSameDay(app.startTime, day));
            const groupedAppointments = groupOverlappingAppointments(dayAppointments);

            return (
              <div key={day.toISOString()} className="bg-white relative">
                {/* Time lines for each hour */}
                {timeSlots.map(time => (
                  <div key={time} className="absolute w-full border-b border-slate-200" style={{ top: `${(parseInt(time.split(':')[0]) - START_HOUR) * 60 * PIXELS_PER_MINUTE}px`, height: '1px' }}></div>
                ))}

                {/* Time slots with improved drop zones */}
                <div className="relative" style={{ height: `${(END_HOUR - START_HOUR) * 60 * PIXELS_PER_MINUTE}px` }}>
                  {/* Drop zones para cada terapeuta */}
                  <div className="absolute inset-0 grid grid-cols-3">
                    {therapists.slice(0, 3).map((therapist) => (
                      <div
                        key={therapist.id}
                        className="border-r border-slate-300 last:border-r-0"
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, day, therapist.id)}
                      >
                        {timeSlots.map((time) => (
                          <div
                            key={time}
                            className={cn(
                              "border-t border-slate-100 hover:bg-blue-50 transition-colors cursor-pointer",
                              time.endsWith('00') ? "border-slate-200" : "border-slate-100"
                            )}
                            style={{
                              height: `${SLOT_DURATION * PIXELS_PER_MINUTE}px`,
                              minHeight: '32px' // Altura mínima para slots
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
                          />
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