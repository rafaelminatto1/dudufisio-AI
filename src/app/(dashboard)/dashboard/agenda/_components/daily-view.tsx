'use client';

import { formatTime, formatDate } from '~/lib/utils';
import { Card } from '~/components/ui/card';

interface DailyViewProps {
  date: Date;
  appointments: any[];
  onAppointmentClick: (appointment: any) => void;
  onSlotClick: (time: string) => void;
}

export function DailyView({ date, appointments, onAppointmentClick, onSlotClick }: DailyViewProps) {
  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 - 20:00
  const dayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.start_time);
    return aptDate.toDateString() === date.toDateString();
  });

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-semibold">{formatDate(date)}</h2>
      <div className="space-y-2">
        {hours.map((hour) => {
          const slotAppointments = dayAppointments.filter((apt) => {
            const aptHour = new Date(apt.start_time).getHours();
            return aptHour === hour;
          });

          return (
            <div key={hour} className="flex gap-4">
              <div className="w-20 text-sm text-muted-foreground">{hour}:00</div>
              <div className="flex-1">
                <button
                  onClick={() => onSlotClick(`${hour}:00`)}
                  className="mb-1 w-full rounded border border-dashed border-muted-foreground/30 p-2 text-left text-sm text-muted-foreground hover:border-primary hover:text-primary"
                >
                  + Adicionar
                </button>
                {slotAppointments.map((apt) => (
                  <Card
                    key={apt.id}
                    className="mb-1 cursor-pointer p-2 hover:bg-accent"
                    onClick={() => onAppointmentClick(apt)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{apt.patient?.full_name || 'Paciente'}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">{apt.status}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

