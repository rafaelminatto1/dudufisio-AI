import { WaitlistManager } from '~/components/features/agenda/WaitlistManager';

export default function WaitlistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lista de Espera</h1>
        <p className="text-muted-foreground">
          Gerencie pacientes em espera por vagas
        </p>
      </div>
      <WaitlistManager />
    </div>
  );
}

