import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { createServerComponentClient } from '~/lib/supabase/server';
import { FinancialDashboard } from './_components/financial-dashboard';
import { PackagesManager } from './_components/packages-manager';
import { FinancialSkeleton, TableSkeleton } from '~/components/skeletons';
import { generateDashboardMetadata } from '~/lib/metadata';

export const metadata: Metadata = generateDashboardMetadata(
  'financeiro',
  'Controle financeiro completo: receitas, despesas, pagamentos, transações e pacotes de tratamento'
);

// Componente assíncrono para Dashboard Financeiro (Next.js 16 Streaming SSR)
async function FinancialDashboardAsync() {
  const supabase = await createServerComponentClient();
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const { data: transactions, error } = await supabase
    .from('financial_transactions')
    .select('*')
    .gte('created_at', startOfMonth.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching financial data:', error);
    return <div className="text-destructive">Erro ao carregar dados financeiros</div>;
  }

  return <FinancialDashboard transactions={transactions || []} />;
}

export default function FinanceiroPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Header - Renderiza imediatamente */}
      <div className="border-b bg-background p-4">
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Gerencie receitas, despesas e pagamentos</p>
        </div>
      </div>

      {/* Content - Streaming SSR com skeletons específicos */}
      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="packages">Pacotes</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-4">
            <Suspense fallback={<FinancialSkeleton />}>
              <FinancialDashboardAsync />
            </Suspense>
          </TabsContent>

          <TabsContent value="packages" className="mt-4">
            <Suspense fallback={<TableSkeleton rows={8} columns={5} />}>
              <PackagesManager />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}