'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { AppointmentsSkeleton } from '~/components/skeletons';

// Dynamic import do componente pesado de calendário para code splitting
// Nota: Este componente já é 'use client', então o dynamic import funciona corretamente
const AgendaCalendarView = dynamic(
  () => import('~/components/features/agenda/AgendaCalendarView').then((mod) => mod.AgendaCalendarView),
  {
    loading: () => <AppointmentsSkeleton />,
  }
);

interface AgendaCalendarClientProps {
  view: 'day' | 'week' | 'month';
  currentDate: Date;
  therapistId?: string;
  resourceId?: string;
}

export function AgendaCalendarClient({
  view,
  currentDate: initialDate,
  therapistId,
  resourceId,
}: AgendaCalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const router = useRouter();

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    // Atualiza URL sem recarregar página
    const params = new URLSearchParams();
    params.set('view', view);
    params.set('date', date.toISOString().split('T')[0]);
    if (therapistId) params.set('therapist', therapistId);
    if (resourceId) params.set('resource', resourceId);
    router.push(`/dashboard/agenda?${params.toString()}`, { scroll: false });
  };

  const handleAppointmentClick = (id: string) => {
    router.push(`/dashboard/agenda/${id}`);
  };

  const handleNewAppointment = (date: Date, time: string) => {
    const datetime = new Date(`${date.toISOString().split('T')[0]}T${time}`);
    router.push(`/dashboard/agenda/novo?date=${datetime.toISOString()}`);
  };

  return (
    <Suspense fallback={<AppointmentsSkeleton />}>
      <AgendaCalendarView
        view={view}
        currentDate={currentDate}
        onDateChange={handleDateChange}
        onAppointmentClick={handleAppointmentClick}
        onNewAppointment={handleNewAppointment}
        therapistId={therapistId}
        resourceId={resourceId}
      />
    </Suspense>
  );
}

