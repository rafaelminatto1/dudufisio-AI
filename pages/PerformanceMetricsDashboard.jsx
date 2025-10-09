/**
 * 🚀 PERFORMANCE METRICS DASHBOARD
 *
 * Dashboard para visualizar métricas de performance em produção
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Activity, AlertTriangle, Download, RefreshCw, Eye, Clock, BarChart3, } from 'lucide-react';
import { performanceMonitor, exportPerformanceMetrics, useFPSMonitoring, } from '../hooks/usePerformanceMonitoring';
const PerformanceMetricsDashboard = () => {
    const [reports, setReports] = useState(new Map());
    const [selectedComponent, setSelectedComponent] = useState(null);
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
        const avgRenderTime = allComponents.reduce((sum, r) => sum + r.averageRenderTime, 0) / allComponents.length;
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
    return (<div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Metrics</h1>
          <p className="text-gray-600 mt-1">
            Monitoramento em tempo real de performance dos componentes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshMetrics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2"/>
            Atualizar
          </Button>
          <Button onClick={exportPerformanceMetrics} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2"/>
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">FPS Atual</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {currentFPS}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${currentFPS >= 50
            ? 'bg-green-100'
            : currentFPS >= 30
                ? 'bg-yellow-100'
                : 'bg-red-100'}`}>
                <Activity className={`w-6 h-6 ${currentFPS >= 50
            ? 'text-green-600'
            : currentFPS >= 30
                ? 'text-yellow-600'
                : 'text-red-600'}`}/>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Render Médio</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.avgRenderTime.toFixed(2)}ms
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600"/>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Componentes Lentos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.slowComponents}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600"/>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Renders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalRenders}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600"/>
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
          <div className="space-y-3">
            {sortedComponents.map(([name, report]) => (<div key={name} onClick={() => setSelectedComponent(name)} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{name}</h3>
                    {report.averageRenderTime > 16 && (<Badge variant="destructive" className="text-xs">
                        Lento
                      </Badge>)}
                    {report.totalRenders > 50 && (<Badge variant="outline" className="text-xs">
                        Muitos renders
                      </Badge>)}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>Avg: {report.averageRenderTime.toFixed(2)}ms</span>
                    <span>Renders: {report.totalRenders}</span>
                    <span>
                      Range: {report.fastestRender.toFixed(2)}ms -{' '}
                      {report.slowestRender.toFixed(2)}ms
                    </span>
                  </div>
                </div>
                <Eye className="w-5 h-5 text-gray-400"/>
              </div>))}

            {sortedComponents.length === 0 && (<div className="text-center py-8 text-gray-500">
                Nenhuma métrica disponível ainda
              </div>)}
          </div>
        </CardContent>
      </Card>

      {/* Component Details Modal */}
      {selectedReport && selectedComponent && (<Card className="border-2 border-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedComponent}</CardTitle>
              <Button onClick={() => setSelectedComponent(null)} variant="ghost" size="sm">
                Fechar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Render Médio</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {selectedReport.averageRenderTime.toFixed(2)}ms
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mais Rápido</p>
                <p className="text-xl font-bold text-green-600 mt-1">
                  {selectedReport.fastestRender.toFixed(2)}ms
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mais Lento</p>
                <p className="text-xl font-bold text-red-600 mt-1">
                  {selectedReport.slowestRender.toFixed(2)}ms
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Renders</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {selectedReport.totalRenders}
                </p>
              </div>
            </div>

            {selectedReport.memoryUsage && (<div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Uso de Memória</p>
                <p className="text-lg font-semibold text-blue-900 mt-1">
                  {(selectedReport.memoryUsage / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>)}

            {selectedReport.averageRenderTime > 16 && (<div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5"/>
                  <div>
                    <p className="font-semibold text-orange-900">
                      Performance abaixo do ideal
                    </p>
                    <p className="text-sm text-orange-800 mt-1">
                      Este componente está renderizando mais lento que 16ms (60fps). Considere
                      aplicar otimizações adicionais.
                    </p>
                  </div>
                </div>
              </div>)}
          </CardContent>
        </Card>)}
    </div>);
};
export default PerformanceMetricsDashboard;
