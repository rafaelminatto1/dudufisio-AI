import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from '@/components/charts/ChartsLazyOptimized';
import { TrendingUp, Eye, Edit, Share2, Users, Calendar, Award } from 'lucide-react';
import materialAnalyticsService from '../../services/materialAnalyticsService';
import materialTemplateService from '../../services/materialTemplateService';

export const MaterialAnalyticsDashboard: React.FC = () => {
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [stats, trendsData] = await Promise.all([
        materialAnalyticsService.getGlobalAnalytics(),
        materialAnalyticsService.getTrends(30),
      ]);
      
      setGlobalStats(stats);
      setTrends(trendsData);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!globalStats) {
    return null;
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Visualizações"
          value={globalStats.totalViews}
          icon={<Eye className="w-6 h-6" />}
          color="blue"
          trend={`+${globalStats.viewsThisWeek} esta semana`}
        />
        <StatCard
          title="Total de Edições"
          value={globalStats.totalEdits}
          icon={<Edit className="w-6 h-6" />}
          color="emerald"
          trend="Atividade de edição"
        />
        <StatCard
          title="Compartilhamentos"
          value={globalStats.totalShares}
          icon={<Share2 className="w-6 h-6" />}
          color="purple"
          trend="Engajamento"
        />
        <StatCard
          title="Usuários Ativos"
          value={globalStats.activeUsers}
          icon={<Users className="w-6 h-6" />}
          color="orange"
          trend="Contribuidores"
        />
      </div>

      {/* Gráfico de Tendências */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Tendências de Uso (Últimos 30 dias)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends?.dailyViews || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="count" 
              name="Visualizações" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Materiais Mais Visualizados */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            Materiais Mais Visualizados
          </h3>
          <div className="space-y-3">
            {globalStats.mostViewedMaterials.slice(0, 5).map((item: any, index: number) => (
              <div key={item.materialId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">Material #{item.materialId.slice(0, 8)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-700">{item.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Materiais Mais Editados */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Edit className="w-5 h-5 text-emerald-600" />
            Materiais Mais Editados
          </h3>
          <div className="space-y-3">
            {globalStats.mostEditedMaterials.slice(0, 5).map((item: any, index: number) => (
              <div key={item.materialId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">Material #{item.materialId.slice(0, 8)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Edit className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-700">{item.edits}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Atividade por Dia da Semana */}
      {trends && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Atividade por Período
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trends.dailyViews.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Visualizações" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'purple' | 'orange';
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 text-blue-700 bg-blue-600',
    emerald: 'from-emerald-50 to-emerald-100 text-emerald-700 bg-emerald-600',
    purple: 'from-purple-50 to-purple-100 text-purple-700 bg-purple-600',
    orange: 'from-orange-50 to-orange-100 text-orange-700 bg-orange-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl shadow-md p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-white/50 ${colorClasses[color].split(' ')[2]}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold mb-1">{value.toLocaleString()}</div>
      <div className="text-sm opacity-90">{title}</div>
      {trend && (
        <div className="mt-2 text-xs font-medium opacity-75">{trend}</div>
      )}
    </div>
  );
};

export default MaterialAnalyticsDashboard;

