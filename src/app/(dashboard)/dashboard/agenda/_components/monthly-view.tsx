'use client';

import { useMemo } from 'react';
import { formatDate } from '~/lib/utils';
import { Card } from '~/components/ui/card';

interface MonthlyViewProps {
  month: Date;
  appointments: any[];
  onAppointmentClick: (appointment: any) => void;
  onDateClick: (date: Date) => void;
}

export function MonthlyView({ month, appointments, onAppointmentClick, onDateClick }: MonthlyViewProps) {
  const calendarDays = useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Domingo

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  }, [month]);

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.start_time);
      return aptDate.toDateString() === day.toDateString();
    });
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="p-4">
      <div className="mb-4 text-center text-lg font-semibold">
        {month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium">
            {day}
          </div>
        ))}
        {calendarDays.map((day) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isCurrentMonth = day.getMonth() === month.getMonth();

          return (
            <Card
              key={day.toISOString()}
              className={`min-h-[80px] cursor-pointer p-2 hover:bg-accent ${
                !isCurrentMonth ? 'opacity-50' : ''
              }`}
              onClick={() => onDateClick(day)}
            >
              <div className="text-sm font-medium">{day.getDate()}</div>
              {dayAppointments.length > 0 && (
                <div className="mt-1 text-xs text-muted-foreground">{dayAppointments.length} agendamentos</div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

