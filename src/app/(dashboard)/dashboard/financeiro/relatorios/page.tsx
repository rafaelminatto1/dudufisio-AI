import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { FinancialSkeleton } from '~/components/skeletons';

// Dynamic import do componente pesado de relatórios financeiros para code splitting
const FinancialReports = dynamic(
  () =>
    import('~/components/features/financial/FinancialReports').then(
      (mod) => mod.FinancialReports
    ),
  {
    loading: () => <FinancialSkeleton />,
  }
);

export default function FinancialReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios Financeiros</h1>
        <p className="text-muted-foreground">
          Análise de fluxo de caixa e desempenho financeiro
        </p>
      </div>
      <Suspense fallback={<FinancialSkeleton />}>
        <FinancialReports />
      </Suspense>
    </div>
  );
}

