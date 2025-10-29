import React from 'react';
import { Users, TrendingUp, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { KPIMetrics } from '../../types';

interface KPICardsProps {
  metrics: KPIMetrics;
}

interface KPICardData {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
  trend?: number;
  trendLabel?: string;
}

export const KPICards: React.FC<KPICardsProps> = ({ metrics }) => {
  const cards: KPICardData[] = [
    {
      title: 'Pacientes Ativos',
      value: metrics.totalActivePatients,
      subtitle: 'Total em acompanhamento',
      icon: Users,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      trend: metrics.trends.activePatients,
      trendLabel: 'vs. período anterior',
    },
    {
      title: 'Taxa de Presença',
      value: `${metrics.averageAttendanceRate.toFixed(1)}%`,
      subtitle: 'Média geral',
      icon: TrendingUp,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      trend: metrics.trends.attendanceRate,
      trendLabel: 'vs. período anterior',
    },
    {
      title: 'Pacientes em Risco',
      value: metrics.patientsAtRisk,
      subtitle: 'Requerem atenção',
      icon: AlertTriangle,
      iconBgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
      trend: metrics.trends.patientsAtRisk,
      trendLabel: 'vs. período anterior',
    },
    {
      title: 'Faltas no Período',
      value: metrics.totalMissesInPeriod,
      subtitle: 'Total de ausências',
      icon: XCircle,
      iconBgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      trend: metrics.trends.misses,
      trendLabel: 'vs. período anterior',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <KPICard key={index} {...card} />
      ))}
    </div>
  );
};

const KPICard: React.FC<KPICardData> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor,
  iconColor,
  trend,
  trendLabel,
}) => {
  const showTrend = trend !== undefined && trend !== 0;
  const trendPositive = trend && trend > 0;
  const trendColor = trendPositive ? 'text-green-600' : 'text-red-600';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
            <p className="text-xs text-slate-500">{subtitle}</p>
            
            {showTrend && (
              <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendColor}`}>
                <span>{trendPositive ? '↑' : '↓'}</span>
                <span>{Math.abs(trend!).toFixed(1)}%</span>
                {trendLabel && <span className="text-slate-400">{trendLabel}</span>}
              </div>
            )}
          </div>
          
          <div className={`${iconBgColor} rounded-full p-3`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

