import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { createServerComponentClient } from '~/lib/supabase/server';
import { getTransactions } from '~/lib/actions/financial';
import { FinancialDashboard } from './_components/financial-dashboard';
import { PackagesManager } from './_components/packages-manager';
import { Loading } from '~/components/ui/loading';

async function getFinancialData() {
  const supabase = await createServerComponentClient();
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const { data: transactions, error } = await supabase
    .from('payment_transactions')
    .select('*')
    .gte('created_at', startOfMonth.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching financial data:', error);
    return { transactions: [] };
  }

  return {
    transactions: transactions || [],
  };
}

export default async function FinanceiroPage() {
  const { transactions } = await getFinancialData();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-background p-4">
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Gerencie receitas, despesas e pagamentos</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="packages">Pacotes</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-4">
            <Suspense fallback={<Loading />}>
              <FinancialDashboard transactions={transactions} />
            </Suspense>
          </TabsContent>

          <TabsContent value="packages" className="mt-4">
            <Suspense fallback={<Loading />}>
              <PackagesManager />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

