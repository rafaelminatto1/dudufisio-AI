import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface PatientDistributionData {
  name: string;
  value: number;
  color: string;
  percentage?: number;
}

interface PatientDistributionChartProps {
  data: PatientDistributionData[];
  isLoading?: boolean;
}

const PatientDistributionChart: React.FC<PatientDistributionChartProps> = ({ 
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

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1)
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} pacientes ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    if (percent < 0.05) return null; // Não mostrar label se muito pequeno

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Distribuição de Pacientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithPercentage}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {dataWithPercentage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda personalizada */}
        <div className="mt-4 space-y-2">
          {dataWithPercentage.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">{item.value}</div>
                <div className="text-xs text-gray-500">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>

        {/* Estatísticas resumo */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{total}</div>
            <div className="text-sm text-blue-800">Total de Pacientes</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {dataWithPercentage.find(item => item.name === 'Ativos')?.percentage || '0'}%
            </div>
            <div className="text-sm text-green-800">Taxa de Atividade</div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <h4 className="text-sm font-semibold text-yellow-800 mb-2">Insights</h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            {dataWithPercentage.find(item => item.name === 'Inativos')?.value > 
             dataWithPercentage.find(item => item.name === 'Ativos')?.value * 0.2 && (
              <li>• Alta taxa de pacientes inativos - considere campanha de reativação</li>
            )}
            {dataWithPercentage.find(item => item.name === 'Em Avaliação')?.value > 
             total * 0.1 && (
              <li>• Muitos pacientes em avaliação - acelere processo de triagem</li>
            )}
            <li>• {Math.round((dataWithPercentage.find(item => item.name === 'Ativos')?.value || 0) / 30)} novos pacientes ativos por dia em média</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientDistributionChart;
