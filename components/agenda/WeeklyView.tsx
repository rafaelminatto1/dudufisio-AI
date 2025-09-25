import React from 'react';
import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { EnrichedAppointment, Therapist } from '../../types';
import { cn } from '../../lib/utils';

interface WeeklyViewProps {
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
}

const START_HOUR = 7;
const END_HOUR = 21;
const SLOT_DURATION = 30;
const PIXELS_PER_MINUTE = 2;

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
      <div className="relative h-px bg-red-500">
        <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
      </div>
    </div>
  );
};

const ImprovedAppointmentCard: React.FC<{
  appointment: EnrichedAppointment;
  startHour: number;
  pixelsPerMinute: number;
  isBeingDragged: boolean;
  onClick: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}> = ({ appointment, startHour, pixelsPerMinute, isBeingDragged, onClick, onDragStart, onDragEnd }) => {
  const top = ((appointment.startTime.getHours() - startHour) * 60 + appointment.startTime.getMinutes()) * pixelsPerMinute;
  const durationInMinutes = (appointment.endTime.getTime() - appointment.startTime.getTime()) / (60 * 1000);
  const height = Math.max(durationInMinutes * pixelsPerMinute, 40); // Min height for better visibility

  const getAppointmentStyle = (color: string) => {
    switch (color) {
      case 'purple': return 'bg-purple-500 border-purple-600 hover:bg-purple-600';
      case 'emerald': return 'bg-emerald-500 border-emerald-600 hover:bg-emerald-600';
      case 'blue': return 'bg-blue-500 border-blue-600 hover:bg-blue-600';
      case 'amber': return 'bg-amber-500 border-amber-600 hover:bg-amber-600';
      case 'red': return 'bg-red-500 border-red-600 hover:bg-red-600';
      case 'indigo': return 'bg-indigo-500 border-indigo-600 hover:bg-indigo-600';
      case 'teal': return 'bg-teal-500 border-teal-600 hover:bg-teal-600';
      case 'sky': return 'bg-sky-500 border-sky-600 hover:bg-sky-600';
      default: return 'bg-slate-500 border-slate-600 hover:bg-slate-600';
    }
  };

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      draggable="true"
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "absolute left-1 right-1 p-2 rounded-lg text-white text-xs cursor-pointer transition-all overflow-hidden flex flex-col border-l-4 shadow-sm",
        getAppointmentStyle(appointment.therapistColor),
        isBeingDragged && 'opacity-50 ring-2 ring-sky-400 scale-105'
      )}
      style={{ top: `${top}px`, height: `${height}px`, zIndex: 20 }}
    >
      <div className="flex-grow min-h-0 flex flex-col">
        <div className="font-semibold text-sm truncate leading-tight">
          {appointment.patientName}
        </div>
        {height > 60 && (
          <>
            <div className="text-xs opacity-90 truncate">
              {appointment.type}
            </div>
            <div className="text-xs opacity-80 mt-auto">
              {format(appointment.startTime, 'HH:mm')} - {format(appointment.endTime, 'HH:mm')}
            </div>
          </>
        )}
        {height <= 60 && height > 30 && (
          <div className="text-xs opacity-80">
            {format(appointment.startTime, 'HH:mm')}
          </div>
        )}
      </div>
    </div>
  );
};

const WeeklyView: React.FC<WeeklyViewProps> = ({
  currentDate,
  appointments,
  therapists,
  onSlotClick,
  onAppointmentClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  draggedAppointmentId
}) => {
  const weekStart = React.useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekDays = React.useMemo(() => Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)), [weekStart]); // Segunda a Sábado

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header with therapist names */}
      <div className="mb-4">
        <div className="grid grid-cols-6 gap-2">
          {weekDays.map(day => {
            const dayAppointments = appointments.filter(app => isSameDay(app.startTime, day));
            return (
              <Card key={day.toISOString()} className={cn(isToday(day) && "border-sky-300 bg-sky-50")}>
                <CardHeader className="pb-2">
                  <CardTitle className={cn(
                    "text-center text-sm font-semibold",
                    isToday(day) ? "text-sky-600" : "text-slate-700"
                  )}>
                    <div>{format(day, 'EEE', { locale: ptBR })}</div>
                    <div className="text-2xl mt-1">{format(day, 'd')}</div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-2">
                  <div className="text-center text-xs text-slate-500">
                    {dayAppointments.length} agendamento{dayAppointments.length !== 1 ? 's' : ''}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Main calendar grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Time column */}
        <div className="w-16 flex-shrink-0 border-r bg-slate-50">
          <div className="h-12"></div> {/* Header spacer */}
          {timeSlots.map(time => (
            <div key={time} className="h-12 text-right pr-2 text-xs text-slate-400 font-medium flex items-start pt-1">
              {time.endsWith('00') ? time : ''}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="flex-1 grid grid-cols-6 gap-px bg-slate-200 overflow-auto">
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="bg-white">
              {/* Therapist header */}
              <div className="h-12 border-b border-slate-200 bg-slate-50 px-2 py-1">
                <div className="grid grid-cols-3 gap-1 h-full">
                  {therapists.slice(0, 3).map((therapist) => (
                    <div
                      key={therapist.id}
                      className={cn(
                        "text-xs font-medium text-center rounded px-1 py-1 truncate text-white",
                        `bg-${therapist.color}-500`
                      )}
                      title={therapist.name}
                    >
                      {therapist.name.split(' ')[0] || therapist.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Time slots */}
              <div className="relative" style={{ height: `${(END_HOUR - START_HOUR) * 60 * PIXELS_PER_MINUTE}px` }}>
                {timeSlots.map((time, index) => (
                  <div
                    key={time}
                    className="absolute left-0 right-0 border-t border-slate-100 hover:bg-blue-50 transition-colors cursor-pointer"
                    style={{
                      top: `${index * SLOT_DURATION * PIXELS_PER_MINUTE}px`,
                      height: `${SLOT_DURATION * PIXELS_PER_MINUTE}px`
                    }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickY = e.clientY - rect.top;
                      const minutesFromTop = clickY / PIXELS_PER_MINUTE;
                      const snappedMinutes = Math.floor(minutesFromTop / SLOT_DURATION) * SLOT_DURATION;
                      const hour = START_HOUR + Math.floor(snappedMinutes / 60);
                      const minute = snappedMinutes % 60;
                      onSlotClick(day, `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`, therapists[0]?.id || '');
                    }}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, day, therapists[0]?.id || '')}
                  />
                ))}

                {/* Appointments for this day */}
                {appointments
                  .filter(app => isSameDay(app.startTime, day))
                  .map(app => (
                    <ImprovedAppointmentCard
                      key={app.id}
                      appointment={app}
                      startHour={START_HOUR}
                      pixelsPerMinute={PIXELS_PER_MINUTE}
                      isBeingDragged={draggedAppointmentId === app.id}
                      onClick={() => onAppointmentClick(app)}
                      onDragStart={(e) => onDragStart(e, app)}
                      onDragEnd={onDragEnd}
                    />
                  ))}

                {isToday(day) && <CurrentTimeIndicator />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyView;