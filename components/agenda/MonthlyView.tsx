import React from 'react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '../ui/card';
import { EnrichedAppointment, Therapist } from '../../types';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthlyViewProps {
  currentDate: Date;
  appointments: EnrichedAppointment[];
  therapists: Therapist[];
  onDateClick: (date: Date) => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onAppointmentClick?: (appointment: EnrichedAppointment) => void;
}

const MonthlyView: React.FC<MonthlyViewProps> = ({
  currentDate,
  appointments,
  therapists: _therapists,
  onDateClick,
  onPrevMonth,
  onNextMonth,
  onAppointmentClick
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(app => isSameDay(app.startTime, date));
  };

  const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
        </h2>
        <div className="flex items-center gap-2">
          {onPrevMonth && (
            <button
              onClick={onPrevMonth}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <button
            onClick={() => onDateClick(new Date())}
            className="px-4 py-2 text-sm font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Hoje
          </button>
          {onNextMonth && (
            <button
              onClick={onNextMonth}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>

      <Card className="flex-1">
        <CardContent className="p-0">
          <div className="grid grid-cols-7">
            {weekdays.map(day => (
              <div key={day} className="p-4 text-center font-semibold text-slate-600 border-b">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7" style={{ minHeight: '600px' }}>
            {calendarDays.map((date) => {
              const dayAppointments = getAppointmentsForDay(date);
              const isCurrentMonth = date >= monthStart && date <= monthEnd;
              const isCurrentDay = isToday(date);

              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    "p-2 border-r border-b cursor-pointer hover:bg-slate-50 transition-colors min-h-[100px]",
                    !isCurrentMonth && "text-slate-400 bg-slate-50/50",
                    isCurrentDay && "bg-sky-50 border-sky-200",
                    "last:border-r-0"
                  )}
                  onClick={() => onDateClick(date)}
                >
                  <div className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold mb-2",
                    isCurrentDay && "bg-sky-500 text-white",
                    !isCurrentDay && isCurrentMonth && "text-slate-900",
                    !isCurrentMonth && "text-slate-400"
                  )}>
                    {format(date, 'd')}
                  </div>

                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map((appointment) => (
                      <div
                        key={appointment.id}
                        className={cn(
                          "text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity",
                          `bg-${appointment.therapistColor}-500`
                        )}
                        title={`${appointment.patientName} - ${format(appointment.startTime, 'HH:mm')}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick?.(appointment);
                        }}
                      >
                        {format(appointment.startTime, 'HH:mm')} {appointment.patientName}
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-slate-500 font-medium">
                        +{dayAppointments.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyView;