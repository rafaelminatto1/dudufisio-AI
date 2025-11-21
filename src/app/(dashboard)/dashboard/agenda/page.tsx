import { Suspense } from 'react';
import { AgendaViewSelector } from '~/components/features/agenda/AgendaViewSelector';
import { AgendaFilters } from '~/components/features/agenda/AgendaFilters';
import { AgendaCalendarView } from '~/components/features/agenda/AgendaCalendarView';
import { AgendaCalendarClient } from './_components/AgendaCalendarClient';
import { AppointmentsSkeleton } from '~/components/skeletons';

export default function AgendaPage({
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

      <div className="flex items-center justify-between gap-4">
        <AgendaViewSelector
          currentView={currentView}
          onViewChange={(view) => {
            // TODO: Atualizar URL com novo view
          }}
        />
        <AgendaFilters
          selectedTherapist={therapistId}
          selectedResource={resourceId}
          onTherapistChange={(id) => {
            // TODO: Atualizar URL
          }}
          onResourceChange={(id) => {
            // TODO: Atualizar URL
          }}
        />
      </div>

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
