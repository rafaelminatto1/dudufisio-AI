import { getPatientById } from '~/lib/actions/patients';
import { PatientForm } from '~/components/features/patients/PatientForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { redirect, notFound } from 'next/navigation';
import { toPatientExtended, type PatientExtended } from '~/types';

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getPatientById(id);

  if (result.error || !result.data) {
    notFound();
  }

  const patient: PatientExtended = toPatientExtended(result.data);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Paciente</h1>
        <p className="text-muted-foreground">Atualize as informações do paciente</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Paciente</CardTitle>
          <CardDescription>Edite os dados do paciente</CardDescription>
        </CardHeader>
        <CardContent>
          <PatientForm
            patientId={patient.id}
            initialData={{
              full_name: (patient as any).full_name || '',
              email: patient.email || '',
              phone: patient.phone || '',
              // whatsapp: patient.whatsapp || '', // Campo será adicionado na migration
              cpf: patient.cpf || '',
              birth_date: patient.birth_date || '',
              gender: (patient.gender as any) || '',
              // marital_status: patient.marital_status || '', // Campo será adicionado na migration
              // rg: patient.rg || '', // Campo será adicionado na migration
              address: ((patient.address as any) || {}) as any,
              // occupation: patient.occupation || '', // Campo será adicionado na migration
              emergency_contact: ((patient.emergency_contact as any) || {}) as any,
              // photo_url: patient.photo_url || '', // Campo será adicionado na migration
              // patient_origin: patient.patient_origin || '', // Campo será adicionado na migration
              notes: patient.notes || '',
            }}
            onSuccess={() => {
              redirect(`/dashboard/pacientes/${id}`);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

