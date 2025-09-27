// pages/FinancialDashboardPage.tsx
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import useFinancialData, { TimePeriod } from '../hooks/useFinancialData';
import PageLoader from '../components/ui/PageLoader';
import { PlusCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { FinancialTransaction } from '../types';
import MetricCard from '../components/MetricCard';
import TransactionFormModal from '../components/financial/TransactionFormModal';
import TransactionList from '../components/financial/TransactionList';
import * as financialService from '../services/financialService';
import { RoleGuard } from '../components/RoleGuard';
import { Role } from '../types';
import { auditHelpers } from '../services/auditService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#775DD0'];

const FinancialDashboardPage: React.FC = () => {
  const [period, setPeriod] = useState<TimePeriod>('this_month');
  const { data, transactions, isLoading, refetch } = useFinancialData(period);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<FinancialTransaction | undefined>(undefined);

  // Log inicial para visualização do relatório financeiro
  React.useEffect(() => {
    if (data && !isLoading) {
      auditHelpers.logFinancialOperation(
        'Current User',
        'VIEW_FINANCIAL_REPORT',
        'dashboard',
        data.kpis.grossRevenue,
        `Visualizou dashboard financeiro - Período: ${period}`
      );
    }
  }, [data, isLoading, period]);

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;
  
  const handleOpenModal = (transaction?: FinancialTransaction) => {
      setTransactionToEdit(transaction);
      setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
      setTransactionToEdit(undefined);
      setIsModalOpen(false);
  };

  const handleSaveExpense = async (expense: Omit<FinancialTransaction, 'id' | 'type'> & { id?: string }) => {
      try {
        if (expense.id) {
          await financialService.updateExpense(expense as FinancialTransaction);
          // Log de auditoria para atualização
          await auditHelpers.logFinancialOperation(
            'Current User',
            'UPDATE_TRANSACTION',
            expense.id,
            expense.amount || 0,
            `Transação atualizada: ${expense.description}`
          );
        } else {
          const savedExpense = await financialService.addExpense(expense);
          const expenseId = typeof savedExpense === 'object' && savedExpense?.id ? savedExpense.id : 'unknown';
          // Log de auditoria para criação
          await auditHelpers.logFinancialOperation(
            'Current User',
            'CREATE_TRANSACTION',
            expenseId,
            expense.amount || 0,
            `Nova transação: ${expense.description}`
          );
        }
        refetch();
        handleCloseModal();
      } catch (error) {
        console.error('Error saving expense:', error);
      }
  };
  
  const handleDeleteExpense = async (id: string) => {
      try {
        const expense = transactions?.find(t => t.id === id);
        await financialService.deleteExpense(id);

        // Log de auditoria para exclusão
        await auditHelpers.logFinancialOperation(
          'Current User',
          'DELETE_TRANSACTION',
          id,
          expense?.amount || 0,
          `Transação excluída: ${expense?.description || 'Descrição não disponível'}`
        );

        refetch();
        handleCloseModal();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
  };

  if (isLoading || !data) {
    return <PageLoader />;
  }

  return (
    <RoleGuard allowedRoles={[Role.Admin, Role.Therapist]}>
      <div className="space-y-8">
      <PageHeader
        title="Controle Financeiro"
        subtitle="Visão completa da saúde financeira da sua clínica."
      >
         <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <select value={period} onChange={(e) => setPeriod(e.target.value as TimePeriod)} className="rounded-lg border-slate-300 bg-white shadow-sm focus:ring-teal-500 focus:border-teal-500">
            <option value="this_month">Este Mês</option>
            <option value="last_3_months">Últimos 3 Meses</option>
            <option value="this_year">Este Ano</option>
          </select>
          <button onClick={() => handleOpenModal()} className="hidden sm:flex items-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm">
            <PlusCircle size={20} className="mr-2"/> Nova Despesa
          </button>
        </div>
      </PageHeader>
      
      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveExpense}
        onDelete={handleDeleteExpense}
        transactionToEdit={transactionToEdit}
      />
      
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        <MetricCard title="Faturamento Bruto" value={formatCurrency(data.kpis.grossRevenue)} />
        <MetricCard title="Despesas" value={formatCurrency(data.kpis.totalExpenses)} />
        <MetricCard title="Lucro Líquido" value={formatCurrency(data.kpis.netProfit)} />
        <MetricCard title="Pacientes Ativos" value={data.kpis.activePatients.toString()} />
        <MetricCard title="Ticket Médio" value={formatCurrency(data.kpis.averageTicket)} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">Fluxo de Caixa</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(value: number) => `R$${value/1000}k`}/>
              <Tooltip formatter={(value: number) => formatCurrency(value)}/>
              <Legend />
              <Line type="monotone" dataKey="Receita" stroke="#10b981" strokeWidth={2}/>
              <Line type="monotone" dataKey="Despesa" stroke="#f43f5e" strokeWidth={2}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">Composição das Despesas</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data.expenseBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={5} label>
                {data.expenseBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)}/>
               <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <TransactionList 
        transactions={transactions}
        onAddExpense={() => handleOpenModal()}
        onEditExpense={handleOpenModal}
      />
      </div>
    </RoleGuard>
  );
};

export default FinancialDashboardPage;