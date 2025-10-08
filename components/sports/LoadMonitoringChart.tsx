import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { LoadMonitoring } from '../../types/sportsRehabTypes';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface LoadMonitoringChartProps {
  data: LoadMonitoring[];
}

export const LoadMonitoringChart: React.FC<LoadMonitoringChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Monitoramento de Carga (ACWR)
        </h2>
        <div className="text-center py-12 text-gray-500">
          <TrendingUp className="w-16 h-16 mx-auto mb-3 opacity-20" />
          <p className="text-lg">Nenhum dado de carga registrado</p>
          <p className="text-sm mt-2">Adicione sessões de treinamento para ver a análise de carga</p>
        </div>
      </div>
    );
  }

  // Preparar dados para o gráfico
  const chartData = data.map(load => ({
    week: load.weekYear,
    acwr: parseFloat(load.acwr.toFixed(2)),
    acuteLoad: parseFloat(load.acuteLoad.toFixed(0)),
    chronicLoad: parseFloat(load.chronicLoad.toFixed(0)),
  })).reverse(); // Reverter para ordem cronológica

  // Último ACWR
  const lastLoad = data[0];
  const isHighRisk = lastLoad.acwr > 1.5;
  const isLowRisk = lastLoad.acwr < 0.8;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Monitoramento de Carga (ACWR)
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Última semana:</span>
          <span className={`text-2xl font-bold ${
            isHighRisk ? 'text-red-600' :
            isLowRisk ? 'text-orange-600' :
            'text-green-600'
          }`}>
            {lastLoad.acwr.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Alert se necessário */}
      {(isHighRisk || isLowRisk) && (
        <div className={`mb-4 p-4 rounded-lg border ${
          isHighRisk ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-5 h-5 ${
              isHighRisk ? 'text-red-600' : 'text-orange-600'
            }`} />
            <div>
              <h4 className={`font-semibold mb-1 ${
                isHighRisk ? 'text-red-900' : 'text-orange-900'
              }`}>
                {isHighRisk ? '⚠️ Risco Aumentado de Lesão' : '⚠️ Carga Insuficiente'}
              </h4>
              <p className={`text-sm ${
                isHighRisk ? 'text-red-800' : 'text-orange-800'
              }`}>
                {isHighRisk 
                  ? 'ACWR > 1.5 indica aumento agudo de carga. Considere reduzir a intensidade.'
                  : 'ACWR < 0.8 indica descarga. Paciente pode não estar progredindo adequadamente.'}
              </p>
              {lastLoad.recommendations && lastLoad.recommendations.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {lastLoad.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm">• {rec}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gráfico */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="week" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px'
              }}
            />
            <Legend />
            
            {/* Linhas de referência ACWR */}
            <ReferenceLine y={0.8} stroke="#f59e0b" strokeDasharray="5 5" label="Mín" />
            <ReferenceLine y={1.5} stroke="#ef4444" strokeDasharray="5 5" label="Máx" />
            
            <Line 
              type="monotone" 
              dataKey="acwr" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="ACWR"
              dot={{ fill: '#3b82f6', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="acuteLoad" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Carga Aguda"
              strokeDasharray="5 5"
            />
            <Line 
              type="monotone" 
              dataKey="chronicLoad" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name="Carga Crônica"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda Explicativa */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="p-3 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-1">ACWR (Acute:Chronic Workload Ratio)</h4>
          <p className="text-blue-800">
            Razão entre carga aguda (última semana) e carga crônica (últimas 4 semanas)
          </p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-1">Zona Segura</h4>
          <p className="text-green-800">
            ACWR entre 0.8 e 1.5 = Risco minimizado de lesão
          </p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <h4 className="font-semibold text-red-900 mb-1">Zona de Risco</h4>
          <p className="text-red-800">
            ACWR &gt; 1.5 = Aumento de 2-4x no risco de lesão
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadMonitoringChart;



