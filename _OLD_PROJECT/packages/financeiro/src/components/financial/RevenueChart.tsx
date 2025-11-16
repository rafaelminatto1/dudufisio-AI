import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from '@/components/charts/ChartsLazyOptimized';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw } from 'lucide-react';
import { useFinancialRealData } from '../../hooks/useFinancialRealData';

interface RevenueChartProps {
  period?: 'month' | 'quarter' | 'year';
}

const RevenueChart: React.FC<RevenueChartProps> = ({ period = 'month' }) => {
  const { revenueData, categories, loading, error, refetch } = useFinancialRealData();

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Receita e Despesas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
              <p className="text-slate-500">Carregando dados financeiros...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Receita e Despesas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <button 
                onClick={refetch}
                className="text-blue-500 hover:text-blue-700 underline"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular totais
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = revenueData.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Comparação com mês anterior
  const lastMonth = revenueData[revenueData.length - 1];
  const previousMonth = revenueData[revenueData.length - 2];
  const revenueChange = previousMonth 
    ? ((lastMonth.revenue - previousMonth.revenue) / previousMonth.revenue * 100).toFixed(1)
    : '0';
  const isRevenueUp = Number(revenueChange) > 0;

  return (
    <div className="space-y-6">
      {/* Resumo de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-500 mb-1">Receita Total</div>
            <div className="text-2xl font-bold text-slate-900">
              R$ {(totalRevenue / 1000).toFixed(1)}k
            </div>
            <div className="flex items-center gap-1 mt-2">
              {isRevenueUp ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm ${isRevenueUp ? 'text-green-500' : 'text-red-500'}`}>
                {revenueChange}%
              </span>
              <span className="text-sm text-slate-400">vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-500 mb-1">Despesas Total</div>
            <div className="text-2xl font-bold text-slate-900">
              R$ {(totalExpenses / 1000).toFixed(1)}k
            </div>
            <Badge variant="secondary" className="mt-2">
              {((totalExpenses / totalRevenue) * 100).toFixed(0)}% da receita
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-500 mb-1">Lucro Líquido</div>
            <div className="text-2xl font-bold text-emerald-600">
              R$ {(totalProfit / 1000).toFixed(1)}k
            </div>
            <Badge variant="outline" className="mt-2 border-emerald-500 text-emerald-600">
              Margem: {profitMargin}%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-500 mb-1">Total Sessões</div>
            <div className="text-2xl font-bold text-slate-900">
              {revenueData.reduce((sum, item) => sum + item.sessions, 0)}
            </div>
            <div className="text-sm text-slate-400 mt-2">
              Últimos {revenueData.length} meses
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Linha - Evolução Temporal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Evolução de Receita e Despesas</span>
            <Badge variant="outline">{revenueData.length} meses</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Receita"
                dot={{ fill: '#3b82f6', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Despesas"
                dot={{ fill: '#ef4444', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Lucro"
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Grid com Gráficos de Barra e Pizza */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barra - Sessões por Mês */}
        <Card>
          <CardHeader>
            <CardTitle>Sessões por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="sessions" 
                  fill="#8b5cf6" 
                  name="Sessões"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Receita por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legenda */}
            <div className="mt-4 space-y-2">
              {categories.map((category, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-slate-600">{category.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    R$ {category.value.toLocaleString('pt-BR')}
                  </span>
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

