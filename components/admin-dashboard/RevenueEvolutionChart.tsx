import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';

interface RevenueData {
  month: string;
  revenue: number;
  goal: number;
  growth?: number;
}

interface RevenueEvolutionChartProps {
  data: RevenueData[];
  isLoading?: boolean;
}

const RevenueEvolutionChart: React.FC<RevenueEvolutionChartProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    })}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm text-gray-600">
                {entry.name === 'revenue' ? 'Faturamento' : 'Meta'}: {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const currentMonthRevenue = data[data.length - 1]?.revenue || 0;
  const currentMonthGoal = data[data.length - 1]?.goal || 0;
  const goalAchievement = ((currentMonthRevenue / currentMonthGoal) * 100).toFixed(1);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Evolução do Faturamento
          </CardTitle>
          <div className="text-right">
            <div className="text-sm text-gray-500">Meta do mês</div>
            <div className={`text-lg font-bold ${
              parseFloat(goalAchievement) >= 100 ? 'text-green-600' : 
              parseFloat(goalAchievement) >= 80 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {goalAchievement}%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#revenueGradient)"
              name="revenue"
            />
            
            <Line
              type="monotone"
              dataKey="goal"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="8 8"
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              name="goal"
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Insights */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-green-800">Melhor Mês</div>
            <div className="text-lg font-bold text-green-600">
              {data.reduce((max, curr) => curr.revenue > max.revenue ? curr : max, data[0])?.month}
            </div>
            <div className="text-xs text-green-600">
              {formatCurrency(Math.max(...data.map(d => d.revenue)))}
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-blue-800">Média Mensal</div>
            <div className="text-lg font-bold text-blue-600">
              {formatCurrency(data.reduce((sum, curr) => sum + curr.revenue, 0) / data.length)}
            </div>
            <div className="text-xs text-blue-600">Últimos {data.length} meses</div>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-purple-800">Crescimento</div>
            <div className="text-lg font-bold text-purple-600">
              {data.length >= 2 ? (
                ((data[data.length - 1].revenue - data[0].revenue) / data[0].revenue * 100).toFixed(1)
              ) : '0'}%
            </div>
            <div className="text-xs text-purple-600">Período total</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueEvolutionChart;