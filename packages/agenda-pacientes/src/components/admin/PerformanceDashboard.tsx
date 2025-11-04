import React, { memo, useMemo } from 'react';
import { Activity, Zap, Database, TrendingUp, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { usePerformanceMetrics, useWebVitals, useCacheMetrics, useComponentMetrics } from '../../hooks/usePerformanceMetrics';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

/**
 * 📊 Dashboard de Performance
 * Exibe métricas em tempo real do sistema
 */
const PerformanceDashboard: React.FC = () => {
  const { report, isMonitoring, toggleMonitoring, resetMetrics, exportReport } = usePerformanceMetrics();
  const webVitals = useWebVitals();
  const cacheMetrics = useCacheMetrics();
  const componentMetrics = useComponentMetrics();

  const getRatingIcon = (rating: 'good' | 'needs-improvement' | 'poor') => {
    switch (rating) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'needs-improvement':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'poor':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getRatingColor = (rating: 'good' | 'needs-improvement' | 'poor') => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const formatValue = (name: string, value: number) => {
    if (name === 'CLS') return value.toFixed(3);
    return Math.round(value) + 'ms';
  };

  const topSlowComponents = useMemo(() => {
    return componentMetrics.slice(0, 10);
  }, [componentMetrics]);

  const downloadReport = () => {
    const reportJson = exportReport();
    const blob = new Blob([reportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-8 h-8 text-sky-600" />
            Dashboard de Performance
          </h1>
          <p className="text-slate-600 mt-1">
            Monitoramento em tempo real de métricas de performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={isMonitoring ? 'default' : 'secondary'}>
            {isMonitoring ? '🟢 Ativo' : '🔴 Pausado'}
          </Badge>
          
          <button
            onClick={toggleMonitoring}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            {isMonitoring ? 'Pausar' : 'Iniciar'}
          </button>
          
          <button
            onClick={resetMetrics}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Resetar
          </button>
          
          <button
            onClick={downloadReport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Exportar
          </button>
        </div>
      </div>

      {/* Web Vitals */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Core Web Vitals
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {webVitals?.lcp && (
            <Card className={`p-4 border-2 ${getRatingColor(webVitals.lcp.rating)}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-slate-600">LCP</p>
                  <p className="text-xs text-slate-500">Largest Contentful Paint</p>
                </div>
                {getRatingIcon(webVitals.lcp.rating)}
              </div>
              <p className="text-2xl font-bold">
                {formatValue('LCP', webVitals.lcp.value)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Meta: &lt; 2.5s
              </p>
            </Card>
          )}

          {webVitals?.fid && (
            <Card className={`p-4 border-2 ${getRatingColor(webVitals.fid.rating)}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-slate-600">FID</p>
                  <p className="text-xs text-slate-500">First Input Delay</p>
                </div>
                {getRatingIcon(webVitals.fid.rating)}
              </div>
              <p className="text-2xl font-bold">
                {formatValue('FID', webVitals.fid.value)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Meta: &lt; 100ms
              </p>
            </Card>
          )}

          {webVitals?.cls && (
            <Card className={`p-4 border-2 ${getRatingColor(webVitals.cls.rating)}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-slate-600">CLS</p>
                  <p className="text-xs text-slate-500">Cumulative Layout Shift</p>
                </div>
                {getRatingIcon(webVitals.cls.rating)}
              </div>
              <p className="text-2xl font-bold">
                {formatValue('CLS', webVitals.cls.value)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Meta: &lt; 0.1
              </p>
            </Card>
          )}

          {webVitals?.ttfb && (
            <Card className={`p-4 border-2 ${getRatingColor(webVitals.ttfb.rating)}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-slate-600">TTFB</p>
                  <p className="text-xs text-slate-500">Time to First Byte</p>
                </div>
                {getRatingIcon(webVitals.ttfb.rating)}
              </div>
              <p className="text-2xl font-bold">
                {formatValue('TTFB', webVitals.ttfb.value)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Meta: &lt; 800ms
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Cache Metrics */}
      {cacheMetrics && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            Estatísticas de Cache
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-green-50 border-2 border-green-200">
              <p className="text-sm font-medium text-slate-600 mb-2">Cache Hits</p>
              <p className="text-3xl font-bold text-green-600">{cacheMetrics.hits}</p>
            </Card>

            <Card className="p-4 bg-red-50 border-2 border-red-200">
              <p className="text-sm font-medium text-slate-600 mb-2">Cache Misses</p>
              <p className="text-3xl font-bold text-red-600">{cacheMetrics.misses}</p>
            </Card>

            <Card className="p-4 bg-blue-50 border-2 border-blue-200">
              <p className="text-sm font-medium text-slate-600 mb-2">Hit Rate</p>
              <p className="text-3xl font-bold text-blue-600">
                {(cacheMetrics.hitRate * 100).toFixed(1)}%
              </p>
            </Card>

            <Card className="p-4 bg-purple-50 border-2 border-purple-200">
              <p className="text-sm font-medium text-slate-600 mb-2">Entradas</p>
              <p className="text-3xl font-bold text-purple-600">{cacheMetrics.entries}</p>
            </Card>
          </div>
        </div>
      )}

      {/* Component Performance */}
      {topSlowComponents.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Componentes Mais Lentos
          </h2>
          
          <Card className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">
                      Componente
                    </th>
                    <th className="text-right py-2 px-3 text-sm font-semibold text-slate-700">
                      Tempo de Render
                    </th>
                    <th className="text-right py-2 px-3 text-sm font-semibold text-slate-700">
                      Atualizações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topSlowComponents.map((component, index) => (
                    <tr key={component.name} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-3 text-sm text-slate-900">
                        <span className="font-medium">{component.name}</span>
                      </td>
                      <td className="py-2 px-3 text-sm text-right">
                        <span className={`font-semibold ${
                          component.renderTime > 100 ? 'text-red-600' :
                          component.renderTime > 50 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {component.renderTime.toFixed(2)}ms
                        </span>
                      </td>
                      <td className="py-2 px-3 text-sm text-right text-slate-600">
                        {component.updateCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Recomendações */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-sky-500" />
          Recomendações
        </h2>
        
        <div className="space-y-2">
          {webVitals?.lcp?.rating === 'poor' && (
            <Card className="p-4 bg-red-50 border-l-4 border-red-500">
              <p className="text-sm font-medium text-red-800">
                ⚠️ LCP precisa de atenção: Otimize imagens e recursos críticos
              </p>
            </Card>
          )}
          
          {cacheMetrics && cacheMetrics.hitRate < 0.7 && (
            <Card className="p-4 bg-yellow-50 border-l-4 border-yellow-500">
              <p className="text-sm font-medium text-yellow-800">
                ⚠️ Taxa de cache baixa: Considere aumentar o TTL ou revisar estratégia de cache
              </p>
            </Card>
          )}
          
          {topSlowComponents.some(c => c.renderTime > 100) && (
            <Card className="p-4 bg-orange-50 border-l-4 border-orange-500">
              <p className="text-sm font-medium text-orange-800">
                ⚠️ Componentes lentos detectados: Considere memoização ou lazy loading
              </p>
            </Card>
          )}

          {(webVitals?.lcp?.rating === 'good') &&
           cacheMetrics && cacheMetrics.hitRate >= 0.7 &&
           !topSlowComponents.some(c => c.renderTime > 100) && (
            <Card className="p-4 bg-green-50 border-l-4 border-green-500">
              <p className="text-sm font-medium text-green-800">
                ✅ Performance excelente! Sistema operando dentro dos parâmetros ideais
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(PerformanceDashboard);
