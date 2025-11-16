import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertTriangle, AlertCircle, Info, XCircle } from 'lucide-react';
import { Badge } from '../ui/badge';

export interface Anomaly {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
}

interface BIAnomaliesAlertProps {
  anomalies: Anomaly[];
  onDismiss?: (anomalyId: string) => void;
}

export const BIAnomaliesAlert: React.FC<BIAnomaliesAlertProps> = ({
  anomalies,
  onDismiss
}) => {
  const getIcon = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-900';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-900';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-900';
      case 'low':
        return 'bg-blue-100 border-blue-300 text-blue-900';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-900';
    }
  };

  const getSeverityBadge = (severity: Anomaly['severity']) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    };
    return variants[severity] || 'outline';
  };

  const sortedAnomalies = [...anomalies].sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });

  if (anomalies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-green-600" />
            Alertas de Anomalias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">✅</div>
            <p>Nenhuma anomalia detectada</p>
            <p className="text-sm mt-1">Sistema operando dentro dos padrões normais</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Alertas de Anomalias
          </CardTitle>
          <Badge variant="destructive">
            {anomalies.length} {anomalies.length === 1 ? 'Anomalia' : 'Anomalias'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedAnomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className={`p-4 rounded-lg border-2 ${getSeverityColor(anomaly.severity)} transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5">{getIcon(anomaly.severity)}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getSeverityBadge(anomaly.severity)}>
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {anomaly.metric}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(anomaly.detectedAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    <p className="font-medium">{anomaly.description}</p>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">Esperado</div>
                        <div className="font-semibold">{anomaly.expectedValue.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Atual</div>
                        <div className="font-semibold">{anomaly.actualValue.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Desvio</div>
                        <div className="font-semibold text-red-600">{anomaly.deviation.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {onDismiss && (
                  <button
                    onClick={() => onDismiss(anomaly.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="Descartar"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

