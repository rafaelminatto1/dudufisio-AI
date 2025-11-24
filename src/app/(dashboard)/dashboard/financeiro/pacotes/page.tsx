import { PackagesManager } from '~/components/features/financial/PackagesManager';

export default function PackagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pacotes de Sessões</h1>
        <p className="text-muted-foreground">
          Gerencie pacotes e controle de sessões
        </p>
      </div>
      <PackagesManager />
    </div>
  );
}

