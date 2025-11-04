/**
 * 📊 SYNC METRICS DASHBOARD
 * 
 * Dashboard administrativo para visualizar métricas de sincronização offline.
 * 
 * Features:
 * - Cartões com métricas principais
 * - Gráficos de tendência
 * - Distribuição por tipo
 * - Export de dados
 * 
 * @module SyncMetricsDashboard
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { syncMetricsCollector, type SyncMetrics } from '../../lib/metrics/syncMetrics';
import { metricsStorage } from '../../lib/metrics/metricsStorage';
import { useSafeOffline } from '../../contexts/SafeOfflineContext';
import { cn } from '../../lib/utils';

/**
 * Props do componente
 */
interface SyncMetricsDashboardProps {
  className?: string;
}

/**
 * 📊 SyncMetricsDashboard
 * 
 * Dashboard completo de métricas de sincronização.
 */
export const SyncMetricsDashboard: React.FC<SyncMetricsDashboardProps> = ({ className }) => {
  const { queueSize } = useSafeOffline();
  const [metrics, setMetrics] = useState<SyncMetrics | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  /**
   * Carregar métricas
   */
  const loadMetrics = () => {
    const currentMetrics = syncMetricsCollector.getMetrics(queueSize);
    setMetrics(currentMetrics);
    setLastUpdated(new Date());
  };

  /**
   * Efeito inicial
   */
  useEffect(() => {
    loadMetrics();

    // Atualizar a cada 30 segundos
    const interval = setInterval(loadMetrics, 30000);

    return () => clearInterval(interval);
  }, [queueSize]);

  /**
   * Handler para exportar métricas
   */
  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const json = await metricsStorage.exportAll();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `sync-metrics-${new Date().toISOString()}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar métricas:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Carregando métricas...</span>
      </div>
    );
  }

  const successRate = metrics.successRate;
  const isHealthy = successRate >= 95;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Métricas de Sincronização</h2>
          <p className="text-sm text-gray-600 mt-1">
            Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMetrics}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exportando...' : 'Exportar'}
          </Button>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Syncs */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Syncs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {metrics.totalSyncs.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Syncs Bem-Sucedidos */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bem-Sucedidos</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {metrics.successfulSyncs.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Syncs Falhados */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Falhados</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {metrics.failedSyncs.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        {/* Tempo Médio */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {metrics.averageSyncTime}
                <span className="text-base font-normal text-gray-500 ml-1">ms</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Taxa de Sucesso */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Taxa de Sucesso</h3>
          <Badge
            variant={isHealthy ? 'default' : 'destructive'}
            className={cn(
              'text-sm',
              isHealthy && 'bg-green-500'
            )}
          >
            {isHealthy ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {successRate.toFixed(2)}%
          </Badge>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              isHealthy ? 'bg-green-500' : 'bg-yellow-500'
            )}
            style={{ width: `${Math.min(successRate, 100)}%` }}
          />
        </div>

        <div className="mt-3 flex justify-between text-sm text-gray-600">
          <span>{metrics.successfulSyncs} sucessos</span>
          <span>{metrics.failedSyncs} falhas</span>
        </div>
      </Card>

      {/* Distribuição por Tipo */}
      {Object.keys(metrics.itemsByType).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribuição por Tipo de Ação
          </h3>

          <div className="space-y-3">
            {Object.entries(metrics.itemsByType)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {type.replace(/-/g, ' ')}
                  </span>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${(count / metrics.totalSyncs) * 100}%`,
                        }}
                      />
                    </div>
                    
                    <Badge variant="secondary" className="min-w-[60px] justify-center">
                      {count}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Status Atual */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Atual</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Itens na Fila</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {queueSize}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Último Sync</p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {metrics.lastSyncTime
                ? new Date(metrics.lastSyncTime).toLocaleString('pt-BR')
                : 'Nunca'}
            </p>
          </div>
        </div>
      </Card>

      {/* Informação Adicional */}
      <div className="text-center text-xs text-gray-500">
        As métricas são coletadas localmente e enviadas periodicamente para análise.
      </div>
    </div>
  );
};

export default SyncMetricsDashboard;

