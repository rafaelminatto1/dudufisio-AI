import { Suspense } from 'react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { DashboardStatsSkeleton } from '~/components/skeletons';
import { generateDashboardMetadata } from '~/lib/metadata';

export const metadata: Metadata = generateDashboardMetadata(
  'relatorios',
  'Relatórios e análises clínicas e financeiras com KPIs e métricas em tempo real'
);

// Dynamic import do componente pesado de relatórios para code splitting
const ExecutiveDashboard = dynamic(
  () =>
    import('~/components/features/reports/ExecutiveDashboard').then(
      (mod) => mod.ExecutiveDashboard
    ),
  {
    loading: () => <DashboardStatsSkeleton />,
  }
);

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios e Analytics</h1>
        <p className="text-muted-foreground">
          Acompanhe KPIs e métricas da clínica
        </p>
      </div>
      <Suspense fallback={<DashboardStatsSkeleton />}>
        <ExecutiveDashboard />
      </Suspense>
    </div>
  );
}

