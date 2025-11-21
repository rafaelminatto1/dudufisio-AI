import { FinancialReports } from '~/components/features/financial/FinancialReports';

export default function FinancialReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios Financeiros</h1>
        <p className="text-muted-foreground">
          Análise de fluxo de caixa e desempenho financeiro
        </p>
      </div>
      <FinancialReports />
    </div>
  );
}

