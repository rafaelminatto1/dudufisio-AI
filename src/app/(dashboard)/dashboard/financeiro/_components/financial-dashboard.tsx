'use client';

import { useMemo, useState, useOptimistic, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Plus } from 'lucide-react';
import { formatCurrency } from '~/lib/utils';
import { TransactionsTable } from './transactions-table';
import { AddTransactionModal } from './add-transaction-modal';
import { createTransaction, updateTransaction, deleteTransaction, updatePaymentStatus } from '../actions';

interface FinancialDashboardProps {
  transactions: any[];
}

type Transaction = {
  id: string;
  amount: number;
  transaction_type: string;
  payment_status: string;
  description?: string;
  category?: string;
  due_date?: string;
  created_at: string;
  isPending?: boolean;
};

type OptimisticAction =
  | { type: 'create'; transaction: Transaction }
  | { type: 'update'; transaction: Transaction }
  | { type: 'delete'; id: string }
  | { type: 'updateStatus'; id: string; status: string };

export function FinancialDashboard({ transactions: initialTransactions }: FinancialDashboardProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // React 19 useOptimistic - Atualização instantânea
  const [optimisticTransactions, updateOptimisticTransactions] = useOptimistic(
    initialTransactions,
    (state: Transaction[], action: OptimisticAction) => {
      switch (action.type) {
        case 'create':
          return [{ ...action.transaction, isPending: true }, ...state];
        case 'update':
          return state.map((t) =>
            t.id === action.transaction.id ? { ...action.transaction, isPending: true } : t
          );
        case 'delete':
          return state.filter((t) => t.id !== action.id);
        case 'updateStatus':
          return state.map((t) =>
            t.id === action.id ? { ...t, payment_status: action.status, isPending: true } : t
          );
        default:
          return state;
      }
    }
  );

  const stats = useMemo(() => {
    const receita = optimisticTransactions
      .filter((t) => t.transaction_type === 'receita')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const despesa = optimisticTransactions
      .filter((t) => t.transaction_type === 'despesa')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const pago = optimisticTransactions
      .filter((t) => t.payment_status === 'pago')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const pendente = optimisticTransactions
      .filter((t) => t.payment_status === 'pendente')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    return {
      receita,
      despesa,
      saldo: receita - despesa,
      pago,
      pendente,
    };
  }, [optimisticTransactions]);

  // Handler para criar transação com useOptimistic
  const handleCreateTransaction = async (formData: FormData) => {
    // Criar transação temporária
    const tempTransaction: Transaction = {
      id: `temp-${Date.now()}`,
      amount: parseFloat(formData.get('amount') as string),
      transaction_type: formData.get('transaction_type') as string,
      payment_status: formData.get('payment_status') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      due_date: formData.get('due_date') as string,
      created_at: new Date().toISOString(),
    };

    // 1. Atualização otimista - UI atualiza IMEDIATAMENTE
    startTransition(() => {
      updateOptimisticTransactions({ type: 'create', transaction: tempTransaction });
    });

    // 2. Fechar modal imediatamente
    setAddModalOpen(false);

    // 3. Salvar no servidor
    try {
      const result = await createTransaction(formData);

      if (!result.success) {
        alert(result.error || 'Erro ao criar transação');
        return;
      }
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      alert('Erro ao criar transação');
    }
  };

  // Handler para deletar transação
  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

    // 1. Atualização otimista
    startTransition(() => {
      updateOptimisticTransactions({ type: 'delete', id });
    });

    // 2. Deletar no servidor
    try {
      const result = await deleteTransaction(id);

      if (!result.success) {
        alert(result.error || 'Erro ao excluir transação');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir transação');
    }
  };

  // Handler para atualizar status de pagamento
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    // 1. Atualização otimista
    startTransition(() => {
      updateOptimisticTransactions({ type: 'updateStatus', id, status: newStatus });
    });

    // 2. Atualizar no servidor
    try {
      const result = await updatePaymentStatus(id, newStatus);

      if (!result.success) {
        alert(result.error || 'Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  };

  return (
    <div className={`space-y-6 ${isPending ? 'opacity-70' : 'opacity-100'} transition-opacity`}>
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
            <Button onClick={() => setAddModalOpen(true)} disabled={isPending}>
              <Plus className="mr-2 h-4 w-4" />
              {isPending ? 'Salvando...' : 'Nova Transação'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TransactionsTable
            transactions={optimisticTransactions}
            onDelete={handleDeleteTransaction}
            onUpdateStatus={handleUpdateStatus}
          />
        </CardContent>
      </Card>

      <AddTransactionModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSave={handleCreateTransaction}
      />
    </div>
  );
}

