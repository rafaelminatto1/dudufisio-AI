import React, { useState, useEffect, useMemo } from 'react';
import Section from '../components/layout/Section';
import { H1, H2, H3, Body, Small, Caption } from '../components/ui/Typography';
import Button from '../components/ui/button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import StatsCard from '../components/ui/StatsCard';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Filter,
  Download,
  BarChart3,
  Zap,
  Server,
  Globe,
  Target,
  BarChart2,
  LineChart,
  PieChart,
} from 'lucide-react';
import { NivoLineChart, NivoBarChart, NivoPieChart, TooltipCard } from '../components/charts/nivo';

interface EdgeFunctionMetric {
  name: string;
  avgResponseTime: number;
  successRate: number;
  totalRequests: number;
  last24h: {
    requests: number[];
    responseTimes: number[];
    errors: number[];
  };
  status: 'healthy' | 'warning' | 'error';
}

interface PerformanceData {
  timestamp: string;
  responseTime: number;
  success: boolean;
  functionName: string;
}

const EdgeFunctionsPerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<EdgeFunctionMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  // Mock data for demonstration
  const mockMetrics: EdgeFunctionMetric[] = [
    {
      name: 'WhatsApp Webhook',
      avgResponseTime: 34.5,
      successRate: 99.8,
      totalRequests: 1247,
      last24h: {
        requests: [45, 52, 48, 61, 55, 67, 59, 72, 68, 74, 81, 89, 95, 102, 98, 87, 79, 73, 68, 62, 58, 54, 49, 46],
        responseTimes: [32, 35, 31, 38, 33, 41, 36, 44, 39, 42, 45, 48, 46, 51, 47, 43, 40, 37, 34, 33, 32, 31, 30, 33],
        errors: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      status: 'healthy'
    },
    {
      name: 'Push Notifications',
      avgResponseTime: 78.2,
      successRate: 98.3,
      totalRequests: 892,
      last24h: {
        requests: [32, 28, 35, 41, 38, 45, 42, 48, 51, 55, 49, 52, 47, 43, 39, 36, 33, 31, 29, 27, 25, 28, 30, 32],
        responseTimes: [72, 75, 69, 82, 76, 85, 79, 88, 91, 84, 78, 81, 74, 71, 68, 65, 62, 59, 56, 54, 52, 55, 58, 61],
        errors: [0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      status: 'healthy'
    },
    {
      name: 'Email Service',
      avgResponseTime: 145.7,
      successRate: 97.1,
      totalRequests: 634,
      last24h: {
        requests: [25, 22, 28, 31, 29, 34, 32, 37, 35, 39, 33, 36, 31, 28, 25, 23, 21, 19, 18, 20, 22, 24, 26, 28],
        responseTimes: [138, 142, 135, 151, 145, 158, 149, 162, 155, 168, 152, 159, 144, 139, 134, 129, 125, 121, 118, 122, 126, 130, 135, 140],
        errors: [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      status: 'warning'
    },
    {
      name: 'Payment Processing',
      avgResponseTime: 234.8,
      successRate: 99.2,
      totalRequests: 156,
      last24h: {
        requests: [8, 6, 9, 12, 10, 7, 5, 11, 9, 8, 6, 7, 5, 9, 11, 8, 6, 5, 7, 9, 8, 6, 7, 8],
        responseTimes: [225, 238, 221, 245, 232, 218, 215, 242, 235, 228, 222, 231, 219, 236, 248, 233, 227, 214, 223, 239, 230, 224, 229, 234],
        errors: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      status: 'healthy'
    }
  ];

  const chartData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    responseTime: Math.floor(Math.random() * 100) + 50,
    requests: Math.floor(Math.random() * 50) + 20,
    errors: Math.floor(Math.random() * 5)
  }));

  const statusDistribution = [
    { name: 'Healthy', value: 2, color: '#10b981' },
    { name: 'Warning', value: 1, color: '#f59e0b' },
    { name: 'Error', value: 0, color: '#ef4444' }
  ];

  const lineSeriesData = useMemo(
    () => [
      {
        id: 'Tempo de resposta',
        color: '#3b82f6',
        data: chartData.map((point) => ({
          x: point.time,
          y: point.responseTime
        }))
      }
    ],
    [chartData]
  );

  const barData = useMemo(
    () =>
      chartData.map((point) => ({
        time: point.time,
        requests: point.requests
      })),
    [chartData]
  );

  const pieData = useMemo(
    () =>
      statusDistribution.map((item) => ({
        id: item.name,
        label: item.name,
        value: item.value,
        color: item.color
      })),
    [statusDistribution]
  );

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setMetrics(mockMetrics);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setLastUpdated(new Date());
    
    // Simulate data refresh
    setTimeout(() => {
      setMetrics(mockMetrics);
      setIsLoading(false);
    }, 800);
  };

  const handleExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: metrics,
      timeRange: selectedTimeRange
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edge-functions-performance-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <Body>Loading performance metrics...</Body>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <Section variant="white" paddingY="lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-md">
          <div>
            <H1 className="text-h2">Edge Functions Performance Dashboard</H1>
            <Small>Monitor the performance and health of your Edge Functions in real-time</Small>
          </div>
          <div className="flex gap-md">
            <Button 
              variant="outline" 
              icon={<Filter size={18} />} 
              iconPosition="left"
              onClick={() => {/* Filter logic */}}
            >
              Filter
            </Button>
            <Button 
              variant="outline" 
              icon={<Download size={18} />} 
              iconPosition="left"
              onClick={handleExport}
            >
              Export
            </Button>
            <Button 
              variant="primary" 
              icon={<RefreshCw size={18} />} 
              iconPosition="left"
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </div>
        </div>
      </Section>

      {/* Time Range Selector */}
      <Section variant="gray" paddingY="sm">
        <div className="flex items-center gap-md">
          <Small className="text-neutral-textSecondary">Time Range:</Small>
          {['1h', '24h', '7d', '30d'].map((range) => (
            <Button
              key={range}
              variant={selectedTimeRange === range ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange(range as any)}
            >
              {range}
            </Button>
          ))}
          <div className="ml-auto">
            <Small className="text-neutral-textSecondary">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Small>
          </div>
        </div>
      </Section>

      {/* Overview Stats */}
      <Section variant="gray" paddingY="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          <StatsCard
            title="Total Functions"
            value={metrics.length.toString()}
            icon={Server}
            variant="primary"
            comparison="100% operational"
            comparisonType="positive"
            caption="All systems running"
          />
          <StatsCard
            title="Avg Response Time"
            value={`${(metrics.reduce((acc, m) => acc + m.avgResponseTime, 0) / metrics.length).toFixed(1)}ms`}
            icon={Clock}
            variant="secondary"
            comparison="Within SLA"
            comparisonType="positive"
            caption="Target: < 200ms"
          />
          <StatsCard
            title="Total Requests"
            value={metrics.reduce((acc, m) => acc + m.totalRequests, 0).toLocaleString()}
            icon={Activity}
            variant="info"
            comparison="↑ 12% vs yesterday"
            comparisonType="positive"
            caption="Last 24 hours"
          />
          <StatsCard
            title="Success Rate"
            value={`${(metrics.reduce((acc, m) => acc + m.successRate, 0) / metrics.length).toFixed(1)}%`}
            icon={Target}
            variant="success"
            comparison="Above 99%"
            comparisonType="positive"
            caption="Excellent performance"
          />
        </div>
      </Section>

      {/* Charts Section */}
      <Section variant="gray" paddingY="lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          {/* Response Time Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Response Times</CardTitle>
                  <CardDescription>Average response time over the last 24 hours</CardDescription>
                </div>
                <BarChart3 className="w-5 h-5 text-neutral-textSecondary" />
              </div>
            </CardHeader>
            <CardContent>
              <NivoLineChart
                height={300}
                data={lineSeriesData}
                curve="monotoneX"
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
                axisBottom={{
                  tickRotation: -30,
                  tickPadding: 10,
                }}
                axisLeft={{
                  tickPadding: 8,
                }}
                colors={['#3b82f6']}
                enableArea
                areaOpacity={0.12}
                pointSize={8}
                pointBorderWidth={2}
                pointColor={{ from: 'color' }}
                pointBorderColor={{ from: 'serieColor' }}
                sliceTooltip={({ slice }) => {
                  const point = slice.points[0];
                  if (!point) return null;

                  return (
                    <TooltipCard
                      title={point.data.xFormatted}
                      rows={[
                        {
                          id: 'response-time',
                          label: 'Tempo de resposta',
                          value: `${point.data.yFormatted} ms`,
                          color: point.serieColor,
                        },
                      ]}
                    />
                  );
                }}
              />
            </CardContent>
          </Card>

          {/* Request Volume Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Request Volume</CardTitle>
                  <CardDescription>Number of requests per hour</CardDescription>
                </div>
                <BarChart2 className="w-5 h-5 text-neutral-textSecondary" />
              </div>
            </CardHeader>
            <CardContent>
              <NivoBarChart
                height={300}
                data={barData}
                keys={['requests']}
                indexBy="time"
                colors={['#10b981']}
                borderRadius={4}
                axisBottom={{
                  tickRotation: -30,
                  tickPadding: 10,
                }}
                axisLeft={{
                  tickPadding: 8,
                }}
                tooltip={({ value, indexValue, color }) => (
                  <TooltipCard
                    title={indexValue}
                    rows={[
                      {
                        id: 'requests',
                        label: 'Solicitações',
                        value: value,
                        color,
                      },
                    ]}
                  />
                )}
              />
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Function Details */}
      <Section variant="gray" paddingY="lg">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Function Performance Details</CardTitle>
                <CardDescription>Detailed metrics for each Edge Function</CardDescription>
              </div>
              <LineChart className="w-5 h-5 text-neutral-textSecondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-lg">
              {metrics.map((metric, index) => (
                <div key={index} className="border border-neutral-border rounded-lg p-lg">
                  <div className="flex items-center justify-between mb-md">
                    <div className="flex items-center gap-md">
                      <div className={`flex items-center gap-xs px-md py-xs rounded-full ${getStatusColor(metric.status)}`}>
                        {getStatusIcon(metric.status)}
                        <Small className="capitalize">{metric.status}</Small>
                      </div>
                      <H3 className="text-base">{metric.name}</H3>
                    </div>
                    <Button variant="ghost" size="sm" icon={<BarChart3 size={16} />}>
                      Details
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{metric.avgResponseTime}ms</div>
                      <Small className="text-neutral-textSecondary">Avg Response</Small>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">{metric.successRate}%</div>
                      <Small className="text-neutral-textSecondary">Success Rate</Small>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-info">{metric.totalRequests.toLocaleString()}</div>
                      <Small className="text-neutral-textSecondary">Total Requests</Small>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-warning">
                        {metric.last24h.errors.reduce((a, b) => a + b, 0)}
                      </div>
                      <Small className="text-neutral-textSecondary">24h Errors</Small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Status Distribution */}
      <Section variant="gray" paddingY="lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Function Status Distribution</CardTitle>
                  <CardDescription>Current health status of all functions</CardDescription>
                </div>
                <PieChart className="w-5 h-5 text-neutral-textSecondary" />
              </div>
            </CardHeader>
            <CardContent>
              <NivoPieChart
                height={250}
                data={pieData}
                colors={{ datum: 'data.color' }}
                enableArcLinkLabels={false}
                arcLinkLabelsSkipAngle={10}
                arcLabelsRadiusOffset={0.55}
                arcLabel={(datum) => `${datum.value}`}
                tooltip={({ datum }) => (
                  <TooltipCard
                    title={datum.label}
                    rows={[
                      {
                        id: String(datum.id),
                        label: 'Funções',
                        value: datum.value,
                        color: datum.color as string,
                      },
                    ]}
                  />
                )}
              />
              <div className="flex justify-center gap-lg mt-md">
                {statusDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <Small>{item.name}: {item.value}</Small>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Performance Insights</CardTitle>
                  <CardDescription>Key recommendations and alerts</CardDescription>
                </div>
                <Zap className="w-5 h-5 text-neutral-textSecondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-md">
                <div className="flex items-start gap-md p-md bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <Body className="font-medium text-green-900">Excellent Performance</Body>
                    <Small className="text-green-700">All functions are performing within SLA targets</Small>
                  </div>
                </div>
                
                <div className="flex items-start gap-md p-md bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <Body className="font-medium text-yellow-900">Optimization Opportunity</Body>
                    <Small className="text-yellow-700">Email service response time could be improved</Small>
                  </div>
                </div>
                
                <div className="flex items-start gap-md p-md bg-blue-50 border border-blue-200 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <Body className="font-medium text-blue-900">Growth Trend</Body>
                    <Small className="text-blue-700">Request volume increased 15% this week</Small>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </div>
  );
};

export default EdgeFunctionsPerformanceDashboard;