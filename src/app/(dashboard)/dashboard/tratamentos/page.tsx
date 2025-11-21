import { Suspense } from 'react';
import { createServerComponentClient } from '~/lib/supabase/server';
import { TreatmentsLayout } from './_components/treatments-layout';
import { TreatmentsSkeleton } from '~/components/skeletons';

// Componente assíncrono separado (Next.js 16 Streaming SSR)
async function TreatmentsLayoutAsync() {
  const supabase = await createServerComponentClient();

  const { data: treatments } = await supabase
    .from('patient_exercise_prescriptions')
    .select('id, created_at, start_date, end_date, status, patient_id, therapist_id')
    .order('created_at', { ascending: false })
    .limit(10);

  return <TreatmentsLayout initialTreatments={treatments || []} />;
}

export default function TratamentosPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Header - Renderiza imediatamente */}
      <div className="border-b bg-background p-4">
        <div>
          <h1 className="text-2xl font-bold">Tratamentos</h1>
          <p className="text-sm text-muted-foreground">Gerencie tratamentos e evoluções dos pacientes</p>
        </div>
      </div>

      {/* Content - Streaming SSR com skeleton específico */}
      <div className="flex-1 overflow-auto p-4">
        <Suspense fallback={<TreatmentsSkeleton />}>
          <TreatmentsLayoutAsync />
        </Suspense>
      </div>
    </div>
  );
}

