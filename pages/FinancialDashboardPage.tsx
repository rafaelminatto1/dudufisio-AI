/**
 * > FINANCIAL DASHBOARD PAGE - DUDUFISIO-AI
 *
 * Dashboard financeiro completo com gestão de pagamentos, relatórios avançados,
 * integração com gateways de pagamento e análises preditivas financeiras.
 */

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area
} from 'recharts';
import useFinancialData, { TimePeriod } from '../hooks/useFinancialData';
import PageLoader from '../components/ui/PageLoader';
import {
  PlusCircle, DollarSign, TrendingUp, TrendingDown, CreditCard,
  Banknote, Receipt, FileText, Calendar, Filter, Download,
  AlertTriangle, CheckCircle, Clock, Eye, RefreshCw, Settings,
  PieChart as PieChartIcon, BarChart3, Target, Wallet,
  ArrowUpRight, ArrowDownRight, Activity, Bell, Star
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { FinancialTransaction } from '../types';
import MetricCard from '../components/MetricCard';
import TransactionFormModal from '../components/financial/TransactionFormModal';
import TransactionList from '../components/financial/TransactionList';
import * as financialService from '../services/financialService';
import { RoleGuard } from '../components/RoleGuard';
import { Role } from '../types';
import { auditHelpers } from '../services/auditService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import PermissionGuard, { IfPermission } from '../components/auth/PermissionGuard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#775DD0'];

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'bank_transfer';
  name: string;
  icon: React.ReactNode;
  percentage: number;
  amount: number;
  transactions: number;
}

interface FinancialAlert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  actionable: boolean;
  action?: string;
}

interface RecurrentPayment {
  id: string;
  patientName: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly';
  nextPayment: string;
  status: 'active' | 'pending' | 'cancelled';
  paymentMethod: string;
}

interface FinancialGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  category: 'revenue' | 'profit' | 'patients' | 'efficiency';
  priority: 'low' | 'medium' | 'high';
}

interface CashFlowPrediction {
  month: string;
  predictedRevenue: number;
  predictedExpenses: number;
  predictedProfit: number;
  confidence: number;
}

const FinancialDashboardPage: React.FC = () => {
  const [period, setPeriod] = useState<TimePeriod>('this_month');
  const { data, transactions, isLoading, refetch } = useFinancialData(period);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<FinancialTransaction | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('overview');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [financialAlerts, setFinancialAlerts] = useState<FinancialAlert[]>([]);
  const [recurrentPayments, setRecurrentPayments] = useState<RecurrentPayment[]>([]);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [cashFlowPredictions, setCashFlowPredictions] = useState<CashFlowPrediction[]>([]);
  const [isLoadingEnhancedData, setIsLoadingEnhancedData] = useState(true);

  // Load enhanced financial data
  useEffect(() => {
    loadEnhancedFinancialData();
  }, [period]);

  // Log inicial para visualização do relatório financeiro
  useEffect(() => {
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

  const loadEnhancedFinancialData = async () => {
    try {
      setIsLoadingEnhancedData(true);

      // Mock enhanced financial data
      await Promise.all([
        loadPaymentMethods(),
        loadFinancialAlerts(),
        loadRecurrentPayments(),
        loadFinancialGoals(),
        loadCashFlowPredictions()
      ]);
    } catch (error) {
      console.error('Error loading enhanced financial data:', error);
    } finally {
      setIsLoadingEnhancedData(false);
    }
  };

  const loadPaymentMethods = async (): Promise<void> => {
    const methods: PaymentMethod[] = [
      {
        id: '1',
        type: 'credit_card',
        name: 'Cartão de Crédito',
        icon: <CreditCard className="w-5 h-5" />,
        percentage: 45,
        amount: 67500,
        transactions: 234
      },
      {
        id: '2',
        type: 'pix',
        name: 'PIX',
        icon: <Banknote className="w-5 h-5" />,
        percentage: 25,
        amount: 37500,
        transactions: 156
      },
      {
        id: '4',
        type: 'cash',
        name: 'Dinheiro',
        icon: <DollarSign className="w-5 h-5" />,
        percentage: 10,
        amount: 15000,
        transactions: 45
      }
    ];
    setPaymentMethods(methods);
  };

  const loadFinancialAlerts = async (): Promise<void> => {
    const alerts: FinancialAlert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Fluxo de Caixa Baixo',
        message: 'Reserva para os próximos 30 dias está abaixo do recomendado',
        severity: 'medium',
        timestamp: new Date().toISOString(),
        actionable: true,
        action: 'Revisar gastos e aumentar recebimentos'
      },
      {
        id: '2',
        type: 'info',
        title: 'Pagamentos Pendentes',
        message: '12 pagamentos pendentes aguardando processamento',
        severity: 'low',
        timestamp: new Date().toISOString(),
        actionable: true,
        action: 'Acompanhar status dos pagamentos'
      },
      {
        id: '3',
        type: 'success',
        title: 'Meta Mensal Atingida',
        message: 'Faturamento deste mês superou a meta em 15%',
        severity: 'low',
        timestamp: new Date().toISOString(),
        actionable: false
      }
    ];
    setFinancialAlerts(alerts);
  };

  const loadRecurrentPayments = async (): Promise<void> => {
    const payments: RecurrentPayment[] = [
      {
        id: '1',
        patientName: 'Ana Silva',
        amount: 250,
        frequency: 'monthly',
        nextPayment: '2024-01-15',
        status: 'active',
        paymentMethod: 'Cartão de Crédito'
      },
      {
        id: '2',
        patientName: 'Carlos Santos',
        amount: 180,
        frequency: 'weekly',
        nextPayment: '2024-01-08',
        status: 'pending',
        paymentMethod: 'PIX'
      },
      {
        id: '3',
        patientName: 'Maria Oliveira',
        amount: 320,
        frequency: 'monthly',
        nextPayment: '2024-01-20',
        status: 'active',
        paymentMethod: 'PIX'
      }
    ];
    setRecurrentPayments(payments);
  };

  const loadFinancialGoals = async (): Promise<void> => {
    const goals: FinancialGoal[] = [
      {
        id: '1',
        title: 'Faturamento Mensal',
        target: 150000,
        current: 128500,
        deadline: '2024-01-31',
        category: 'revenue',
        priority: 'high'
      },
      {
        id: '2',
        title: 'Redução de Custos',
        target: 25000,
        current: 18200,
        deadline: '2024-03-31',
        category: 'profit',
        priority: 'medium'
      },
      {
        id: '3',
        title: 'Novos Pacientes',
        target: 50,
        current: 38,
        deadline: '2024-02-29',
        category: 'patients',
        priority: 'medium'
      }
    ];
    setFinancialGoals(goals);
  };

  const loadCashFlowPredictions = async (): Promise<void> => {
    const predictions: CashFlowPrediction[] = [
      {
        month: 'Jan/24',
        predictedRevenue: 142000,
        predictedExpenses: 68000,
        predictedProfit: 74000,
        confidence: 89
      },
      {
        month: 'Fev/24',
        predictedRevenue: 158000,
        predictedExpenses: 72000,
        predictedProfit: 86000,
        confidence: 85
      },
      {
        month: 'Mar/24',
        predictedRevenue: 165000,
        predictedExpenses: 75000,
        predictedProfit: 90000,
        confidence: 82
      },
      {
        month: 'Abr/24',
        predictedRevenue: 171000,
        predictedExpenses: 78000,
        predictedProfit: 93000,
        confidence: 78
      }
    ];
    setCashFlowPredictions(predictions);
  };

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

  const handleOpenModal = (transaction?: FinancialTransaction) => {
      setTransactionToEdit(transaction);
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setTransactionToEdit(undefined);
      setIsModalOpen(false);
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info': return <Bell className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (current: number, target: number): number => {
    return Math.min((current / target) * 100, 100);
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
    <PermissionGuard permission="financial:read">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Gestão Financeira"
            subtitle="Dashboard financeiro completo com análises avançadas e gestão de pagamentos"
          />

          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as TimePeriod)}
              className="rounded-lg border-gray-300 bg-white shadow-sm focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="this_month">Este Mês</option>
              <option value="last_3_months">Últimos 3 Meses</option>
              <option value="this_year">Este Ano</option>
            </select>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Nova Transação
            </button>
          </div>
        </div>

        <TransactionFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveExpense}
          onDelete={handleDeleteExpense}
          transactionToEdit={transactionToEdit}
        />

        {/* Financial Alerts */}
        {financialAlerts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Bell className="w-5 h-5 text-sky-600" />
              Alertas Financeiros
            </h3>
            <div className="space-y-3">
              {financialAlerts.map((alert: any) => (
                <div key={alert.id} className={`border rounded-lg p-3 ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm mt-1">{alert.message}</p>
                      {alert.actionable && alert.action && (
                        <p className="text-xs mt-2 font-medium">💡 {alert.action}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Faturamento Bruto</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(data.kpis.grossRevenue)}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +8.2% vs mês anterior
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Despesas</p>
                <p className="text-2xl font-bold text-red-900">{formatCurrency(data.kpis.totalExpenses)}</p>
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <ArrowDownRight className="w-3 h-3" />
                  -2.1% vs mês anterior
                </p>
              </div>
              <div className="p-3 bg-red-500 rounded-lg">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Lucro Líquido</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(data.kpis.netProfit)}</p>
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +12.5% vs mês anterior
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Pacientes Ativos</p>
                <p className="text-2xl font-bold text-purple-900">{data.kpis.activePatients}</p>
                <p className="text-xs text-purple-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +5 novos pacientes
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Ticket Médio</p>
                <p className="text-2xl font-bold text-orange-900">{formatCurrency(data.kpis.averageTicket)}</p>
                <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +3.8% vs mês anterior
                </p>
              </div>
              <div className="p-3 bg-orange-500 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="goals">Metas</TabsTrigger>
            <TabsTrigger value="predictions">Previsões</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cash Flow Chart */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Fluxo de Caixa</h3>
                </div>
                <div className="p-6">
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
              </div>

              {/* Expense Breakdown */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Despesas por Categoria</h3>
                </div>
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.expenseBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                      >
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
            </div>

            <TransactionList
              transactions={transactions}
              onAddExpense={() => handleOpenModal()}
              onEditExpense={handleOpenModal}
            />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Methods */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-sky-600" />
                    Métodos de Pagamento
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {paymentMethods.map((method: any) => (
                      <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-sky-100 rounded-lg">
                            {method.icon}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{method.name}</p>
                            <p className="text-sm text-gray-600">{method.transactions} transações</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(method.amount)}</p>
                          <p className="text-sm text-gray-600">{method.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recurrent Payments */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-green-600" />
                    Pagamentos Recorrentes
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recurrentPayments.map((payment: any) => (
                      <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{payment.patientName}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{formatCurrency(payment.amount)} · {payment.frequency}</span>
                          <span>Próximo: {new Date(payment.nextPayment).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{payment.paymentMethod}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Evolution */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Evolução da Receita
                  </h3>
                </div>
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.cashFlowData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value: number) => `R$${value/1000}k`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Area type="monotone" dataKey="Receita" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Payment Methods Distribution */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-purple-600" />
                    Distribuição por Método
                  </h3>
                </div>
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={paymentMethods}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="amount" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Metas Financeiras
                </h3>
              </div>
              <div className="p-6">
                <div className="grid gap-6">
                  {financialGoals.map((goal: any) => {
                    const progress = getProgressPercentage(goal.current, goal.target);
                    return (
                      <div key={goal.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{goal.title}</h4>
                            <p className="text-sm text-gray-600">Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                            goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {goal.priority}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progresso</span>
                            <span className="font-medium">
                              {goal.category === 'patients' ?
                                `${goal.current}/${goal.target}` :
                                `${formatCurrency(goal.current)} / ${formatCurrency(goal.target)}`
                              }
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all duration-500 ${
                                progress >= 100 ? 'bg-green-500' :
                                progress >= 75 ? 'bg-blue-500' :
                                progress >= 50 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>0%</span>
                            <span className="font-medium">{progress.toFixed(1)}%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-sky-600" />
                  Previsões de Fluxo de Caixa
                </h3>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={cashFlowPredictions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value: number) => `R$${value/1000}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="predictedRevenue" stroke="#10b981" strokeWidth={2} name="Receita Prevista" />
                    <Line type="monotone" dataKey="predictedExpenses" stroke="#f43f5e" strokeWidth={2} name="Despesas Previstas" />
                    <Line type="monotone" dataKey="predictedProfit" stroke="#3b82f6" strokeWidth={2} name="Lucro Previsto" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {cashFlowPredictions.map((prediction, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">{prediction.month}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Receita:</span>
                      <span className="font-medium text-green-600">{formatCurrency(prediction.predictedRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Despesas:</span>
                      <span className="font-medium text-red-600">{formatCurrency(prediction.predictedExpenses)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lucro:</span>
                      <span className="font-medium text-blue-600">{formatCurrency(prediction.predictedProfit)}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <span className="text-xs text-gray-500">Confiança: {prediction.confidence}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Relatórios Financeiros
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border border-gray-200 rounded-lg p-6 hover:border-sky-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Relatório de Receitas</h4>
                        <p className="text-sm text-gray-600">Análise detalhada de receitas</p>
                      </div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      <Download className="w-4 h-4" />
                      Gerar Relatório
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6 hover:border-sky-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-red-100 rounded-lg">
                        <TrendingDown className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Relatório de Despesas</h4>
                        <p className="text-sm text-gray-600">Controle de gastos detalhado</p>
                      </div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                      <Download className="w-4 h-4" />
                      Gerar Relatório
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6 hover:border-sky-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Fluxo de Caixa</h4>
                        <p className="text-sm text-gray-600">Movimentação financeira completa</p>
                      </div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                      <Download className="w-4 h-4" />
                      Gerar Relatório
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6 hover:border-sky-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Receipt className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Impostos e Tributos</h4>
                        <p className="text-sm text-gray-600">Obrigações fiscais e tributárias</p>
                      </div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                      <Download className="w-4 h-4" />
                      Gerar Relatório
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6 hover:border-sky-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Activity className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Performance Mensal</h4>
                        <p className="text-sm text-gray-600">Indicadores de desempenho</p>
                      </div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors">
                      <Download className="w-4 h-4" />
                      Gerar Relatório
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6 hover:border-sky-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-sky-100 rounded-lg">
                        <Settings className="w-6 h-6 text-sky-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Relatório Customizado</h4>
                        <p className="text-sm text-gray-600">Configure seu próprio relatório</p>
                      </div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-sky-600 text-sky-600 rounded-lg hover:bg-sky-50 transition-colors">
                      <Settings className="w-4 h-4" />
                      Configurar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Export Actions */}
        <IfPermission permission="financial:export">
          <div className="flex justify-end gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Exportar Dashboard
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Atualizar Dados
            </button>
          </div>
        </IfPermission>
      </div>
    </PermissionGuard>
  );
};

export default FinancialDashboardPage;