import { InactivePatientsList } from '~/components/features/marketing/InactivePatientsList';

export default function InactivePatientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pacientes Inativos</h1>
        <p className="text-muted-foreground">
          Identifique e reative pacientes inativos
        </p>
      </div>
      <InactivePatientsList />
    </div>
  );
}

