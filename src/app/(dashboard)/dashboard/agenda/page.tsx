import { Suspense } from 'react';
import { createServerComponentClient } from '~/lib/supabase/server';
import { AgendaCalendar } from './_components/agenda-calendar';
import { AgendaStats } from './_components/agenda-stats';
import { QuickActionsPanel } from './_components/quick-actions-panel';
import { Loading } from '~/components/ui/loading';

async function getAgendaData() {
  const supabase = await createServerComponentClient();
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('id, start_time, end_time, status, patient_id, therapist_id, notes')
    .gte('start_time', startOfWeek.toISOString())
    .lte('start_time', endOfWeek.toISOString())
    .order('start_time', { ascending: true });

  const { data: patients } = await supabase.from('patients').select('id, full_name').order('full_name');
  const { data: therapists } = await supabase.from('therapists').select('id, user_id').eq('is_active', true);

  return {
    appointments: appointments || [],
    patients: patients || [],
    therapists: therapists || [],
    error,
  };
}

export default async function AgendaPage() {
  const { appointments, patients, therapists, error } = await getAgendaData();

  if (error) {
    return (
      <div className="p-6">
        <div className="text-destructive">Erro ao carregar agenda: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Agenda</h1>
            <p className="text-sm text-muted-foreground">Gerencie todos os agendamentos da clínica</p>
          </div>
          <QuickActionsPanel />
        </div>
      </div>

      <Suspense fallback={<Loading />}>
        <AgendaStats appointments={appointments} />
      </Suspense>

      <div className="flex-1 overflow-auto p-4">
        <Suspense fallback={<Loading />}>
          <AgendaCalendar
            initialAppointments={appointments}
            patients={patients}
            therapists={therapists}
          />
        </Suspense>
      </div>
    </div>
  );
}

