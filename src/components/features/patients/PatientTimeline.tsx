import { createServerComponentClient } from '~/lib/supabase/server';
import { formatDate, formatDateTime } from '~/lib/utils';
import { Calendar, FileText, Scale, Target, AlertTriangle } from 'lucide-react';
import { cn } from '~/lib/utils';

export async function PatientTimeline({ patientId }: { patientId: string }) {
  const supabase = await createServerComponentClient();

  // Busca eventos de diferentes tabelas
  const [evolutions, appointments, surgeries, goals] = await Promise.all([
    supabase
      .from('session_evolutions')
      .select('id, created_at, session_date')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('appointments')
      .select('id, scheduled_at, status')
      .eq('patient_id', patientId)
      .order('scheduled_at', { ascending: false })
      .limit(20),
    (supabase as any)
      .from('surgeries')
      .select('id, surgery_date, surgery_name')
      .eq('patient_id', patientId)
      .order('surgery_date', { ascending: false })
      .limit(10),
    (supabase as any)
      .from('patient_goals')
      .select('id, created_at, target_date, title, status')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  // Combina todos os eventos em uma timeline
  const events: Array<{
    id: string;
    date: string;
    type: 'evolution' | 'appointment' | 'surgery' | 'goal';
    title: string;
    description?: string;
    icon: React.ReactNode;
  }> = [];

  evolutions.data?.forEach((evo: any) => {
    events.push({
      id: evo.id,
      date: evo.created_at || new Date().toISOString(),
      type: 'evolution',
      title: 'Evolução de Sessão',
      description: 'Evolução registrada',
      icon: <FileText className="h-4 w-4" />,
    });
  });

  appointments.data?.forEach((apt: any) => {
    events.push({
      id: apt.id,
      date: apt.scheduled_at,
      type: 'appointment',
      title: 'Agendamento',
      description: `Status: ${apt.status}`,
      icon: <Calendar className="h-4 w-4" />,
    });
  });

  surgeries.data?.forEach((surgery) => {
    events.push({
      id: surgery.id,
      date: surgery.surgery_date,
      type: 'surgery',
      title: surgery.surgery_name,
      description: 'Cirurgia realizada',
      icon: <Scale className="h-4 w-4" />,
    });
  });

  goals.data?.forEach((goal) => {
    events.push({
      id: goal.id,
      date: (goal as any).achieved_date || goal.created_at || new Date().toISOString(),
      type: 'goal',
      title: goal.title,
      description: goal.status === 'alcancado' ? 'Objetivo alcançado' : 'Objetivo criado',
      icon: <Target className="h-4 w-4" />,
    });
  });

  // Ordena por data (mais recente primeiro)
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getTypeColor = (type: string) => {
    const colors = {
      evolution: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
      appointment: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
      surgery: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
      goal: 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300',
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
      <div className="space-y-6">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground pl-8">Nenhum evento registrado</p>
        ) : (
          events.map((event, index) => (
            <div key={event.id} className="relative flex gap-4">
              <div className={cn('relative z-10 flex h-8 w-8 items-center justify-center rounded-full', getTypeColor(event.type))}>
                {event.icon}
              </div>
              <div className="flex-1 space-y-1 pb-6">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(event.date)}</p>
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

