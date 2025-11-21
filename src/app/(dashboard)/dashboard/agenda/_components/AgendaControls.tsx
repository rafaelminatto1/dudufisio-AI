'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AgendaViewSelector } from '~/components/features/agenda/AgendaViewSelector';
import { AgendaFilters } from '~/components/features/agenda/AgendaFilters';

interface AgendaControlsProps {
  currentView: 'day' | 'week' | 'month';
  therapistId?: string;
  resourceId?: string;
}

export function AgendaControls({ currentView, therapistId, resourceId }: AgendaControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateURL = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/dashboard/agenda?${params.toString()}`);
  };

  const handleViewChange = (view: 'day' | 'week' | 'month') => {
    updateURL({ view });
  };

  const handleTherapistChange = (id: string | undefined) => {
    updateURL({ therapist: id });
  };

  const handleResourceChange = (id: string | undefined) => {
    updateURL({ resource: id });
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <AgendaViewSelector
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      <AgendaFilters
        selectedTherapist={therapistId}
        selectedResource={resourceId}
        onTherapistChange={handleTherapistChange}
        onResourceChange={handleResourceChange}
      />
    </div>
  );
}

