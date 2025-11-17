'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Plus } from 'lucide-react';
import { formatCurrency } from '~/lib/utils';
import { TransactionsTable } from './transactions-table';
import { AddTransactionModal } from './add-transaction-modal';
import { useState } from 'react';

interface FinancialDashboardProps {
  transactions: any[];
}

export function FinancialDashboard({ transactions }: FinancialDashboardProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);

  const stats = useMemo(() => {
    const receita = transactions
      .filter((t) => t.transaction_type === 'receita')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const despesa = transactions
      .filter((t) => t.transaction_type === 'despesa')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const pago = transactions
      .filter((t) => t.payment_status === 'pago')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const pendente = transactions
      .filter((t) => t.payment_status === 'pendente')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    return {
      receita,
      despesa,
      saldo: receita - despesa,
      pago,
      pendente,
    };
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.receita)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.despesa)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.saldo)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <CreditCard className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendente)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transações Recentes</CardTitle>
            <Button onClick={() => setAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TransactionsTable transactions={transactions} />
        </CardContent>
      </Card>

      <AddTransactionModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
      />
    </div>
  );
}

