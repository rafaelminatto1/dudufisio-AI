import { ExecutiveDashboard } from '~/components/features/reports/ExecutiveDashboard';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios e Analytics</h1>
        <p className="text-muted-foreground">
          Acompanhe KPIs e métricas da clínica
        </p>
      </div>
      <ExecutiveDashboard />
    </div>
  );
}

