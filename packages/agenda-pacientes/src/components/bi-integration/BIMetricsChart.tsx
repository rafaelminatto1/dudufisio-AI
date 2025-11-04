import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ChartData {
  date: string;
  value: number;
  count?: number;
}

interface BIMetricsChartProps {
  title: string;
  data: ChartData[];
  type?: 'line' | 'area' | 'bar';
  color?: string;
  showTrend?: boolean;
}

export const BIMetricsChart: React.FC<BIMetricsChartProps> = ({
  title,
  data,
  type = 'line',
  color = '#3b82f6',
  showTrend = true
}) => {
  const calculateTrend = () => {
    if (data.length < 2) return { direction: 'stable', percentage: 0 };
    
    const recent = data.slice(-5);
    const older = data.slice(-10, -5);
    
    if (recent.length === 0 || older.length === 0) return { direction: 'stable', percentage: 0 };
    
    const recentAvg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.value, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(change) > 5) {
      direction = change > 0 ? 'up' : 'down';
    }
    
    return { direction, percentage: Math.abs(change) };
  };

  const trend = calculateTrend();

  const getTrendIcon = () => {
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (trend.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 5, left: -20, bottom: 5 }
    };

    switch (type) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id={`color-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                stroke="#9ca3af"
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                stroke="#9ca3af"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                fillOpacity={1} 
                fill={`url(#color-${title})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                stroke="#9ca3af"
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                stroke="#9ca3af"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
        
      default: // line
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                stroke="#9ca3af"
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                stroke="#9ca3af"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={2}
                dot={{ fill: color, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {showTrend && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${getTrendColor()}`}>
              {getTrendIcon()}
              {trend.percentage > 0 && (
                <span>{trend.percentage.toFixed(1)}%</span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          renderChart()
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
};

