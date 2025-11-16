// components/atendimento/ai/RiskAnalysis.tsx
import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface Alert {
  id: string;
  severity: 'critical' | 'important' | 'info';
  message: string;
  recommendation?: string;
}

interface RiskAnalysisProps {
  alerts: Alert[];
  isLoading?: boolean;
}

export const RiskAnalysis: React.FC<RiskAnalysisProps> = ({ alerts, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-slate-300 rounded animate-pulse" />
          <div className="h-5 bg-slate-300 rounded animate-pulse w-48" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded animate-pulse w-full" />
          <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6" />
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="p-6 bg-green-50 rounded-lg border border-green-200 text-center">
        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <h4 className="font-semibold text-green-900 mb-1">✅ Sem Alertas</h4>
        <p className="text-sm text-green-700">
          Todos os protocolos estão sendo seguidos corretamente.
        </p>
      </div>
    );
  }

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const importantAlerts = alerts.filter(a => a.severity === 'important');
  const infoAlerts = alerts.filter(a => a.severity === 'info');

  const getSeverityConfig = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-300',
          iconColor: 'text-red-600',
          titleColor: 'text-red-900',
          textColor: 'text-red-800',
        };
      case 'important':
        return {
          icon: AlertCircle,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-300',
          iconColor: 'text-orange-600',
          titleColor: 'text-orange-900',
          textColor: 'text-orange-800',
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-300',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-900',
          textColor: 'text-blue-800',
        };
    }
  };

  const renderAlertSection = (title: string, sectionAlerts: Alert[], emoji: string) => {
    if (sectionAlerts.length === 0) return null;

    const config = getSeverityConfig(sectionAlerts[0].severity);
    const Icon = config.icon;

    return (
      <div className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
          <div className="flex-1">
            <h4 className={`font-semibold ${config.titleColor} mb-2`}>
              {emoji} {title}
            </h4>
            <ul className="space-y-2">
              {sectionAlerts.map((alert) => (
                <li key={alert.id} className="text-sm">
                  <p className={`${config.textColor} font-medium`}>{alert.message}</p>
                  {alert.recommendation && (
                    <p className={`${config.textColor} text-xs mt-1 opacity-90`}>
                      💡 {alert.recommendation}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        🔮 Análise de Risco e Alertas
      </h3>

      {renderAlertSection('CRÍTICO', criticalAlerts, '🔴')}
      {renderAlertSection('IMPORTANTE', importantAlerts, '🟡')}
      {renderAlertSection('BOAS PRÁTICAS', infoAlerts, '🟢')}
    </div>
  );
};
