/**
 * 🚀 PERFORMANCE METRICS DASHBOARD
 *
 * Dashboard para visualizar métricas de performance em produção
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Activity,
  Zap,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Eye,
  Clock,
  BarChart3,
} from 'lucide-react';
import {
  performanceMonitor,
  exportPerformanceMetrics,
  useFPSMonitoring,
  PerformanceReport,
} from '../hooks/usePerformanceMonitoring';

const PerformanceMetricsDashboard: React.FC = () => {
  const [reports, setReports] = useState<Map<string, PerformanceReport>>(new Map());
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const currentFPS = useFPSMonitoring();

  const refreshMetrics = () => {
    const allReports = performanceMonitor.getAllReports();
    setReports(allReports);
  };

  useEffect(() => {
    refreshMetrics();
    const interval = setInterval(refreshMetrics, 5000); // Atualizar a cada 5s
    return () => clearInterval(interval);
  }, []);

  // Estatísticas gerais
  const stats = useMemo(() => {
    const allComponents = Array.from(reports.values());

    if (allComponents.length === 0) {
      return {
        avgRenderTime: 0,
        slowComponents: 0,
        totalRenders: 0,
        memoryUsage: 0,
      };
    }

    const avgRenderTime =
      allComponents.reduce((sum, r) => sum + r.averageRenderTime, 0) / allComponents.length;

    const slowComponents = allComponents.filter((r) => r.averageRenderTime > 16).length;

    const totalRenders = allComponents.reduce((sum, r) => sum + r.totalRenders, 0);

    const memoryUsage = allComponents
      .filter((r) => r.memoryUsage)
      .reduce((sum, r) => sum + (r.memoryUsage || 0), 0);

    return {
      avgRenderTime,
      slowComponents,
      totalRenders,
      memoryUsage,
    };
  }, [reports]);

  const sortedComponents = useMemo(() => {
    return Array.from(reports.entries())
      .sort((a, b) => b[1].averageRenderTime - a[1].averageRenderTime)
      .slice(0, 20); // Top 20 componentes
  }, [reports]);

  const selectedReport = selectedComponent ? reports.get(selectedComponent) : null;

  return (
    <div className="p-lg space-y-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-text">Performance Metrics</h1>
          <p className="text-neutral-textSecondary mt-xs">
            Monitoramento em tempo real de performance dos componentes
          </p>
        </div>
        <div className="flex gap-sm">
          <Button onClick={refreshMetrics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-sm" />
            Atualizar
          </Button>
          <Button onClick={exportPerformanceMetrics} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-sm" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-textSecondary">FPS Atual</p>
                <p className="text-2xl font-bold text-neutral-text mt-xs">
                  {currentFPS}
                </p>
              </div>
              <div
                className={`p-md rounded-lg ${
                  currentFPS >= 50
                    ? 'bg-success-light'
                    : currentFPS >= 30
                    ? 'bg-warning-light'
                    : 'bg-error-light'
                }`}
              >
                <Activity
                  className={`w-6 h-6 ${
                    currentFPS >= 50
                      ? 'text-success'
                      : currentFPS >= 30
                      ? 'text-warning'
                      : 'text-error'
                  }`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-textSecondary">Render Médio</p>
                <p className="text-2xl font-bold text-neutral-text mt-xs">
                  {stats.avgRenderTime.toFixed(2)}ms
                </p>
              </div>
              <div className="p-md bg-primary-light rounded-lg">
                <Clock className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-textSecondary">Componentes Lentos</p>
                <p className="text-2xl font-bold text-neutral-text mt-xs">
                  {stats.slowComponents}
                </p>
              </div>
              <div className="p-md bg-warning-light rounded-lg">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-textSecondary">Total Renders</p>
                <p className="text-2xl font-bold text-neutral-text mt-xs">
                  {stats.totalRenders}
                </p>
              </div>
              <div className="p-md bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Components Table */}
      <Card>
        <CardHeader>
          <CardTitle>Componentes por Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-sm">
            {sortedComponents.map(([name, report]) => (
              <div
                key={name}
                onClick={() => setSelectedComponent(name)}
                className="flex items-center justify-between p-md bg-neutral-bgAlt rounded-lg hover:bg-neutral-bgDark cursor-pointer transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-md">
                    <h3 className="font-semibold text-neutral-text">{name}</h3>
                    {report.averageRenderTime > 16 && (
                      <Badge variant="destructive" className="text-xs">
                        Lento
                      </Badge>
                    )}
                    {report.totalRenders > 50 && (
                      <Badge variant="outline" className="text-xs">
                        Muitos renders
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-md mt-sm text-sm text-neutral-textSecondary">
                    <span>Avg: {report.averageRenderTime.toFixed(2)}ms</span>
                    <span>Renders: {report.totalRenders}</span>
                    <span>
                      Range: {report.fastestRender.toFixed(2)}ms -{' '}
                      {report.slowestRender.toFixed(2)}ms
                    </span>
                  </div>
                </div>
                <Eye className="w-5 h-5 text-neutral-textTertiary" />
              </div>
            ))}

            {sortedComponents.length === 0 && (
              <div className="text-center py-3xl text-gray-500">
                Nenhuma métrica disponível ainda
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Component Details Modal */}
      {selectedReport && selectedComponent && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedComponent}</CardTitle>
              <Button
                onClick={() => setSelectedComponent(null)}
                variant="ghost"
                size="sm"
              >
                Fechar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
              <div>
                <p className="text-sm text-neutral-textSecondary">Render Médio</p>
                <p className="text-xl font-bold text-neutral-text mt-xs">
                  {selectedReport.averageRenderTime.toFixed(2)}ms
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-textSecondary">Mais Rápido</p>
                <p className="text-xl font-bold text-success mt-xs">
                  {selectedReport.fastestRender.toFixed(2)}ms
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-textSecondary">Mais Lento</p>
                <p className="text-xl font-bold text-error mt-xs">
                  {selectedReport.slowestRender.toFixed(2)}ms
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-textSecondary">Total Renders</p>
                <p className="text-xl font-bold text-neutral-text mt-xs">
                  {selectedReport.totalRenders}
                </p>
              </div>
            </div>

            {selectedReport.memoryUsage && (
              <div className="mt-md p-md bg-primary-light rounded-lg">
                <p className="text-sm text-neutral-textSecondary">Uso de Memória</p>
                <p className="text-lg font-semibold text-blue-900 mt-xs">
                  {(selectedReport.memoryUsage / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            {selectedReport.averageRenderTime > 16 && (
              <div className="mt-md p-md bg-warning-light border border-warning rounded-lg">
                <div className="flex items-start gap-sm">
                  <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-900">
                      Performance abaixo do ideal
                    </p>
                    <p className="text-sm text-warning mt-xs">
                      Este componente está renderizando mais lento que 16ms (60fps). Considere
                      aplicar otimizações adicionais.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerformanceMetricsDashboard;
