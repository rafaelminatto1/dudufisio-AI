import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import {
  MessageSquare, Mail, Smartphone, Bell, TrendingUp, TrendingDown,
  Users, Clock, AlertTriangle, CheckCircle, XCircle,
  Filter, Download, RefreshCw, Calendar
} from 'lucide-react';
import { CommunicationMetrics, DashboardData, AnalyticsFilter } from '../../lib/communication/analytics/AnalyticsEngine';

interface CommunicationDashboardProps {
  className?: string;
}

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

const channelIcons = {
  whatsapp: MessageSquare,
  sms: Smartphone,
  email: Mail,
  push: Bell
};

export const CommunicationDashboard: React.FC<CommunicationDashboardProps> = ({
  className = ''
}) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['whatsapp', 'sms', 'email', 'push']);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const analyticsFilter = useMemo((): AnalyticsFilter => ({
    timeRange: selectedTimeRange,
    channels: selectedChannels,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }), [selectedTimeRange, selectedChannels]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would call the AnalyticsEngine
      // For now, we'll simulate the API call
      const response = await fetch('/api/communication/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analyticsFilter)
      });

      if (!response.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Dashboard loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [analyticsFilter]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, analyticsFilter]);

  const handleChannelToggle = (channel: string) => {
    setSelectedChannels(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number): string => `${num.toFixed(1)}%`;

  if (loading && !dashboardData) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="flex flex-col items-center space-y-4 text-center">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          <p className="text-red-600">Erro ao carregar dados: {error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Comunicação</h1>
          <p className="text-gray-600 mt-1">
            Métricas e análises em tempo real dos canais de comunicação
          </p>
        </div>

        <div className="flex flex-wrap items-center space-x-4">
          {/* Time Range Selector */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="24h">Últimas 24h</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>

          {/* Auto Refresh Toggle */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Atualização automática</span>
          </label>

          {/* Refresh Button */}
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-purple-600 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export Button */}
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Channel Filters */}
      <div className="flex flex-wrap items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Canais:</span>
        {Object.entries(channelIcons).map(([channel, Icon]) => (
          <label key={channel} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedChannels.includes(channel)}
              onChange={() => handleChannelToggle(channel)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <Icon className="h-4 w-4" />
            <span className="text-sm capitalize">{channel}</span>
          </label>
        ))}
      </div>

      {/* Alert Notifications */}
      {dashboardData.alerts && dashboardData.alerts.length > 0 && (
        <div className="space-y-2">
          {dashboardData.alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                alert.severity === 'high' ? 'bg-red-50 border-red-400' :
                alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className={`h-5 w-5 ${
                  alert.severity === 'high' ? 'text-red-600' :
                  alert.severity === 'medium' ? 'text-yellow-600' :
                  'text-blue-600'
                }`} />
                <span className="font-medium">{alert.title}</span>
                <span className="text-sm text-gray-600">{alert.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Mensagens Enviadas"
          value={formatNumber(dashboardData.overview.totalMessages)}
          change={dashboardData.overview.messageGrowth}
          icon={MessageSquare}
          color="purple"
        />
        <MetricCard
          title="Taxa de Entrega"
          value={formatPercentage(dashboardData.overview.deliveryRate)}
          change={dashboardData.overview.deliveryRateChange}
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          title="Taxa de Engajamento"
          value={formatPercentage(dashboardData.overview.engagementRate)}
          change={dashboardData.overview.engagementChange}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Custo Total"
          value={`R$ ${dashboardData.overview.totalCost.toFixed(2)}`}
          change={dashboardData.overview.costChange}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages Over Time */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Mensagens ao Longo do Tempo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboardData.timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="messages"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Performance por Canal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.channelMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="deliveryRate" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Message Type Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Distribuição por Tipo de Mensagem</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.messageTypeMetrics}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {dashboardData.messageTypeMetrics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Delivery Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Status de Entrega</h3>
          <div className="space-y-4">
            {Object.entries(dashboardData.overview.deliveryStatusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {status === 'delivered' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                  {status === 'pending' && <Clock className="h-4 w-4 text-yellow-600" />}
                  <span className="capitalize">{status}</span>
                </div>
                <span className="font-medium">{formatNumber(count)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Atividade Recente</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Canal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destinatário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dashboardData.recentMessages.map((message, index) => {
                const Icon = channelIcons[message.channel as keyof typeof channelIcons];
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span className="capitalize">{message.channel}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">{message.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{message.recipient}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        message.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        message.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {message.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{message.timestamp}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<any>;
  color: 'purple' | 'green' | 'blue' | 'orange';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, color }) => {
  const colorClasses = {
    purple: 'text-purple-600 bg-purple-100',
    green: 'text-green-600 bg-green-100',
    blue: 'text-blue-600 bg-blue-100',
    orange: 'text-orange-600 bg-orange-100'
  };

  const isPositive = change > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className={`flex items-center space-x-1 text-sm ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          <TrendIcon className="h-4 w-4" />
          <span>{Math.abs(change).toFixed(1)}%</span>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
};

export default CommunicationDashboard;