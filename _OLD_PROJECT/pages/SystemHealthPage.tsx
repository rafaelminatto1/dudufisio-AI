/**
 * Dashboard de Saúde do Sistema
 * 
 * Exibe métricas de erro, desempenho e saúde geral da aplicação
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {  AlertTriangle, Activity, TrendingUp, TrendingDown, Download, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getSystemHealthMetrics, getAllOperationsWithErrors, getOperationStats, exportMetrics, clearAllMetrics } from '../lib/monitoring/errorMetrics';
import type { SystemHealthMetrics } from '../lib/monitoring/errorMetrics';

const SystemHealthPage: React.FC = () => {
  const [healthMetrics, setHealthMetrics] = useState<SystemHealthMetrics | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadMetrics();
  }, [refreshKey]);

  const loadMetrics = () => {
    const metrics = getSystemHealthMetrics();
    setHealthMetrics(metrics);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleExport = () => {
    const data = exportMetrics();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-metrics-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (window.confirm('Tem certeza que deseja limpar todas as métricas?')) {
      clearAllMetrics();
      handleRefresh();
    }
  };

  const getHealthStatus = (): { status: string; color: string; icon: React.ReactNode } => {
    if (!healthMetrics) return { status: 'Carregando...', color: 'gray', icon: <Activity /> };
    
    if (healthMetrics.criticalErrors > 0) {
      return { status: 'Crítico', color: 'red', icon: <XCircle /> };
    }
    
    if (healthMetrics.errorRate > 10) {
      return { status: 'Alerta', color: 'orange', icon: <AlertTriangle /> };
    }
    
    if (healthMetrics.errorRate > 5) {
      return { status: 'Atenção', color: 'yellow', icon: <AlertTriangle /> };
    }
    
    return { status: 'Saudável', color: 'green', icon: <CheckCircle /> };
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  const healthStatus = getHealthStatus();
  const operations = getAllOperationsWithErrors();

  if (!healthMetrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bgAlt p-lg">
      <div className="max-w-7xl mx-auto space-y-xl">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-neutral-text">Saúde do Sistema</h1>
            <p className="text-neutral-textSecondary mt-xs">Monitoramento de erros e métricas</p>
          </div>
          <div className="flex gap-sm">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-sm" />
              Atualizar
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-sm" />
              Exportar
            </Button>
            <Button variant="destructive" onClick={handleClear}>
              Limpar Métricas
            </Button>
          </div>
        </div>

        {/* Status Geral */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-sm">
              {healthStatus.icon}
              Status: {healthStatus.status}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
              <div className="bg-neutral-bgAlt p-md rounded-lg">
                <div className="text-sm text-neutral-textSecondary">Total de Erros</div>
                <div className="text-2xl font-bold">{healthMetrics.totalErrors}</div>
              </div>
              <div className="bg-neutral-bgAlt p-md rounded-lg">
                <div className="text-sm text-neutral-textSecondary">Últimas 24h</div>
                <div className="text-2xl font-bold flex items-center gap-sm">
                  {healthMetrics.errorsLast24h}
                  {healthMetrics.errorsLast24h > healthMetrics.errorsLastHour * 24 ? (
                    <TrendingUp className="w-5 h-5 text-red-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
              <div className="bg-neutral-bgAlt p-md rounded-lg">
                <div className="text-sm text-neutral-textSecondary">Taxa de Erro/Hora</div>
                <div className="text-2xl font-bold">{healthMetrics.errorRate.toFixed(2)}</div>
              </div>
              <div className="bg-neutral-bgAlt p-md rounded-lg">
                <div className="text-sm text-neutral-textSecondary">Erros Críticos</div>
                <div className="text-2xl font-bold text-error">
                  {healthMetrics.criticalErrors}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tempo Médio de Resolução */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-sm">
              <Clock className="w-5 h-5" />
              Tempo Médio de Resolução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatDuration(healthMetrics.averageResolutionTime)}
            </div>
            <p className="text-sm text-neutral-textSecondary mt-sm">
              Tempo médio para resolver erros com retry automático
            </p>
          </CardContent>
        </Card>

        {/* Operações Mais Problemáticas */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 - Operações com Mais Erros</CardTitle>
            <CardDescription>Operações que falharam mais nas últimas 24h</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-sm">
              {healthMetrics.mostFailedOperations.map((op, index) => (
                <div
                  key={op.operation}
                  className="flex items-center justify-between p-md bg-neutral-bgAlt rounded-lg hover:bg-neutral-bgDark cursor-pointer"
                  onClick={() => setSelectedOperation(op.operation)}
                >
                  <div className="flex items-center gap-md">
                    <Badge variant={index === 0 ? 'destructive' : 'secondary'}>
                      #{index + 1}
                    </Badge>
                    <span className="font-medium">{op.operation}</span>
                  </div>
                  <div className="flex items-center gap-md">
                    <div className="text-sm text-neutral-textSecondary">
                      {op.count} erros
                    </div>
                    <div className="text-sm text-neutral-textSecondary">
                      {op.errorRate.toFixed(2)} erros/hora
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detalhes da Operação Selecionada */}
        {selectedOperation && (
          <Card>
            <CardHeader>
              <CardTitle>Detalhes: {selectedOperation}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOperation(null)}
              >
                Fechar
              </Button>
            </CardHeader>
            <CardContent>
              {(() => {
                const stats = getOperationStats(selectedOperation);
                return (
                  <div className="space-y-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                      <div className="bg-neutral-bgAlt p-md rounded-lg">
                        <div className="text-sm text-neutral-textSecondary">Total de Erros</div>
                        <div className="text-2xl font-bold">{stats.totalErrors}</div>
                      </div>
                      <div className="bg-neutral-bgAlt p-md rounded-lg">
                        <div className="text-sm text-neutral-textSecondary">Taxa de Erro</div>
                        <div className="text-2xl font-bold">{stats.errorRate.toFixed(2)}/h</div>
                      </div>
                      <div className="bg-neutral-bgAlt p-md rounded-lg">
                        <div className="text-sm text-neutral-textSecondary">Tempo Médio Resolução</div>
                        <div className="text-2xl font-bold">
                          {formatDuration(stats.avgResolutionTime)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-sm">Erros por Tipo</h4>
                      <div className="space-y-sm">
                        {Object.entries(stats.errorsByType).map(([type, count]) => (
                          <div key={type} className="flex justify-between items-center p-sm bg-neutral-bgAlt rounded">
                            <span>{type}</span>
                            <Badge>{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-sm">Erros por Severidade</h4>
                      <div className="space-y-sm">
                        {Object.entries(stats.errorsBySeverity).map(([severity, count]) => (
                          <div key={severity} className="flex justify-between items-center p-sm bg-neutral-bgAlt rounded">
                            <span className="capitalize">{severity}</span>
                            <Badge
                              variant={
                                severity === 'critical'
                                  ? 'destructive'
                                  : severity === 'high'
                                  ? 'secondary'
                                  : 'default'
                              }
                            >
                              {count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Lista de Todas as Operações */}
        <Card>
          <CardHeader>
            <CardTitle>Todas as Operações com Erros ({operations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-sm">
              {operations.map((op) => (
                <Button
                  key={op}
                  variant="outline"
                  className="justify-start"
                  onClick={() => setSelectedOperation(op)}
                >
                  {op}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemHealthPage;

