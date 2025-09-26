import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Settings,
  Calendar,
  Clock,
  Mail,
  Smartphone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  TestTube,
  Monitor,
  BarChart3,
  Trash2
} from 'lucide-react';
import {
  CalendarPreferences,
  CalendarMetrics,
  CalendarIntegration
} from '../../types';

interface CalendarSettingsProps {
  patientId?: string;
  isAdmin?: boolean;
}

interface ProviderTestResult {
  success: boolean;
  error?: string;
  features?: string[];
  responseTime?: number;
}

interface ProviderStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  lastTest?: Date;
  features: string[];
  testResult?: ProviderTestResult;
}

export const CalendarSettings: React.FC<CalendarSettingsProps> = ({
  patientId,
  isAdmin = false
}) => {
  const [preferences, setPreferences] = useState<CalendarPreferences | null>(null);
  const [metrics, setMetrics] = useState<CalendarMetrics | null>(null);
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);
  const [providerStatuses, setProviderStatuses] = useState<ProviderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load calendar preferences
      if (patientId) {
        const prefsResponse = await fetch(`/api/calendar/preferences/${patientId}`);
        if (prefsResponse.ok) {
          setPreferences(await prefsResponse.json());
        }

        // Load integration history
        const integrationsResponse = await fetch(`/api/calendar/integrations/${patientId}`);
        if (integrationsResponse.ok) {
          setIntegrations(await integrationsResponse.json());
        }
      }

      // Load metrics (admin only)
      if (isAdmin) {
        const metricsResponse = await fetch('/api/calendar/metrics');
        if (metricsResponse.ok) {
          setMetrics(await metricsResponse.json());
        }
      }

      // Load provider statuses
      const statusResponse = await fetch('/api/calendar/providers/status');
      if (statusResponse.ok) {
        setProviderStatuses(await statusResponse.json());
      }
    } catch (error) {
      console.error('Error loading calendar settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences || !patientId) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/calendar/preferences/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) throw new Error('Failed to save preferences');

      // Show success message
      console.log('Calendar preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const testProvider = async (providerName: string) => {
    setTestingProvider(providerName);

    try {
      const response = await fetch(`/api/calendar/providers/${providerName}/test`, {
        method: 'POST'
      });

      const result: ProviderTestResult = await response.json();

      setProviderStatuses(prev => prev.map(provider =>
        provider.name === providerName
          ? {
              ...provider,
              status: result.success ? 'connected' : 'error',
              lastTest: new Date(),
              testResult: result
            }
          : provider
      ));
    } catch (error) {
      console.error(`Error testing ${providerName}:`, error);
    } finally {
      setTestingProvider(null);
    }
  };

  const clearIntegrationHistory = async () => {
    if (!patientId) return;

    try {
      const response = await fetch(`/api/calendar/integrations/${patientId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setIntegrations([]);
      }
    } catch (error) {
      console.error('Error clearing integration history:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-gray-600';
      case 'error': return 'text-red-600';
      case 'testing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      case 'testing': return <Loader2 className="h-4 w-4 animate-spin" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Calendar Preferences */}
      {patientId && preferences && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Preferências de Calendário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="preferred-provider">Provedor Preferido</Label>
                <Select
                  value={preferences.preferredProvider}
                  onValueChange={(value: any) =>
                    setPreferences({ ...preferences, preferredProvider: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google Calendar</SelectItem>
                    <SelectItem value="outlook">Outlook Calendar</SelectItem>
                    <SelectItem value="apple">Apple Calendar</SelectItem>
                    <SelectItem value="ics">Arquivo ICS (Universal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Select
                  value={preferences.timeZone}
                  onValueChange={(value) =>
                    setPreferences({ ...preferences, timeZone: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">São Paulo (BRT)</SelectItem>
                    <SelectItem value="America/Manaus">Manaus (AMT)</SelectItem>
                    <SelectItem value="America/Fortaleza">Fortaleza (BRT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Lembretes por Email</Label>
                  <p className="text-sm text-gray-600">
                    Receber lembretes antes dos agendamentos
                  </p>
                </div>
                <Switch
                  checked={preferences.enableReminders}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, enableReminders: checked })
                  }
                />
              </div>

              {preferences.enableReminders && (
                <div>
                  <Label>Horários dos Lembretes (minutos antes)</Label>
                  <div className="flex gap-2 mt-2">
                    {preferences.reminderTimes.map((time, index) => (
                      <Badge key={index} variant="secondary">
                        {time >= 1440 ? `${time / 1440} dia(s)` :
                         time >= 60 ? `${time / 60} hora(s)` :
                         `${time} min`}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Configure os horários no sistema principal
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Aceitar Convites Automaticamente</Label>
                  <p className="text-sm text-gray-600">
                    Adicionar agendamentos ao calendário automaticamente
                  </p>
                </div>
                <Switch
                  checked={preferences.autoAcceptInvites}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, autoAcceptInvites: checked })
                  }
                />
              </div>
            </div>

            <Button
              onClick={savePreferences}
              disabled={saving}
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Preferências'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Provider Status & Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Status dos Provedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {providerStatuses.map((provider) => (
              <div key={provider.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={getStatusColor(provider.status)}>
                      {getStatusIcon(provider.status)}
                    </span>
                    <span className="font-medium capitalize">{provider.name}</span>
                    <Badge variant={provider.status === 'connected' ? 'default' : 'secondary'}>
                      {provider.status}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testProvider(provider.name)}
                    disabled={testingProvider === provider.name}
                  >
                    {testingProvider === provider.name ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Testar'
                    )}
                  </Button>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>Recursos: {provider.features.join(', ')}</p>
                  {provider.lastTest && (
                    <p>Último teste: {provider.lastTest.toLocaleString('pt-BR')}</p>
                  )}
                  {provider.testResult?.responseTime && (
                    <p>Tempo de resposta: {provider.testResult.responseTime}ms</p>
                  )}
                </div>

                {provider.testResult?.error && (
                  <Alert className="mt-3">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {provider.testResult.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration History */}
      {patientId && integrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Histórico de Integrações
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={clearIntegrationHistory}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Histórico
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {integrations.slice(0, 10).map((integration) => (
                <div key={integration.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">Agendamento {integration.appointmentId.slice(-8)}</p>
                    <p className="text-sm text-gray-600">
                      {integration.provider} • {integration.createdAt.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Badge
                    variant={
                      integration.status === 'sent' ? 'default' :
                      integration.status === 'failed' ? 'destructive' :
                      'secondary'
                    }
                  >
                    {integration.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Dashboard (Admin Only) */}
      {isAdmin && metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Métricas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.totalInvitesSent}
                </div>
                <div className="text-sm text-gray-600">Convites Enviados</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.successRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Taxa de Sucesso</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {metrics.averageDeliveryTime.toFixed(0)}ms
                </div>
                <div className="text-sm text-gray-600">Tempo Médio</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Performance por Provedor</h4>
              {Object.entries(metrics.providerPerformance).map(([provider, stats]) => (
                <div key={provider} className="flex items-center justify-between border rounded p-3">
                  <span className="font-medium capitalize">{provider}</span>
                  <div className="text-right text-sm">
                    <div>{stats.successCount}/{stats.totalSent} ({((stats.successCount / stats.totalSent) * 100).toFixed(1)}%)</div>
                    <div className="text-gray-600">{stats.averageDeliveryTime.toFixed(0)}ms</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Status da Fila</h4>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold">{metrics.queueStats.pending}</div>
                  <div className="text-xs text-gray-600">Pendentes</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{metrics.queueStats.processing}</div>
                  <div className="text-xs text-gray-600">Processando</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{metrics.queueStats.completed}</div>
                  <div className="text-xs text-gray-600">Concluídos</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{metrics.queueStats.failed}</div>
                  <div className="text-xs text-gray-600">Falharam</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};