'use client';

'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { formatDate, formatTime } from '~/lib/utils';
import { DraggableAppointmentCard } from './DraggableAppointmentCard';
import { getAppointments } from '~/lib/actions/agenda';

interface AgendaCalendarViewProps {
  view: 'day' | 'week' | 'month';
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onAppointmentClick?: (id: string) => void;
  onNewAppointment?: (date: Date, time: string) => void;
  therapistId?: string;
  resourceId?: string;
}

export function AgendaCalendarView({
  view,
  currentDate,
  onDateChange,
  onAppointmentClick,
  onNewAppointment,
  therapistId,
  resourceId,
}: AgendaCalendarViewProps) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Calcula range de datas baseado na view
  const dateRange = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    switch (view) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        const dayOfWeek = start.getDay();
        start.setDate(start.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        break;
    }

    return { start, end };
  }, [view, currentDate]);

  // Carrega agendamentos
  useEffect(() => {
    let cancelled = false;
    
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const result = await getAppointments({
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
          therapistId,
          resourceId,
        });

        if (!cancelled && result.data) {
          setAppointments(result.data as any[]);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Erro ao carregar agendamentos:', error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAppointments();

    return () => {
      cancelled = true;
    };
  }, [dateRange, therapistId, resourceId]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (view) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    onDateChange(newDate);
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour < 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const getAppointmentsForSlot = (slot: string) => {
    return appointments.filter((apt) => {
      const aptTime = new Date(apt.start_time);
      const slotTime = new Date(`${currentDate.toISOString().split('T')[0]}T${slot}`);
      return aptTime.toTimeString().startsWith(slot);
    });
  };

  if (view === 'day') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{formatDate(currentDate)}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => onDateChange(new Date())}>
                Hoje
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {getTimeSlots().map((slot) => {
                const slotAppointments = getAppointmentsForSlot(slot);
                return (
                  <div key={slot} className="flex gap-4 border-b pb-2">
                    <div className="w-20 text-sm text-muted-foreground">{slot}</div>
                    <div className="flex-1 space-y-2">
                      {slotAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          onClick={() => onAppointmentClick?.(apt.id)}
                        >
                          <DraggableAppointmentCard
                            appointment={apt}
                          />
                        </div>
                      ))}
                      {slotAppointments.length === 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-muted-foreground"
                          onClick={() => onNewAppointment?.(currentDate, slot)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Novo agendamento
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Views de semana e mês podem ser implementadas similarmente
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualização {view === 'week' ? 'Semanal' : 'Mensal'}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Visualização {view} em desenvolvimento</p>
      </CardContent>
    </Card>
  );
}

