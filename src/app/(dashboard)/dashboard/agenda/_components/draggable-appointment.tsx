'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '~/components/ui/card';
import { formatTime } from '~/lib/utils';

interface DraggableAppointmentProps {
  appointment: any;
  onClick: () => void;
}

export function DraggableAppointment({ appointment, onClick }: DraggableAppointmentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: appointment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="m-1 cursor-grab p-1 text-xs hover:bg-accent active:cursor-grabbing"
      onClick={onClick}
    >
      <div className="font-medium">{appointment.patient?.full_name || 'Paciente'}</div>
      <div className="text-[10px] text-muted-foreground">{formatTime(appointment.start_time)}</div>
    </Card>
  );
}

