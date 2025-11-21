import { createServerComponentClient } from '~/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { formatDate, formatTime } from '~/lib/utils';
import { Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '~/components/ui/button';

export async function PatientNextAppointments({ patientId }: { patientId: string }) {
  const supabase = await createServerComponentClient();

  const today = new Date().toISOString().split('T')[0];

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', patientId)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(5);

  if (!appointments || appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximos Agendamentos
          </CardTitle>
          <CardDescription>Agendamentos futuros</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhum agendamento futuro</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      scheduled: 'default',
      confirmed: 'default',
      completed: 'secondary',
      canceled: 'destructive',
      no_show: 'destructive',
    };
    return variants[status || ''] || 'outline';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Próximos Agendamentos
        </CardTitle>
        <CardDescription>{appointments.length} agendamento(s) futuro(s)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {formatDate((appointment as any).start_time)} às {formatTime((appointment as any).start_time)}
              </p>
              {(appointment as any).title && (
                <p className="text-sm text-muted-foreground">{(appointment as any).title}</p>
              )}
            </div>
            <Badge variant={getStatusBadge(appointment.status)}>
              {appointment.status === 'scheduled' ? 'Agendado' : appointment.status === 'confirmed' ? 'Confirmado' : appointment.status || 'N/A'}
            </Badge>
          </div>
        ))}
        <Link href={`/dashboard/agenda?patient=${patientId}`}>
          <Button variant="link" className="w-full">
            Ver todos os agendamentos
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

