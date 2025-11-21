'use client';

import { useState } from 'react';
import { Card } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { formatTime } from '~/lib/utils';
import { GripVertical } from 'lucide-react';
import { cn } from '~/lib/utils';

interface DraggableAppointmentCardProps {
  appointment: {
    id: string;
    title: string;
    start_time: string;
    end_time?: string;
    status: string;
    patient_name?: string;
  };
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
  className?: string;
}

export function DraggableAppointmentCard({
  appointment,
  onDragStart,
  onDragEnd,
  className,
}: DraggableAppointmentCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      no_show: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('appointmentId', appointment.id);
    onDragStart?.(appointment.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd?.();
  };

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        'cursor-move p-3 transition-all hover:shadow-md',
        isDragging && 'opacity-50',
        className
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground mt-1" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="font-medium text-sm truncate">{appointment.title || appointment.patient_name}</p>
            <Badge className={cn('text-xs', getStatusColor(appointment.status))}>
              {appointment.status === 'scheduled' ? 'Agendado' :
               appointment.status === 'confirmed' ? 'Confirmado' :
               appointment.status === 'completed' ? 'Concluído' :
               appointment.status === 'cancelled' ? 'Cancelado' :
               appointment.status === 'no_show' ? 'Falta' : appointment.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatTime(appointment.start_time)}
            {appointment.end_time && ` - ${formatTime(appointment.end_time)}`}
          </p>
        </div>
      </div>
    </Card>
  );
}

