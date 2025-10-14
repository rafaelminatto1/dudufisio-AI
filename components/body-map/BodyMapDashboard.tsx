/**
 * BODY MAP DASHBOARD
 * Dashboard analítico completo com gráficos e métricas do mapa corporal
 */

import React, { useMemo } from 'react';
import type { BodyMapAnalytics } from '../../types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingDown, TrendingUp, Minus, Activity, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { getPainLevelColor } from '../../services/bodyMapService';

interface BodyMapDashboardProps {
  analytics: BodyMapAnalytics;
  showMainComplaint?: boolean;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#f97316'];

const BodyMapDashboard: React.FC<BodyMapDashboardProps> = ({
  analytics,
  showMainComplaint = true,
}) => {
  // Preparar dados do gráfico de linha (evolução)
  const lineChartData = useMemo(() => {
    return analytics.painTrend.map(item => ({
      date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      dor: item.averagePain,
      regiões: item.activeRegions,
    }));
  }, [analytics.painTrend]);

  // Preparar dados do gráfico de barras (frequência por região)
  const barChartData = useMemo(() => {
    return Object.entries(analytics.regionFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10) // Top 10 regiões
      .map(([region, frequency]) => ({
        região: region.replace(/_/g, ' '),
        frequência: frequency,
      }));
  }, [analytics.regionFrequency]);

  // Preparar dados do gráfico de pizza (tipos de dor)
  const pieChartData = useMemo(() => {
    return Object.entries(analytics.painTypeDistribution).map(([type, count]) => ({
      name: type,
      value: count,
    }));
  }, [analytics.painTypeDistribution]);

  // Calcular tendência
  const trend = useMemo(() => {
    if (analytics.painTrend.length < 2) return 'stable';
    const first = analytics.painTrend[0].averagePain;
    const last = analytics.painTrend[analytics.painTrend.length - 1].averagePain;
    const change = ((last - first) / first) * 100;
    if (change < -10) return 'improving';
    if (change > 10) return 'worsening';
    return 'stable';
  }, [analytics.painTrend]);

  return (
    <div className="space-y-6">
      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Sessões */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total de Sessões</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{analytics.totalSessions}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Sessões Sem Dor */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Sessões Sem Dor</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{analytics.painFreeSessions}</p>
              <p className="text-xs text-slate-500 mt-1">
                {analytics.totalSessions > 0
                  ? `${((analytics.painFreeSessions / analytics.totalSessions) * 100).toFixed(1)}%`
                  : '0%'}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Dor Média */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Dor Média</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">
                {analytics.averagePainLevel.toFixed(1)}
                <span className="text-lg font-normal text-slate-500">/10</span>
              </p>
              <div
                className="h-2 w-full bg-slate-100 rounded-full mt-2 overflow-hidden"
              >
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(analytics.averagePainLevel / 10) * 100}%`,
                    backgroundColor: getPainLevelColor(analytics.averagePainLevel),
                  }}
                />
              </div>
            </div>
            <div className="bg-amber-100 rounded-full p-3">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Tendência */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Tendência</p>
              <div className="flex items-center gap-2 mt-1">
                {trend === 'improving' && (
                  <>
                    <TrendingDown className="w-6 h-6 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">Melhorando</span>
                  </>
                )}
                {trend === 'worsening' && (
                  <>
                    <TrendingUp className="w-6 h-6 text-red-600" />
                    <span className="text-2xl font-bold text-red-600">Piorando</span>
                  </>
                )}
                {trend === 'stable' && (
                  <>
                    <Minus className="w-6 h-6 text-amber-600" />
                    <span className="text-2xl font-bold text-amber-600">Estável</span>
                  </>
                )}
              </div>
              {analytics.improvementPercent !== 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  {analytics.improvementPercent > 0 ? '+' : ''}
                  {analytics.improvementPercent.toFixed(1)}% desde início
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Regiões Ativas vs Resolvidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Regiões com Dor</h3>
            <MapPin className="w-5 h-5 text-slate-600" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Ativas</p>
              <p className="text-3xl font-bold text-red-600">{analytics.activeRegions}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Resolvidas</p>
              <p className="text-3xl font-bold text-green-600">{analytics.resolvedRegions}</p>
            </div>
          </div>
        </div>

        {/* Card de Progresso da Queixa Principal */}
        {showMainComplaint && analytics.mainComplaintProgress.length > 0 && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-amber-400 rounded-full p-2">
                <AlertCircle className="w-5 h-5 text-amber-900" />
              </div>
              <h3 className="text-lg font-bold text-amber-900">Queixa Principal</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-amber-800">Início:</span>
                <span className="font-bold text-amber-900">
                  {analytics.mainComplaintProgress[0]?.painLevel || 0}/10
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-amber-800">Atual:</span>
                <span className="font-bold text-amber-900">
                  {analytics.mainComplaintProgress[analytics.mainComplaintProgress.length - 1]?.painLevel || 0}/10
                </span>
              </div>
              <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{
                    width: `${Math.max(
                      0,
                      100 -
                        ((analytics.mainComplaintProgress[analytics.mainComplaintProgress.length - 1]?.painLevel || 0) /
                          (analytics.mainComplaintProgress[0]?.painLevel || 1)) *
                          100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs text-amber-700 text-center mt-2">
                {analytics.improvementPercent > 0
                  ? `Melhoria de ${analytics.improvementPercent.toFixed(0)}%`
                  : 'Sem melhoria significativa ainda'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Gráfico de Evolução da Dor */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Evolução da Dor ao Longo do Tempo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={lineChartData}>
            <defs>
              <linearGradient id="colorDor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
            <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} stroke="#64748b" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="dor"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#colorDor)"
              name="Nível de Dor"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Gráficos Lado a Lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Frequência por Região */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Regiões Mais Afetadas</h3>
          {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" style={{ fontSize: '11px' }} />
                <YAxis dataKey="região" type="category" stroke="#64748b" style={{ fontSize: '11px' }} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="frequência" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p>Sem dados suficientes</p>
            </div>
          )}
        </div>

        {/* Gráfico de Pizza - Tipos de Dor */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Distribuição de Tipos de Dor</h3>
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p>Sem dados suficientes</p>
            </div>
          )}
        </div>
      </div>

      {/* Mapa de Calor - Heatmap */}
      {analytics.heatmapData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Intensidade de Dor por Região</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {analytics.heatmapData
              .sort((a, b) => b.avgPainLevel - a.avgPainLevel)
              .slice(0, 12)
              .map((data) => (
                <div
                  key={data.region}
                  className="p-4 rounded-lg border-2"
                  style={{
                    backgroundColor: `${getPainLevelColor(data.avgPainLevel)}20`,
                    borderColor: getPainLevelColor(data.avgPainLevel),
                  }}
                >
                  <div className="text-sm font-medium text-slate-700 mb-1">
                    {data.region.replace(/_/g, ' ')}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Média:</span>
                    <span
                      className="text-lg font-bold"
                      style={{ color: getPainLevelColor(data.avgPainLevel) }}
                    >
                      {data.avgPainLevel.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-600">Freq:</span>
                    <span className="text-sm font-semibold text-slate-700">{data.frequency}x</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyMapDashboard;

