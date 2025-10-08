/**
 * Dashboard Metrics - Componente de métricas principais do CRM
 * Activity Fisioterapia Integration - Fase 1
 */

import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, CheckCircle, Clock, AlertTriangle, Phone } from 'lucide-react';
import { MetricsService } from '@/services/api/crm/metricsService';
import { DashboardMetrics as DashboardMetricsType } from '@/types/crm';

interface DashboardMetricsProps {
  clinicId: string;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ clinicId }) => {
  const [metrics, setMetrics] = useState<DashboardMetricsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, [clinicId]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await MetricsService.getDashboardMetrics(clinicId);
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const cards = [
    {
      title: 'Total de Leads',
      value: metrics.total_leads,
      icon: Users,
      color: 'blue',
      subtitle: `${metrics.new_leads_today} novos hoje`,
    },
    {
      title: 'Novos (Semana)',
      value: metrics.new_leads_week,
      icon: TrendingUp,
      color: 'green',
      subtitle: `${metrics.new_leads_month} este mês`,
    },
    {
      title: 'Taxa de Conversão',
      value: `${metrics.conversion_rate.toFixed(1)}%`,
      icon: CheckCircle,
      color: 'purple',
      subtitle: `${metrics.converted_this_month} convertidos/mês`,
    },
    {
      title: 'Tempo de Resposta',
      value: metrics.avg_response_time_minutes > 0 
        ? `${metrics.avg_response_time_minutes}min`
        : 'N/A',
      icon: Clock,
      color: 'yellow',
      subtitle: 'Média de resposta',
    },
    {
      title: 'Urgentes',
      value: metrics.urgent_leads,
      icon: AlertTriangle,
      color: 'red',
      subtitle: `${metrics.high_urgency_leads} alta urgência`,
    },
    {
      title: 'Precisam Follow-up',
      value: metrics.leads_needing_followup,
      icon: Phone,
      color: 'orange',
      subtitle: 'Ação necessária',
    },
    {
      title: 'Novos',
      value: metrics.leads_by_status.novo,
      icon: Users,
      color: 'gray',
      subtitle: 'Aguardando contato',
    },
    {
      title: 'Qualificados',
      value: metrics.leads_by_status.qualificado,
      icon: CheckCircle,
      color: 'teal',
      subtitle: 'Prontos para agendar',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    gray: 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </h3>
              <div className={`p-2 rounded-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {card.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

