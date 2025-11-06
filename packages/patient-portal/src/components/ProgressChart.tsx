/**
 * Componente de Gráfico de Progresso
 * MoocaFisio - App para Pacientes
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProgressDataPoint } from '../services/patientStatsService';

interface ProgressChartProps {
  data: ProgressDataPoint[];
}

export default function ProgressChart({ data }: ProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-xl text-neutral-textSecondary">
        <p>Nenhum dado disponível ainda</p>
      </div>
    );
  }
  
  // Preparar dados para o gráfico (mostrar apenas últimos 14 dias para melhor visualização)
  const recentData = data.slice(-14);
  
  return (
    <div className="w-full h-64 mt-md">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={recentData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="dayOfWeek"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#1f2937', fontWeight: 600 }}
            formatter={(value: number) => [`${value} exercício${value !== 1 ? 's' : ''}`, 'Completados']}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: '#2563eb', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

