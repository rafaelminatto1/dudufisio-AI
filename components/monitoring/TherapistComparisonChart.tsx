import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from '@/components/charts/ChartsLazyOptimized';
import { CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';

export interface TherapistStats {
  therapistName: string;
  attendanceRate: number; // 0-100
  totalPatients: number;
  totalSessions: number;
  averageRiskScore: number; // 0-10
}

interface TherapistComparisonChartProps {
  data: TherapistStats[];
}

export const TherapistComparisonChart: React.FC<TherapistComparisonChartProps> = ({ data }) => {
  const getColor = (rate: number) => {
    if (rate >= 90) return '#10b981';
    if (rate >= 75) return '#3b82f6';
    if (rate >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900 mb-2">{data.therapistName}</p>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600">
              Taxa de Presença: <span className="font-semibold">{data.attendanceRate.toFixed(1)}%</span>
            </p>
            <p className="text-slate-600">
              Pacientes: <span className="font-semibold">{data.totalPatients}</span>
            </p>
            <p className="text-slate-600">
              Sessões: <span className="font-semibold">{data.totalSessions}</span>
            </p>
            <p className="text-amber-600">
              Risco Médio: <span className="font-semibold">{data.averageRiskScore.toFixed(1)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg">Comparação entre Terapeutas</CardTitle>
        <CardDescription>Performance e indicadores por profissional</CardDescription>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={data}
            margin={{ top: 5, right: 30, bottom: 5, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis 
              dataKey="therapistName"
              className="text-xs"
              stroke="#64748b"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              domain={[0, 100]}
              className="text-xs"
              stroke="#64748b"
              label={{ value: 'Taxa de Presença (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="attendanceRate"
              radius={[8, 8, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.attendanceRate)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Tabela resumo */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 text-slate-600 font-semibold">Terapeuta</th>
                <th className="text-center py-2 px-3 text-slate-600 font-semibold">Pacientes</th>
                <th className="text-center py-2 px-3 text-slate-600 font-semibold">Sessões</th>
                <th className="text-center py-2 px-3 text-slate-600 font-semibold">Presença</th>
                <th className="text-center py-2 px-3 text-slate-600 font-semibold">Risco Médio</th>
              </tr>
            </thead>
            <tbody>
              {data.map((therapist, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-3 font-medium text-slate-900">{therapist.therapistName}</td>
                  <td className="py-2 px-3 text-center text-slate-700">{therapist.totalPatients}</td>
                  <td className="py-2 px-3 text-center text-slate-700">{therapist.totalSessions}</td>
                  <td className="py-2 px-3 text-center">
                    <span 
                      className="px-2 py-0.5 rounded-full text-white font-semibold"
                      style={{ backgroundColor: getColor(therapist.attendanceRate) }}
                    >
                      {therapist.attendanceRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center text-slate-700">{therapist.averageRiskScore.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </>
  );
};

