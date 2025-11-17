'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Calendar, Clock, Users, AlertCircle } from 'lucide-react';

interface AgendaStatsProps {
  appointments: any[];
}

export function AgendaStats({ appointments }: AgendaStatsProps) {
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.start_time);
      return aptDate >= today && aptDate < tomorrow;
    });

    const confirmed = todayAppointments.filter((apt) => apt.status === 'confirmado').length;
    const pending = todayAppointments.filter((apt) => apt.status === 'agendado').length;
    const total = todayAppointments.length;
    const conflicts = 0; // TODO: Calcular conflitos

    return { total, confirmed, pending, conflicts };
  }, [appointments]);

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hoje</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">agendamentos hoje</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.confirmed}</div>
          <p className="text-xs text-muted-foreground">confirmados hoje</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending}</div>
          <p className="text-xs text-muted-foreground">aguardando confirmação</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conflitos</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.conflicts}</div>
          <p className="text-xs text-muted-foreground">conflitos detectados</p>
        </CardContent>
      </Card>
    </div>
  );
}

