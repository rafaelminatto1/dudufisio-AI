'use client';

import { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { formatTime, formatDate } from '~/lib/utils';
import { Card } from '~/components/ui/card';
import { DraggableAppointment } from './draggable-appointment';

interface WeeklyViewProps {
  startDate: Date;
  appointments: any[];
  onAppointmentClick: (appointment: any) => void;
  onSlotClick: (date: Date, time: string) => void;
  onAppointmentMove?: (appointmentId: string, newDate: Date, newTime: string) => void;
}

export function WeeklyView({ 
  startDate, 
  appointments, 
  onAppointmentClick, 
  onSlotClick,
  onAppointmentMove 
}: WeeklyViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const weekDays = useMemo(() => {
    const days = [];
    const start = new Date(startDate);
    start.setDate(start.getDate() - start.getDay()); // Domingo
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  }, [startDate]);

  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 - 20:00

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.start_time);
      return aptDate.toDateString() === day.toDateString();
    });
  };

  const snapToGrid = (hour: number, minute: number) => {
    // Snap to 30-minute intervals
    const snappedMinute = minute < 30 ? 0 : 30;
    return { hour, minute: snappedMinute };
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !onAppointmentMove) return;

    const appointmentId = active.id as string;
    
    // Se over.id é um slot, usar diretamente
    // Caso contrário, encontrar o slot pai
    let slotId: string | null = null;
    
    if (typeof over.id === 'string' && over.id.includes('-')) {
      slotId = over.id;
    } else {
      // Tentar encontrar o elemento do slot
      const overElement = document.getElementById(String(over.id));
      const slotElement = overElement?.closest('[data-slot-id]');
      slotId = slotElement?.getAttribute('data-slot-id') || null;
    }

    if (!slotId) return;

    // Format: "YYYY-MM-DD-HH"
    const parts = slotId.split('-');
    if (parts.length < 4) return;

    const dateStr = `${parts[0]}-${parts[1]}-${parts[2]}`;
    const targetDate = new Date(dateStr);
    const targetHour = parseInt(parts[3], 10);

    const snapped = snapToGrid(targetHour, 0);
    const newDate = new Date(targetDate);
    newDate.setHours(snapped.hour, snapped.minute, 0, 0);

    onAppointmentMove(appointmentId, newDate, `${snapped.hour}:${snapped.minute.toString().padStart(2, '0')}`);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="p-4">
        <div className="grid grid-cols-8 gap-2">
          <div className="sticky left-0 z-10 bg-background"></div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="text-center text-sm font-medium">
              <div>{day.toLocaleDateString('pt-BR', { weekday: 'short' })}</div>
              <div className="text-xs text-muted-foreground">{formatDate(day)}</div>
            </div>
          ))}

          {hours.map((hour) => (
            <>
              <div key={`time-${hour}`} className="sticky left-0 z-10 bg-background text-right text-xs text-muted-foreground">
                {hour}:00
              </div>
              {weekDays.map((day) => {
                const dayAppointments = getAppointmentsForDay(day).filter((apt) => {
                  const aptHour = new Date(apt.start_time).getHours();
                  return aptHour === hour;
                });

                const slotId = `${day.toISOString().split('T')[0]}-${hour}`;

                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    id={slotId}
                    data-slot-id={slotId}
                    className="min-h-[60px] border border-muted"
                  >
                    {dayAppointments.length > 0 ? (
                      <SortableContext items={dayAppointments.map((apt) => apt.id)} strategy={verticalListSortingStrategy}>
                        {dayAppointments.map((apt) => (
                          <DraggableAppointment
                            key={apt.id}
                            appointment={apt}
                            onClick={() => onAppointmentClick(apt)}
                          />
                        ))}
                      </SortableContext>
                    ) : (
                      <button
                        onClick={() => onSlotClick(day, `${hour}:00`)}
                        className="h-full w-full text-transparent hover:bg-muted/50"
                      >
                        +
                      </button>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </DndContext>
  );
}
