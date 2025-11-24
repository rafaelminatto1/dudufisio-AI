import { getPatientById } from '~/lib/actions/patients';
import { Patient360Dashboard } from '~/components/features/patients/Patient360Dashboard';
import { notFound } from 'next/navigation';

export default async function PatientRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getPatientById(id);

  if (result.error || !result.data) {
    notFound();
  }

  return <Patient360Dashboard patientId={id} patient={result.data} />;
}

