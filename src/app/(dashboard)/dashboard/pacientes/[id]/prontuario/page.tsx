import { getPatientById } from '~/lib/actions/patients';
import { Patient360Dashboard } from '~/components/features/patients/Patient360Dashboard';
import { notFound } from 'next/navigation';

export default async function PatientRecordPage({ params }: { params: { id: string } }) {
  const result = await getPatientById(params.id);

  if (result.error || !result.data) {
    notFound();
  }

  return <Patient360Dashboard patientId={params.id} patient={result.data} />;
}

