import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ProfessionalData {
  name: string;
  sessions: number;
  revenue: number;
  efficiency?: number;
}

interface ProfessionalProductivityChartProps {
  data: ProfessionalData[];
  isLoading?: boolean;
}

const ProfessionalProductivityChart: React.FC<ProfessionalProductivityChartProps> = ({ 
  data, 
  isLoading = false 
}) => {
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
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const revenuePerSession = data.revenue / data.sessions;
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-600">Sessões:</span>
              <span className="font-medium">{data.sessions}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-600">Receita:</span>
              <span className="font-medium">{formatCurrency(data.revenue)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-600">Receita/Sessão:</span>
              <span className="font-medium">{formatCurrency(revenuePerSession)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calcular cores baseadas na performance
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const getBarColor = (revenue: number) => {
    const percentage = (revenue / maxRevenue) * 100;
    if (percentage >= 90) return '#10b981'; // Verde
    if (percentage >= 70) return '#3b82f6'; // Azul
    if (percentage >= 50) return '#f59e0b'; // Amarelo
    return '#ef4444'; // Vermelho
  };

  // Estatísticas
  const totalSessions = data.reduce((sum, d) => sum + d.sessions, 0);
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const avgSessionsPerProfessional = totalSessions / data.length;
  const avgRevenuePerProfessional = totalRevenue / data.length;

  // Top performer
  const topPerformer = data.reduce((max, curr) => 
    curr.revenue > max.revenue ? curr : max, data[0]
  );

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Produtividade por Profissional
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Bar dataKey="sessions" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.revenue)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Estatísticas */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-blue-800">Total Sessões</div>
            <div className="text-xl font-bold text-blue-600">{totalSessions}</div>
            <div className="text-xs text-blue-600">Este período</div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-green-800">Receita Total</div>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-xs text-green-600">Este período</div>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-purple-800">Média Sessões</div>
            <div className="text-xl font-bold text-purple-600">
              {avgSessionsPerProfessional.toFixed(1)}
            </div>
            <div className="text-xs text-purple-600">Por profissional</div>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-orange-800">Top Performer</div>
            <div className="text-sm font-bold text-orange-600">
              {topPerformer.name.split(' ')[0]}
            </div>
            <div className="text-xs text-orange-600">
              {topPerformer.sessions} sessões
            </div>
          </div>
        </div>

        {/* Ranking */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Ranking de Performance</h4>
          <div className="space-y-2">
            {data
              .sort((a, b) => b.revenue - a.revenue)
              .map((professional, index) => {
                const revenuePerSession = professional.revenue / professional.sessions;
                return (
                  <div key={professional.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-800">
                          {professional.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {professional.sessions} sessões
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm text-gray-800">
                        {formatCurrency(professional.revenue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(revenuePerSession)}/sessão
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalProductivityChart;
