/**
 * Conversion Funnel Chart - Gráfico de funil de conversão
 * Activity Fisioterapia Integration - Analytics
 */
import React, { useEffect, useState } from 'react';
import { MetricsService } from '@/services/api/crm/metricsService';
import { TrendingDown, Users, CheckCircle } from 'lucide-react';
export const ConversionFunnelChart = ({ clinicId, dateFrom, dateTo, }) => {
    const [funnel, setFunnel] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadFunnel();
    }, [clinicId, dateFrom, dateTo]);
    const loadFunnel = async () => {
        try {
            setLoading(true);
            const data = await MetricsService.getConversionFunnel(clinicId, dateFrom, dateTo);
            setFunnel(data);
        }
        catch (error) {
            console.error('Erro ao carregar funil:', error);
        }
        finally {
            setLoading(false);
        }
    };
    if (loading || !funnel) {
        return (<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (<div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>))}
        </div>
      </div>);
    }
    const stages = [
        {
            label: 'Total de Leads',
            value: funnel.total,
            percentage: 100,
            color: 'bg-gray-500',
            icon: Users,
        },
        {
            label: 'Contatados',
            value: funnel.contacted,
            percentage: funnel.contact_rate,
            color: 'bg-blue-500',
            icon: CheckCircle,
        },
        {
            label: 'Qualificados',
            value: funnel.qualified,
            percentage: funnel.qualification_rate,
            color: 'bg-yellow-500',
            icon: CheckCircle,
        },
        {
            label: 'Agendados',
            value: funnel.scheduled,
            percentage: funnel.schedule_rate,
            color: 'bg-purple-500',
            icon: CheckCircle,
        },
        {
            label: 'Convertidos',
            value: funnel.converted,
            percentage: funnel.conversion_rate,
            color: 'bg-green-500',
            icon: CheckCircle,
        },
    ];
    return (<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Funil de Conversão
        </h2>
        <TrendingDown className="w-6 h-6 text-gray-400"/>
      </div>

      <div className="space-y-4">
        {stages.map((stage, index) => {
            const Icon = stage.icon;
            const width = (stage.value / funnel.total) * 100;
            return (<div key={index} className="relative">
              {/* Barra do funil */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {stage.label}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {stage.value} ({stage.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-10 relative overflow-hidden">
                    <div className={`${stage.color} h-full rounded-full transition-all duration-500 flex items-center justify-center`} style={{ width: `${width}%` }}>
                      {width > 20 && (<span className="text-white font-bold text-sm">
                          {stage.value}
                        </span>)}
                    </div>
                  </div>
                </div>
                <Icon className={`w-6 h-6 ${stage.color.replace('bg-', 'text-')}`}/>
              </div>

              {/* Seta de conexão */}
              {index < stages.length - 1 && (<div className="absolute left-1/2 bottom-0 transform translate-y-2 text-gray-400">
                  ↓
                </div>)}
            </div>);
        })}
      </div>

      {/* Taxa final de conversão em destaque */}
      <div className="mt-6 pt-6 border-t dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            Taxa de Conversão Total
          </span>
          <span className="text-3xl font-bold text-green-600 dark:text-green-400">
            {funnel.conversion_rate.toFixed(1)}%
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {funnel.converted} de {funnel.total} leads convertidos em pacientes
        </p>
      </div>
    </div>);
};
