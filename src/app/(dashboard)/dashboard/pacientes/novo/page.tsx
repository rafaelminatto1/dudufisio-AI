import { PatientForm } from '~/components/features/patients/PatientForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { redirect } from 'next/navigation';

export default function NewPatientPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Novo Paciente</h1>
        <p className="text-muted-foreground">Cadastre um novo paciente no sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Paciente</CardTitle>
          <CardDescription>Preencha os dados obrigatórios e opcionais do paciente</CardDescription>
        </CardHeader>
        <CardContent>
          <PatientForm
            onSuccess={() => {
              redirect('/dashboard/pacientes');
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

