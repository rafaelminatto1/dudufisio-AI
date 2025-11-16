import React from 'react';
import { EnrichedAppointment } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppointmentsWidgetProps {
  appointments: EnrichedAppointment[];
  maxItems?: number;
}

export function AppointmentsWidget({ appointments, maxItems = 5 }: AppointmentsWidgetProps) {
  // Garantir que temos um array válido
  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  
  const upcomingAppointments = safeAppointments
    .filter((app) => new Date(app.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, maxItems);

  if (upcomingAppointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Calendar className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Nenhum agendamento próximo</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {upcomingAppointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={appointment.patientAvatarUrl} />
              <AvatarFallback>
                {appointment.patientName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{appointment.patientName}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {format(new Date(appointment.startTime), 'HH:mm', { locale: ptBR })}
                </span>
                <span>•</span>
                <span>{appointment.type}</span>
              </div>
            </div>

            <Badge variant="outline" className="shrink-0">
              {format(new Date(appointment.startTime), 'dd/MM', { locale: ptBR })}
            </Badge>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

