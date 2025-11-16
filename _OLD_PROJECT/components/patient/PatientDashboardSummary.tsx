import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Calendar, 
  TrendingUp, 
  Activity, 
  Target, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  Heart
} from 'lucide-react';
import { Patient } from '../../types';

interface PatientDashboardSummaryProps {
  patient: Patient;
  stats?: {
    totalSessions: number;
    completedSessions: number;
    upcomingSessions: number;
    adherenceRate: number;
    averagePain: number;
    lastSessionDate?: string;
    activeGoals: number;
    completedGoals: number;
  };
}

export const PatientDashboardSummary: React.FC<PatientDashboardSummaryProps> = ({
  patient,
  stats = {
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    adherenceRate: 0,
    averagePain: 0,
    activeGoals: 0,
    completedGoals: 0
  }
}) => {
  const getAdherenceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-50';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getPainColor = (pain: number) => {
    if (pain <= 3) return 'text-green-600 bg-green-50';
    if (pain <= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const adherenceColor = getAdherenceColor(stats.adherenceRate);
  const painColor = getPainColor(stats.averagePain);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="patient-dashboard-summary">
      {/* Sessões Realizadas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Sessões
          </CardTitle>
          <Calendar className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedSessions}</div>
          <p className="text-xs text-muted-foreground mt-1">
            de {stats.totalSessions} agendadas
          </p>
          {stats.lastSessionDate && (
            <p className="text-xs text-muted-foreground mt-2">
              Última: {new Date(stats.lastSessionDate).toLocaleDateString('pt-BR')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Taxa de Adesão */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Adesão
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.adherenceRate}%</div>
          <Badge className={`mt-2 ${adherenceColor}`} variant="secondary">
            {stats.adherenceRate >= 80 ? 'Excelente' : stats.adherenceRate >= 60 ? 'Bom' : 'Precisa atenção'}
          </Badge>
          {stats.upcomingSessions > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {stats.upcomingSessions} sessões agendadas
            </p>
          )}
        </CardContent>
      </Card>

      {/* Dor Média (EVA) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Dor Média (EVA)
          </CardTitle>
          <Activity className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averagePain.toFixed(1)}/10</div>
          <Badge className={`mt-2 ${painColor}`} variant="secondary">
            {stats.averagePain <= 3 ? 'Leve' : stats.averagePain <= 6 ? 'Moderada' : 'Intensa'}
          </Badge>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${stats.averagePain <= 3 ? 'bg-green-500' : stats.averagePain <= 6 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${(stats.averagePain / 10) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Objetivos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Objetivos
          </CardTitle>
          <Target className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeGoals}</div>
          <p className="text-xs text-muted-foreground mt-1">
            ativos
          </p>
          {stats.completedGoals > 0 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              <span>{stats.completedGoals} concluídos</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Componente de Estatísticas Rápidas (versão compacta)
export const QuickStats: React.FC<{ patient: Patient }> = ({ patient }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="quick-stats">
      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
        <Calendar className="h-5 w-5 text-blue-600" />
        <div>
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="text-sm font-semibold">{patient.status}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <div>
          <p className="text-xs text-muted-foreground">Ativo desde</p>
          <p className="text-sm font-semibold">
            {patient.createdAt ? new Date(patient.createdAt).getFullYear() : 'N/A'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
        <Heart className="h-5 w-5 text-purple-600" />
        <div>
          <p className="text-xs text-muted-foreground">Idade</p>
          <p className="text-sm font-semibold">
            {patient.birthDate 
              ? Math.floor((new Date().getTime() - new Date(patient.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
              : 'N/A'
            } anos
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
        <Clock className="h-5 w-5 text-orange-600" />
        <div>
          <p className="text-xs text-muted-foreground">Convênio</p>
          <p className="text-sm font-semibold truncate">
            {patient.healthInsurance || 'Particular'}
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente de Alertas e Avisos
interface AlertItem {
  type: 'warning' | 'info' | 'success';
  message: string;
  date?: string;
}

export const PatientAlerts: React.FC<{ alerts: AlertItem[] }> = ({ alerts }) => {
  if (alerts.length === 0) return null;

  return (
    <Card data-testid="patient-alerts">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          Avisos e Alertas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`flex items-start gap-2 p-2 rounded-md ${
              alert.type === 'warning'
                ? 'bg-yellow-50 border border-yellow-200'
                : alert.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-blue-50 border border-blue-200'
            }`}
          >
            {alert.type === 'warning' && (
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            )}
            {alert.type === 'success' && (
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
            )}
            {alert.type === 'info' && (
              <Activity className="h-4 w-4 text-blue-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-sm">{alert.message}</p>
              {alert.date && (
                <p className="text-xs text-muted-foreground mt-1">{alert.date}</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

