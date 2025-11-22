import { getPatientById } from '~/lib/actions/patients';
import { PatientForm } from '~/components/features/patients/PatientForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { redirect, notFound } from 'next/navigation';

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getPatientById(id);

  if (result.error || !result.data) {
    notFound();
  }

  const patient = result.data;

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
              full_name: (patient as any).full_name || (patient as any).name || '',
              email: patient.email || '',
              phone: patient.phone || '',
              // whatsapp: (patient as any).whatsapp || '', // Campo não existe na tabela patients
              cpf: (patient as any).cpf || '',
              birth_date: patient.birth_date || '',
              gender: (patient as any).gender || '',
              // marital_status: (patient as any).marital_status as any, // Campo não existe na tabela patients
              // rg: (patient as any).rg || '', // Campo não existe na tabela patients
              address: ((patient as any).address as any) || {},
              // occupation: (patient as any).occupation || '', // Campo não existe na tabela patients
              emergency_contact: ((patient as any).emergency_contact as any) || {},
              // photo_url: (patient as any).photo_url || '', // Campo não existe na tabela patients
              // patient_origin: (patient as any).patient_origin || '', // Campo não existe na tabela patients
              notes: (patient as any).notes || '',
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

