'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  CreditCard, 
  AlertTriangle,
  Calendar,
  FileText,
  PieChart,
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  BarChart,
  Bar
} from 'recharts';

interface DashboardMetric {
  name: string;
  value: number;
  change: number;
  unit: string;
  icon: React.ElementType;
  color: string;
}

interface RevenueData {
  date: string;
  revenue: number;
  transactions: number;
}

interface PaymentMethodData {
  method: string;
  value: number;
  percentage: number;
  color: string;
}

interface OverdueData {
  patientId: string;
  patientName: string;
  amount: number;
  daysOverdue: number;
  type: string;
}

export function FinancialDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<PaymentMethodData[]>([]);
  const [overdueData, setOverdueData] = useState<OverdueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  const periodOptions = [
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
    { value: '90d', label: '90 dias' },
    { value: '12m', label: '12 meses' }
  ];

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard metrics
      const metricsResponse = await fetch(`/api/financial/dashboard/metrics?period=${selectedPeriod}`);
      const metricsData = await metricsResponse.json();
      
      setMetrics([
        {
          name: 'Receita Total',
          value: metricsData.totalRevenue || 0,
          change: metricsData.revenueChange || 0,
          unit: 'BRL',
          icon: DollarSign,
          color: 'text-green-600'
        },
        {
          name: 'Transações',
          value: metricsData.transactionCount || 0,
          change: metricsData.transactionChange || 0,
          unit: 'count',
          icon: CreditCard,
          color: 'text-blue-600'
        },
        {
          name: 'Pacientes Únicos',
          value: metricsData.uniquePatients || 0,
          change: metricsData.patientsChange || 0,
          unit: 'count',
          icon: Users,
          color: 'text-purple-600'
        },
        {
          name: 'Em Atraso',
          value: metricsData.overdueCount || 0,
          change: metricsData.overdueChange || 0,
          unit: 'count',
          icon: AlertTriangle,
          color: 'text-red-600'
        }
      ]);

      // Load revenue trend data
      const revenueResponse = await fetch(`/api/financial/dashboard/revenue-trend?period=${selectedPeriod}`);
      const revenueData = await revenueResponse.json();
      setRevenueData(revenueData);

      // Load payment method distribution
      const paymentMethodResponse = await fetch(`/api/financial/dashboard/payment-methods?period=${selectedPeriod}`);
      const paymentMethodData = await paymentMethodResponse.json();
      
      const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
      setPaymentMethodData(
        paymentMethodData.map((item: any, index: number) => ({
          ...item,
          color: colors[index % colors.length]
        }))
      );

      // Load overdue data
      const overdueResponse = await fetch('/api/financial/dashboard/overdue');
      const overdueData = await overdueResponse.json();
      setOverdueData(overdueData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">
          {Math.abs(change).toFixed(1)}%
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
          <p className="text-gray-500 mt-1">
            Visão geral das métricas financeiras e performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      {metric.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">
                        {metric.unit === 'BRL' 
                          ? formatCurrency(metric.value)
                          : metric.value.toLocaleString('pt-BR')
                        }
                      </p>
                      {formatChange(metric.change)}
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100 ${metric.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Receita
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="overdue" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Em Atraso
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tendência de Receita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Receita']}
                      labelFormatter={(label) => `Data: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#0088FE" 
                      fill="#0088FE" 
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Transaction Volume */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Volume de Transações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [value, 'Transações']}
                      labelFormatter={(label) => `Data: ${label}`}
                    />
                    <Bar dataKey="transactions" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Receita Detalhada</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Receita']}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#0088FE" 
                    strokeWidth={3}
                    dot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Método de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ method, percentage }) => `${method}: ${percentage}%`}
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Methods Table */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Método</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethodData.map((method, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: method.color }}
                        />
                        <span className="font-medium">{method.method}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(method.value)}</div>
                        <div className="text-sm text-gray-500">{method.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Pagamentos em Atraso
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overdueData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium">Nenhum pagamento em atraso!</p>
                  <p>Todos os pagamentos estão em dia.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {overdueData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="space-y-1">
                        <p className="font-medium">{item.patientName}</p>
                        <p className="text-sm text-gray-600">{item.type}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-bold text-red-600">{formatCurrency(item.amount)}</p>
                        <Badge variant="destructive">
                          {item.daysOverdue} dias em atraso
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
