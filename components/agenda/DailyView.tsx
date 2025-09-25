import React from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { EnrichedAppointment, Therapist } from '../../types';
import AppointmentCard from '../AppointmentCard';
import { cn } from '../../lib/utils';

interface DailyViewProps {
  selectedDate: Date;
  appointments: EnrichedAppointment[];
  therapists: Therapist[];
  onSlotClick: (date: Date, time: string, therapistId: string) => void;
  onAppointmentClick: (appointment: EnrichedAppointment) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, appointment: EnrichedAppointment) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, date: Date, therapistId: string) => void;
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

const DailyView: React.FC<DailyViewProps> = ({
  selectedDate,
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
  const dayAppointments = appointments.filter(app => isSameDay(app.startTime, selectedDate));

  return (
    <div className="flex-1 overflow-hidden">
      <div className="mb-4">
        <h2 className={cn(
          "text-lg font-semibold",
          isToday(selectedDate) ? "text-sky-600" : "text-slate-900"
        )}>
          {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </h2>
        <p className="text-sm text-slate-500">
          {dayAppointments.length} agendamento{dayAppointments.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex gap-4 h-full overflow-auto">
        {therapists.map((therapist) => {
          const therapistAppointments = dayAppointments.filter(app => app.therapistId === therapist.id);

          return (
            <Card key={therapist.id} className="flex-1 min-w-[280px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div
                    className={cn("w-3 h-3 rounded-full", `bg-${therapist.color}-500`)}
                  />
                  {therapist.name}
                  <span className="text-sm font-normal text-slate-500">
                    ({therapistAppointments.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="relative">
                  <div
                    className="relative"
                    style={{ height: `${(END_HOUR - START_HOUR) * 60 * PIXELS_PER_MINUTE}px` }}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, selectedDate, therapist.id)}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickY = e.clientY - rect.top;
                      const minutesFromTop = clickY / PIXELS_PER_MINUTE;
                      const snappedMinutes = Math.floor(minutesFromTop / SLOT_DURATION) * SLOT_DURATION;
                      const hour = START_HOUR + Math.floor(snappedMinutes / 60);
                      const minute = snappedMinutes % 60;
                      onSlotClick(selectedDate, `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`, therapist.id);
                    }}
                  >
                    {timeSlots.map((time, index) => (
                      <div
                        key={time}
                        className="absolute left-0 right-0 border-t border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                        style={{
                          top: `${index * SLOT_DURATION * PIXELS_PER_MINUTE}px`,
                          height: `${SLOT_DURATION * PIXELS_PER_MINUTE}px`
                        }}
                      >
                        {time.endsWith('00') && (
                          <span className="absolute -left-12 -top-2 text-xs text-slate-400 font-medium">
                            {time}
                          </span>
                        )}
                      </div>
                    ))}

                    {therapistAppointments.map(app => (
                      <AppointmentCard
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

                    {isToday(selectedDate) && <CurrentTimeIndicator />}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DailyView;