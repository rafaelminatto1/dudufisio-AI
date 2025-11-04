import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Activity, Zap, Database, Clock } from 'lucide-react';

interface PerformanceData {
  avgQueryTime: number;
  totalQueries: number;
  cacheHitRate: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
}

interface BIPerformanceMonitorProps {
  performanceData: PerformanceData;
  realTime?: boolean;
}

export const BIPerformanceMonitor: React.FC<BIPerformanceMonitorProps> = ({
  performanceData,
  realTime = false
}) => {
  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBarColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'bg-green-500';
    if (value <= thresholds.warning) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitor de Performance
            {realTime && (
              <span className="ml-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avg Query Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Tempo Médio de Query</span>
            </div>
            <span className={getStatusColor(performanceData.avgQueryTime, { good: 200, warning: 500 })}>
              {performanceData.avgQueryTime.toFixed(0)}ms
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getBarColor(performanceData.avgQueryTime, { good: 200, warning: 500 })}`}
              style={{ width: `${Math.min((performanceData.avgQueryTime / 1000) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Cache Hit Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span>Taxa de Cache Hit</span>
            </div>
            <span className={getStatusColor(100 - performanceData.cacheHitRate, { good: 20, warning: 40 })}>
              {performanceData.cacheHitRate.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500 bg-blue-500"
              style={{ width: `${performanceData.cacheHitRate}%` }}
            />
          </div>
        </div>

        {/* Memory Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span>Uso de Memória</span>
            </div>
            <span className={getStatusColor(performanceData.memoryUsage, { good: 400, warning: 600 })}>
              {performanceData.memoryUsage}MB
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getBarColor(performanceData.memoryUsage, { good: 400, warning: 600 })}`}
              style={{ width: `${Math.min((performanceData.memoryUsage / 1000) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* CPU Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span>Uso de CPU</span>
            </div>
            <span className={getStatusColor(performanceData.cpuUsage, { good: 50, warning: 75 })}>
              {performanceData.cpuUsage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getBarColor(performanceData.cpuUsage, { good: 50, warning: 75 })}`}
              style={{ width: `${performanceData.cpuUsage}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{performanceData.totalQueries}</div>
            <div className="text-xs text-muted-foreground">Total Queries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{performanceData.activeConnections}</div>
            <div className="text-xs text-muted-foreground">Conexões Ativas</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

