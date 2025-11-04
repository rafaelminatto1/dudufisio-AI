import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HealthTrend } from '../../types/populationHealthTypes';

interface PopulationTrendChartProps {
  trends: HealthTrend[];
  title?: string;
}

export const PopulationTrendChart: React.FC<PopulationTrendChartProps> = ({ 
  trends,
  title = 'Tendências de Saúde Populacional'
}) => {
  const chartData = trends.map(t => ({
    period: t.period,
    value: t.value,
    change: t.change,
    patients: t.patientCount,
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Valor Médio"
              dot={{ fill: '#3b82f6', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="patients"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="Nº Pacientes"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PopulationTrendChart;

