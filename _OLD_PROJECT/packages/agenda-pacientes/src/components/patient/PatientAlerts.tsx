import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle, X, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

interface PatientAlertsProps {
  patientId: string;
  currentSessionNumber?: number;
}

const alertConfig = {
  missing_test: {
    icon: AlertCircle,
    colorClass: 'border-red-400 bg-red-50',
    iconColor: 'text-red-600',
    badgeVariant: 'destructive' as const
  },
  regression: {
    icon: AlertTriangle,
    colorClass: 'border-orange-400 bg-orange-50',
    iconColor: 'text-orange-600',
    badgeVariant: 'destructive' as const
  },
  reminder: {
    icon: Info,
    colorClass: 'border-blue-400 bg-blue-50',
    iconColor: 'text-blue-600',
    badgeVariant: 'secondary' as const
  },
  milestone: {
    icon: CheckCircle,
    colorClass: 'border-green-400 bg-green-50',
    iconColor: 'text-green-600',
    badgeVariant: 'default' as const
  }
};

const severityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta'
};

export const PatientAlerts: React.FC<PatientAlertsProps> = ({
  patientId,
  currentSessionNumber
}) => {
  const { alerts, loading, dismissAlert } = usePatientAlerts(patientId, currentSessionNumber);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        Verificando alertas...
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Nenhum alerta no momento</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Alertas e Notificações ({alerts.length})
        </h3>
      </div>

      {alerts.map((alert) => {
        const config = alertConfig[alert.type];
        const Icon = config.icon;

        return (
          <Card
            key={alert.id}
            className={`border-l-4 ${config.colorClass} transition-all hover:shadow-lg`}
          >
            <CardContent className="py-3 px-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {alert.title}
                      </h4>
                      <Badge variant={config.badgeVariant} className="text-xs">
                        {severityLabels[alert.severity]}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-slate-700 mb-2">
                      {alert.message}
                    </p>

                    {alert.actionUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(alert.actionUrl!)}
                        className="text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Ver Detalhes
                      </Button>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAlert(alert.id)}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PatientAlerts;




