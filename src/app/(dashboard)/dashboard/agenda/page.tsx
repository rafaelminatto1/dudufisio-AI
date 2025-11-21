import { Suspense } from 'react';
import { AgendaCalendarClient } from './_components/AgendaCalendarClient';
import { AgendaControls } from './_components/AgendaControls';
import { AppointmentsSkeleton } from '~/components/skeletons';

export default async function AgendaPage({
  searchParams,
}: {
  searchParams?: {
    view?: 'day' | 'week' | 'month';
    therapist?: string;
    resource?: string;
    date?: string;
  };
}) {
  const currentView = (searchParams?.view || 'day') as 'day' | 'week' | 'month';
  const currentDate = searchParams?.date ? new Date(searchParams.date) : new Date();
  const therapistId = searchParams?.therapist;
  const resourceId = searchParams?.resource;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">
            Gerencie agendamentos e visualize sua agenda
          </p>
        </div>
      </div>

      <AgendaControls
        currentView={currentView}
        therapistId={therapistId}
        resourceId={resourceId}
      />

      <Suspense fallback={<AppointmentsSkeleton />}>
        <AgendaCalendarClient
          view={currentView}
          currentDate={currentDate}
          therapistId={therapistId}
          resourceId={resourceId}
        />
      </Suspense>
    </div>
  );
}
