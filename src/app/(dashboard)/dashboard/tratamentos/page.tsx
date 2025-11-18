import { Suspense } from 'react';
import { createServerComponentClient } from '~/lib/supabase/server';
import { TreatmentsLayout } from './_components/treatments-layout';
import { Loading } from '~/components/ui/loading';

async function getTreatmentsData() {
  const supabase = await createServerComponentClient();

  const { data: treatments } = await supabase
    .from('patient_exercise_prescriptions')
    .select(
      'id, created_at, start_date, end_date, status, patient:patients(id, full_name), therapist:therapists(id, user_id)'
    )
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    treatments: treatments || [],
  };
}

export default async function TratamentosPage() {
  const { treatments } = await getTreatmentsData();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-background p-4">
        <div>
          <h1 className="text-2xl font-bold">Tratamentos</h1>
          <p className="text-sm text-muted-foreground">Gerencie tratamentos e evoluções dos pacientes</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Suspense fallback={<Loading />}>
          <TreatmentsLayout initialTreatments={treatments} />
        </Suspense>
      </div>
    </div>
  );
}

