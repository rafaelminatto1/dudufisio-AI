import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  sessions: number;
}

interface RevenueCategory {
  name: string;
  value: number;
  color: string;
}

interface RevenueChartProps {
  data?: RevenueData[];
  categories?: RevenueCategory[];
  period?: 'month' | 'quarter' | 'year';
}

// Mock data para desenvolvimento
const MOCK_REVENUE_DATA: RevenueData[] = [
  { month: 'Jan', revenue: 45000, expenses: 28000, profit: 17000, sessions: 120 },
  { month: 'Fev', revenue: 52000, expenses: 30000, profit: 22000, sessions: 135 },
  { month: 'Mar', revenue: 48000, expenses: 29000, profit: 19000, sessions: 128 },
  { month: 'Abr', revenue: 55000, expenses: 32000, profit: 23000, sessions: 145 },
  { month: 'Mai', revenue: 58000, expenses: 33000, profit: 25000, sessions: 152 },
  { month: 'Jun', revenue: 62000, expenses: 35000, profit: 27000, sessions: 165 }
];

const MOCK_CATEGORIES: RevenueCategory[] = [
  { name: 'Consultas', value: 35000, color: '#3b82f6' },
  { name: 'Exames', value: 15000, color: '#10b981' },
  { name: 'Produtos', value: 8000, color: '#f59e0b' },
  { name: 'Outros', value: 4000, color: '#ef4444' }
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const RevenueChart: React.FC<RevenueChartProps> = ({ 
  data = MOCK_REVENUE_DATA, 
  categories = MOCK_CATEGORIES,
  period = 'month'
}) => {
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  
  const lastMonth = data[data.length - 1];
  const previousMonth = data[data.length - 2];
  const revenueGrowth = previousMonth ? 
    ((lastMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTooltipValue = (value: number, name: string) => {
    if (name.includes('Sessões')) return value;
    return formatCurrency(value);
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Receita Total</p>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {revenueGrowth >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500 ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Lucro Total</p>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalProfit)}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <Badge variant="outline" className="text-xs">
                Margem: {profitMargin.toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Despesas</p>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="bg-red-100 p-2 rounded-full">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-xs text-slate-500">
                {((totalExpenses / totalRevenue) * 100).toFixed(1)}% da receita
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Sessões</p>
                <p className="text-2xl font-bold text-slate-800">{data.reduce((sum, item) => sum + item.sessions, 0)}</p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-xs text-slate-500">
                Média: {(data.reduce((sum, item) => sum + item.sessions, 0) / data.length).toFixed(0)}/mês
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Linha - Receita vs Despesas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">
            Evolução Financeira
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  formatter={formatTooltipValue}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Sessões por Mês */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">
              Sessões por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="sessions" 
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Categorias de Receita */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">
              Categorias de Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={formatCurrency}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {categories.map((category, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm text-slate-600">{category.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RevenueChart;
