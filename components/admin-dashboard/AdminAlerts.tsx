import React from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  DollarSign, 
  Clock, 
  FileText, 
  Target, 
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';

export interface AdminAlert {
  id: string;
  type: 'payment' | 'material' | 'document' | 'goal';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  count?: number;
  actionRequired?: boolean;
  dueDate?: string;
}

interface AdminAlertsProps {
  alerts: AdminAlert[];
  onViewDetails?: (alertId: string) => void;
  onMarkResolved?: (alertId: string) => void;
  isLoading?: boolean;
}

const AdminAlerts: React.FC<AdminAlertsProps> = ({ 
  alerts, 
  onViewDetails, 
  onMarkResolved,
  isLoading = false 
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'payment': return <DollarSign className="w-5 h-5" />;
      case 'material': return <Clock className="w-5 h-5" />;
      case 'document': return <FileText className="w-5 h-5" />;
      case 'goal': return <Target className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getIconColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Alertas Administrativos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Tudo em ordem!</h3>
        <p className="text-gray-600">Não há alertas administrativos no momento.</p>
      </div>
    );
  }

  const highPriorityAlerts = alerts.filter(alert => alert.severity === 'high');
  const mediumPriorityAlerts = alerts.filter(alert => alert.severity === 'medium');
  const lowPriorityAlerts = alerts.filter(alert => alert.severity === 'low');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Alertas Administrativos</h3>
        <div className="flex items-center gap-2">
          {highPriorityAlerts.length > 0 && (
            <Badge className="bg-red-100 text-red-800">
              {highPriorityAlerts.length} crítico{highPriorityAlerts.length > 1 ? 's' : ''}
            </Badge>
          )}
          {mediumPriorityAlerts.length > 0 && (
            <Badge className="bg-yellow-100 text-yellow-800">
              {mediumPriorityAlerts.length} médio{mediumPriorityAlerts.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {alerts.map((alert) => (
          <Alert key={alert.id} className={`${getSeverityColor(alert.severity)} border hover:shadow-md transition-shadow`}>
            <div className="flex items-start gap-3">
              <div className={`p-1 ${getIconColor(alert.severity)}`}>
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm text-gray-800 truncate">
                    {alert.title}
                  </h4>
                  <div className="flex items-center gap-1 ml-2">
                    {alert.count && (
                      <Badge variant="secondary" className="text-xs">
                        {alert.count}
                      </Badge>
                    )}
                    <Badge className={`text-xs ${getSeverityBadgeColor(alert.severity)}`}>
                      {alert.severity === 'high' ? 'Alto' : 
                       alert.severity === 'medium' ? 'Médio' : 'Baixo'}
                    </Badge>
                  </div>
                </div>
                
                <AlertDescription className="text-xs text-gray-600 mb-3">
                  {alert.description}
                </AlertDescription>

                {alert.dueDate && (
                  <div className="text-xs text-gray-500 mb-3">
                    Vencimento: {alert.dueDate}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {onViewDetails && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDetails(alert.id)}
                      className="text-xs h-7 px-2"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                  )}
                  {onMarkResolved && alert.actionRequired !== false && (
                    <Button
                      size="sm"
                      onClick={() => onMarkResolved(alert.id)}
                      className="text-xs h-7 px-2"
                      variant={alert.severity === 'high' ? 'default' : 'secondary'}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Resolver
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Alert>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Alertas</p>
              <p className="text-2xl font-bold text-gray-800">{alerts.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Críticos</p>
              <p className="text-2xl font-bold text-red-600">{highPriorityAlerts.length}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolvidos Hoje</p>
              <p className="text-2xl font-bold text-green-600">7</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAlerts;